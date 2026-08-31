import { prisma } from "../config/prisma.js";
import { AppError } from "../utils/AppError.js";
import { logger } from "../config/logger.js";
import { enqueueScheduledEmail } from "../queues/emailQueue.js";
import { indexEmail, updateEmail } from "../elasticsearch/emailIndex.js";
import type { CreateCampaignInput } from "./campaign.schema.js";

function buildIdempotencyKey(campaignId: string, recipient: string): string {
  return `${campaignId}:${recipient}`;
}

export async function createCampaign(userId: string, input: CreateCampaignInput) {
  // Validate sender ownership - never trust the client's senderId blindly.
  const sender = await prisma.sender.findFirst({
    where: { id: input.senderId, userId }
  });

  if (!sender) {
    throw AppError.forbidden("senderId does not belong to the authenticated user.", "SENDER_NOT_OWNED");
  }

  // Case-insensitive de-duplication of recipients. We never silently drop
  // recipients without normalizing first - duplicates collapse to one entry.
  const seen = new Set<string>();
  const uniqueRecipients: string[] = [];
  for (const raw of input.recipients) {
    const normalized = raw.trim().toLowerCase();
    if (!seen.has(normalized)) {
      seen.add(normalized);
      uniqueRecipients.push(normalized);
    }
  }

  const campaign = await prisma.campaign.create({
    data: {
      userId,
      subject: input.subject,
      body: input.body,
      startTime: input.startTime,
      delayBetweenEmails: input.delayBetweenEmails,
      hourlyLimit: input.hourlyLimit,
      status: "scheduled"
    }
  });

  const scheduledEmails = [];
  for (let i = 0; i < uniqueRecipients.length; i += 1) {
    const recipient = uniqueRecipients[i]!;
    const scheduledAt = new Date(
      campaign.startTime.getTime() + i * input.delayBetweenEmails
    );

    const scheduledEmail = await prisma.scheduledEmail.create({
      data: {
        campaignId: campaign.id,
        senderId: sender.id,
        recipient,
        subject: campaign.subject,
        body: campaign.body,
        scheduledAt,
        status: "scheduled",
        idempotencyKey: buildIdempotencyKey(campaign.id, recipient)
      }
    });

    // Index into Elasticsearch as "scheduled" as soon as the row exists, so
    // it's searchable via /api/emails/search before it's ever sent (indexEmail
    // is best-effort/never throws - Elasticsearch being unavailable must
    // never block or fail campaign creation).
    await indexEmail({
      id: scheduledEmail.id,
      campaignId: scheduledEmail.campaignId,
      userId,
      recipient: scheduledEmail.recipient,
      subject: scheduledEmail.subject,
      body: scheduledEmail.body,
      status: scheduledEmail.status,
      scheduledAt: scheduledEmail.scheduledAt.toISOString(),
      sentAt: null,
      senderId: scheduledEmail.senderId
    });

    try {
      const jobId = await enqueueScheduledEmail(scheduledEmail.id, scheduledAt);
      await prisma.scheduledEmail.update({
        where: { id: scheduledEmail.id },
        data: { bullmqJobId: jobId }
      });
      scheduledEmails.push({ ...scheduledEmail, bullmqJobId: jobId });
    } catch (err) {
      // The DB row exists but enqueueing failed - surface this loudly rather
      // than silently leaving an orphaned "scheduled" row with no job.
      logger.error({ err, scheduledEmailId: scheduledEmail.id }, "[campaign] failed to enqueue job");
      await prisma.scheduledEmail.update({
        where: { id: scheduledEmail.id },
        data: { status: "failed", failureReason: "Failed to enqueue delivery job" }
      });
      await updateEmail(scheduledEmail.id, { status: "failed" });
    }
  }

  return { campaign, scheduledCount: scheduledEmails.length, totalRecipients: uniqueRecipients.length };
}