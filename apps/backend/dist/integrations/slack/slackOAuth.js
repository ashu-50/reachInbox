import { WebClient } from "@slack/web-api";
import { env } from "../../config/env.js";
import { AppError } from "../../utils/AppError.js";
const SLACK_SCOPES = ["chat:write", "im:write"];
export function assertSlackConfigured() {
    if (!env.SLACK_CLIENT_ID || !env.SLACK_CLIENT_SECRET) {
        throw AppError.badRequest("Slack is not configured. Set SLACK_CLIENT_ID and SLACK_CLIENT_SECRET in .env.", "SLACK_NOT_CONFIGURED");
    }
}
export function getSlackAuthUrl(state) {
    assertSlackConfigured();
    const params = new URLSearchParams({
        client_id: env.SLACK_CLIENT_ID,
        scope: SLACK_SCOPES.join(","),
        redirect_uri: env.SLACK_REDIRECT_URI,
        state
    });
    return `https://slack.com/oauth/v2/authorize?${params.toString()}`;
}
export async function exchangeSlackCode(code) {
    assertSlackConfigured();
    const client = new WebClient();
    const result = await client.oauth.v2.access({
        client_id: env.SLACK_CLIENT_ID,
        client_secret: env.SLACK_CLIENT_SECRET,
        code,
        redirect_uri: env.SLACK_REDIRECT_URI
    });
    const accessToken = result.access_token;
    const teamId = result.team?.id;
    const slackUserId = result.authed_user?.id;
    if (!accessToken || !teamId || !slackUserId) {
        throw AppError.internal("Slack OAuth response was missing required fields", "SLACK_OAUTH_INCOMPLETE");
    }
    return { accessToken, teamId, slackUserId };
}
//# sourceMappingURL=slackOAuth.js.map