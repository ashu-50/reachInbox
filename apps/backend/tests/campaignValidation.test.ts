import { describe, it, expect } from "vitest";
import { createCampaignSchema } from "../src/services/campaign.schema.js";

const validPayload = {
  subject: "Hello",
  body: "Hello world",
  startTime: new Date(Date.now() + 60_000).toISOString(),
  delayBetweenEmails: 2000,
  hourlyLimit: 100,
  senderId: "123e4567-e89b-12d3-a456-426614174000",
  recipients: ["a@example.com", "b@example.com"]
};

describe("createCampaignSchema", () => {
  it("accepts a valid campaign payload", () => {
    const result = createCampaignSchema.safeParse(validPayload);
    expect(result.success).toBe(true);
  });

  it("rejects a startTime in the past", () => {
    const result = createCampaignSchema.safeParse({
      ...validPayload,
      startTime: new Date(Date.now() - 60 * 60 * 1000).toISOString()
    });
    expect(result.success).toBe(false);
  });

  it("rejects an empty recipients array", () => {
    const result = createCampaignSchema.safeParse({ ...validPayload, recipients: [] });
    expect(result.success).toBe(false);
  });

  it("rejects invalid recipient emails", () => {
    const result = createCampaignSchema.safeParse({
      ...validPayload,
      recipients: ["not-an-email"]
    });
    expect(result.success).toBe(false);
  });

  it("rejects a non-uuid senderId", () => {
    const result = createCampaignSchema.safeParse({ ...validPayload, senderId: "not-a-uuid" });
    expect(result.success).toBe(false);
  });

  it("rejects a negative delayBetweenEmails", () => {
    const result = createCampaignSchema.safeParse({ ...validPayload, delayBetweenEmails: -1 });
    expect(result.success).toBe(false);
  });
});
