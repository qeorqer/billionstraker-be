import { FilterQuery, Types } from 'mongoose';
import Decimal from 'decimal.js';

import Transaction, { MongooseTransaction } from '@models/Transaction.model';
import Balance, { MongooseBalance } from '@models/Balance.model';
import { FilteringOptions, TransactionType } from '@type/transaction.type';
import ApiError from '@exceptions/api-errors';

const handleExpense = async (
  transaction: TransactionType,
  balance: MongooseBalance,
) => {
  if (balance.amount < transaction.sum) {
    throw ApiError.BadRequest('The balance does not have enough money');
  }

  balance.amount = Decimal.sub(balance.amount, transaction.sum).toNumber();
  await balance.save();

  return [balance];
};

const handleProfit = async (
  transaction: TransactionType,
  balance: MongooseBalance,
) => {
  balance.amount = Decimal.add(balance.amount, transaction.sum).toNumber();
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

  balanceToSubtract.amount = Decimal.sub(
    balanceToSubtract.amount,
    transaction.sumToSubtract,
  ).toNumber();
  await balanceToSubtract.save();

  balance.amount = Decimal.add(balance.amount, transaction.sum).toNumber();
  await balance.save();

  return [balance, balanceToSubtract];
};

const handleRevertExchange = async (
  transaction: TransactionType,
  balanceToAdd: MongooseBalance,
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

  console.log(balanceToAdd, balanceToSubtract);
  if (balanceToSubtract.amount < transaction.sum) {
    throw ApiError.BadRequest('The balance does not have enough money');
  }

  balanceToSubtract.amount = Decimal.sub(
    balanceToSubtract.amount,
    transaction.sum,
  ).toNumber();
  await balanceToSubtract.save();

  balanceToAdd.amount = Decimal.add(balanceToAdd.amount, transaction.sumToSubtract).toNumber();
  await balanceToAdd.save();

  return [balanceToAdd, balanceToSubtract];
};

type createTransactionReturnType = {
  transaction: TransactionType;
  balances: MongooseBalance[];
};

const updateBalances = async (
  transaction: TransactionType,
  balanceId: string,
  balanceToSubtractId: string | undefined,
): Promise<MongooseBalance[]> => {
  const balance: MongooseBalance | null = await Balance.findById(balanceId);
  if (!balance) {
    throw ApiError.BadRequest('Balance with such id does not exist');
  }

  let updatedBalances: MongooseBalance[] = [];

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

  return updatedBalances;
};

export const createTransaction = async (
  transaction: TransactionType,
  balanceId: string,
  userId: string,
  balanceToSubtractId?: string,
): Promise<createTransactionReturnType> => {
  const updatedBalances = await updateBalances(transaction, balanceId, balanceToSubtractId);


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
  date?: {
    $gte: Date,
    $lt: Date
  }
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

  if (filteringOptions.from && filteringOptions.to) {
    result.date = {
      $gte: new Date(filteringOptions.from),
      $lt: new Date(filteringOptions.to),
    };
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
    from: Date,
    to: Date,
  },
): Promise<getAllTransactionsReturnType | null> => {
  const conditionsForSearch = formConditionForSearch(userId, filteringOptions);
  const transactions = await Transaction.find(
    conditionsForSearch as FilterQuery<MongooseTransaction>,
  )
  .sort({ date: -1, _id: -1 })
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

type deleteTransactionReturnType = {
  transactionId: string;
  balances: MongooseBalance[];
};

const revertBalances = async (transaction: TransactionType, userId: string): Promise<MongooseBalance[]> => {
  let updatedBalances: MongooseBalance[] = [];

  const balanceToSubtract = await Balance.findOne({ name: transaction.balance, ownerId: userId });

  switch (transaction.transactionType) {
    case 'expense':
      if (balanceToSubtract) {
        updatedBalances = await handleProfit(transaction, balanceToSubtract);
      }
      break;
    case 'profit':
      if (balanceToSubtract) {
        updatedBalances = await handleExpense(transaction, balanceToSubtract);
      }
      break;
    case 'exchange':
      if (balanceToSubtract) {
        const balanceToAdd = await Balance.findOne({ name: transaction.balanceToSubtract!, ownerId: userId });

        if (balanceToAdd) {
          updatedBalances = await handleRevertExchange(
            transaction,
            balanceToAdd,
            balanceToSubtract._id,
          );
        }
      }
      break;
    default:
      throw ApiError.BadRequest('Unexpected transaction type');
  }

  return updatedBalances;
};

export const deleteTransaction = async (
  transactionId: string,
  userId: string,
): Promise<deleteTransactionReturnType> => {
  const transaction: TransactionType | null = await Transaction.findById(transactionId);
  if (!transaction) {
    throw ApiError.BadRequest('Transaction with such id does not exist');
  }

  const updatedBalances = await revertBalances(transaction, userId);

  await Transaction.findByIdAndDelete(transactionId);

  return { transactionId, balances: updatedBalances };
};

export const editTransaction = async (
  transaction: MongooseTransaction,
  balanceId: string,
  userId: string,
  balanceToSubtractId?: string,
): Promise<createTransactionReturnType> => {
  if (!transaction._id) {
    throw ApiError.BadRequest('_id field is required');
  }

  const currentTransaction: MongooseTransaction | null = await Transaction.findById(transaction._id);
  let updatedBalances = [] as MongooseBalance[];

  if (!currentTransaction) {
    throw ApiError.BadRequest('There is no transaction with such id');
  }

  if (currentTransaction.transactionType !== transaction.transactionType ||
    transaction.sum !== currentTransaction.sum ||
    transaction.sumToSubtract !== currentTransaction.sumToSubtract) {

    const revertedBalances = await revertBalances(currentTransaction, userId);
    const changedBalances = await updateBalances(transaction, balanceId, balanceToSubtractId);

    [...changedBalances, ...revertedBalances].forEach((balance) => {
      const isBalanceAlreadyInTheList = updatedBalances.find((b) => b._id.toString() === balance._id.toString());

      if (!isBalanceAlreadyInTheList) {
        updatedBalances.push(balance);
      }
    });
  }

  for (const transactionProperty in transaction) {
    // @ts-ignore
    if (transaction[transactionProperty] !== currentTransaction[transactionProperty]) {
      // @ts-ignore
      currentTransaction[transactionProperty] = transaction[transactionProperty];
    }
  }

  await currentTransaction.save();
  return { transaction: currentTransaction, balances: updatedBalances };
};
