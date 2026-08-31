import { getUserId } from "../middleware/requireAuth.js";
import { createCampaign } from "../services/campaign.service.js";
import { sendSuccess } from "../utils/apiResponse.js";
export async function createCampaignHandler(req, res, next) {
    try {
        const userId = getUserId(req);
        const result = await createCampaign(userId, req.body);
        sendSuccess(res, result, 201);
    }
    catch (err) {
        next(err);
    }
}
//# sourceMappingURL=campaign.controller.js.map