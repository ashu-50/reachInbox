import { Worker, DelayedError, type Job } from "bullmq";
import { prisma } from "../config/prisma.js";
import { env } from "../config/env.js";
import { logger } from "../config/logger.js";
import { createRedisConnection } from "../config/redis.js";
import { EMAIL_QUEUE_NAME, type EmailJobData } from "../queues/emailQueue.js";
import { checkAndIncrementRateLimit } from "../services/rateLimit.service.js";
import { tryAcquireSendSlot } from "../services/minDelay.service.js";
import { notifyRateLimitReached } from "../services/slackNotification.service.js";
import { EtherealEmailProvider } from "../integrations/email/EtherealEmailProvider.js";
import { indexEmail, updateEmail } from "../elasticsearch/emailIndex.js";
import type { EmailProvider } from "../integrations/email/EmailProvider.js";

const emailProvider: EmailProvider = new EtherealEmailProvider();

function hourWindowLabel(date: Date): string {
  return date.toISOString().slice(0, 13);
}

async function processEmailJob(job: Job<EmailJobData>, token?: string): Promise<void> {
  const { scheduledEmailId } = job.data;

  const scheduledEmail = await prisma.scheduledEmail.findUnique({
    where: { id: scheduledEmailId },
    include: { sender: true, campaign: true }
  });

  if (!scheduledEmail) {
    logger.warn({ scheduledEmailId }, "[worker] scheduled email not found - skipping");
    return;
  }

  // Idempotency: already sent (e.g. a retry/duplicate delivery of this job).
  if (scheduledEmail.status === "sent") {
    logger.info({ scheduledEmailId }, "[worker] already sent - skipping");
    return;
  }

  if (scheduledEmail.status === "cancelled") {
    logger.info({ scheduledEmailId }, "[worker] cancelled - skipping");
    return;
  }

  // Atomic claim: scheduled -> processing. Only the worker whose updateMany
  // actually matched a row may proceed; this guards against duplicate
  // BullMQ jobs, retries, and multiple workers racing on the same job.
  const claim = await prisma.scheduledEmail.updateMany({
    where: { id: scheduledEmailId, status: "scheduled" },
    data: { status: "processing" }
  });

  if (claim.count === 0) {
    logger.info({ scheduledEmailId }, "[worker] already claimed by another worker - skipping");
    return;
  }

  // Rate limit check (Redis-backed, atomic, multi-worker safe).
  const rateLimit = await checkAndIncrementRateLimit(
    scheduledEmail.senderId,
    scheduledEmail.sender.hourlyLimit
  );

  if (!rateLimit.allowed) {
    logger.info(
      { scheduledEmailId, senderId: scheduledEmail.senderId },
      "[worker] hourly rate limit reached - rescheduling"
    );

    // Revert the claim so the row is back to "scheduled" for its next run.
    await prisma.scheduledEmail.update({
      where: { id: scheduledEmailId },
      data: { status: "scheduled" }
    });

    await notifyRateLimitReached(
      scheduledEmail.campaign.userId,
      scheduledEmail.senderId,
      scheduledEmail.sender.email,
      hourWindowLabel(new Date())
    );

    const delayMs = Math.max(rateLimit.nextWindowStart.getTime() - Date.now(), 1000);

    if (token) {
      await job.moveToDelayed(Date.now() + delayMs, token);
      throw new DelayedError();
    }
    return;
  }

  // Minimum delay between sends for this sender (Redis-backed distributed lock).
  const slot = await tryAcquireSendSlot(scheduledEmail.senderId);
  if (!slot.allowed) {
    logger.info(
      { scheduledEmailId, senderId: scheduledEmail.senderId },
      "[worker] min delay not elapsed - rescheduling shortly"
    );

    // We already reserved one unit of the hourly quota above (rateLimit.allowed
    // was true), but we're not actually sending right now - give it back so a
    // rescheduled retry doesn't get charged twice for one real send, and so
    // other jobs for this sender aren't starved of quota they should still have.
    await rateLimit.release();

    await prisma.scheduledEmail.update({
      where: { id: scheduledEmailId },
      data: { status: "scheduled" }
    });

    if (token) {
      await job.moveToDelayed(Date.now() + slot.retryAfterMs, token);
      throw new DelayedError();
    }
    return;
  }

  try {
    const result = await emailProvider.send({
      from: scheduledEmail.sender.email,
      fromName: scheduledEmail.sender.name,
      to: scheduledEmail.recipient,
      subject: scheduledEmail.subject,
      body: scheduledEmail.body
    });

    const sentAt = new Date();

    await prisma.scheduledEmail.update({
      where: { id: scheduledEmailId },
      data: {
        status: "sent",
        sentAt,
        attempts: { increment: 1 },
        providerMessageId: result.messageId,
        previewUrl: result.previewUrl
      }
    });

    await indexEmail({
      id: scheduledEmail.id,
      campaignId: scheduledEmail.campaignId,
      userId: scheduledEmail.campaign.userId,
      recipient: scheduledEmail.recipient,
      subject: scheduledEmail.subject,
      body: scheduledEmail.body,
      status: "sent",
      scheduledAt: scheduledEmail.scheduledAt.toISOString(),
      sentAt: sentAt.toISOString(),
      senderId: scheduledEmail.senderId
    });

    logger.info({ scheduledEmailId, messageId: result.messageId }, "[worker] email sent");
  } catch (err) {
    const message = err instanceof Error ? err.message : "Unknown send error";
    logger.error({ err, scheduledEmailId }, "[worker] send failed");

    await prisma.scheduledEmail.update({
      where: { id: scheduledEmailId },
      data: {
        status: "failed",
        attempts: { increment: 1 },
        failureReason: message
      }
    });

    await updateEmail(scheduledEmail.id, { status: "failed" }).catch(() => undefined);

    // Re-throw so BullMQ's retry/backoff policy (configured on the queue)
    // can still retry transient SMTP errors up to its attempt limit.
    throw err;
  }
}

export function createEmailWorker(): Worker<EmailJobData> {
  const connection = createRedisConnection("bullmq");

  const worker = new Worker<EmailJobData>(EMAIL_QUEUE_NAME, processEmailJob, {
    connection,
    concurrency: env.WORKER_CONCURRENCY
  });

  worker.on("completed", (job) => {
    logger.info({ jobId: job.id }, "[worker] job completed");
  });

  worker.on("failed", (job, err) => {
    // One failed email must never crash the worker process.
    logger.error({ jobId: job?.id, err: err.message }, "[worker] job failed");
  });

  worker.on("error", (err) => {
    logger.error({ err }, "[worker] worker-level error");
  });

  return worker;
}