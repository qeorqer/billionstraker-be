import { Router } from 'express';

import authMiddleware from '@middlewares/auth.middleware';
import * as transactionController from '@controllers/transaction.controller';

const transactionRouter: Router = Router();

transactionRouter.post(
  '/create',
  authMiddleware,
  transactionController.createTransaction,
);

transactionRouter.post(
  '/get',
  authMiddleware,
  transactionController.getUserTransactions,
);

transactionRouter.delete(
  '/delete',
  authMiddleware,
  transactionController.deleteTransaction,
);

transactionRouter.patch(
  '/update',
  authMiddleware,
  transactionController.editTransaction,
);

export default transactionRouter;
