import { Types } from 'mongoose';
import Decimal from 'decimal.js';

import Transaction from '@models/Transaction.model';

type ExpenseIncome = {
  _id: Types.ObjectId;
  total: number;
};

type GetStatisticsForBalanceResponse = {
  expensesInRange: ExpenseIncome[];
  profitsInRange: ExpenseIncome[];
  totallySpent: number;
  totallyEarned: number;
};

export const getStatisticsForBalance = async (
  userId: Types.ObjectId,
  from: Date,
  to: Date,
  balance: string,
): Promise<GetStatisticsForBalanceResponse | null> => {
  // TODO: optimize db requests

  let expensesInRange: ExpenseIncome[] = await Transaction.aggregate([
    {
      $match: {
        ownerId: new Types.ObjectId(userId),
        date: {
          $gte: new Date(from),
          $lt: new Date(to),
        },
        balance,
        transactionType: 'expense',
      },
    },
    {
      $group: {
        _id: '$category',
        total: {
          $sum: '$sum',
        },
      },
    },
  ]);

  expensesInRange = expensesInRange.map((item) => ({
    ...item,
    total: Number(item.total.toFixed(2)),
  }));

  let profitsInRange: ExpenseIncome[] = await Transaction.aggregate([
    {
      $match: {
        ownerId: new Types.ObjectId(userId),
        date: {
          $gte: new Date(from),
          $lt: new Date(to),
        },
        balance,
        transactionType: 'profit',
      },
    },
    {
      $group: {
        _id: '$category',
        total: {
          $sum: '$sum',
        },
      },
    },
  ]);

  profitsInRange = profitsInRange.map((item) => ({
    ...item,
    total: Number(item.total.toFixed(2)),
  }));

  if (!expensesInRange && !profitsInRange) {
    return null;
  }

  const totallySpent = expensesInRange.reduce(
    (prev, current) => Decimal.add(prev, current.total).toNumber(),
    0,
  );

  const totallyEarned = profitsInRange.reduce(
    (prev, current) => Decimal.add(prev, current.total).toNumber(),
    0,
  );

  return {
    expensesInRange,
    profitsInRange,
    totallySpent,
    totallyEarned,
  };
};
