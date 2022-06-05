import { Types } from 'mongoose';

import Transaction from '../models/Transaction.model';
import Balance, { MongooseBalance } from '../models/Balance.model';
import { TransactionType } from '../types/transaction.type';
import ApiError from '../exceptions/api-errors';
import { balanceType } from '../types/balance.type';

const handleExpense = async (transaction: TransactionType, balance: MongooseBalance) => {
  if (balance.amount < transaction.sum) {
    throw ApiError.BadRequest('The balance does not have enough money', '');
  }

  balance.amount -= transaction.sum;
  await balance.save();
};

const handleProfit = async (transaction: TransactionType, balance: MongooseBalance) => {
  balance.amount += transaction.sum;
  await balance.save();
};

type createTransactionReturnType = {
  transaction: TransactionType,
  balance: balanceType,
}

export const createTransaction = async (
  transaction: TransactionType,
  balanceId: string,
  userId: string,
): Promise<createTransactionReturnType> => {
  const balance: MongooseBalance | null = await Balance.findById(balanceId);

  if (!balance) {
    throw ApiError.BadRequest('Balance with such id does not exist', '');
  }

  switch (transaction.transactionType) {
    case 'expense':
      await handleExpense(transaction, balance);
      break;
    case 'profit':
      await handleProfit(transaction, balance);
      break;
    default:
      throw ApiError.BadRequest('Unexpected transaction type', '');
  }

  const newTransaction = await Transaction.create({
    ...transaction,
    balance: balance.name,
    ownerId: userId,
  });

  return { transaction: newTransaction, balance };
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
