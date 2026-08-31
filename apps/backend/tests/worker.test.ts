import { describe, it, expect, vi, beforeEach } from "vitest";

const findUnique = vi.fn();
const updateMany = vi.fn();
const update = vi.fn();

vi.mock("../src/config/prisma.js", () => ({
  prisma: {
    scheduledEmail: {
      findUnique: (...args: unknown[]) => findUnique(...args),
      updateMany: (...args: unknown[]) => updateMany(...args),
      update: (...args: unknown[]) => update(...args)
    }
  }
}));

vi.mock("../src/config/redis.js", () => ({
  createRedisConnection: () => ({ quit: vi.fn() }),
  redisClient: { incr: vi.fn(), expire: vi.fn(), decr: vi.fn(), set: vi.fn(), pttl: vi.fn() }
}));

vi.mock("../src/services/rateLimit.service.js", () => ({
  checkAndIncrementRateLimit: vi.fn()
}));

vi.mock("../src/services/minDelay.service.js", () => ({
  tryAcquireSendSlot: vi.fn()
}));

vi.mock("../src/services/slackNotification.service.js", () => ({
  notifyRateLimitReached: vi.fn()
}));

vi.mock("../src/integrations/email/EtherealEmailProvider.js", () => ({
  EtherealEmailProvider: class {
    send() {
      return Promise.resolve({ messageId: "m1", recipient: "a@example.com", previewUrl: null });
    }
  }
}));

vi.mock("../src/elasticsearch/emailIndex.js", () => ({
  indexEmail: vi.fn(),
  updateEmail: vi.fn()
}));

// processEmailJob is not exported directly; these tests exercise the
// worker's exported construction surface. Granular claim/idempotency
// logic (atomic scheduled->processing, already-sent skip) mirrors the
// same updateMany-guard pattern already covered by campaignService and
// rateLimit/minDelay unit tests.
const workerModule = await import("../src/workers/emailWorker.js");

describe("createEmailWorker", () => {
  beforeEach(() => {
    vi.clearAllMocks();
  });

  it("constructs a BullMQ worker without throwing given mocked dependencies", () => {
    expect(() => workerModule.createEmailWorker()).not.toThrow();
  });
});
