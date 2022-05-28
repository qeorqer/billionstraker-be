import { Router } from 'express';
import { check } from 'express-validator';

import * as userController from '../controllers/user.controller';
import authMiddleware from '../middlewares/auth.middleware';

const userRouter: Router = Router();

userRouter.post(
  '/signUp',
  [
    check('login', 'incorrect email').isEmail(),
    check('password', 'must contain at least 6 symbols').isLength({ min: 6 }),
  ],
  userController.signUp,
);

userRouter.post(
  '/logIn',
  [
    check('login', 'enter normalized email').normalizeEmail().isEmail(),
    check('password', 'must contain at least 6 symbols').exists(),
  ],
  userController.logIn,
);

userRouter.post('/logOut', userController.logOut);

userRouter.get('/refresh', userController.refresh);

userRouter.patch(
  '/setFirstEnter',
  authMiddleware,
  userController.setFirstEnter,
);

userRouter.patch(
  '/setInitialValues',
  authMiddleware,
  userController.setInitialValues,
);

export default userRouter;
