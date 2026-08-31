import { describe, it, expect, vi } from "vitest";

class FakeRedis {
  private store = new Map<string, { value: string; expiresAt: number }>();

  async set(
    key: string,
    value: string,
    _mode: "PX",
    ttlMs: number,
    flag: "NX"
  ): Promise<"OK" | null> {
    const existing = this.store.get(key);
    const now = Date.now();

    if (flag === "NX" && existing && existing.expiresAt > now) {
      return null;
    }

    this.store.set(key, { value, expiresAt: now + ttlMs });
    return "OK";
  }

  async pttl(key: string): Promise<number> {
    const existing = this.store.get(key);
    if (!existing) return -2;
    return Math.max(existing.expiresAt - Date.now(), 0);
  }
}

const fakeRedis = new FakeRedis();

vi.mock("../src/config/redis.js", () => ({
  redisClient: fakeRedis
}));

const { tryAcquireSendSlot } = await import("../src/services/minDelay.service.js");

describe("tryAcquireSendSlot", () => {
  it("grants the first slot for a sender", async () => {
    const result = await tryAcquireSendSlot("sender-fresh");
    expect(result.allowed).toBe(true);
  });

  it("denies a second immediate request for the same sender within MIN_EMAIL_DELAY_MS", async () => {
    const senderId = "sender-busy";
    const first = await tryAcquireSendSlot(senderId);
    const second = await tryAcquireSendSlot(senderId);

    expect(first.allowed).toBe(true);
    expect(second.allowed).toBe(false);
    expect(second.retryAfterMs).toBeGreaterThan(0);
  });

  it("does not block different senders from each other", async () => {
    const a = await tryAcquireSendSlot("sender-a");
    const b = await tryAcquireSendSlot("sender-b");

    expect(a.allowed).toBe(true);
    expect(b.allowed).toBe(true);
  });
});
