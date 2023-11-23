import { NextFunction, Request, Response } from 'express';

import * as transactionService from '@services/transaction.service';
import ApiError from '@exceptions/api-errors';
import { FilteringOptions } from '@type/transaction.type';

type ControllerFunction = (
  req: Request,
  res: Response,
  next: NextFunction,
) => Promise<Response | void>;

type GetUserTransactionsReq = {
  limit: number;
  numberToSkip: number;
  filteringOptions: FilteringOptions;
};

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

export const deleteTransaction: ControllerFunction = async (req, res, next) => {
  try {
    const { transactionId } = req.body;
    const { userId } = req.body.user;

    if (!transactionId) {
      return next(
        ApiError.BadRequest('transactionId is required'),
      );
    }

    const removedTransactionId = await transactionService.deleteTransaction(transactionId, userId);

    return res.status(200).json({
      message: 'Transaction removed successfully',
      ...removedTransactionId,
    });
  } catch (e) {
    next(e);
  }
};

export const editTransaction: ControllerFunction = async (req, res, next) => {
  try {
    const { transaction, balanceId, balanceToSubtractId } = req.body;
    const { userId } = req.body.user;

    if (!transaction || !balanceId) {
      return next(
        ApiError.BadRequest('Transaction and balanceId are required'),
      );
    }

    const updatedTransactionData = await transactionService.editTransaction(
      transaction,
      balanceId,
      userId,
      balanceToSubtractId,
    );

    return res.status(200).json({
      message: 'Transaction updated successfully',
      ...updatedTransactionData,
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
    const {
      limit,
      numberToSkip,
      filteringOptions,
    }: GetUserTransactionsReq = req.body;

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
