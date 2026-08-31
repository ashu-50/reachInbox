import type { Sender } from "./sender";

/**
 * Matches the ScheduledEmailStatus enum in prisma/schema.prisma.
 */
export type ScheduledEmailStatus = "scheduled" | "processing" | "sent" | "failed" | "cancelled";

/**
 * Matches prisma.ScheduledEmail with its `sender` relation included, exactly
 * as returned by GET /api/emails/scheduled and GET /api/emails/sent
 * (apps/backend/src/services/email.service.ts uses `include: { sender: true }`).
 *
 * IMPORTANT CONTRACT NOTE: GET /api/emails/scheduled only ever returns rows
 * with status "scheduled" or "processing"; GET /api/emails/sent only ever
 * returns status "sent". Neither endpoint returns status "failed" - failed
 * sends are only visible through GET /api/emails/search?status=failed (see
 * EmailSearchResult below), which is why the Sent tab has a separate
 * "Failed" view backed by search instead of this type.
 */
export interface ScheduledEmailWithSender {
  id: string;
  campaignId: string;
  senderId: string;
  recipient: string;
  subject: string;
  body: string;
  scheduledAt: string;
  sentAt: string | null;
  status: ScheduledEmailStatus;
  attempts: number;
  bullmqJobId: string | null;
  idempotencyKey: string;
  failureReason: string | null;
  providerMessageId: string | null;
  previewUrl: string | null;
  createdAt: string;
  updatedAt: string;
  sender: Sender;
}

/**
 * Matches EmailDocument exactly as returned by GET /api/emails/search
 * (apps/backend/src/elasticsearch/emailIndex.ts). This is a flatter,
 * independently-indexed document - it only has `senderId`, not a nested
 * `sender` relation, because Elasticsearch documents are indexed
 * independently of the live Postgres row.
 */
export interface EmailSearchResult {
  id: string;
  campaignId: string;
  userId: string;
  recipient: string;
  subject: string;
  body: string;
  status: string;
  scheduledAt: string;
  sentAt: string | null;
  senderId: string;
}