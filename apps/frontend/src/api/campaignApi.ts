import { request } from "./client";
import type { CreateCampaignInput, CreateCampaignResult } from "@/types/campaign";

/** POST /api/campaigns */
export async function createCampaign(input: CreateCampaignInput): Promise<CreateCampaignResult> {
  return request<CreateCampaignResult>("/api/campaigns", {
    method: "POST",
    body: input
  });
}