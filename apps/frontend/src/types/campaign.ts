/**
 * Matches the CampaignStatus enum in prisma/schema.prisma.
 */
export type CampaignStatus = "draft" | "scheduled" | "running" | "completed" | "cancelled";

/**
 * Matches prisma.Campaign exactly.
 */
export interface Campaign {
  id: string;
  userId: string;
  subject: string;
  body: string;
  startTime: string;
  delayBetweenEmails: number;
  hourlyLimit: number;
  status: CampaignStatus;
  createdAt: string;
  updatedAt: string;
}

/**
 * Matches createCampaignSchema exactly
 * (apps/backend/src/services/campaign.schema.ts). startTime must be an
 * ISO-8601 string; zod's z.coerce.date() on the backend will parse it.
 */
export interface CreateCampaignInput {
  subject: string;
  body: string;
  startTime: string;
  delayBetweenEmails: number;
  hourlyLimit: number;
  senderId: string;
  recipients: string[];
}

/**
 * Response shape of POST /api/campaigns
 * (apps/backend/src/services/campaign.service.ts -> createCampaign return value).
 */
export interface CreateCampaignResult {
  campaign: Campaign;
  scheduledCount: number;
  totalRecipients: number;
}