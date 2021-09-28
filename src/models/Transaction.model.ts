import { Document, model, Schema, Types } from "mongoose"
import { TransactionType } from "../interfaces/transaction.interface"

const schema: Schema = new Schema({
  title: {type: String, required: true},
  ownerId : { type: Types.ObjectId, ref: 'User', required: true },
  sum: { type: Number, required: true },
  isCard: { type: Boolean, required: true },
  isExpense: { type: Boolean, required: true },
  category: {type: Types.ObjectId, ref: 'Category', required: true},
  date: { type: Date, default: new Date(), required: true }
})

type MongooseUser = Document & TransactionType
export default model<MongooseUser>('Transaction', schema)
