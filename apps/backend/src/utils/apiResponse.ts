import type { Response } from "express";

export function sendSuccess<T>(res: Response, data: T, status = 200): void {
  res.status(status).json({ success: true, data });
}

export interface ApiErrorShape {
  code: string;
  message: string;
}

export function sendError(res: Response, status: number, code: string, message: string): void {
  res.status(status).json({ success: false, error: { code, message } satisfies ApiErrorShape });
}
