import { z } from "zod";
export const createCampaignSchema = z.object({
    subject: z.string().trim().min(1, "subject is required").max(500),
    body: z.string().trim().min(1, "body is required"),
    startTime: z.coerce.date().refine((d) => d.getTime() > Date.now() - 60_000, {
        message: "startTime must not be in the past"
    }),
    delayBetweenEmails: z.number().int().min(0).max(3_600_000),
    hourlyLimit: z.number().int().positive().max(10_000),
    senderId: z.string().uuid("senderId must be a valid id"),
    recipients: z
        .array(z.string().trim().email("each recipient must be a valid email address"))
        .min(1, "at least one recipient is required")
        .max(50_000, "too many recipients in a single campaign")
});
//# sourceMappingURL=campaign.schema.js.map