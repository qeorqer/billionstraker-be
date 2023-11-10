import { Types } from 'mongoose';

import { Transaction, TransactionType } from '@type/transaction.type';
import { User } from '@type/user.type';
import { Balance } from '@type/balance.type';

export type GetNetWorthResponse = {
  value: number;
  currency: string;
};

export type CategoryStatistics = {
  name: string;
  amount: number;
};

export type StatisticsForTransactionTypeResponse = {
  range: CategoryStatistics[];
  total: number;
};

export type GetExchangesStatisticsResponse = {
  totallySend: number;
  totallyReceived: number;
};

export type GetStatisticsResponse = {
  expenses: StatisticsForTransactionTypeResponse;
  profits: StatisticsForTransactionTypeResponse;
  exchanges: GetExchangesStatisticsResponse | null;
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
