import { Document, model, Schema, Types } from 'mongoose';

import { balanceType } from '@type/balance.type';

const schema: Schema = new Schema({
  name: { type: String, required: true },
  amount: { type: Number, required: true, default: 0 },
  ownerId: { type: Types.ObjectId, ref: 'User', required: true },
});

export type MongooseBalance = Document & balanceType;
export default model<MongooseBalance>('Balance', schema);
