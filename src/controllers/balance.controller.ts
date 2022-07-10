import { NextFunction, Request, Response } from 'express';

import * as balanceService from '@services/balance.service';
import ApiError from '@exceptions/api-errors';

type ControllerFunction = (
  req: Request,
  res: Response,
  next: NextFunction,
) => Promise<Response | void>;

export const createBalance: ControllerFunction = async (req, res, next) => {
  try {
    const { name, amount }: { name: string; amount: number } = req.body;
    const { userId } = req.body.user;

    if (!name) {
      return next(ApiError.BadRequest('Name is required', ''));
    }

    const balance = await balanceService.createBalance(name, amount, userId);

    return res.json({
      messageEn: 'Balance created successfully',
      messageRu: '',
      balance,
    });
  } catch (e) {
    next(e);
  }
};

export const getBalances: ControllerFunction = async (req, res, next) => {
  try {
    const { userId } = req.body.user;

    const balances = await balanceService.getBalances(userId);

    return res.json({
      messageEn: 'Balance loaded successfully',
      messageRu: '',
      balances,
    });
  } catch (e) {
    next(e);
  }
};

export const updateBalance: ControllerFunction = async (req, res, next) => {
  try {
    const { balanceId, balance } = req.body;

    if (!balanceId || !balance) {
      return next(
        ApiError.BadRequest('BalanceId and balance are required', ''),
      );
    }

    const updatedBalance = await balanceService.updateBalance(
      balanceId,
      balance,
    );

    return res.json({
      messageEn: 'Balance updated successfully',
      messageRu: '',
      balance: updatedBalance,
    });
  } catch (e) {
    next(e);
  }
};

export const deleteBalance: ControllerFunction = async (req, res, next) => {
  try {
    const { balanceId } = req.body;

    if (!balanceId) {
      return next(ApiError.BadRequest('BalanceId is required', ''));
    }

    const removedBalanceId = await balanceService.deleteBalance(balanceId);

    return res.json({
      messageEn: 'Balance deleted successfully',
      messageRu: '',
      balanceId: removedBalanceId,
    });
  } catch (e) {
    next(e);
  }
};
