import { describe, it, expect, vi, beforeEach } from "vitest";

class FakeRedis {
  private store = new Map<string, number>();

  async incr(key: string): Promise<number> {
    const next = (this.store.get(key) ?? 0) + 1;
    this.store.set(key, next);
    return next;
  }

  async decr(key: string): Promise<number> {
    const next = (this.store.get(key) ?? 0) - 1;
    this.store.set(key, next);
    return next;
  }

  async expire(): Promise<number> {
    return 1;
  }
}

const fakeRedis = new FakeRedis();

vi.mock("../src/config/redis.js", () => ({
  redisClient: fakeRedis
}));

const { checkAndIncrementRateLimit } = await import("../src/services/rateLimit.service.js");

describe("checkAndIncrementRateLimit", () => {
  beforeEach(() => {
    // fresh key per test via unique senderId, no reset needed
  });

  it("allows sends up to the hourly limit", async () => {
    const now = new Date("2026-09-01T10:00:00Z");
    const senderId = "sender-allow";

    for (let i = 0; i < 3; i += 1) {
      const result = await checkAndIncrementRateLimit(senderId, 3, now);
      expect(result.allowed).toBe(true);
    }
  });

  it("rejects sends once the hourly limit is exceeded, without inflating the counter", async () => {
    const now = new Date("2026-09-01T11:00:00Z");
    const senderId = "sender-reject";

    await checkAndIncrementRateLimit(senderId, 2, now);
    await checkAndIncrementRateLimit(senderId, 2, now);
    const third = await checkAndIncrementRateLimit(senderId, 2, now);

    expect(third.allowed).toBe(false);
    expect(third.currentCount).toBe(2);

    // A subsequent call in the same window should still be rejected at count 2,
    // proving the rejected attempt's increment was correctly rolled back.
    const fourth = await checkAndIncrementRateLimit(senderId, 2, now);
    expect(fourth.allowed).toBe(false);
    expect(fourth.currentCount).toBe(2);
  });

  it("computes nextWindowStart as the start of the following UTC hour", async () => {
    const now = new Date("2026-09-01T10:37:12Z");
    const senderId = "sender-window";

    const result = await checkAndIncrementRateLimit(senderId, 100, now);
    expect(result.nextWindowStart.toISOString()).toBe("2026-09-01T11:00:00.000Z");
  });

  it("release() gives back a reserved slot so a later attempt in the same window is not overcharged", async () => {
    // Regression test for: worker increments the hourly counter, then fails
    // to acquire the per-sender min-delay slot and reschedules. Without
    // release(), that reservation would be permanently lost even though no
    // email was actually sent.
    const now = new Date("2026-09-01T12:00:00Z");
    const senderId = "sender-release";
    const limit = 1;

    const first = await checkAndIncrementRateLimit(senderId, limit, now);
    expect(first.allowed).toBe(true);

    // Simulate: min-delay lock could not be acquired, give the slot back.
    await first.release();

    // A second attempt in the same window should now be allowed again,
    // proving the counter was actually decremented (not left consumed).
    const second = await checkAndIncrementRateLimit(senderId, limit, now);
    expect(second.allowed).toBe(true);
  });

  it("release() is idempotent - calling it twice only gives back one slot", async () => {
    const now = new Date("2026-09-01T13:00:00Z");
    const senderId = "sender-release-twice";
    const limit = 1;

    const first = await checkAndIncrementRateLimit(senderId, limit, now);
    await first.release();
    await first.release();

    // Only one unit was ever reserved, so only one more should be allowed
    // before the sender is over its limit of 1 again.
    const second = await checkAndIncrementRateLimit(senderId, limit, now);
    const third = await checkAndIncrementRateLimit(senderId, limit, now);

    expect(second.allowed).toBe(true);
    expect(third.allowed).toBe(false);
  });

  it("release() on an already-rejected check is a safe no-op", async () => {
    const now = new Date("2026-09-01T14:00:00Z");
    const senderId = "sender-release-rejected";
    const limit = 1;

    await checkAndIncrementRateLimit(senderId, limit, now);
    const rejected = await checkAndIncrementRateLimit(senderId, limit, now);
    expect(rejected.allowed).toBe(false);

    // Must not throw, and must not further decrement a counter that was
    // already rolled back internally.
    await expect(rejected.release()).resolves.toBeUndefined();

    const next = await checkAndIncrementRateLimit(senderId, limit, now);
    expect(next.allowed).toBe(false);
  });
});