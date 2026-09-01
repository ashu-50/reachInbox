import express, { type Express } from "express";
import cors from "cors";
import helmet from "helmet";
import session from "express-session";
import RedisStore from "connect-redis";

import { env } from "./config/env.js";
import { sessionRedisClient } from "./config/redis.js";
import { rootRouter } from "./routes/index.js";
import {
  errorHandler,
  notFoundHandler
} from "./middleware/errorHandler.js";

export function createApp(): Express {
  const app = express();

  // Render is behind a reverse proxy.
  // Required so Express correctly detects HTTPS.
  app.set("trust proxy", 1);

  app.use(helmet());

  // Allow the deployed frontend to send cookies to the backend.
  app.use(
    cors({
      origin: env.FRONTEND_URL,
      credentials: true
    })
  );

  app.use(express.json());

  // Persistent sessions stored in Redis.
  app.use(
    session({
      store: new RedisStore({
        client: sessionRedisClient
      }),

      secret: env.SESSION_SECRET,

      resave: false,

      saveUninitialized: false,

      // Trust the Render proxy when setting secure cookies.
      proxy: true,

      cookie: {
        httpOnly: true,
        secure: true,
        sameSite: "none",
        path: "/",
        maxAge: 1000 * 60 * 60 * 24 * 7
      }
    })
  );

  app.use(rootRouter);

  app.use(notFoundHandler);
  app.use(errorHandler);

  return app;
}