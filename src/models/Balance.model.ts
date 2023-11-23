import { Document, model, Schema, Types } from 'mongoose';

import { Balance } from '@type/balance.type';

const schema: Schema = new Schema({
  name: { type: String, required: true },
  amount: { type: Number, required: true, default: 0 },
  ownerId: { type: Types.ObjectId, ref: 'User', required: true },
  currency: { type: String, required: false, default: null },
});

export type MongooseBalance = Document & Balance;
export default model<MongooseBalance>('Balance', schema);
