import { Types } from 'mongoose';

export type Balance = {
  _id: Types.ObjectId;
  name: string;
  amount: number;
  ownerId: Types.ObjectId;
  currency: string | null;
};
