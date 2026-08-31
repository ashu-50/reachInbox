import { redisClient } from "../config/redis.js";

/**
 * Rate limiting is entirely Redis-backed (no in-memory counters) so it is
 * correct across multiple worker processes/instances.
 */

function hourWindow(date: Date): string {
  // e.g. "2026-08-31T14" - one bucket per calendar hour (UTC)
  return date.toISOString().slice(0, 13);
}

function rateLimitKey(senderId: string, window: string): string {
  return `rate_limit:${senderId}:${window}`;
}

export interface RateLimitCheck {
  allowed: boolean;
  currentCount: number;
  /** Start of the next hour window, to reschedule the job if not allowed. */
  nextWindowStart: Date;
  /**
   * Gives back the increment this check just made, for callers that only
   * discover *after* calling this function that the send won't actually
   * happen in this window (e.g. a concurrent per-sender min-delay lock
   * could not be acquired). Only meaningful when `allowed === true`; when
   * `allowed === false` the increment has already been rolled back inline,
   * so this is a no-op. Safe to call more than once - only decrements once.
   */
  release(): Promise<void>;
}

/**
 * Atomically increments the counter for the sender's current hour window
 * and checks it against the limit. Uses INCR + EXPIRE, both atomic Redis
 * operations, so concurrent workers cannot race past the limit.
 *
 * IMPORTANT: incrementing this counter reserves one unit of the sender's
 * hourly quota. If the caller subsequently fails to actually send (for any
 * reason other than the SMTP attempt itself failing/succeeding - e.g. it
 * couldn't acquire the per-sender minimum-delay slot), it MUST call the
 * returned `release()` before giving up, or the quota silently leaks: the
 * hour would be consumed for an attempt that never actually sent anything.
 */
export async function checkAndIncrementRateLimit(
  senderId: string,
  hourlyLimit: number,
  now: Date = new Date()
): Promise<RateLimitCheck> {
  const window = hourWindow(now);
  const key = rateLimitKey(senderId, window);

  const count = await redisClient.incr(key);
  if (count === 1) {
    // First increment in this window - set expiry so keys don't accumulate.
    await redisClient.expire(key, 3600 * 2);
  }

  const nextWindowStart = new Date(now);
  nextWindowStart.setUTCMinutes(0, 0, 0);
  nextWindowStart.setUTCHours(nextWindowStart.getUTCHours() + 1);

  if (count > hourlyLimit) {
    // Over the limit: undo our increment so we don't permanently inflate
    // the counter for a send that will never happen this window.
    await redisClient.decr(key);
    return {
      allowed: false,
      currentCount: count - 1,
      nextWindowStart,
      release: async () => undefined
    };
  }

  let released = false;
  return {
    allowed: true,
    currentCount: count,
    nextWindowStart,
    release: async () => {
      if (released) return;
      released = true;
      await redisClient.decr(key);
    }
  };
}