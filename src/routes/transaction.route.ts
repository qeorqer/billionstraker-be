import { Router } from 'express';

import authMiddleware from '@middlewares/auth.middleware';
import * as transactionController from '@controllers/transaction.controller';

const transactionRouter: Router = Router();

transactionRouter.post(
  '/createTransaction',
  authMiddleware,
  transactionController.createTransaction,
);

transactionRouter.post(
  '/getAllUserTransactions',
  authMiddleware,
  transactionController.getUserTransactions,
);

transactionRouter.delete(
  '/deleteTransaction',
  authMiddleware,
  transactionController.deleteTransaction,
);

export default transactionRouter;
