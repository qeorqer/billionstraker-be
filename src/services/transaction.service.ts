import { FilterQuery, Types } from 'mongoose';

import Transaction, { MongooseTransaction } from '@models/Transaction.model';
import Balance, { MongooseBalance } from '@models/Balance.model';
import { FilteringOptions, TransactionType } from '@type/transaction.type';
import ApiError from '@exceptions/api-errors';
import { balanceType } from '@type/balance.type';

const handleExpense = async (
  transaction: TransactionType,
  balance: MongooseBalance,
) => {
  if (balance.amount < transaction.sum) {
    throw ApiError.BadRequest('The balance does not have enough money');
  }

  balance.amount -= transaction.sum;
  await balance.save();

  return [balance];
};

const handleProfit = async (
  transaction: TransactionType,
  balance: MongooseBalance,
) => {
  balance.amount += transaction.sum;
  await balance.save();

  return [balance];
};

const handleExchange = async (
  transaction: TransactionType,
  balance: MongooseBalance,
  balanceToSubtractId: string | undefined,
) => {
  if (!transaction.sumToSubtract || !balanceToSubtractId) {
    throw ApiError.BadRequest(
      'sumToSubtract and balanceToSubtractId are required for exchange operation',
    );
  }

  const balanceToSubtract = await Balance.findById(balanceToSubtractId);
  if (!balanceToSubtract) {
    throw ApiError.BadRequest('Balance with such id does not exist');
  }

  if (balanceToSubtract.amount < transaction.sumToSubtract) {
    throw ApiError.BadRequest('The balance does not have enough money');
  }

  balanceToSubtract.amount -= transaction.sumToSubtract;
  await balanceToSubtract.save();

  balance.amount += transaction.sum;
  await balance.save();

  return [balance, balanceToSubtract];
};

type createTransactionReturnType = {
  transaction: TransactionType;
  balances: balanceType[];
};

export const createTransaction = async (
  transaction: TransactionType,
  balanceId: string,
  userId: string,
  balanceToSubtractId?: string,
): Promise<createTransactionReturnType> => {
  const balance: MongooseBalance | null = await Balance.findById(balanceId);
  if (!balance) {
    throw ApiError.BadRequest('Balance with such id does not exist');
  }

  let updatedBalances: balanceType[] = [];
  switch (transaction.transactionType) {
    case 'expense':
      updatedBalances = await handleExpense(transaction, balance);
      break;
    case 'profit':
      updatedBalances = await handleProfit(transaction, balance);
      break;
    case 'exchange':
      updatedBalances = await handleExchange(
        transaction,
        balance,
        balanceToSubtractId,
      );
      break;
    default:
      throw ApiError.BadRequest('Unexpected transaction type');
  }

  const newTransaction = await Transaction.create({
    ...transaction,
    ownerId: userId,
  });

  return { transaction: newTransaction, balances: updatedBalances };
};

type conditionForSearchType = {
  ownerId: Types.ObjectId;
  transactionType?: string;
  balance?: { $in: string[] };
  category?: { $in: string[] };
};

const formConditionForSearch = (
  userId: Types.ObjectId,
  filteringOptions: FilteringOptions,
): conditionForSearchType => {
  const result: conditionForSearchType = {
    ownerId: userId,
  };

  if (filteringOptions.shownTransactionsTypes !== 'all transactions') {
    result.transactionType = filteringOptions.shownTransactionsTypes;
  }

  if (filteringOptions.balancesToShow.length) {
    result.balance = { $in: filteringOptions.balancesToShow };
  }

  if (filteringOptions.categoriesToShow.length) {
    result.category = { $in: filteringOptions.categoriesToShow };
  }

  return result;
};

type getAllTransactionsReturnType = {
  transactions: TransactionType[];
  numberOfTransactions: number;
};

export const getUserTransactions = async (
  userId: Types.ObjectId,
  limit: number,
  numberToSkip: number,
  filteringOptions: {
    shownTransactionsTypes: string;
    categoriesToShow: string[];
    balancesToShow: string[];
  },
): Promise<getAllTransactionsReturnType | null> => {
  const conditionsForSearch = formConditionForSearch(userId, filteringOptions);
  const transactions = await Transaction.find(
    conditionsForSearch as FilterQuery<MongooseTransaction>,
  )
    .sort({ date: -1 })
    .skip(numberToSkip)
    .limit(limit)
    .exec();

  if (!transactions) {
    return null;
  }

  const numberOfTransactions = await Transaction.countDocuments(
    conditionsForSearch as FilterQuery<MongooseTransaction>,
  );

  return {
    transactions,
    numberOfTransactions,
  };
};
