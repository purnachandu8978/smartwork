const express = require("express");
const router = express.Router();
const taskService = require("../../services/task.service");
const { authenticate, authorize } = require("../../middlewares/auth");
const { ApiResponse } = require("../../utils/ApiResponse");
const { PERMISSIONS } = require("../../constants/roles");
const { auditLog } = require("../../middlewares/logger");

router.use(authenticate);

// Kanban board
router.get("/kanban", authorize(PERMISSIONS.TASK_READ), async (req, res) => {
  const board = await taskService.getKanbanBoard(req.query.projectId);
  ApiResponse.success(res, board, "Kanban board fetched");
});

// Update task order (drag & drop)
router.patch("/:id/order", authorize(PERMISSIONS.TASK_UPDATE), async (req, res) => {
  const { status, order } = req.body;
  const task = await taskService.updateTaskOrder(req.params.id, status, order);
  ApiResponse.success(res, task, "Task order updated");
});

// Time logging
router.post("/:id/time-log", authorize(PERMISSIONS.TASK_UPDATE), async (req, res) => {
  const timeLog = await taskService.logTime(req.params.id, req.body, req.user._id);
  ApiResponse.success(res, timeLog, "Time logged successfully");
});

// Comments
router.post("/:id/comments", authorize(PERMISSIONS.TASK_UPDATE), async (req, res) => {
  const comment = await taskService.addComment(req.params.id, req.body, req.user._id);
  ApiResponse.success(res, comment, "Comment added");
});

// CRUD
router.get("/", authorize(PERMISSIONS.TASK_READ), async (req, res) => {
  const result = await taskService.getTasks({
    ...req.query,
    page: parseInt(req.query.page) || 1,
    limit: parseInt(req.query.limit) || 20,
  });
  ApiResponse.success(res, result);
});

router.post("/", authorize(PERMISSIONS.TASK_CREATE), auditLog("create", "Task"), async (req, res) => {
  const task = await taskService.createTask(req.body, req.user._id);
  ApiResponse.created(res, task, "Task created successfully");
});

router.get("/:id", authorize(PERMISSIONS.TASK_READ), async (req, res) => {
  const task = await taskService.getTaskById(req.params.id);
  ApiResponse.success(res, task);
});

router.put("/:id", authorize(PERMISSIONS.TASK_UPDATE), auditLog("update", "Task"), async (req, res) => {
  const task = await taskService.updateTask(req.params.id, req.body, req.user._id);
  ApiResponse.success(res, task, "Task updated successfully");
});

router.delete("/:id", authorize(PERMISSIONS.TASK_DELETE), auditLog("delete", "Task"), async (req, res) => {
  const result = await taskService.deleteTask(req.params.id);
  ApiResponse.success(res, result, result.message);
});

module.exports = router;
