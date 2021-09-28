import Transaction from "../models/Transaction.model"
import ApiError from "../exceptions/api-errors";
import { TransactionType } from "../interfaces/transaction.interface";
import * as userService from '../services/user.service'
import { Types } from "mongoose";
import { UserType } from "../interfaces/user.interface";

export const addTransaction = async (transaction: TransactionType): Promise<Partial<UserType>> => {
  const newTransaction = new Transaction(transaction)
  const result = await newTransaction.save()

  if (!result) {
    throw ApiError.ServerError('Failed to create transaction','Ошибка при создании транзакции')
  }

  const user = await userService.updateBalance(transaction.ownerId, transaction.sum, transaction.isExpense, transaction.isCard)

  return user
}

type getAllTransactionsReturnType = {
  transactions: TransactionType[],
  numberOfTransactions: number
}

export const getUserTransactions = async (userId: Types.ObjectId, limit: number, numberToSkip:number): Promise<getAllTransactionsReturnType | null> => {
  const transactions = await Transaction
    .find({ ownerId: userId })
    .sort({ 'date': -1 })
    .skip(numberToSkip)
    .limit(limit)
    .exec()

  if (!transactions) {
    return null
  }

  const numberOfTransactions = await Transaction.countDocuments({ ownerId: userId })

  return {
    transactions,
    numberOfTransactions
  }
}
