import { getUserId } from "../middleware/requireAuth.js";
import { createSender, listSenders, getSenderById, deleteSender } from "../services/sender.service.js";
import { sendSuccess } from "../utils/apiResponse.js";
export async function createSenderHandler(req, res, next) {
    try {
        const userId = getUserId(req);
        const sender = await createSender(userId, req.body);
        sendSuccess(res, { sender }, 201);
    }
    catch (err) {
        next(err);
    }
}
export async function listSendersHandler(req, res, next) {
    try {
        const userId = getUserId(req);
        const senders = await listSenders(userId);
        sendSuccess(res, { senders });
    }
    catch (err) {
        next(err);
    }
}
export async function getSenderHandler(req, res, next) {
    try {
        const userId = getUserId(req);
        const sender = await getSenderById(userId, req.params.id);
        sendSuccess(res, { sender });
    }
    catch (err) {
        next(err);
    }
}
export async function deleteSenderHandler(req, res, next) {
    try {
        const userId = getUserId(req);
        await deleteSender(userId, req.params.id);
        sendSuccess(res, { deleted: true });
    }
    catch (err) {
        next(err);
    }
}
//# sourceMappingURL=sender.controller.js.map