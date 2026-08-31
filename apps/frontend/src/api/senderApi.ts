import { request } from "./client";
import type { CreateSenderInput, Sender } from "@/types/sender";

/** GET /api/senders */
export async function listSenders(): Promise<Sender[]> {
  const { senders } = await request<{ senders: Sender[] }>("/api/senders");
  return senders;
}

/** POST /api/senders */
export async function createSender(input: CreateSenderInput): Promise<Sender> {
  const { sender } = await request<{ sender: Sender }>("/api/senders", {
    method: "POST",
    body: input
  });
  return sender;
}

/** DELETE /api/senders/:id */
export async function deleteSender(id: string): Promise<void> {
  await request<{ deleted: boolean }>(`/api/senders/${encodeURIComponent(id)}`, {
    method: "DELETE"
  });
}