import { Router } from "express";
import { googleAuthStart, googleAuthCallback, logout, me } from "../controllers/auth.controller.js";
export const authRouter = Router();
authRouter.get("/google", googleAuthStart);
authRouter.get("/google/callback", googleAuthCallback);
authRouter.post("/logout", logout);
authRouter.get("/me", me);
//# sourceMappingURL=auth.routes.js.map