import { env } from "./config/env.js";
import { logger } from "./config/logger.js";
import { prisma, disconnectPrisma } from "./config/prisma.js";
import { redisClient, connectSessionRedis, disconnectRedis } from "./config/redis.js";
import { closeEmailQueue } from "./queues/emailQueue.js";
import { createEmailWorker } from "./workers/emailWorker.js";
import { ensureEmailIndex, esClient } from "./elasticsearch/emailIndex.js";
import { createApp } from "./app.js";
async function main() {
    // Connect to PostgreSQL.
    await prisma.$connect();
    logger.info("[server] database connected");
    // Connect to the application Redis.
    await redisClient.ping();
    logger.info("[server] redis connected");
    // Connect to Redis used by express-session.
    await connectSessionRedis();
    logger.info("[server] session redis connected");
    // Elasticsearch is best-effort: never block startup on it.
    await ensureEmailIndex();
    const worker = createEmailWorker();
    logger.info({ concurrency: env.WORKER_CONCURRENCY }, "[server] email worker started");
    const app = createApp();
    const server = app.listen(env.PORT, () => {
        logger.info({ port: env.PORT }, "[server] listening");
    });
    let shuttingDown = false;
    async function shutdown(signal) {
        if (shuttingDown)
            return;
        shuttingDown = true;
        logger.info({ signal }, "[server] shutting down");
        await new Promise((resolve) => {
            server.close(() => resolve());
        });
        await worker.close();
        await closeEmailQueue();
        await disconnectPrisma();
        await disconnectRedis();
        await esClient.close().catch(() => undefined);
        logger.info("[server] shutdown complete");
        process.exit(0);
    }
    process.on("SIGINT", () => void shutdown("SIGINT"));
    process.on("SIGTERM", () => void shutdown("SIGTERM"));
}
main().catch((err) => {
    logger.error({ err }, "[server] fatal startup error");
    process.exit(1);
});
//# sourceMappingURL=server.js.map