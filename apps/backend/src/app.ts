import express, { type Express } from "express";
import cors from "cors";
import helmet from "helmet";
import session from "express-session";
import { RedisStore } from "connect-redis";

import { env } from "./config/env.js";
import { redisClient } from "./config/redis.js";
import { rootRouter } from "./routes/index.js";
import { errorHandler, notFoundHandler } from "./middleware/errorHandler.js";

export function createApp(): Express {
  const app = express();

  // Render runs behind a proxy.
  app.set("trust proxy", 1);

  app.use(helmet());

  app.use(
    cors({
      origin: env.FRONTEND_URL,
      credentials: true
    })
  );

  app.use(express.json());

  app.use(
    session({
      store: new RedisStore({
        client: redisClient
      }),

      secret: env.SESSION_SECRET,

      resave: false,

      saveUninitialized: false,

      proxy: true,

      cookie: {
        httpOnly: true,
        secure: true,
        sameSite: "none",
        maxAge: 1000 * 60 * 60 * 24 * 7
      }
    })
  );

  app.use(rootRouter);

  app.use(notFoundHandler);
  app.use(errorHandler);

  return app;
}