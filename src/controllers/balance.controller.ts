import { NextFunction, Request, Response } from 'express';

import * as balanceService from '../services/balance.service';
import ApiError from '../exceptions/api-errors';

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
