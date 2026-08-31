import { describe, it, expect, vi, beforeEach } from "vitest";

const senderCreate = vi.fn();
const senderFindMany = vi.fn();
const senderFindFirst = vi.fn();
const senderDelete = vi.fn();

vi.mock("../src/config/prisma.js", () => ({
  prisma: {
    sender: {
      create: (...args: unknown[]) => senderCreate(...args),
      findMany: (...args: unknown[]) => senderFindMany(...args),
      findFirst: (...args: unknown[]) => senderFindFirst(...args),
      delete: (...args: unknown[]) => senderDelete(...args)
    }
  }
}));

const { createSender, listSenders, getSenderById, deleteSender } = await import(
  "../src/services/sender.service.js"
);

describe("sender.service", () => {
  const userId = "user-1";

  beforeEach(() => {
    vi.clearAllMocks();
  });

  it("creates a sender scoped to the authenticated user, normalizing the email", async () => {
    senderCreate.mockResolvedValue({
      id: "sender-1",
      userId,
      email: "a@x.com",
      name: "A",
      hourlyLimit: 100
    });

    await createSender(userId, { email: "A@X.com", name: "A" });

    expect(senderCreate).toHaveBeenCalledWith({
      data: { userId, email: "a@x.com", name: "A", hourlyLimit: 100 }
    });
  });

  it("uses the caller-provided hourlyLimit instead of the env default when given", async () => {
    senderCreate.mockResolvedValue({});

    await createSender(userId, { email: "a@x.com", name: "A", hourlyLimit: 250 });

    expect(senderCreate).toHaveBeenCalledWith({
      data: { userId, email: "a@x.com", name: "A", hourlyLimit: 250 }
    });
  });

  it("lists only the authenticated user's senders", async () => {
    senderFindMany.mockResolvedValue([]);

    await listSenders(userId);

    expect(senderFindMany).toHaveBeenCalledWith({
      where: { userId },
      orderBy: { createdAt: "desc" }
    });
  });

  it("throws SENDER_NOT_FOUND when fetching a sender that belongs to another user", async () => {
    senderFindFirst.mockResolvedValue(null);

    await expect(getSenderById(userId, "someone-elses-sender")).rejects.toMatchObject({
      code: "SENDER_NOT_FOUND"
    });
  });

  it("returns the sender when it belongs to the authenticated user", async () => {
    const sender = { id: "sender-1", userId, email: "a@x.com" };
    senderFindFirst.mockResolvedValue(sender);

    await expect(getSenderById(userId, "sender-1")).resolves.toEqual(sender);
  });

  it("refuses to delete a sender owned by a different user (User A cannot delete User B's sender)", async () => {
    senderFindFirst.mockResolvedValue(null);

    await expect(deleteSender(userId, "someone-elses-sender")).rejects.toMatchObject({
      code: "SENDER_NOT_FOUND"
    });
    expect(senderDelete).not.toHaveBeenCalled();
  });

  it("deletes a sender the authenticated user owns", async () => {
    senderFindFirst.mockResolvedValue({ id: "sender-1", userId });
    senderDelete.mockResolvedValue({});

    await deleteSender(userId, "sender-1");

    expect(senderDelete).toHaveBeenCalledWith({ where: { id: "sender-1" } });
  });
});