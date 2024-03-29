import { Router } from 'express';
import { check } from 'express-validator';

import * as userController from '@controllers/user.controller';
import authMiddleware from '@middlewares/auth.middleware';

const userRouter: Router = Router();

userRouter.post(
  '/signup',
  [
    check('login', 'incorrect email').isEmail(),
    check('password', 'must contain at least 6 symbols').isLength({ min: 6 }),
  ],
  userController.signUp,
);

userRouter.post(
  '/login',
  [
    check('login', 'enter normalized email').normalizeEmail().isEmail(),
    check('password', 'must contain at least 6 symbols').isLength({ min: 6 }),
  ],
  userController.logIn,
);

userRouter.post('/refresh', userController.refresh);

userRouter.get('/get', authMiddleware, userController.getUser);

userRouter.post('/logout', userController.logOut);

userRouter.patch('/update', authMiddleware, userController.updateUser);

export default userRouter;
