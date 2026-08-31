import { prisma } from "../config/prisma.js";
import { searchEmails } from "../elasticsearch/emailIndex.js";

export async function listScheduledEmails(userId: string) {
  return prisma.scheduledEmail.findMany({
    where: { campaign: { userId }, status: { in: ["scheduled", "processing"] } },
    orderBy: { scheduledAt: "asc" },
    include: { sender: true }
  });
}

export async function listSentEmails(userId: string) {
  return prisma.scheduledEmail.findMany({
    where: { campaign: { userId }, status: "sent" },
    orderBy: { sentAt: "desc" },
    include: { sender: true }
  });
}

export async function searchUserEmails(userId: string, query?: string, status?: string) {
  return searchEmails({ userId, query, status });
}
