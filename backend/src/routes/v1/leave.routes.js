const express = require("express");
const router = express.Router();
const Leave = require("../../models/Leave");
const { authenticate, authorizeRoles } = require("../../middlewares/auth");
const { ApiResponse } = require("../../utils/ApiResponse");
const { ApiError } = require("../../utils/ApiError");
const { ROLES } = require("../../constants/roles");
const Notification = require("../../models/Notification");

router.use(authenticate);

// Apply for leave
router.post("/", async (req, res) => {
  const leave = await Leave.create({ ...req.body, employee: req.user._id });

  // Notify admins/managers
  await Notification.create({
    recipient: req.user._id, // TODO: find actual manager
    sender: req.user._id,
    type: "leave_requested",
    title: "Leave Request",
    message: `${req.user.fullName} applied for ${leave.type} leave`,
    link: `/leaves/${leave._id}`,
  });

  ApiResponse.created(res, leave, "Leave application submitted");
});

// My leaves
router.get("/my", async (req, res) => {
  const leaves = await Leave.find({ employee: req.user._id })
    .sort({ createdAt: -1 })
    .populate("approver", "firstName lastName");
  ApiResponse.success(res, leaves);
});

// All leaves (admin/manager)
router.get("/", authorizeRoles(ROLES.SUPER_ADMIN, ROLES.ADMIN, ROLES.MANAGER), async (req, res) => {
  const { status, type, userId } = req.query;
  const filter = {};
  if (status) filter.status = status;
  if (type) filter.type = type;
  if (userId) filter.employee = userId;

  const leaves = await Leave.find(filter)
    .sort({ createdAt: -1 })
    .populate("employee", "firstName lastName avatar department")
    .populate("approver", "firstName lastName");

  ApiResponse.success(res, leaves);
});

router.get("/:id", async (req, res) => {
  const leave = await Leave.findById(req.params.id)
    .populate("employee", "firstName lastName avatar")
    .populate("approver", "firstName lastName");
  if (!leave) throw ApiError.notFound("Leave not found");
  ApiResponse.success(res, leave);
});

// Approve/Reject
router.patch("/:id/status", authorizeRoles(ROLES.SUPER_ADMIN, ROLES.ADMIN, ROLES.MANAGER), async (req, res) => {
  const { status, rejectionReason } = req.body;
  if (!["approved", "rejected"].includes(status)) throw ApiError.badRequest("Invalid status");

  const leave = await Leave.findById(req.params.id).populate("employee");
  if (!leave) throw ApiError.notFound("Leave not found");
  if (leave.status !== "pending") throw ApiError.conflict("Leave already processed");

  leave.status = status;
  leave.approver = req.user._id;
  leave.approvedAt = new Date();
  if (rejectionReason) leave.rejectionReason = rejectionReason;
  await leave.save();

  // Notify employee
  await Notification.create({
    recipient: leave.employee._id,
    sender: req.user._id,
    type: status === "approved" ? "leave_approved" : "leave_rejected",
    title: `Leave ${status}`,
    message: `Your ${leave.type} leave request has been ${status}`,
    link: `/leaves/${leave._id}`,
  });

  ApiResponse.success(res, leave, `Leave ${status} successfully`);
});

router.delete("/:id", async (req, res) => {
  const leave = await Leave.findOne({ _id: req.params.id, employee: req.user._id });
  if (!leave) throw ApiError.notFound("Leave not found");
  if (leave.status !== "pending") throw ApiError.conflict("Cannot cancel processed leave");
  leave.status = "cancelled";
  await leave.save();
  ApiResponse.success(res, leave, "Leave cancelled");
});

module.exports = router;
