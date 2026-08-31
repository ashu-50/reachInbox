import type { NextFunction, Request, Response } from "express";
import { AppError } from "../utils/AppError.js";

export function requireAuth(req: Request, _res: Response, next: NextFunction): void {
  const userId = req.session.userId;
  if (!userId) {
    next(AppError.unauthorized("You must be signed in to perform this action."));
    return;
  }
  next();
}

export function getUserId(req: Request): string {
  const userId = req.session.userId;
  if (!userId) {
    throw AppError.unauthorized();
  }
  return userId;
}
