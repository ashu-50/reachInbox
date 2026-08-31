import type { Request, Response, NextFunction } from "express";
import { getUserId } from "../middleware/requireAuth.js";
import { listScheduledEmails, listSentEmails, searchUserEmails } from "../services/email.service.js";
import { sendSuccess } from "../utils/apiResponse.js";

export async function getScheduledEmails(req: Request, res: Response, next: NextFunction): Promise<void> {
  try {
    const userId = getUserId(req);
    const emails = await listScheduledEmails(userId);
    sendSuccess(res, { emails });
  } catch (err) {
    next(err);
  }
}

export async function getSentEmails(req: Request, res: Response, next: NextFunction): Promise<void> {
  try {
    const userId = getUserId(req);
    const emails = await listSentEmails(userId);
    sendSuccess(res, { emails });
  } catch (err) {
    next(err);
  }
}

export async function searchEmailsHandler(req: Request, res: Response, next: NextFunction): Promise<void> {
  try {
    const userId = getUserId(req);
    const query = typeof req.query.q === "string" ? req.query.q : undefined;
    const status = typeof req.query.status === "string" ? req.query.status : undefined;
    const results = await searchUserEmails(userId, query, status);
    sendSuccess(res, { results });
  } catch (err) {
    next(err);
  }
}
