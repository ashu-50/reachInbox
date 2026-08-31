import { redisClient } from "../config/redis.js";
import { env } from "../config/env.js";

function minDelayKey(senderId: string): string {
  return `min_delay_lock:${senderId}`;
}

export interface MinDelayCheck {
  allowed: boolean;
  /** If not allowed, how long (ms) until the lock is free. */
  retryAfterMs: number;
}

/**
 * Enforces MIN_EMAIL_DELAY_MS between sends *per sender*, safe across
 * multiple worker processes. Uses SET ... NX PX as an atomic distributed
 * lock rather than any in-memory timestamp.
 */
export async function tryAcquireSendSlot(senderId: string): Promise<MinDelayCheck> {
  if (env.MIN_EMAIL_DELAY_MS <= 0) {
    return { allowed: true, retryAfterMs: 0 };
  }

  const key = minDelayKey(senderId);
  const acquired = await redisClient.set(key, "1", "PX", env.MIN_EMAIL_DELAY_MS, "NX");

  if (acquired === "OK") {
    return { allowed: true, retryAfterMs: 0 };
  }

  const ttl = await redisClient.pttl(key);
  return { allowed: false, retryAfterMs: Math.max(ttl, 100) };
}
