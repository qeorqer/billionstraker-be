import { ValidationError } from 'express-validator';

export default class ApiError extends Error {
  message;
  status;
  errors;

  constructor(
    status: number,
    message: string,
    errors: Error[] | ValidationError[] = [],
  ) {
    super(message);
    this.status = status;
    this.errors = errors;
    this.message = message;
  }

  static UnauthorizedError() {
    return new ApiError(401, 'User is unauthorized');
  }

  static BadRequest(message: string, errors: ValidationError[] = []) {
    return new ApiError(400, message, errors);
  }

  static ServerError(message: string, errors: Error[] = []) {
    return new ApiError(500, message, errors);
  }
}
