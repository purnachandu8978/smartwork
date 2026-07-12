const { z } = require("zod");
const { ApiError } = require("../utils/ApiError");

/**
 * Middleware factory to validate request data with a Zod schema
 * @param {z.ZodSchema} schema
 * @param {'body'|'query'|'params'} target
 */
const validate = (schema, target = "body") => {
  return (req, res, next) => {
    const result = schema.safeParse(req[target]);

    if (!result.success) {
      const errors = result.error.issues.map((issue) => ({
        field: issue.path.join("."),
        message: issue.message,
      }));
      return next(new ApiError(400, "Validation failed", errors));
    }

    req[target] = result.data;
    next();
  };
};

module.exports = { validate };
