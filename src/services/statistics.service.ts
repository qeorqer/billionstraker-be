import { Types } from 'mongoose';
import Decimal from 'decimal.js';

import UserModel from '@models/User.model';
import TransactionModel from '@models/Transaction.model';
import { getBalances } from '@services/balance.service';
import axios from 'axios';

Decimal.set({ rounding: 2 });

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

  let expensesInRange: ExpenseIncome[] = await TransactionModel.aggregate([
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

  let profitsInRange: ExpenseIncome[] = await TransactionModel.aggregate([
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

type GetNetWorthResponse = {
  value: number;
  currency: string;
};

const convertCurrency = async (
  convertToCurrency: string,
  convertFromCurrency: string,
  value: number,
): Promise<number> => {
  try {
    const convertApiRoute = `https://cdn.jsdelivr.net/gh/fawazahmed0/currency-api@1/latest/currencies/${convertFromCurrency}/${convertToCurrency}.json`;
    const rateForOneResponse = await axios.get(convertApiRoute);
    const rateForOneData = rateForOneResponse.data[convertToCurrency];

    return Number((rateForOneData * value).toFixed());
  } catch (e) {
    console.log(e);
    return 0;
  }
};

export const getNetWorth = async (
  userId: Types.ObjectId,
): Promise<GetNetWorthResponse | null> => {
  const user = await UserModel.findById(userId);
  const userBalances = await getBalances(userId);

  if (!user?.preferredCurrency || !userBalances?.length) {
    return null;
  }

  const convertedBalances = await Promise.all(
    userBalances.map((balance) =>
      convertCurrency(
        user?.preferredCurrency?.toLowerCase() || '',
        balance?.currency?.toLowerCase() || '',
        balance.amount,
      ),
    ),
  );

  const netWorth = convertedBalances.reduce(
    (acc, cur) => Decimal.add(acc, cur).toNumber(),
    0,
  );

  return {
    value: netWorth,
    currency: user?.preferredCurrency,
  };
};
