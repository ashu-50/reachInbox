import { WebClient } from "@slack/web-api";
import { logger } from "../../config/logger.js";

export async function sendSlackDirectMessage(
  accessToken: string,
  slackUserId: string,
  text: string
): Promise<void> {
  try {
    const client = new WebClient(accessToken);
    await client.chat.postMessage({ channel: slackUserId, text });
  } catch (err) {
    // Slack failures must never crash the worker or block email sending.
    logger.error({ err, slackUserId }, "[slack] failed to send direct message");
  }
}
