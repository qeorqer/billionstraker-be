import { Types } from 'mongoose';

import Transaction from '../models/Transaction.model';
import Balance, { MongooseBalance } from '../models/Balance.model';
import { TransactionType } from '../types/transaction.type';
import ApiError from '../exceptions/api-errors';

export const createTransaction = async (
  transaction: TransactionType,
  balanceId: string,
  userId: string,
): Promise<TransactionType> => {
  const balance: MongooseBalance | null = await Balance.findById(balanceId);

  if (!balance) {
    throw ApiError.BadRequest('Balance with such id does not exist', '');
  }

  if (balance.amount < transaction.sum) {
    throw ApiError.BadRequest('The balance does not have enough money', '');
  }

  const newTransaction = await Transaction.create({
    ...transaction,
    balance: balance.name,
    ownerId: userId,
  });

  return newTransaction;
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
