export function validateBody(schema) {
    return (req, _res, next) => {
        req.body = schema.parse(req.body);
        next();
    };
}
export function validateQuery(schema) {
    return (req, _res, next) => {
        req.query = schema.parse(req.query);
        next();
    };
}
//# sourceMappingURL=validate.js.map