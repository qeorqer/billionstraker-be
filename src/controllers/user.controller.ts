import { NextFunction, Request, Response } from 'express';
import { validationResult } from 'express-validator';

import * as userService from '@services/user.service';
import ApiError from '@exceptions/api-errors';

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

    await userService.signUp(login, password);

    return res.status(201).json({
      message: 'User created successfully',
    });
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

    res.cookie('refreshToken', logInRes.refreshToken, {
      maxAge: 30 * 24 * 60 * 60 * 1000,
      httpOnly: true,
      secure: true,
      sameSite: 'none',
    });
    return res.json(logInRes);
  } catch (e) {
    next(e);
  }
};

export const refresh: ControllerFunction = async (req, res, next) => {
  try {
    const { refreshToken } = req.cookies;

    const result = await userService.refresh(refreshToken);

    res.cookie('refreshToken', result.refreshToken, {
      maxAge: 30 * 24 * 60 * 60 * 1000,
      httpOnly: true,
      secure: true,
      sameSite: 'none',
    });
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

export const setFirstEnter: ControllerFunction = async (req, res, next) => {
  try {
    const { userId } = req.body.user;

    const user = await userService.setFirstEnter(userId);

    return res.status(201).json({
      message: 'isFirstEnter set to false',
      user,
    });
  } catch (e) {
    next(e);
  }
};

export const setInitialValues: ControllerFunction = async (req, res, next) => {
  try {
    const { userId } = req.body.user;
    const { card, cash }: { card: number; cash: number } = req.body;

    const user = await userService.setInitialValues(userId, card, cash);

    return res.status(201).json({
      message: 'initial values where set successfully',
      user,
    });
  } catch (e) {
    next(e);
  }
};
