import { Types } from 'mongoose';
import Decimal from 'decimal.js';

import UserModel from '@models/User.model';
import TransactionModel from '@models/Transaction.model';
import { getBalances } from '@services/balance.service';
import { convertCurrency } from '@utils/statistics/convertCurrency';
import {
  GetNetWorthResponse,
  GetStatisticsResponse,
  GetTransactionsByTypeOptions,
} from '@type/statistics.type';
import { getStatisticsRange } from '@utils/statistics/GetStatisticsRange';
import ApiError from '@exceptions/api-errors';
import { getExchangesStatistics } from '@utils/statistics/getExchangeStatistics';

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

const getTransactions = async ({
  userId,
  from,
  to,
  transactionType,
  balanceNameQuery,
}: GetTransactionsByTypeOptions) =>
  TransactionModel.find({
    ownerId: userId,
    date: {
      $gte: new Date(from),
      $lt: new Date(to),
    },
    transactionType,
    ...balanceNameQuery,
  });

export const getStatistics = async (
  userId: Types.ObjectId,
  from: Date,
  to: Date,
  balanceName: string | null,
): Promise<GetStatisticsResponse> => {
  const user = await UserModel.findById(userId);
  const balances = await getBalances(userId);

  if (!user) {
    throw ApiError.BadRequest("Can't find the user with this id");
  }

  const [
    expensesTransaction,
    profitsTransactions,
    sentExchangeTransaction,
    receivedExchangeTransaction,
  ] = await Promise.all([
    getTransactions({
      userId,
      from,
      to,
      balanceNameQuery: balanceName ? { balance: balanceName } : {},
      transactionType: 'expense',
    }),
    getTransactions({
      userId,
      from,
      to,
      balanceNameQuery: balanceName ? { balance: balanceName } : {},
      transactionType: 'profit',
    }),
    getTransactions({
      userId,
      from,
      to,
      transactionType: 'exchange',
      balanceNameQuery: {
        balanceToSubtract: balanceName,
      },
    }),
    getTransactions({
      userId,
      from,
      to,
      transactionType: 'exchange',
      balanceNameQuery: {
        balance: balanceName,
      },
    }),
  ]);

  const expensesStatistics = await getStatisticsRange({
    transactions: expensesTransaction,
    user: user,
    balances: balances,
    balanceName: balanceName,
  });

  const profitsStatistics = await getStatisticsRange({
    transactions: profitsTransactions,
    user: user,
    balances: balances,
    balanceName: balanceName,
  });

  const exchangesStatistics = balanceName
    ? {
        totallySend: getExchangesStatistics(
          sentExchangeTransaction,
          'sumToSubtract',
        ),
        totallyReceived: getExchangesStatistics(
          receivedExchangeTransaction,
          'sum',
        ),
      }
    : null;

  return {
    expenses: expensesStatistics,
    profits: profitsStatistics,
    exchanges: exchangesStatistics,
  };
};
