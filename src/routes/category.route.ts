import { Router } from 'express';

import authMiddleware from '@middlewares/auth.middleware';
import * as categoryController from '@controllers/category.controller';

const categoryRouter: Router = Router();

categoryRouter.get(
  '/get',
  authMiddleware,
  categoryController.getCategories,
);

categoryRouter.post(
  '/create',
  authMiddleware,
  categoryController.createCategory,
);

categoryRouter.patch(
  '/update',
  authMiddleware,
  categoryController.updateCategory,
);

categoryRouter.delete(
  '/delete',
  authMiddleware,
  categoryController.deleteCategory,
);

export default categoryRouter;
