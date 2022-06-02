import { Router } from 'express';

import authMiddleware from '../middlewares/auth.middleware';
import * as balanceController from '../controllers/balance.controller';

const balanceRouter: Router = Router();

balanceRouter.post(
  '/balance',
  authMiddleware,
  balanceController.createBalance,
);

export default balanceRouter;
