import type { Request, Response, NextFunction } from "express";
import { getUserId } from "../middleware/requireAuth.js";
import { createSender, listSenders, getSenderById, deleteSender } from "../services/sender.service.js";
import { sendSuccess } from "../utils/apiResponse.js";
import type { CreateSenderInput } from "../services/sender.schema.js";

export async function createSenderHandler(
  req: Request<Record<string, string>, unknown, CreateSenderInput>,
  res: Response,
  next: NextFunction
): Promise<void> {
  try {
    const userId = getUserId(req);
    const sender = await createSender(userId, req.body);
    sendSuccess(res, { sender }, 201);
  } catch (err) {
    next(err);
  }
}

export async function listSendersHandler(req: Request, res: Response, next: NextFunction): Promise<void> {
  try {
    const userId = getUserId(req);
    const senders = await listSenders(userId);
    sendSuccess(res, { senders });
  } catch (err) {
    next(err);
  }
}

export async function getSenderHandler(
  req: Request<{ id: string }>,
  res: Response,
  next: NextFunction
): Promise<void> {
  try {
    const userId = getUserId(req);
    const sender = await getSenderById(userId, req.params.id);
    sendSuccess(res, { sender });
  } catch (err) {
    next(err);
  }
}

export async function deleteSenderHandler(
  req: Request<{ id: string }>,
  res: Response,
  next: NextFunction
): Promise<void> {
  try {
    const userId = getUserId(req);
    await deleteSender(userId, req.params.id);
    sendSuccess(res, { deleted: true });
  } catch (err) {
    next(err);
  }
}