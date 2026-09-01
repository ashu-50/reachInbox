import type { Request, Response, NextFunction } from "express";
import {
  getGoogleAuthUrl,
  exchangeCodeForProfile
} from "../integrations/google/googleOAuth.js";
import {
  findOrCreateUserFromGoogle,
  getUserById
} from "../services/auth.service.js";
import { sendSuccess, sendError } from "../utils/apiResponse.js";
import { env } from "../config/env.js";
import { logger } from "../config/logger.js";
import { AppError } from "../utils/AppError.js";

export function googleAuthStart(
  _req: Request,
  res: Response,
  next: NextFunction
): void {
  try {
    const url = getGoogleAuthUrl();
    res.redirect(url);
  } catch (err) {
    next(err);
  }
}

export async function googleAuthCallback(
  req: Request,
  res: Response,
  next: NextFunction
): Promise<void> {
  try {
    const code =
      typeof req.query.code === "string"
        ? req.query.code
        : undefined;

    if (!code) {
      throw AppError.badRequest(
        "Missing OAuth 'code' query parameter",
        "MISSING_OAUTH_CODE"
      );
    }

    // Exchange Google authorization code for Google profile
    const profile = await exchangeCodeForProfile(code);

    // Find existing user or create a new one
    const user = await findOrCreateUserFromGoogle(profile);

    // Store authenticated user in the session
    req.session.userId = user.id;

    logger.info(
      {
        sessionId: req.sessionID,
        userId: user.id
      },
      "[auth] session created"
    );

    // IMPORTANT:
    // Explicitly wait for Redis/session storage to finish
    // before redirecting the browser.
    await new Promise<void>((resolve, reject) => {
      req.session.save((err) => {
        if (err) {
          logger.error(
            {
              err,
              sessionId: req.sessionID,
              userId: user.id
            },
            "[auth] session save failed"
          );

          reject(err);
          return;
        }

        logger.info(
          {
            sessionId: req.sessionID,
            userId: user.id
          },
          "[auth] session saved successfully"
        );

        resolve();
      });
    });

    logger.info(
      {
        sessionId: req.sessionID,
        frontendUrl: env.FRONTEND_URL
      },
      "[auth] redirecting to frontend"
    );

    res.redirect(env.FRONTEND_URL);
  } catch (err) {
    next(err);
  }
}

export function logout(
  req: Request,
  res: Response,
  next: NextFunction
): void {
  req.session.destroy((err) => {
    if (err) {
      next(err);
      return;
    }

    res.clearCookie("connect.sid", {
      httpOnly: true,
      secure: true,
      sameSite: "none"
    });

    sendSuccess(res, { loggedOut: true });
  });
}

export async function me(
  req: Request,
  res: Response,
  next: NextFunction
): Promise<void> {
  try {
    const userId = req.session.userId;

    logger.info(
      {
        sessionId: req.sessionID,
        userId: userId ?? null
      },
      "[auth] checking current session"
    );

    if (!userId) {
      sendError(
        res,
        401,
        "UNAUTHORIZED",
        "Not signed in."
      );
      return;
    }

    const user = await getUserById(userId);

    if (!user) {
      sendError(
        res,
        401,
        "UNAUTHORIZED",
        "Session user no longer exists."
      );
      return;
    }

    sendSuccess(res, { user });
  } catch (err) {
    next(err);
  }
}