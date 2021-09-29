import { NextFunction, Request, Response } from 'express'
import * as transactionService from '../services/transaction.service'

type ControllerFunction = (req: Request, res: Response, next: NextFunction) => Promise<Response | void>

export const addTransaction: ControllerFunction = async (req, res, next) => {
  try {
    const { transaction } = req.body

    const updatedUser = await transactionService.addTransaction(transaction)

    return res.status(201).json({
      messageEn: 'Transaction created successfully',
      messageRu: 'Транзакция успешно создана',
      updatedUser
    })
  } catch (e) {
    next(e)
  }
}

export const getUserTransactions: ControllerFunction = async (req, res, next) => {
  try {
    const { id: userId } = req.body.user
    const { limit, numberToSkip }: { limit: number, numberToSkip: number } = req.body

    const transactionRes = await transactionService.getUserTransactions(userId, limit, numberToSkip)

    if (!transactionRes) {
      return res.json({
        messageEn: 'There is no transactions yet',
        messageRu: 'Пока что нет транзакций',
        transactions: []
      })
    }

    return res.json({
      messageEn: 'Transactions loaded successfully',
      messageRu: 'Транзакции успешно загружены',
      transactions: transactionRes?.transactions,
      numberOfTransactions: transactionRes?.numberOfTransactions
    })
  } catch (e) {
    next(e)
  }
}