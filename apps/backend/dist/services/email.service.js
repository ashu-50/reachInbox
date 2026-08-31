import { prisma } from "../config/prisma.js";
import { searchEmails } from "../elasticsearch/emailIndex.js";
export async function listScheduledEmails(userId) {
    return prisma.scheduledEmail.findMany({
        where: { campaign: { userId }, status: { in: ["scheduled", "processing"] } },
        orderBy: { scheduledAt: "asc" },
        include: { sender: true }
    });
}
export async function listSentEmails(userId) {
    return prisma.scheduledEmail.findMany({
        where: { campaign: { userId }, status: "sent" },
        orderBy: { sentAt: "desc" },
        include: { sender: true }
    });
}
export async function searchUserEmails(userId, query, status) {
    return searchEmails({ userId, query, status });
}
//# sourceMappingURL=email.service.js.map