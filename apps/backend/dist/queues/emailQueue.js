import { Queue } from "bullmq";
import { createRedisConnection } from "../config/redis.js";
export const EMAIL_QUEUE_NAME = "email-sending";
const bullmqConnection = createRedisConnection("bullmq");
export const emailQueue = new Queue(EMAIL_QUEUE_NAME, {
    connection: bullmqConnection,
    defaultJobOptions: {
        attempts: 5,
        backoff: { type: "exponential", delay: 5_000 },
        removeOnComplete: { age: 60 * 60 * 24 * 7 },
        removeOnFail: { age: 60 * 60 * 24 * 30 }
    }
});
export async function enqueueScheduledEmail(scheduledEmailId, scheduledAt) {
    const delay = Math.max(0, scheduledAt.getTime() - Date.now());
    const job = await emailQueue.add("send-email", { scheduledEmailId }, {
        delay,
        // Each job's id is tied 1:1 to its ScheduledEmail row, so re-enqueuing
        // (e.g. after a reschedule due to rate limiting) is safe/idempotent
        // at the BullMQ layer as well as the DB layer.
        jobId: `scheduled-email:${scheduledEmailId}`
    });
    if (!job.id) {
        throw new Error(`Failed to enqueue BullMQ job for scheduledEmailId=${scheduledEmailId}`);
    }
    return job.id;
}
export async function closeEmailQueue() {
    await emailQueue.close();
    await bullmqConnection.quit();
}
//# sourceMappingURL=emailQueue.js.map