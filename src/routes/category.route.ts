import { Router } from 'express';

import authMiddleware from '../middlewares/auth.middleware';
import * as categoryController from '../controllers/category.controller';

const categoryRouter: Router = Router();

categoryRouter.get(
  '/getCategories',
  authMiddleware,
  categoryController.getCategories,
);

categoryRouter.post(
  '/createCategory',
  authMiddleware,
  categoryController.createCategory,
);

categoryRouter.patch(
  '/updateCategory',
  authMiddleware,
  categoryController.updateCategory,
);

categoryRouter.delete(
  '/deleteCategory',
  authMiddleware,
  categoryController.deleteCategory,
);

export default categoryRouter;
