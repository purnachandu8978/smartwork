const express = require("express");
const router = express.Router();
const { authenticate, authorizeRoles } = require("../../middlewares/auth");
const { ApiResponse } = require("../../utils/ApiResponse");
const { ROLES } = require("../../constants/roles");
const User = require("../../models/User");
const Task = require("../../models/Task");
const Project = require("../../models/Project");
const Attendance = require("../../models/Attendance");
const Leave = require("../../models/Leave");

router.use(authenticate);

router.get("/", async (req, res) => {
  const userId = req.user._id;
  const isAdmin = ["super_admin", "admin"].includes(req.user.role);

  const startOfMonth = new Date();
  startOfMonth.setDate(1);
  startOfMonth.setHours(0, 0, 0, 0);

  const today = new Date();
  today.setHours(0, 0, 0, 0);
  const tomorrow = new Date(today); tomorrow.setDate(tomorrow.getDate() + 1);

  const [
    totalUsers,
    totalProjects,
    totalTasks,
    myTasks,
    tasksByStatus,
    tasksByPriority,
    recentTasks,
    todayAttendance,
    monthAttendance,
    pendingLeaves,
    projectProgress,
  ] = await Promise.all([
    isAdmin ? User.countDocuments({ isActive: true }) : Promise.resolve(null),
    isAdmin ? Project.countDocuments({ isArchived: false }) : Promise.resolve(null),
    isAdmin ? Task.countDocuments({ isArchived: false }) : Promise.resolve(null),
    Task.countDocuments({ assignee: userId, isArchived: false }),

    // Task status distribution
    Task.aggregate([
      { $match: isAdmin ? { isArchived: false } : { assignee: userId, isArchived: false } },
      { $group: { _id: "$status", count: { $sum: 1 } } },
    ]),

    // Task priority distribution
    Task.aggregate([
      { $match: isAdmin ? { isArchived: false } : { assignee: userId, isArchived: false } },
      { $group: { _id: "$priority", count: { $sum: 1 } } },
    ]),

    // Recent tasks
    Task.find(isAdmin ? { isArchived: false } : { assignee: userId })
      .sort({ updatedAt: -1 })
      .limit(5)
      .populate("assignee", "firstName lastName avatar")
      .populate("project", "name"),

    // Today's check-in status
    Attendance.findOne({ user: userId, date: { $gte: today, $lt: tomorrow } }),

    // This month's attendance
    Attendance.find({ user: userId, date: { $gte: startOfMonth } }).select("status workHours"),

    // Pending leaves (admin sees all, employee sees own)
    isAdmin
      ? Leave.countDocuments({ status: "pending" })
      : Leave.countDocuments({ employee: userId, status: "pending" }),

    // Projects with progress
    Project.find({ isArchived: false, ...(isAdmin ? {} : { "members.user": userId }) })
      .select("name status progress endDate")
      .sort({ progress: 1 })
      .limit(5),
  ]);

  const workHoursThisMonth = monthAttendance.reduce((sum, a) => sum + a.workHours, 0);

  const stats = {
    kpi: {
      totalUsers,
      totalProjects,
      totalTasks: isAdmin ? totalTasks : myTasks,
      myTasks,
      pendingLeaves,
    },
    tasks: {
      byStatus: tasksByStatus.reduce((acc, t) => ({ ...acc, [t._id]: t.count }), {}),
      byPriority: tasksByPriority.reduce((acc, t) => ({ ...acc, [t._id]: t.count }), {}),
      recent: recentTasks,
    },
    attendance: {
      todayCheckedIn: !!todayAttendance?.checkIn,
      todayCheckedOut: !!todayAttendance?.checkOut,
      workHoursThisMonth: parseFloat(workHoursThisMonth.toFixed(2)),
      presentDays: monthAttendance.filter((a) => a.status === "present").length,
    },
    projects: projectProgress,
  };

  ApiResponse.success(res, stats, "Dashboard data fetched");
});

// Analytics — last 7 days task completion
router.get("/analytics/tasks", async (req, res) => {
  const last7Days = new Date(); last7Days.setDate(last7Days.getDate() - 7);

  const data = await Task.aggregate([
    { $match: { completedAt: { $gte: last7Days }, status: "done" } },
    {
      $group: {
        _id: { $dateToString: { format: "%Y-%m-%d", date: "$completedAt" } },
        count: { $sum: 1 },
      },
    },
    { $sort: { _id: 1 } },
  ]);

  ApiResponse.success(res, data);
});

// Analytics — attendance trend
router.get("/analytics/attendance", authorizeRoles(ROLES.SUPER_ADMIN, ROLES.ADMIN, ROLES.MANAGER), async (req, res) => {
  const last30Days = new Date(); last30Days.setDate(last30Days.getDate() - 30);

  const data = await Attendance.aggregate([
    { $match: { date: { $gte: last30Days } } },
    {
      $group: {
        _id: { $dateToString: { format: "%Y-%m-%d", date: "$date" } },
        present: { $sum: { $cond: [{ $eq: ["$status", "present"] }, 1, 0] } },
        absent: { $sum: { $cond: [{ $eq: ["$status", "absent"] }, 1, 0] } },
      },
    },
    { $sort: { _id: 1 } },
  ]);

  ApiResponse.success(res, data);
});

module.exports = router;
