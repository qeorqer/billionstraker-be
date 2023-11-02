import { Router } from 'express';

import authMiddleware from '@middlewares/auth.middleware';
import * as balanceController from '@controllers/balance.controller';

const balanceRouter: Router = Router();

balanceRouter.post(
  '/create',
  authMiddleware,
  balanceController.createBalance,
);

balanceRouter.get(
  '/get',
  authMiddleware,
  balanceController.getBalances,
);

balanceRouter.patch(
  '/update',
  authMiddleware,
  balanceController.updateBalance,
);

balanceRouter.delete(
  '/delete',
  authMiddleware,
  balanceController.deleteBalance,
);

export default balanceRouter;
