import { Types } from 'mongoose';
import Decimal from 'decimal.js';

import Transaction from '@models/Transaction.model';

type expenseIncomeType = {
  _id: Types.ObjectId;
  total: number;
};

type getStatisticsForBalanceReturnType = {
  expensesInRange: expenseIncomeType[];
  profitsInRange: expenseIncomeType[];
  totallySpent: number;
  totallyEarned: number;
};

export const getStatisticsForBalance = async (
  userId: Types.ObjectId,
  from: Date,
  to: Date,
  balance: string,
): Promise<getStatisticsForBalanceReturnType | null> => {
  // TODO: optimize db requests

  let expensesInRange: expenseIncomeType[] = await Transaction.aggregate([
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

  let profitsInRange: expenseIncomeType[] = await Transaction.aggregate([
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
