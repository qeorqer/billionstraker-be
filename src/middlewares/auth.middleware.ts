import { NextFunction, Request, Response } from 'express';
import ApiError from '../exceptions/api-errors';
import { validateAccessToken } from '../helpers/auth.hellper';

export default function (
  req: Request,
  res: Response,
  next: NextFunction,
): void {
  try {
    const authHeader = req.headers.authorization;
    if (!authHeader) {
      return next(ApiError.UnauthorizedError());
    }

    const accessToken = authHeader.split(' ')[1];
    if (!authHeader) {
      return next(ApiError.UnauthorizedError());
    }

    const userData = validateAccessToken(accessToken);
    if (!userData) {
      return next(ApiError.UnauthorizedError());
    }

    req.body.user = userData;
    next();
  } catch (e) {
    return next(ApiError.UnauthorizedError());
  }
}
