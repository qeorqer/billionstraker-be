import { Request, Response, NextFunction } from 'express';

import * as statisticService from '@services/statistics.service';

type ControllerFunction = (
  req: Request,
  res: Response,
  next: NextFunction,
) => Promise<Response | void>;

export const getStatistics: ControllerFunction = async (req, res, next) => {
  try {
    const { userId } = req.body.user;
    const { from, to, balance } = req.body;

    const statistics = await statisticService.getStatistics(
      userId,
      from,
      to,
      balance,
    );

    return res.json({
      message: 'Statistics for single balance calculated successfully',
      statistics,
    });
  } catch (e) {
    next(e);
  }
};

export const getNetWorth: ControllerFunction = async (req, res, next) => {
  try {
    const { userId } = req.body.user;

    const statistics = await statisticService.getNetWorth(userId);

    return res.json({
      message: 'Net worth calculated successfully',
      statistics,
    });
  } catch (e) {
    next(e);
  }
};
