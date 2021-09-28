import ApiError from "../exceptions/api-errors"
import { NextFunction, Request, Response } from "express"

export default function (err: ApiError | Error, req: Request, res: Response, next: NextFunction) {
  console.log('Error =>', err)

  if (err instanceof ApiError) {
    return res
      .status(err.status)
      .json({
        messageEn: err.messageEn || 'Unhandled error.',
        messageRu: err.messageRu || 'Необработанная ошибка.',
        errors: err.errors
      })
  }

  return res
    .status(500)
    .json({
      messageEn: 'Unhandled error.',
      messageRu: 'Необработанная ошибка.',
      errors: err.stack
    })
}