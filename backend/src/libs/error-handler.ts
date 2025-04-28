export class AppError extends Error {
  public readonly statusCode: number;
  public readonly details?: any;
  constructor(status: number, message: string) {
    super(message);
    this.statusCode = status;
  }
}

export class ValidationError extends AppError {
  constructor(message: string = "Invalid request data") {
    super(400, message);
  }
}

export class NotFoundError extends AppError {
  constructor(message: string = "Not found") {
    super(404, message);
  }
}

export class AuthError extends AppError {
  constructor(message: string = "Unauthorized") {
    super(401, message);
  }
}
