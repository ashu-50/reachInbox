import { prisma } from "../config/prisma.js";
import type { SlackOAuthResult } from "../integrations/slack/slackOAuth.js";

export async function saveSlackConnection(userId: string, result: SlackOAuthResult) {
  return prisma.slackConnection.upsert({
    where: { userId_teamId: { userId, teamId: result.teamId } },
    update: { accessToken: result.accessToken, slackUserId: result.slackUserId },
    create: {
      userId,
      teamId: result.teamId,
      slackUserId: result.slackUserId,
      accessToken: result.accessToken
    }
  });
}

export async function disconnectSlack(userId: string): Promise<void> {
  await prisma.slackConnection.deleteMany({ where: { userId } });
}

export async function getSlackStatus(userId: string) {
  const connection = await prisma.slackConnection.findFirst({ where: { userId } });
  return {
    connected: Boolean(connection),
    teamId: connection?.teamId ?? null,
    connectedAt: connection?.connectedAt ?? null
  };
}
