import { Client } from "@elastic/elasticsearch";
import { env } from "../config/env.js";
import { logger } from "../config/logger.js";
export const EMAIL_INDEX = "emails";
export const esClient = new Client({
    node: env.ELASTICSEARCH_URL,
    auth: {
        apiKey: env.ELASTICSEARCH_API_KEY
    }
});
export async function ensureEmailIndex() {
    try {
        const exists = await esClient.indices.exists({ index: EMAIL_INDEX });
        if (!exists) {
            await esClient.indices.create({
                index: EMAIL_INDEX,
                mappings: {
                    properties: {
                        id: { type: "keyword" },
                        campaignId: { type: "keyword" },
                        userId: { type: "keyword" },
                        recipient: { type: "keyword" },
                        subject: { type: "text" },
                        body: { type: "text" },
                        status: { type: "keyword" },
                        scheduledAt: { type: "date" },
                        sentAt: { type: "date" },
                        senderId: { type: "keyword" }
                    }
                }
            });
            logger.info({ index: EMAIL_INDEX }, "[elasticsearch] index created");
        }
    }
    catch (err) {
        // Per spec: Elasticsearch being unavailable must never crash the app.
        logger.error({ err }, "[elasticsearch] failed to ensure index - continuing without it");
    }
}
export async function indexEmail(doc) {
    try {
        await esClient.index({ index: EMAIL_INDEX, id: doc.id, document: doc });
    }
    catch (err) {
        logger.error({ err, id: doc.id }, "[elasticsearch] indexEmail failed - email send is unaffected");
    }
}
export async function updateEmail(id, partial) {
    try {
        await esClient.update({ index: EMAIL_INDEX, id, doc: partial });
    }
    catch (err) {
        logger.error({ err, id }, "[elasticsearch] updateEmail failed - email send is unaffected");
    }
}
export async function searchEmails(params) {
    const must = [{ term: { userId: params.userId } }];
    if (params.query) {
        must.push({
            multi_match: {
                query: params.query,
                fields: ["recipient", "subject", "body"]
            }
        });
    }
    if (params.status) {
        must.push({ term: { status: params.status } });
    }
    try {
        const result = await esClient.search({
            index: EMAIL_INDEX,
            from: params.from ?? 0,
            size: params.size ?? 25,
            query: { bool: { must } }
        });
        return result.hits.hits
            .map((hit) => hit._source)
            .filter((source) => Boolean(source));
    }
    catch (err) {
        logger.error({ err }, "[elasticsearch] searchEmails failed");
        return [];
    }
}
//# sourceMappingURL=emailIndex.js.map