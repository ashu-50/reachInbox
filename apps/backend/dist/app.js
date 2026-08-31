import express from "express";
import cors from "cors";
import helmet from "helmet";
import session from "express-session";
import { env } from "./config/env.js";
import { rootRouter } from "./routes/index.js";
import { errorHandler, notFoundHandler } from "./middleware/errorHandler.js";
export function createApp() {
    const app = express();
    app.set("trust proxy", 1);
    app.use(helmet());
    app.use(cors({
        origin: env.FRONTEND_URL,
        credentials: true
    }));
    app.use(express.json());
    app.use(session({
        secret: env.SESSION_SECRET,
        resave: false,
        saveUninitialized: false,
        cookie: {
            httpOnly: true,
            secure: env.NODE_ENV === "production",
            sameSite: env.NODE_ENV === "production" ? "none" : "lax",
            maxAge: 1000 * 60 * 60 * 24 * 7
        }
    }));
    app.use(rootRouter);
    app.use(notFoundHandler);
    app.use(errorHandler);
    return app;
}
//# sourceMappingURL=app.js.map