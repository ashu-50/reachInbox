import type { NextFunction, Request, Response } from "express";
import { ZodError } from "zod";
import {
  PrismaClientKnownRequestError,
  PrismaClientInitializationError
} from "@prisma/client/runtime/library.js";
import { AppError } from "../utils/AppError.js";
import { sendError } from "../utils/apiResponse.js";
import { logger } from "../config/logger.js";

export function notFoundHandler(req: Request, res: Response): void {
  sendError(res, 404, "ROUTE_NOT_FOUND", `No route for ${req.method} ${req.originalUrl}`);
}

// eslint-disable-next-line @typescript-eslint/no-unused-vars
export function errorHandler(err: unknown, req: Request, res: Response, _next: NextFunction): void {
  if (err instanceof AppError) {
    logger.warn({ err: err.message, code: err.code }, "[error] application error");
    sendError(res, err.statusCode, err.code, err.message);
    return;
  }

  if (err instanceof ZodError) {
    const message = err.issues.map((i) => `${i.path.join(".") || "value"}: ${i.message}`).join("; ");
    logger.warn({ issues: err.issues }, "[error] validation error");
    sendError(res, 400, "VALIDATION_ERROR", message);
    return;
  }

  if (err instanceof PrismaClientKnownRequestError) {
    logger.warn({ code: err.code, meta: err.meta }, "[error] prisma known error");
    if (err.code === "P2002") {
      sendError(res, 409, "DUPLICATE_ENTITY", "A record with this value already exists.");
      return;
    }
    if (err.code === "P2025") {
      sendError(res, 404, "NOT_FOUND", "Record not found.");
      return;
    }
    sendError(res, 400, "DATABASE_ERROR", "Database request could not be processed.");
    return;
  }

  if (err instanceof PrismaClientInitializationError) {
    logger.error({ err: err.message }, "[error] prisma init error");
    sendError(res, 503, "DATABASE_UNAVAILABLE", "Database is currently unavailable.");
    return;
  }

  logger.error({ err }, "[error] unhandled error");
  sendError(res, 500, "INTERNAL_ERROR", "Something went wrong.");
}
