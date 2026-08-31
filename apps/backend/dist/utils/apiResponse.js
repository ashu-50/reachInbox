export function sendSuccess(res, data, status = 200) {
    res.status(status).json({ success: true, data });
}
export function sendError(res, status, code, message) {
    res.status(status).json({ success: false, error: { code, message } });
}
//# sourceMappingURL=apiResponse.js.map