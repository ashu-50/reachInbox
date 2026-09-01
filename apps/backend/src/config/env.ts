import { z } from "zod";
import dotenv from "dotenv";

dotenv.config();

const envSchema = z.object({
  NODE_ENV: z.enum(["development", "test", "production"]).default("development"),
  PORT: z.coerce.number().int().positive().default(5100),
  FRONTEND_URL: z.string().url(),

  DATABASE_URL: z.string().min(1, "DATABASE_URL is required"),

  REDIS_URL: z.string().min(1, "REDIS_URL is required"),
  REDIS_HOST: z.string().min(1),
  REDIS_PORT: z.coerce.number().int().positive(),

  ELASTICSEARCH_URL: z.string().url(),
  ELASTICSEARCH_API_KEY: z.string().min(1, "ELASTICSEARCH_API_KEY is required"),

  GOOGLE_CLIENT_ID: z.string().optional().default(""),
  GOOGLE_CLIENT_SECRET: z.string().optional().default(""),
  GOOGLE_CALLBACK_URL: z.string().url(),

  SESSION_SECRET: z.string().min(1, "SESSION_SECRET is required"),

  SLACK_CLIENT_ID: z.string().optional().default(""),
  SLACK_CLIENT_SECRET: z.string().optional().default(""),
  SLACK_REDIRECT_URI: z.string().url(),

  ETHEREAL_HOST: z.string().optional().default(""),
  ETHEREAL_PORT: z.coerce.number().int().optional(),
  ETHEREAL_USER: z.string().optional().default(""),
  ETHEREAL_PASSWORD: z.string().optional().default(""),

  WORKER_CONCURRENCY: z.coerce.number().int().positive().default(5),
  MIN_EMAIL_DELAY_MS: z.coerce.number().int().nonnegative().default(2000),
  MAX_EMAILS_PER_HOUR: z.coerce.number().int().positive().default(100),
  MAX_CSV_SIZE_MB: z.coerce.number().int().positive().default(5)
});

export type Env = z.infer<typeof envSchema>;

function loadEnv(): Env {
  const parsed = envSchema.safeParse(process.env);

  if (!parsed.success) {
    const issues = parsed.error.issues
      .map((issue) => `  - ${issue.path.join(".")}: ${issue.message}`)
      .join("\n");
    // eslint-disable-next-line no-console
    console.error(`[config] Invalid environment configuration:\n${issues}`);
    throw new Error("Invalid environment configuration. See log above for details.");
  }

  return parsed.data;
}

export const env = loadEnv();

/**
 * Google OAuth is optional for local boot but required to actually use
 * /api/auth/google. We fail loudly and specifically when it's invoked
 * without credentials, rather than silently faking success.
 */
export function assertGoogleConfigured(): void {
  if (!env.GOOGLE_CLIENT_ID || !env.GOOGLE_CLIENT_SECRET) {
    throw new Error(
      "Google OAuth is not configured. Set GOOGLE_CLIENT_ID and GOOGLE_CLIENT_SECRET in .env."
    );
  }
}

export function isSlackConfigured(): boolean {
  return Boolean(env.SLACK_CLIENT_ID && env.SLACK_CLIENT_SECRET);
}

export function isEtherealConfigured(): boolean {
  return Boolean(env.ETHEREAL_HOST && env.ETHEREAL_USER && env.ETHEREAL_PASSWORD);
}
