import { getGoogleAuthUrl, exchangeCodeForProfile } from "../integrations/google/googleOAuth.js";
import { findOrCreateUserFromGoogle, getUserById } from "../services/auth.service.js";
import { sendSuccess, sendError } from "../utils/apiResponse.js";
import { env } from "../config/env.js";
import { logger } from "../config/logger.js";
import { AppError } from "../utils/AppError.js";
export function googleAuthStart(_req, res, next) {
    try {
        const url = getGoogleAuthUrl();
        res.redirect(url);
    }
    catch (err) {
        next(err);
    }
}
export async function googleAuthCallback(req, res, next) {
    try {
        const code = typeof req.query.code === "string" ? req.query.code : undefined;
        if (!code) {
            throw AppError.badRequest("Missing OAuth 'code' query parameter", "MISSING_OAUTH_CODE");
        }
        const profile = await exchangeCodeForProfile(code);
        const user = await findOrCreateUserFromGoogle(profile);
        req.session.userId = user.id;
        req.session.save((err) => {
            if (err) {
                logger.error({ err }, "[auth] session save failed");
                next(err);
                return;
            }
            res.redirect(env.FRONTEND_URL);
        });
    }
    catch (err) {
        next(err);
    }
}
export function logout(req, res, next) {
    req.session.destroy((err) => {
        if (err) {
            next(err);
            return;
        }
        res.clearCookie("connect.sid");
        sendSuccess(res, { loggedOut: true });
    });
}
export async function me(req, res, next) {
    try {
        const userId = req.session.userId;
        if (!userId) {
            sendError(res, 401, "UNAUTHORIZED", "Not signed in.");
            return;
        }
        const user = await getUserById(userId);
        if (!user) {
            sendError(res, 401, "UNAUTHORIZED", "Session user no longer exists.");
            return;
        }
        sendSuccess(res, { user });
    }
    catch (err) {
        next(err);
    }
}
//# sourceMappingURL=auth.controller.js.map