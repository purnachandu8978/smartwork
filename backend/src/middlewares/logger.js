const morgan = require("morgan");
const logger = require("../utils/logger");
const AuditLog = require("../models/AuditLog");

// Stream morgan through winston
const stream = {
  write: (message) => logger.http(message.trim()),
};

const httpLogger = morgan(
  ":method :url :status :res[content-length] - :response-time ms",
  { stream }
);

/**
 * Audit logging middleware — log CRUD actions to DB
 */
const auditLog = (action, resource) => async (req, res, next) => {
  const originalJson = res.json.bind(res);

  res.json = async (data) => {
    if (res.statusCode < 400 && req.user) {
      try {
        await AuditLog.create({
          actor: req.user._id,
          action,
          resource,
          resourceId: req.params.id || data?.data?._id,
          description: `${req.user.fullName} performed ${action} on ${resource}`,
          ip: req.ip,
          userAgent: req.get("User-Agent"),
          status: "success",
        });
      } catch (err) {
        logger.error("Audit log error:", err);
      }
    }
    return originalJson(data);
  };

  next();
};

module.exports = { httpLogger, auditLog };
