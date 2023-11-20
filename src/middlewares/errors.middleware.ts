import { NextFunction, Request, Response } from 'express';
import chalk from 'chalk';

import ApiError from '@exceptions/api-errors';

export default function (
  err: ApiError | Error,
  req: Request,
  res: Response,
  next: NextFunction,
) {
  console.log(
    chalk.green(new Date().toISOString()),
    chalk.red('Error =>'),
    err,
    chalk.red('<= Error'),
  );

  if (err instanceof ApiError) {
    return res.status(err.status).json({
      message: err.message || 'Unhandled error.',
      errors: err.errors,
    });
  }

  return res.status(500).json({
    message: 'Unhandled error.',
    errors: err.stack,
  });
}
