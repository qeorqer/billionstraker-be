import { NextFunction, Request, Response } from 'express';

import * as balanceService from '../services/balance.service';

type ControllerFunction = (
  req: Request,
  res: Response,
  next: NextFunction,
) => Promise<Response | void>;

export const createBalance: ControllerFunction = async (req, res, next) => {
  try {
    const categories = await balanceService.createBalance();
    return res.json({
      messageEn: 'Сategories loaded successfully',
      messageRu: 'Категории успешно загружены',
      categories,
    });
  } catch (e) {
    next(e);
  }
};
