import { Types } from 'mongoose';

enum transactionTypes {
  'expense' = 'expense',
  'profit' = 'profit',
  'exchange' = 'exchange',
}

export type TransactionType = {
  title: string;
  ownerId: Types.ObjectId;
  sum: number;
  sumToSubtract?: number;
  category: Types.ObjectId;
  date: Date;
  balance: String,
  balanceToSubtract?: String,
  transactionType: transactionTypes,
};
