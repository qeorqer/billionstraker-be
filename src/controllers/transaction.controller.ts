import { NextFunction, Request, Response } from 'express';

import * as transactionService from '@services/transaction.service';
import ApiError from '@exceptions/api-errors';

type ControllerFunction = (
  req: Request,
  res: Response,
  next: NextFunction,
) => Promise<Response | void>;

export const createTransaction: ControllerFunction = async (req, res, next) => {
  try {
    const { transaction, balanceId, balanceToSubtractId } = req.body;
    const { userId } = req.body.user;

    if (!transaction || !balanceId) {
      return next(
        ApiError.BadRequest('Transaction and balanceId are required', ''),
      );
    }

    const createdTransaction = await transactionService.createTransaction(
      transaction,
      balanceId,
      userId,
      balanceToSubtractId,
    );

    return res.status(201).json({
      messageEn: 'Transaction created successfully',
      ...createdTransaction,
    });
  } catch (e) {
    next(e);
  }
};

export const getUserTransactions: ControllerFunction = async (
  req,
  res,
  next,
) => {
  try {
    const { userId } = req.body.user;
    const { limit, numberToSkip }: { limit: number; numberToSkip: number } =
      req.body;

    const transactionRes = await transactionService.getUserTransactions(
      userId,
      limit,
      numberToSkip,
    );

    if (!transactionRes) {
      return res.json({
        messageEn: 'There is no transactions yet',
        messageRu: 'Пока что нет транзакций',
        transactions: [],
      });
    }

    return res.json({
      messageEn: 'Transactions loaded successfully',
      messageRu: 'Транзакции успешно загружены',
      transactions: transactionRes?.transactions,
      numberOfTransactions: transactionRes?.numberOfTransactions,
    });
  } catch (e) {
    next(e);
  }
};
