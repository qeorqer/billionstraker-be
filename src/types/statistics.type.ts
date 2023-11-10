import { Types } from 'mongoose';

import { Transaction, TransactionType } from '@type/transaction.type';
import { User } from '@type/user.type';
import { Balance } from '@type/balance.type';

export type GetNetWorthResult = {
  value: number;
  currency: string;
};

export type CategoryStatistics = {
  name: string;
  amount: number;
};

export type StatisticsForTransactionTypeResult = {
  range: CategoryStatistics[];
  total: number;
};

export type GetExchangesStatisticsResult = {
  totallySend: number;
  totallyReceived: number;
};

export type GetStatisticsResult = {
  expenses: StatisticsForTransactionTypeResult;
  profits: StatisticsForTransactionTypeResult;
  exchanges: GetExchangesStatisticsResult | null;
};

export type GetTransactionsByTypeOptions = {
  userId: Types.ObjectId;
  from: Date;
  to: Date;
  balanceNameQuery?: Record<string, any>;
  transactionType: TransactionType;
};

export type GetStatisticsRangeOptions = {
  transactions: Transaction[];
  user: User;
  balances: Balance[];
  balanceName: string | null;
};
