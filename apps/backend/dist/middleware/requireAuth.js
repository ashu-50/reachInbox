import { AppError } from "../utils/AppError.js";
export function requireAuth(req, _res, next) {
    const userId = req.session.userId;
    if (!userId) {
        next(AppError.unauthorized("You must be signed in to perform this action."));
        return;
    }
    next();
}
export function getUserId(req) {
    const userId = req.session.userId;
    if (!userId) {
        throw AppError.unauthorized();
    }
    return userId;
}
//# sourceMappingURL=requireAuth.js.map