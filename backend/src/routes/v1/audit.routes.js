const express = require("express");
const router = express.Router();
const AuditLog = require("../../models/AuditLog");
const { authenticate, authorizeRoles } = require("../../middlewares/auth");
const { ApiResponse } = require("../../utils/ApiResponse");
const { ROLES } = require("../../constants/roles");
const { getPagination, paginatedResponse } = require("../../utils/helpers");

router.use(authenticate, authorizeRoles(ROLES.SUPER_ADMIN, ROLES.ADMIN));

router.get("/", async (req, res) => {
  const { page = 1, limit = 20, action, resource, userId, startDate, endDate } = req.query;
  const { skip } = getPagination({ page, limit });
  const filter = {};
  if (action) filter.action = action;
  if (resource) filter.resource = resource;
  if (userId) filter.actor = userId;
  if (startDate || endDate) {
    filter.createdAt = {};
    if (startDate) filter.createdAt.$gte = new Date(startDate);
    if (endDate) filter.createdAt.$lte = new Date(endDate);
  }

  const [logs, total] = await Promise.all([
    AuditLog.find(filter)
      .sort({ createdAt: -1 })
      .skip(skip)
      .limit(parseInt(limit))
      .populate("actor", "firstName lastName email avatar role"),
    AuditLog.countDocuments(filter),
  ]);

  ApiResponse.success(res, paginatedResponse(logs, total, parseInt(page), parseInt(limit)));
});

module.exports = router;
