import { Document, model, Schema, Types } from 'mongoose';
import { TransactionType } from '../types/transaction.type';

const transactionTypes = ['expense', 'profit', 'exchange'];

const schema: Schema = new Schema({
  title: { type: String, required: true },
  ownerId: { type: Types.ObjectId, ref: 'User', required: true },
  sum: { type: Number, required: true },
  sumToSubtract: {type: Number, required: false},
  balance: { type: String, required: true },
  balanceToSubtract: { type: String, required: false },
  transactionType: { type: String, enum: transactionTypes, required: true },
  category: { type: Types.ObjectId, ref: 'Category', required: false },
  date: { type: Date, default: new Date(), required: true },
});

type MongooseTransaction = Document & TransactionType;
export default model<MongooseTransaction>('Transaction', schema);
