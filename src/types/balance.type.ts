import { Types } from 'mongoose';

export type Balance = {
  name: string;
  amount: number;
  ownerId: Types.ObjectId;
  currency: string | null;
};
