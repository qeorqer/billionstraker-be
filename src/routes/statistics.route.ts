import { Router } from 'express';

import authMiddleware from '@middlewares/auth.middleware';
import * as statisticController from '@controllers/statistics.controller';

const statisticRouter: Router = Router();

statisticRouter.post(
  '/getForSingleBalance',
  authMiddleware,
  statisticController.getStatisticsForBalance,
);

export default statisticRouter;
