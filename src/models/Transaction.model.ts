import { Document, model, Schema, Types } from 'mongoose';
import { TransactionType } from '../types/transaction.type';

const transactionTypes = ['expense', 'profit', 'exchange'];

const schema: Schema = new Schema({
  title: { type: String, required: true },
  ownerId: { type: Types.ObjectId, ref: 'User', required: true },
  sum: { type: Number, required: true },
  balance: { type: String, required: true },
  transactionType: { type: String, enum: transactionTypes, required: true },
  category: { type: Types.ObjectId, ref: 'Category', required: true },
  date: { type: Date, default: new Date() },
});

type MongooseUser = Document & TransactionType;
export default model<MongooseUser>('Transaction', schema);
