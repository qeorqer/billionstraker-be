import { ValidationError } from 'express-validator';

export default class ApiError extends Error {
  messageRu;
  messageEn;
  status;
  errors;

  constructor(
    status: number,
    messageEn: string,
    messageRu: string,
    errors: Error[] | ValidationError[] = [],
  ) {
    super(messageEn);
    this.status = status;
    this.errors = errors;
    this.messageEn = messageEn;
    this.messageRu = messageRu;
  }

  static UnauthorizedError() {
    return new ApiError(
      401,
      'User is unauthorized',
      'Пользователь не авторизован',
    );
  }

  static BadRequest(
    messageEn: string,
    messageRu: string,
    errors: ValidationError[] = [],
  ) {
    return new ApiError(400, messageEn, messageRu, errors);
  }

  static ServerError(
    messageEn: string,
    messageRu: string,
    errors: Error[] = [],
  ) {
    return new ApiError(500, messageEn, messageRu, errors);
  }
}
