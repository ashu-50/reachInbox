import { Router } from "express";
import { healthRouter } from "./health.routes.js";
import { campaignRouter } from "./campaign.routes.js";
import { authRouter } from "./auth.routes.js";
import { slackRouter } from "./slack.routes.js";
import { emailRouter } from "./email.routes.js";
import { adminRouter } from "./admin.routes.js";
import { senderRouter } from "./sender.routes.js";

export const rootRouter = Router();

// /health is mounted at the root, not under /api
rootRouter.use(healthRouter);

const apiRouter = Router();
rootRouter.use("/api", apiRouter);

apiRouter.use("/auth", authRouter);
apiRouter.use("/campaigns", campaignRouter);
apiRouter.use("/emails", emailRouter);
apiRouter.use("/slack", slackRouter);
apiRouter.use("/admin", adminRouter);
apiRouter.use("/senders", senderRouter);

export { apiRouter };