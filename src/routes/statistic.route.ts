import { Router } from 'express';

import authMiddleware from '@middlewares/auth.middleware';
import * as statisticController from '@controllers/statistic.controller';

const statisticRouter: Router = Router();

statisticRouter.post(
  '/getStatisticsForBalance',
  authMiddleware,
  statisticController.getStatisticsForBalance,
);

export default statisticRouter;
