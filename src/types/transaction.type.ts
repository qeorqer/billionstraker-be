import { Types } from 'mongoose';

export type TransactionType = 'expense' | 'profit' | 'exchange';

export type Transaction = {
  _id?: string;
  title: string;
  ownerId: Types.ObjectId;
  sum: number;
  sumToSubtract?: number;
  category: string;
  date: Date;
  balance: string;
  balanceToSubtract?: string;
  transactionType: TransactionType;
};

export type FilteringOptions = {
  shownTransactionsTypes: string;
  transactionName: string;
  categoriesToShow: string[];
  balancesToShow: string[];
  from: Date;
  to: Date;
};
