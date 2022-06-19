import { Types } from 'mongoose';

export type balanceType = {
  name: string;
  amount: number;
  ownerId: Types.ObjectId;
};
