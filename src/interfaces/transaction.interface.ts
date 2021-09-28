import { Types } from "mongoose"

export type TransactionType = {
  title: string,
  ownerId: Types.ObjectId,
  isCard: boolean,
  isExpense: boolean,
  sum: number,
  category: Types.ObjectId,
  data: Date,
}
