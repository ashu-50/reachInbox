import { prisma } from "../config/prisma.js";
import { redisClient } from "../config/redis.js";
import { isSlackConfigured } from "../config/env.js";
import { sendSlackDirectMessage } from "../integrations/slack/slackClient.js";
import { logger } from "../config/logger.js";
function dedupeKey(senderId, hourWindow) {
    return `slack-rate-limit-notified:${senderId}:${hourWindow}`;
}
/**
 * Sends at most one Slack DM per sender per hour window when the hourly
 * rate limit is hit. No-ops silently if Slack isn't configured or the
 * user hasn't connected Slack - this must never crash the worker.
 */
export async function notifyRateLimitReached(userId, senderId, senderEmail, hourWindow) {
    if (!isSlackConfigured()) {
        return;
    }
    try {
        const key = dedupeKey(senderId, hourWindow);
        const setResult = await redisClient.set(key, "1", "EX", 3600 * 2, "NX");
        if (setResult !== "OK") {
            // Already notified for this sender/hour.
            return;
        }
        const slackConnection = await prisma.slackConnection.findFirst({ where: { userId } });
        if (!slackConnection) {
            return;
        }
        await sendSlackDirectMessage(slackConnection.accessToken, slackConnection.slackUserId, `:warning: Sender *${senderEmail}* just hit its hourly send limit. Remaining emails will resume next hour.`);
    }
    catch (err) {
        logger.error({ err, senderId }, "[slack] rate limit notification failed");
    }
}
//# sourceMappingURL=slackNotification.service.js.map