import { NextFunction, Request, Response } from 'express';

import * as transactionService from '@services/transaction.service';
import ApiError from '@exceptions/api-errors';
import { FilteringOptions } from '@type/transaction.type';

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
        ApiError.BadRequest('Transaction and balanceId are required'),
      );
    }

    const createdTransaction = await transactionService.createTransaction(
      transaction,
      balanceId,
      userId,
      balanceToSubtractId,
    );

    return res.status(201).json({
      message: 'Transaction created successfully',
      ...createdTransaction,
    });
  } catch (e) {
    next(e);
  }
};

type getUserTransactionsReqBodyType = {
  limit: number;
  numberToSkip: number;
  filteringOptions: FilteringOptions;
};

export const getUserTransactions: ControllerFunction = async (
  req,
  res,
  next,
) => {
  try {
    const { userId } = req.body.user;
    const {
      limit,
      numberToSkip,
      filteringOptions,
    }: getUserTransactionsReqBodyType = req.body;

    const transactionRes = await transactionService.getUserTransactions(
      userId,
      limit,
      numberToSkip,
      filteringOptions,
    );

    if (!transactionRes) {
      return res.json({
        message: 'There is no transactions yet',
        transactions: [],
      });
    }

    return res.json({
      message: 'Transactions loaded successfully',
      transactions: transactionRes?.transactions,
      numberOfTransactions: transactionRes?.numberOfTransactions,
    });
  } catch (e) {
    next(e);
  }
};
