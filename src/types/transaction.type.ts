import { Types } from 'mongoose';

enum transactionTypes {
  'expense',
  'profit',
  'exchange',
}

export type TransactionType = {
  title: string;
  ownerId: Types.ObjectId;
  sum: number;
  category: Types.ObjectId;
  data: Date;
  balance: String,
  transactionType: transactionTypes,
};
