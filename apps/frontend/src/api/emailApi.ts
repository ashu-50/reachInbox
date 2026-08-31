import { request } from "./client";
import type { EmailSearchResult, ScheduledEmailWithSender } from "@/types/email";

/** GET /api/emails/scheduled - only ever returns status "scheduled" | "processing". */
export async function listScheduledEmails(): Promise<ScheduledEmailWithSender[]> {
  const { emails } = await request<{ emails: ScheduledEmailWithSender[] }>("/api/emails/scheduled");
  return emails;
}

/** GET /api/emails/sent - only ever returns status "sent" (never "failed"). */
export async function listSentEmails(): Promise<ScheduledEmailWithSender[]> {
  const { emails } = await request<{ emails: ScheduledEmailWithSender[] }>("/api/emails/sent");
  return emails;
}

export interface SearchEmailsParams {
  q?: string;
  status?: string;
}

/**
 * GET /api/emails/search?q=&status=
 * The backend's exact query param names, confirmed from
 * apps/backend/src/controllers/email.controller.ts. Do not rename these.
 */
export async function searchEmails(params: SearchEmailsParams): Promise<EmailSearchResult[]> {
  const { results } = await request<{ results: EmailSearchResult[] }>("/api/emails/search", {
    query: { q: params.q, status: params.status }
  });
  return results;
}