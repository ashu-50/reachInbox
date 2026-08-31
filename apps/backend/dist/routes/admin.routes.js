import { Router } from "express";
import { createBullBoard } from "@bull-board/api";
import { BullMQAdapter } from "@bull-board/api/bullMQAdapter.js";
import { ExpressAdapter } from "@bull-board/express";
import { requireAuth } from "../middleware/requireAuth.js";
import { emailQueue } from "../queues/emailQueue.js";
const serverAdapter = new ExpressAdapter();
serverAdapter.setBasePath("/api/admin/queues");
createBullBoard({
    queues: [new BullMQAdapter(emailQueue)],
    serverAdapter
});
export const adminRouter = Router();
// Protected: only authenticated users may view the Bull Board dashboard.
adminRouter.use("/queues", requireAuth, serverAdapter.getRouter());
//# sourceMappingURL=admin.routes.js.map