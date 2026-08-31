import { Router } from "express";
import { requireAuth } from "../middleware/requireAuth.js";
import { slackConnect, slackCallback, slackDisconnect, slackStatus } from "../controllers/slack.controller.js";
export const slackRouter = Router();
slackRouter.get("/connect", requireAuth, slackConnect);
slackRouter.get("/callback", slackCallback);
slackRouter.post("/disconnect", requireAuth, slackDisconnect);
slackRouter.get("/status", requireAuth, slackStatus);
//# sourceMappingURL=slack.routes.js.map