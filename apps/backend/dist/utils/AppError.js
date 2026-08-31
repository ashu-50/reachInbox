export class AppError extends Error {
    statusCode;
    code;
    constructor(statusCode, code, message) {
        super(message);
        this.statusCode = statusCode;
        this.code = code;
        this.name = "AppError";
        Error.captureStackTrace?.(this, AppError);
    }
    static badRequest(message, code = "BAD_REQUEST") {
        return new AppError(400, code, message);
    }
    static unauthorized(message = "Authentication required", code = "UNAUTHORIZED") {
        return new AppError(401, code, message);
    }
    static forbidden(message = "Forbidden", code = "FORBIDDEN") {
        return new AppError(403, code, message);
    }
    static notFound(message = "Resource not found", code = "NOT_FOUND") {
        return new AppError(404, code, message);
    }
    static conflict(message, code = "CONFLICT") {
        return new AppError(409, code, message);
    }
    static internal(message = "Internal server error", code = "INTERNAL_ERROR") {
        return new AppError(500, code, message);
    }
}
//# sourceMappingURL=AppError.js.map