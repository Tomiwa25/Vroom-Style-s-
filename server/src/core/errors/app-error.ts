/**
 * Base Application / Domain Error class.
 * Core domain services throw domain errors inheriting from AppError,
 * without having any knowledge of Express or HTTP protocols.
 */
export class AppError extends Error {
  public readonly statusCode: number;
  public readonly isOperational: boolean;
  public readonly errors?: unknown;

  constructor(
    message: string,
    statusCode = 400,
    isOperational = true,
    errors?: unknown
  ) {
    super(message);
    this.name = this.constructor.name;
    this.statusCode = statusCode;
    this.isOperational = isOperational;
    this.errors = errors;
    Error.captureStackTrace(this, this.constructor);
  }
}

export class BadRequestError extends AppError {
  constructor(message = "Bad request", errors?: unknown) {
    super(message, 400, true, errors);
  }
}

export class UnauthorizedError extends AppError {
  constructor(message = "Authentication required") {
    super(message, 401, true);
  }
}

export class ForbiddenError extends AppError {
  constructor(message = "Permission denied") {
    super(message, 403, true);
  }
}

export class NotFoundError extends AppError {
  constructor(message = "Resource not found") {
    super(message, 404, true);
  }
}

export class ConflictError extends AppError {
  constructor(message = "Conflict with existing resource") {
    super(message, 409, true);
  }
}
