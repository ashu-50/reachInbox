import { Router } from "express";
import { requireAuth } from "../middleware/requireAuth.js";
import { validateBody } from "../middleware/validate.js";
import { createCampaignSchema } from "../services/campaign.schema.js";
import { createCampaignHandler } from "../controllers/campaign.controller.js";
export const campaignRouter = Router();
campaignRouter.post("/", requireAuth, validateBody(createCampaignSchema), createCampaignHandler);
//# sourceMappingURL=campaign.routes.js.map