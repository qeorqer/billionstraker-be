import { Types } from 'mongoose';
import Decimal from 'decimal.js';

import Transaction from '@models/Transaction.model';

type expenseIncomeType = {
  _id: Types.ObjectId;
  total: number;
};

/*
  todo: analyze the logic and remove when not needed
type getGeneralStatisticReturnType = {
  userExpenses: number;
  userExpensesThisMonth: number;
};

export const getGeneralStatistic = async (
  userId: Types.ObjectId,
): Promise<getGeneralStatisticReturnType | null> => {
  const isUserHasTransactions = await Transaction.countDocuments({
    ownerId: userId,
  });

  if (!isUserHasTransactions) {
    return null;
  }

  const userExpenses: expenseIncomeType[] = await Transaction.aggregate([
    {
      $match: {
        ownerId: new Types.ObjectId(userId),
        isExpense: true,
      },
    },
    {
      $group: {
        _id: '$ownerId',
        total: {
          $sum: '$sum',
        },
      },
    },
  ]);

  const userExpensesThisMonth: expenseIncomeType[] =
    await Transaction.aggregate([
      {
        $match: {
          ownerId: new Types.ObjectId(userId),
          isExpense: true,
          $expr: {
            $and: [
              { $eq: [{ $month: '$date' }, { $month: new Date() }] },
              { $eq: [{ $year: '$date' }, { $year: new Date() }] },
            ],
          },
        },
      },
      {
        $group: {
          _id: '$ownerId',
          total: {
            $sum: '$sum',
          },
        },
      },
    ]);

  return {
    userExpenses: userExpenses[0]?.total | 0,
    userExpensesThisMonth: userExpensesThisMonth[0]?.total | 0,
  };
};

type getWholeStatisticReturnType = {
  userExpenses: number;
  userExpensesThisMonth: number;
  userIncomes: number;
  userIncomesThisMonth: number;
  averageExpensePerMonth: number;
  averageIncomePerMonth: number;
};

type expensesIncomesPerMonth = {
  _id: { year: number; month: number };
  total: number;
};

export const getWholeStatistic = async (
  userId: Types.ObjectId,
): Promise<getWholeStatisticReturnType | null> => {
  const generalStatistic = await getGeneralStatistic(userId);

  if (!generalStatistic) {
    return null;
  }

  const userIncomes: expenseIncomeType[] = await Transaction.aggregate([
    {
      $match: {
        ownerId: new Types.ObjectId(userId),
        isExpense: false,
      },
    },
    {
      $group: {
        _id: '$ownerId',
        total: {
          $sum: '$sum',
        },
      },
    },
  ]);

  const userIncomesThisMonth: expenseIncomeType[] = await Transaction.aggregate(
    [
      {
        $match: {
          ownerId: new Types.ObjectId(userId),
          isExpense: false,
          $expr: {
            $and: [
              { $eq: [{ $month: '$date' }, { $month: new Date() }] },
              { $eq: [{ $year: '$date' }, { $year: new Date() }] },
            ],
          },
        },
      },
      {
        $group: {
          _id: '$ownerId',
          total: {
            $sum: '$sum',
          },
        },
      },
    ],
  );

  const expensesPerMonth: expensesIncomesPerMonth[] =
    await Transaction.aggregate([
      {
        $match: {
          ownerId: new Types.ObjectId(userId),
          isExpense: true,
          $expr: {
            $and: [
              { $lt: [{ $month: '$date' }, { $month: new Date() }] },
              { $lte: [{ $year: '$date' }, { $year: new Date() }] },
            ],
          },
        },
      },
      {
        $group: {
          _id: {
            year: { $year: '$date' },
            month: { $month: '$date' },
          },
          total: {
            $sum: '$sum',
          },
        },
      },
    ]);

  const incomesPerMonth: expensesIncomesPerMonth[] =
    await Transaction.aggregate([
      {
        $match: {
          ownerId: new Types.ObjectId(userId),
          isExpense: false,
          $expr: {
            $and: [
              { $lt: [{ $month: '$date' }, { $month: new Date() }] },
              { $lte: [{ $year: '$date' }, { $year: new Date() }] },
            ],
          },
        },
      },
      {
        $group: {
          _id: {
            year: { $year: '$date' },
            month: { $month: '$date' },
          },
          total: {
            $sum: '$sum',
          },
        },
      },
    ]);

  const averageExpensePerMonth: number =
    expensesPerMonth.reduce((prev, current) => prev + current.total, 0) /
    (expensesPerMonth.length || 1);

  const averageIncomePerMonth: number =
    incomesPerMonth.reduce((prev, current) => prev + current.total, 0) /
    (incomesPerMonth.length || 1);

  return {
    userExpenses: generalStatistic.userExpenses,
    userExpensesThisMonth: generalStatistic.userExpensesThisMonth,
    userIncomes: userIncomes[0]?.total | 0,
    userIncomesThisMonth: userIncomesThisMonth[0]?.total | 0,
    averageExpensePerMonth: averageExpensePerMonth,
    averageIncomePerMonth: averageIncomePerMonth,
  };
};*/

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
