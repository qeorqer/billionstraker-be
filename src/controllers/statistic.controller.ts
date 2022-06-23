import { Request, Response, NextFunction } from 'express';

import * as statisticService from '@services/statistic.service';

type ControllerFunction = (
  req: Request,
  res: Response,
  next: NextFunction,
) => Promise<Response | void>;

export const getGeneralStatistic: ControllerFunction = async (
  req,
  res,
  next,
) => {
  try {
    const { userId } = req.body.user;

    const statistic = await statisticService.getGeneralStatistic(userId);

    return res.json({
      messageEn: 'Statistic calculated successfully',
      messageRu: 'Статистика успешно рассчитана',
      statistic,
    });
  } catch (e) {
    next(e);
  }
};

export const getWholeStatistic: ControllerFunction = async (req, res, next) => {
  try {
    const { userId } = req.body.user;

    const statistic = await statisticService.getWholeStatistic(userId);

    return res.json({
      messageEn: 'Statistic calculated successfully',
      messageRu: 'Статистика успешно рассчитана',
      statistic,
    });
  } catch (e) {
    next(e);
  }
};

export const getStatisticForRange: ControllerFunction = async (
  req,
  res,
  next,
) => {
  try {
    const { userId } = req.body.user;
    const { from, to } = req.body;

    const statistic = await statisticService.getStatisticForRange(
      userId,
      from,
      to,
    );

    return res.json({
      messageEn: 'Statistic calculated successfully',
      messageRu: 'Статистика успешно рассчитана',
      statistic,
    });
  } catch (e) {
    next(e);
  }
};
