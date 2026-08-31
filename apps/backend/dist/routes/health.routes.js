import { Router } from "express";
import { sendSuccess } from "../utils/apiResponse.js";
export const healthRouter = Router();
healthRouter.get("/health", (_req, res) => {
    sendSuccess(res, { status: "ok" });
});
//# sourceMappingURL=health.routes.js.map