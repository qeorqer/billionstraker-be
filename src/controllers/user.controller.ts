import { NextFunction, Request, Response } from 'express';
import { validationResult } from 'express-validator';

import * as userService from '@services/user.service';
import ApiError from '@exceptions/api-errors';
import { User } from '@type/user.type';

type ControllerFunction = (
  req: Request,
  res: Response,
  next: NextFunction,
) => Promise<Response | void>;

export const signUp: ControllerFunction = async (req, res, next) => {
  try {
    const errors = validationResult(req);

    if (!errors.isEmpty()) {
      return next(
        ApiError.BadRequest('There are validation errors', errors.array()),
      );
    }

    const { login, password }: { login: string; password: string } = req.body;

    const authRes = await userService.signUp(login, password);

    return res.status(201).json(authRes);
  } catch (e) {
    next(e);
  }
};

export const logIn: ControllerFunction = async (req, res, next) => {
  try {
    const errors = validationResult(req);

    if (!errors.isEmpty()) {
      return next(
        ApiError.BadRequest('There are validation errors', errors.array()),
      );
    }

    const { login, password }: { login: string; password: string } = req.body;

    const logInRes = await userService.logIn(login, password);

    return res.json(logInRes);
  } catch (e) {
    next(e);
  }
};

export const refresh: ControllerFunction = async (req, res, next) => {
  try {
    const { refreshToken } = req.body;

    const result = await userService.refresh(refreshToken);

    return res.json(result);
  } catch (e) {
    next(e);
  }
};

export const logOut: ControllerFunction = async (req, res, next) => {
  try {
    const { refreshToken } = req.body;
    await userService.logOut(refreshToken);
    return res.status(200).json('log out successfully');
  } catch (e) {
    next(e);
  }
};

export const updateUser: ControllerFunction = async (req, res, next) => {
  try {
    const { updatedFields }: { updatedFields: Partial<User> } = req.body;
    const { userId } = req.body.user;

    const user = await userService.updateUser(updatedFields, userId);

    return res.status(201).json({
      message: 'User updated successfully',
      user,
    });
  } catch (e) {
    next(e);
  }
};

export const getUser: ControllerFunction = async (req, res, next) => {
  try {
    const { userId } = req.body.user;

    const user = await userService.getUser(userId);

    return res.status(200).json({
      message: 'User found successfully',
      user,
    });
  } catch (e) {
    next(e);
  }
};
