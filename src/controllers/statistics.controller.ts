import { Request, Response, NextFunction } from 'express';

import * as statisticService from '@services/statistics.service';

type ControllerFunction = (
  req: Request,
  res: Response,
  next: NextFunction,
) => Promise<Response | void>;

export const getStatisticsForBalance: ControllerFunction = async (
  req,
  res,
  next,
) => {
  try {
    const { userId } = req.body.user;
    const { from, to, balance } = req.body;

    const statistic = await statisticService.getStatisticsForBalance(
      userId,
      from,
      to,
      balance,
    );

    return res.json({
      message: 'Statistic calculated successfully',
      statistic,
    });
  } catch (e) {
    next(e);
  }
};
