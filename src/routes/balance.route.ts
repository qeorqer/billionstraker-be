import { Router } from 'express';

import authMiddleware from '../middlewares/auth.middleware';
import * as balanceController from '../controllers/balance.controller';

const balanceRouter: Router = Router();

balanceRouter.post(
  '/createBalance',
  authMiddleware,
  balanceController.createBalance,
);

export default balanceRouter;
