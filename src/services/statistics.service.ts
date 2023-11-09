import { Types } from 'mongoose';
import Decimal from 'decimal.js';

import UserModel from '@models/User.model';
import TransactionModel from '@models/Transaction.model';
import { TransactionType } from '@type/transaction.type';
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

type GetTransactionsAggregateBody = {
  userId: Types.ObjectId;
  from: Date;
  to: Date;
  balanceName: string;
  transactionType: TransactionType;
};

const getTransactionsAggregate = async ({
  userId,
  from,
  to,
  balanceName,
  transactionType,
}: GetTransactionsAggregateBody): Promise<ExpenseIncome[]> => {
  return TransactionModel.aggregate([
    {
      $match: {
        ownerId: new Types.ObjectId(userId),
        date: {
          $gte: new Date(from),
          $lt: new Date(to),
        },
        balance: balanceName,
        transactionType,
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
};

export const getStatisticsForSingleBalance = async (
  userId: Types.ObjectId,
  from: Date,
  to: Date,
  balanceName: string,
): Promise<GetStatisticsForBalanceResponse | null> => {
  let [expensesInRange, profitsInRange] = await Promise.all([
    getTransactionsAggregate({
      userId,
      from,
      to,
      balanceName,
      transactionType: 'expense',
    }),
    getTransactionsAggregate({
      userId,
      from,
      to,
      balanceName,
      transactionType: 'profit',
    }),
  ]);

  expensesInRange = expensesInRange.map((item) => ({
    ...item,
    total: Number(item.total.toFixed(2)),
  }));

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
