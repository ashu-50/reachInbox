/**
 * Matches prisma.Sender exactly (apps/backend/prisma/schema.prisma).
 */
export interface Sender {
  id: string;
  userId: string;
  email: string;
  name: string;
  hourlyLimit: number;
  createdAt: string;
  updatedAt: string;
}

/**
 * Matches createSenderSchema (apps/backend/src/services/sender.schema.ts).
 * hourlyLimit is optional - the backend defaults it from MAX_EMAILS_PER_HOUR
 * when omitted.
 */
export interface CreateSenderInput {
  email: string;
  name: string;
  hourlyLimit?: number;
}