const express = require("express");
const router = express.Router();

const authRoutes = require("./auth.routes");
const userRoutes = require("./user.routes");
const employeeRoutes = require("./employee.routes");
const teamRoutes = require("./team.routes");
const projectRoutes = require("./project.routes");
const taskRoutes = require("./task.routes");
const notificationRoutes = require("./notification.routes");
const attendanceRoutes = require("./attendance.routes");
const leaveRoutes = require("./leave.routes");
const calendarRoutes = require("./calendar.routes");
const dashboardRoutes = require("./dashboard.routes");
const auditRoutes = require("./audit.routes");

router.use("/auth", authRoutes);
router.use("/users", userRoutes);
router.use("/employees", employeeRoutes);
router.use("/teams", teamRoutes);
router.use("/projects", projectRoutes);
router.use("/tasks", taskRoutes);
router.use("/notifications", notificationRoutes);
router.use("/attendance", attendanceRoutes);
router.use("/leaves", leaveRoutes);
router.use("/calendar", calendarRoutes);
router.use("/dashboard", dashboardRoutes);
router.use("/audit-logs", auditRoutes);

module.exports = router;
