export default class ApiError extends Error {
  messageRu;
  messageEn;
  status;
  errors;

  constructor(
    status: number,
    messageEn: string,
    messageRu: string,
    errors: Error[] = [],
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

  static BadRequest(messageEn: string, messageRu: string) {
    return new ApiError(400, messageEn, messageRu);
  }

  static ServerError(
    messageEn: string,
    messageRu: string,
    errors: Error[] = [],
  ) {
    return new ApiError(500, messageEn, messageRu, errors);
  }
}
