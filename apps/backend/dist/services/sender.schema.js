import { z } from "zod";
export const createSenderSchema = z.object({
    email: z.string().trim().email("email must be a valid email address"),
    name: z.string().trim().min(1, "name is required").max(200),
    // Optional: if omitted, the service defaults it from MAX_EMAILS_PER_HOUR.
    hourlyLimit: z.number().int().positive().max(10_000).optional()
});
//# sourceMappingURL=sender.schema.js.map