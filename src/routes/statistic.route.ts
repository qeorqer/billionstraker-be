import { Router } from 'express';
import authMiddleware from '../middlewares/auth.middleware';
import * as statisticController from '../controllers/statistic.controller';

const statisticRouter: Router = Router();

statisticRouter.get(
  '/getGeneralStatistic',
  authMiddleware,
  statisticController.getGeneralStatistic,
);

statisticRouter.get(
  '/getWholeStatistic',
  authMiddleware,
  statisticController.getWholeStatistic,
);

statisticRouter.post(
  '/getStatisticForRange',
  authMiddleware,
  statisticController.getStatisticForRange,
);

export default statisticRouter;
