import { Router } from "express";
import { requireAuth } from "../middleware/requireAuth.js";
import { validateBody } from "../middleware/validate.js";
import { createSenderSchema } from "../services/sender.schema.js";
import {
  createSenderHandler,
  listSendersHandler,
  getSenderHandler,
  deleteSenderHandler
} from "../controllers/sender.controller.js";

export const senderRouter = Router();

senderRouter.post("/", requireAuth, validateBody(createSenderSchema), createSenderHandler);
senderRouter.get("/", requireAuth, listSendersHandler);
senderRouter.get("/:id", requireAuth, getSenderHandler);
senderRouter.delete("/:id", requireAuth, deleteSenderHandler);