export class AppError extends Error {
  public readonly statusCode: number;
  public readonly code: string;

  constructor(statusCode: number, code: string, message: string) {
    super(message);
    this.statusCode = statusCode;
    this.code = code;
    this.name = "AppError";
    Error.captureStackTrace?.(this, AppError);
  }

  static badRequest(message: string, code = "BAD_REQUEST"): AppError {
    return new AppError(400, code, message);
  }

  static unauthorized(message = "Authentication required", code = "UNAUTHORIZED"): AppError {
    return new AppError(401, code, message);
  }

  static forbidden(message = "Forbidden", code = "FORBIDDEN"): AppError {
    return new AppError(403, code, message);
  }

  static notFound(message = "Resource not found", code = "NOT_FOUND"): AppError {
    return new AppError(404, code, message);
  }

  static conflict(message: string, code = "CONFLICT"): AppError {
    return new AppError(409, code, message);
  }

  static internal(message = "Internal server error", code = "INTERNAL_ERROR"): AppError {
    return new AppError(500, code, message);
  }
}
