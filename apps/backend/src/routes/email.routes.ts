import { Router } from "express";
import { requireAuth } from "../middleware/requireAuth.js";
import { getScheduledEmails, getSentEmails, searchEmailsHandler } from "../controllers/email.controller.js";

export const emailRouter = Router();

emailRouter.get("/scheduled", requireAuth, getScheduledEmails);
emailRouter.get("/sent", requireAuth, getSentEmails);
emailRouter.get("/search", requireAuth, searchEmailsHandler);
