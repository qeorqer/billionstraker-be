import { Types } from 'mongoose';

import Transaction from '../models/Transaction.model';
import Balance, { MongooseBalance } from '../models/Balance.model';
import { TransactionType } from '../types/transaction.type';
import ApiError from '../exceptions/api-errors';
import { balanceType } from '../types/balance.type';

const handleExpense = async (
  transaction: TransactionType,
  balance: MongooseBalance,
) => {
  if (balance.amount < transaction.sum) {
    throw ApiError.BadRequest('The balance does not have enough money', '');
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
      '',
    );
  }

  const balanceToSubtract = await Balance.findById(balanceToSubtractId);
  if (!balanceToSubtract) {
    throw ApiError.BadRequest('Balance with such id does not exist', '');
  }

  if (balanceToSubtract.amount < transaction.sumToSubtract) {
    throw ApiError.BadRequest('The balance does not have enough money', '');
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
    throw ApiError.BadRequest('Balance with such id does not exist', '');
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
      throw ApiError.BadRequest('Unexpected transaction type', '');
  }

  const newTransaction = await Transaction.create({
    ...transaction,
    ownerId: userId,
  });

  return { transaction: newTransaction, balances: updatedBalances };
};

type getAllTransactionsReturnType = {
  transactions: TransactionType[];
  numberOfTransactions: number;
};

export const getUserTransactions = async (
  userId: Types.ObjectId,
  limit: number,
  numberToSkip: number,
): Promise<getAllTransactionsReturnType | null> => {
  const transactions = await Transaction.find({ ownerId: userId })
    .sort({ date: -1 })
    .skip(numberToSkip)
    .limit(limit)
    .exec();

  if (!transactions) {
    return null;
  }

  const numberOfTransactions = await Transaction.countDocuments({
    ownerId: userId,
  });

  return {
    transactions,
    numberOfTransactions,
  };
};
