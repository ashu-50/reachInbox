import { Redis } from "ioredis";
import { env } from "./env.js";
import { logger } from "./logger.js";

/**
 * BullMQ requires maxRetriesPerRequest: null on connections it manages.
 * We keep one connection for BullMQ (queues/workers) and a separate one
 * for general app use (rate limiting, dedup keys) so semantics don't clash.
 */
export function createRedisConnection(purpose: "bullmq" | "app"): Redis {
  const client = new Redis({
    host: env.REDIS_HOST,
    port: env.REDIS_PORT,
    maxRetriesPerRequest: purpose === "bullmq" ? null : 3,
    enableReadyCheck: true
  });

  client.on("error", (err: Error) => {
    logger.error({ err, purpose }, "[redis] connection error");
  });

  client.on("connect", () => {
    logger.info({ purpose }, "[redis] connected");
  });

  return client;
}

export const redisClient = createRedisConnection("app");

export async function disconnectRedis(): Promise<void> {
  await redisClient.quit();
}
