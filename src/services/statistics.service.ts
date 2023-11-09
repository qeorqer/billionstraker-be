import { Types } from 'mongoose';
import Decimal from 'decimal.js';

import UserModel from '@models/User.model';
import TransactionModel from '@models/Transaction.model';
import { Transaction, TransactionType } from '@type/transaction.type';
import { getBalances } from '@services/balance.service';
import axios from 'axios';

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
    const rateForOne = rateForOneResponse.data[convertToCurrency];

    return Number(Decimal.mul(rateForOne, value).toFixed(2));
  } catch (e) {
    try {
      // In case first request fails, which happens sometimes, use another which is more stable
      const singleCurrencyRoute = `https://cdn.jsdelivr.net/gh/fawazahmed0/currency-api@1/latest/currencies/${convertFromCurrency}.json`;
      const singleCurrencyResponse = await axios.get(singleCurrencyRoute);
      const rateForOne =
        singleCurrencyResponse.data[convertFromCurrency][convertToCurrency];

      return Number(Decimal.mul(rateForOne, value).toFixed(2));
    } catch (error) {
      console.log(error);
      return 0;
    }
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

type ExpenseIncome = {
  _id: string;
  total: number;
};

type GetStatisticsForBalanceResponse = {
  expensesInRange: ExpenseIncome[];
  profitsInRange: ExpenseIncome[];
  totallySpent: number;
  totallyEarned: number;
};

type GetTransactionsOptions = {
  userId: Types.ObjectId;
  from: Date;
  to: Date;
  balanceName?: string | null;
  transactionType: TransactionType;
};

const groupTransactionsByKey = (
  transactions: Transaction[],
  key: 'category' | 'balance-category',
) => {
  const groupedTransactions: {
    [key: string]: number;
  } = {};

  transactions.forEach(({ category, balance, sum }) => {
    const groupKey = key === 'category' ? category : `${balance}-${category}`;

    if (groupedTransactions[groupKey]) {
      groupedTransactions[groupKey] = Decimal.add(
        groupedTransactions[groupKey],
        sum,
      ).toNumber();
    } else {
      groupedTransactions[groupKey] = sum;
    }
  });

  return Object.keys(groupedTransactions).map((key) => ({
    _id: key,
    total: groupedTransactions[key],
  }));
};

const getStatisticsRange = async ({
  userId,
  from,
  to,
  balanceName,
  transactionType,
}: GetTransactionsOptions): Promise<ExpenseIncome[]> => {
  const user = await UserModel.findById(userId);
  const userBalances = await getBalances(userId);

  const transactions = await TransactionModel.find({
    ownerId: new Types.ObjectId(userId),
    date: {
      $gte: new Date(from),
      $lt: new Date(to),
    },
    transactionType,
    ...(balanceName && { balance: balanceName }),
  });

  if (!transactions.length) {
    return [];
  }

  if (balanceName) {
    return groupTransactionsByKey(transactions, 'category');
  }

  const groupedTransactions = groupTransactionsByKey(
    transactions,
    'balance-category',
  );

  const groupedTransactionsWithConvertedCurrency =
    await Promise.all<ExpenseIncome | null>(
      groupedTransactions.map(async ({ _id, total }) => {
        const [balanceName, category] = _id.split('-');
        const balance = userBalances.find(({ name }) => name === balanceName);

        if (!balance?.currency || !user?.preferredCurrency) {
          return null;
        }

        const convertedTotalValue = await convertCurrency(
          user?.preferredCurrency,
          balance.currency,
          total,
        );

        return {
          _id: category,
          total: convertedTotalValue,
        };
      }),
    );

  // @ts-ignore
  const filteredValues: ExpenseIncome[] =
    groupedTransactionsWithConvertedCurrency.filter(Boolean);

  return filteredValues;
};

export const getStatisticsForSingleBalance = async (
  userId: Types.ObjectId,
  from: Date,
  to: Date,
  balanceName: string | null,
): Promise<GetStatisticsForBalanceResponse | null> => {
  const [expensesInRange, profitsInRange] = await Promise.all([
    getStatisticsRange({
      userId,
      from,
      to,
      balanceName,
      transactionType: 'expense',
    }),
    getStatisticsRange({
      userId,
      from,
      to,
      balanceName,
      transactionType: 'profit',
    }),
  ]);

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
