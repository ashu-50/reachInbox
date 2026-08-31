import type { Request, Response, NextFunction } from "express";
import { getUserId } from "../middleware/requireAuth.js";
import { createCampaign } from "../services/campaign.service.js";
import { sendSuccess } from "../utils/apiResponse.js";
import type { CreateCampaignInput } from "../services/campaign.schema.js";

export async function createCampaignHandler(
  req: Request<Record<string, string>, unknown, CreateCampaignInput>,
  res: Response,
  next: NextFunction
): Promise<void> {
  try {
    const userId = getUserId(req);
    const result = await createCampaign(userId, req.body);
    sendSuccess(res, result, 201);
  } catch (err) {
    next(err);
  }
}
