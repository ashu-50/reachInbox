import crypto from "node:crypto";
import { getSlackAuthUrl, exchangeSlackCode } from "../integrations/slack/slackOAuth.js";
import { saveSlackConnection, disconnectSlack, getSlackStatus } from "../services/slack.service.js";
import { getUserId } from "../middleware/requireAuth.js";
import { sendSuccess } from "../utils/apiResponse.js";
import { AppError } from "../utils/AppError.js";
export function slackConnect(req, res, next) {
    try {
        const userId = getUserId(req);
        const state = crypto.randomUUID();
        req.session.slackOAuthState = state;
        // Encode the user id into state as well so the callback (a top-level
        // navigation, not an XHR) can identify the user even if the session
        // cookie handling differs across browsers during the redirect.
        const url = getSlackAuthUrl(`${state}.${userId}`);
        res.redirect(url);
    }
    catch (err) {
        next(err);
    }
}
export async function slackCallback(req, res, next) {
    try {
        const code = typeof req.query.code === "string" ? req.query.code : undefined;
        const state = typeof req.query.state === "string" ? req.query.state : undefined;
        if (!code || !state) {
            throw AppError.badRequest("Missing 'code' or 'state' query parameter", "SLACK_OAUTH_INVALID");
        }
        const [statePart, userId] = state.split(".");
        if (!statePart || !userId || statePart !== req.session.slackOAuthState) {
            throw AppError.badRequest("Invalid or expired Slack OAuth state", "SLACK_OAUTH_STATE_MISMATCH");
        }
        delete req.session.slackOAuthState;
        const result = await exchangeSlackCode(code);
        await saveSlackConnection(userId, result);
        sendSuccess(res, { connected: true });
    }
    catch (err) {
        next(err);
    }
}
export async function slackDisconnect(req, res, next) {
    try {
        const userId = getUserId(req);
        await disconnectSlack(userId);
        sendSuccess(res, { disconnected: true });
    }
    catch (err) {
        next(err);
    }
}
export async function slackStatus(req, res, next) {
    try {
        const userId = getUserId(req);
        const status = await getSlackStatus(userId);
        sendSuccess(res, status);
    }
    catch (err) {
        next(err);
    }
}
//# sourceMappingURL=slack.controller.js.map