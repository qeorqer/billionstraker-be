import { Types } from 'mongoose';

enum transactionTypes {
  'expense' = 'expense',
  'profit' = 'profit',
  'exchange' = 'exchange',
}

export type TransactionType = {
  _id?: string;
  title: string;
  ownerId: Types.ObjectId;
  sum: number;
  sumToSubtract?: number;
  category: String;
  date: Date;
  balance: string;
  balanceToSubtract?: string;
  transactionType: transactionTypes;
};

export type FilteringOptions = {
  shownTransactionsTypes: string;
  categoriesToShow: string[];
  balancesToShow: string[];
};
