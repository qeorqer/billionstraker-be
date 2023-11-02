import { Types } from 'mongoose';

enum TransactionTypes {
  'expense' = 'expense',
  'profit' = 'profit',
  'exchange' = 'exchange',
}

export type Transaction = {
  _id?: string;
  title: string;
  ownerId: Types.ObjectId;
  sum: number;
  sumToSubtract?: number;
  category: String;
  date: Date;
  balance: string;
  balanceToSubtract?: string;
  transactionType: TransactionTypes;
};

export type FilteringOptions = {
  shownTransactionsTypes: string;
  categoriesToShow: string[];
  balancesToShow: string[];
  from: Date,
  to: Date,
};
