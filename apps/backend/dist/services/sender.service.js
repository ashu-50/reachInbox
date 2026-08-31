import { prisma } from "../config/prisma.js";
import { env } from "../config/env.js";
import { AppError } from "../utils/AppError.js";
/**
 * Sender management. Every function here is scoped to `userId` - there is
 * no code path that returns or mutates a sender belonging to another user.
 * campaign.service's ownership check (`sender.findFirst({ id, userId })`)
 * relies on the same invariant and is unaffected by this file.
 */
export async function createSender(userId, input) {
    return prisma.sender.create({
        data: {
            userId,
            email: input.email.trim().toLowerCase(),
            name: input.name.trim(),
            // Fall back to the global default hourly limit when the caller
            // doesn't specify one, rather than relying only on the Prisma
            // schema's hardcoded @default(100) - this keeps MAX_EMAILS_PER_HOUR
            // meaningful for newly-created senders too.
            hourlyLimit: input.hourlyLimit ?? env.MAX_EMAILS_PER_HOUR
        }
    });
    // Note: a duplicate (userId, email) pair violates the unique constraint
    // on Sender and is handled by the global error handler (Prisma P2002 ->
    // 409 DUPLICATE_ENTITY), matching the existing convention already used
    // elsewhere in this codebase rather than adding a second error path.
}
export async function listSenders(userId) {
    return prisma.sender.findMany({
        where: { userId },
        orderBy: { createdAt: "desc" }
    });
}
export async function getSenderById(userId, senderId) {
    const sender = await prisma.sender.findFirst({ where: { id: senderId, userId } });
    if (!sender) {
        // Same message/behavior whether the id doesn't exist at all or belongs
        // to a different user - never confirm the existence of another user's
        // sender.
        throw AppError.notFound("Sender not found.", "SENDER_NOT_FOUND");
    }
    return sender;
}
export async function deleteSender(userId, senderId) {
    const sender = await prisma.sender.findFirst({ where: { id: senderId, userId } });
    if (!sender) {
        throw AppError.notFound("Sender not found.", "SENDER_NOT_FOUND");
    }
    // ScheduledEmail.sender is onDelete: Restrict, so deleting a sender that
    // still has scheduled/sent email history throws a Prisma FK error (P2003),
    // which the global error handler turns into a 400 DATABASE_ERROR rather
    // than silently cascading and losing history.
    await prisma.sender.delete({ where: { id: sender.id } });
}
//# sourceMappingURL=sender.service.js.map