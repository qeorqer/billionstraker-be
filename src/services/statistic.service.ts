import { Types } from 'mongoose';
import Transaction from '../models/Transaction.model';

type expenseIncomeType = {
  _id: Types.ObjectId;
  total: number;
};

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
};

type getStatisticForRangeReturnType = {
  transactionsInRange: expenseIncomeType[];
  totalSpent: number;
};

export const getStatisticForRange = async (
  userId: Types.ObjectId,
  from: Date,
  to: Date,
): Promise<getStatisticForRangeReturnType | null> => {
  const transactionsInRange: expenseIncomeType[] = await Transaction.aggregate([
    {
      $match: {
        ownerId: new Types.ObjectId(userId),
        date: {
          $gte: new Date(from),
          $lt: new Date(to),
        },
        isExpense: true,
      },
    },
    {
      $lookup: {
        from: 'categories',
        localField: 'category',
        foreignField: '_id',
        as: 'category',
      },
    },
    {
      $unwind: '$category',
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

  if (!transactionsInRange) {
    return null;
  }

  const totalSpent = transactionsInRange.reduce(
    (prev, current) => prev + current.total,
    0,
  );

  return {
    transactionsInRange,
    totalSpent,
  };
};
