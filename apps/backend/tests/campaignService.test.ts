import { describe, it, expect, vi, beforeEach } from "vitest";

const senderFindFirst = vi.fn();
const campaignCreate = vi.fn();
const scheduledEmailCreate = vi.fn();
const scheduledEmailUpdate = vi.fn();

vi.mock("../src/config/prisma.js", () => ({
  prisma: {
    sender: {
      findFirst: (...args: unknown[]) => senderFindFirst(...args)
    },
    campaign: {
      create: (...args: unknown[]) => campaignCreate(...args)
    },
    scheduledEmail: {
      create: (...args: unknown[]) => scheduledEmailCreate(...args),
      update: (...args: unknown[]) => scheduledEmailUpdate(...args)
    }
  }
}));

const enqueueScheduledEmail = vi.fn();

vi.mock("../src/queues/emailQueue.js", () => ({
  enqueueScheduledEmail: (...args: unknown[]) =>
    enqueueScheduledEmail(...args)
}));

const indexEmail = vi.fn();
const updateEmail = vi.fn();

vi.mock("../src/elasticsearch/emailIndex.js", () => ({
  indexEmail: (...args: unknown[]) => indexEmail(...args),
  updateEmail: (...args: unknown[]) => updateEmail(...args)
}));

const { createCampaign } =
  await import("../src/services/campaign.service.js");

describe("createCampaign", () => {
  const userId = "user-1";
  const senderId = "sender-1";
  const campaignId = "campaign-1";

  beforeEach(() => {
    vi.clearAllMocks();

    senderFindFirst.mockResolvedValue({
      id: senderId,
      userId,
      email: "s@x.com",
      hourlyLimit: 100
    });

    campaignCreate.mockResolvedValue({
      id: campaignId,
      subject: "Hi",
      body: "Body",
      startTime: new Date("2026-09-01T10:00:00Z")
    });

    scheduledEmailCreate.mockImplementation(
      ({ data }: { data: Record<string, unknown> }) =>
        Promise.resolve({
          id: `se-${data.recipient}`,
          ...data
        })
    );

    scheduledEmailUpdate.mockResolvedValue({});
    enqueueScheduledEmail.mockResolvedValue("job-123");
  });

  it("rejects a senderId that does not belong to the authenticated user", async () => {
    senderFindFirst.mockResolvedValue(null);

    await expect(
      createCampaign(userId, {
        subject: "Hi",
        body: "Body",
        startTime: new Date(),
        delayBetweenEmails: 1000,
        hourlyLimit: 100,
        senderId,
        recipients: ["a@example.com"]
      })
    ).rejects.toMatchObject({
      code: "SENDER_NOT_OWNED"
    });
  });

  it("de-duplicates recipients case-insensitively without silently dropping unique ones", async () => {
    await createCampaign(userId, {
      subject: "Hi",
      body: "Body",
      startTime: new Date("2026-09-01T10:00:00Z"),
      delayBetweenEmails: 2000,
      hourlyLimit: 100,
      senderId,
      recipients: [
        "A@example.com",
        "a@example.com",
        "b@example.com"
      ]
    });

    expect(scheduledEmailCreate).toHaveBeenCalledTimes(2);

    const recipients = scheduledEmailCreate.mock.calls.map(
      (call) => {
        const args = call[0] as {
          data: Record<string, unknown>;
        };

        return args.data.recipient as string;
      }
    );

    expect(recipients.sort()).toEqual([
      "a@example.com",
      "b@example.com"
    ]);
  });

  it("builds idempotencyKey as campaignId:recipient", async () => {
    await createCampaign(userId, {
      subject: "Hi",
      body: "Body",
      startTime: new Date("2026-09-01T10:00:00Z"),
      delayBetweenEmails: 2000,
      hourlyLimit: 100,
      senderId,
      recipients: ["a@example.com"]
    });

    const call = scheduledEmailCreate.mock.calls[0]![0] as {
      data: Record<string, unknown>;
    };

    expect(call.data.idempotencyKey).toBe(
      `${campaignId}:a@example.com`
    );
  });

  it("indexes each scheduled email into Elasticsearch as 'scheduled' as soon as it's created", async () => {
    await createCampaign(userId, {
      subject: "Hi",
      body: "Body",
      startTime: new Date("2026-09-01T10:00:00Z"),
      delayBetweenEmails: 2000,
      hourlyLimit: 100,
      senderId,
      recipients: ["a@example.com"]
    });

    expect(indexEmail).toHaveBeenCalledTimes(1);

    expect(indexEmail).toHaveBeenCalledWith(
      expect.objectContaining({
        status: "scheduled",
        sentAt: null,
        recipient: "a@example.com",
        userId
      })
    );
  });

  it("updates the Elasticsearch doc to 'failed' when BullMQ enqueueing fails, instead of losing the email silently", async () => {
    enqueueScheduledEmail.mockRejectedValueOnce(
      new Error("redis down")
    );

    const result = await createCampaign(userId, {
      subject: "Hi",
      body: "Body",
      startTime: new Date("2026-09-01T10:00:00Z"),
      delayBetweenEmails: 2000,
      hourlyLimit: 100,
      senderId,
      recipients: ["a@example.com"]
    });

    expect(result.scheduledCount).toBe(0);

    expect(scheduledEmailUpdate).toHaveBeenCalledWith(
      expect.objectContaining({
        data: expect.objectContaining({
          status: "failed"
        })
      })
    );

    expect(updateEmail).toHaveBeenCalledWith(
      expect.any(String),
      { status: "failed" }
    );
  });

  it("staggers scheduledAt by delayBetweenEmails per recipient", async () => {
    await createCampaign(userId, {
      subject: "Hi",
      body: "Body",
      startTime: new Date("2026-09-01T10:00:00Z"),
      delayBetweenEmails: 5000,
      hourlyLimit: 100,
      senderId,
      recipients: [
        "a@example.com",
        "b@example.com"
      ]
    });

    const firstCall = scheduledEmailCreate.mock.calls[0]![0] as {
      data: Record<string, unknown>;
    };

    const secondCall = scheduledEmailCreate.mock.calls[1]![0] as {
      data: Record<string, unknown>;
    };

    const first = firstCall.data.scheduledAt as Date;
    const second = secondCall.data.scheduledAt as Date;

    expect(
      second.getTime() - first.getTime()
    ).toBe(5000);
  });
});