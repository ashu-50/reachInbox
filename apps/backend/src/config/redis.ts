import { Redis } from "ioredis";
import { createClient, type RedisClientType } from "redis";
import { env } from "./env.js";
import { logger } from "./logger.js";

/**
 * ioredis connections used by the application and BullMQ.
 */
export function createRedisConnection(
  purpose: "bullmq" | "app"
): Redis {
  const client = new Redis({
    host: env.REDIS_HOST,
    port: env.REDIS_PORT,
    maxRetriesPerRequest: purpose === "bullmq" ? null : 3,
    enableReadyCheck: true
  });

  client.on("error", (err: Error) => {
    logger.error(
      { err, purpose },
      "[redis] connection error"
    );
  });

  client.on("connect", () => {
    logger.info(
      { purpose },
      "[redis] connected"
    );
  });

  return client;
}

/**
 * General application Redis connection.
 */
export const redisClient = createRedisConnection("app");

/**
 * Separate node-redis client for connect-redis.
 *
 * connect-redis expects a node-redis compatible client,
 * while BullMQ/application code continues using ioredis.
 */
export const sessionRedisClient = createClient({
  url: `redis://${env.REDIS_HOST}:${env.REDIS_PORT}`
});

sessionRedisClient.on("error", (err) => {
  logger.error(
    { err },
    "[redis] session connection error"
  );
});

sessionRedisClient.on("connect", () => {
  logger.info(
    "[redis] session redis connected"
  );
});

/**
 * Connect the Redis client used by express-session.
 */
export async function connectSessionRedis(): Promise<void> {
  if (!sessionRedisClient.isOpen) {
    await sessionRedisClient.connect();
  }
}

/**
 * Disconnect all Redis connections.
 */
export async function disconnectRedis(): Promise<void> {
  await redisClient.quit();

  if (sessionRedisClient.isOpen) {
    await sessionRedisClient.quit();
  }
}