import { Redis } from "ioredis";
import { createClient } from "redis";
import { env } from "./env.js";
import { logger } from "./logger.js";
/**
 * ioredis connection used by BullMQ/application code.
 */
export function createRedisConnection(purpose) {
    const client = new Redis(env.REDIS_URL, {
        maxRetriesPerRequest: purpose === "bullmq" ? null : 3,
        enableReadyCheck: true
    });
    client.on("error", (err) => {
        logger.error({ err, purpose }, "[redis] connection error");
    });
    client.on("connect", () => {
        logger.info({ purpose }, "[redis] connected");
    });
    return client;
}
/**
 * Application/BullMQ Redis connection.
 */
export const redisClient = createRedisConnection("app");
/**
 * Separate node-redis connection used by connect-redis.
 *
 * connect-redis v7 expects a node-redis client,
 * while BullMQ/ioredis uses ioredis.
 */
export const sessionRedisClient = createClient({
    url: env.REDIS_URL
});
sessionRedisClient.on("error", (err) => {
    logger.error({ err }, "[redis] session connection error");
});
sessionRedisClient.on("connect", () => {
    logger.info("[redis] session redis connected");
});
/**
 * Connect the Redis client used by express-session.
 */
export async function connectSessionRedis() {
    if (!sessionRedisClient.isOpen) {
        await sessionRedisClient.connect();
    }
}
/**
 * Close all Redis connections.
 */
export async function disconnectRedis() {
    await redisClient.quit();
    if (sessionRedisClient.isOpen) {
        await sessionRedisClient.quit();
    }
}
//# sourceMappingURL=redis.js.map