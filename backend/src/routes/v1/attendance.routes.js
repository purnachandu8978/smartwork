const express = require("express");
const router = express.Router();
const Attendance = require("../../models/Attendance");
const { authenticate, authorizeRoles } = require("../../middlewares/auth");
const { ApiResponse } = require("../../utils/ApiResponse");
const { ApiError } = require("../../utils/ApiError");
const { ROLES } = require("../../constants/roles");

router.use(authenticate);

// Check-in
router.post("/check-in", async (req, res) => {
  const today = new Date();
  today.setHours(0, 0, 0, 0);
  const tomorrow = new Date(today); tomorrow.setDate(tomorrow.getDate() + 1);

  const existing = await Attendance.findOne({ user: req.user._id, date: { $gte: today, $lt: tomorrow } });
  if (existing?.checkIn) throw ApiError.conflict("Already checked in today");

  const attendance = await Attendance.findOneAndUpdate(
    { user: req.user._id, date: { $gte: today, $lt: tomorrow } },
    { user: req.user._id, date: new Date(), checkIn: new Date(), location: { ip: req.ip } },
    { upsert: true, new: true }
  );

  ApiResponse.success(res, attendance, "Checked in successfully");
});

// Check-out
router.post("/check-out", async (req, res) => {
  const today = new Date();
  today.setHours(0, 0, 0, 0);
  const tomorrow = new Date(today); tomorrow.setDate(tomorrow.getDate() + 1);

  const attendance = await Attendance.findOne({ user: req.user._id, date: { $gte: today, $lt: tomorrow } });
  if (!attendance?.checkIn) throw ApiError.badRequest("You haven't checked in today");
  if (attendance.checkOut) throw ApiError.conflict("Already checked out today");

  attendance.checkOut = new Date();
  await attendance.save();
  ApiResponse.success(res, attendance, "Checked out successfully");
});

// My attendance
router.get("/my", async (req, res) => {
  const { month, year } = req.query;
  const startDate = new Date(year || new Date().getFullYear(), (month || new Date().getMonth() + 1) - 1, 1);
  const endDate = new Date(startDate.getFullYear(), startDate.getMonth() + 1, 0, 23, 59, 59);

  const records = await Attendance.find({
    user: req.user._id,
    date: { $gte: startDate, $lte: endDate },
  }).sort({ date: -1 });

  const stats = {
    present: records.filter((r) => r.status === "present").length,
    absent: records.filter((r) => r.status === "absent").length,
    halfDay: records.filter((r) => r.status === "half_day").length,
    totalHours: records.reduce((sum, r) => sum + r.workHours, 0).toFixed(2),
  };

  ApiResponse.success(res, { records, stats });
});

// All employees' attendance (admin/manager)
router.get("/", authorizeRoles(ROLES.SUPER_ADMIN, ROLES.ADMIN, ROLES.MANAGER), async (req, res) => {
  const { date, userId, month, year } = req.query;
  const filter = {};

  if (userId) filter.user = userId;
  if (date) {
    const d = new Date(date);
    const next = new Date(d); next.setDate(next.getDate() + 1);
    filter.date = { $gte: d, $lt: next };
  } else if (month && year) {
    const startDate = new Date(year, month - 1, 1);
    const endDate = new Date(year, month, 0, 23, 59, 59);
    filter.date = { $gte: startDate, $lte: endDate };
  }

  const records = await Attendance.find(filter)
    .sort({ date: -1 })
    .populate("user", "firstName lastName avatar email department");

  ApiResponse.success(res, records);
});

// Monthly summary (aggregation)
router.get("/summary", authorizeRoles(ROLES.SUPER_ADMIN, ROLES.ADMIN, ROLES.MANAGER), async (req, res) => {
  const { month = new Date().getMonth() + 1, year = new Date().getFullYear() } = req.query;
  const startDate = new Date(year, month - 1, 1);
  const endDate = new Date(year, month, 0, 23, 59, 59);

  const summary = await Attendance.aggregate([
    { $match: { date: { $gte: startDate, $lte: endDate } } },
    {
      $group: {
        _id: "$user",
        present: { $sum: { $cond: [{ $eq: ["$status", "present"] }, 1, 0] } },
        absent: { $sum: { $cond: [{ $eq: ["$status", "absent"] }, 1, 0] } },
        halfDay: { $sum: { $cond: [{ $eq: ["$status", "half_day"] }, 1, 0] } },
        totalHours: { $sum: "$workHours" },
      },
    },
    {
      $lookup: { from: "users", localField: "_id", foreignField: "_id", as: "user" },
    },
    { $unwind: "$user" },
    {
      $project: {
        _id: 0,
        user: { _id: 1, firstName: 1, lastName: 1, avatar: 1, department: 1 },
        present: 1, absent: 1, halfDay: 1, totalHours: 1,
      },
    },
  ]);

  ApiResponse.success(res, summary);
});

module.exports = router;
