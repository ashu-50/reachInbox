import pino from "pino";
import { env } from "./env.js";
export const logger = pino({
    level: env.NODE_ENV === "production" ? "info" : "debug",
    redact: {
        paths: [
            "req.headers.authorization",
            "req.headers.cookie",
            "*.password",
            "*.accessToken",
            "*.token",
            "*.DATABASE_URL",
            "*.smtpPassword"
        ],
        remove: true
    },
    transport: env.NODE_ENV === "development"
        ? { target: "pino-pretty", options: { colorize: true, translateTime: "SYS:standard" } }
        : undefined
});
//# sourceMappingURL=logger.js.map