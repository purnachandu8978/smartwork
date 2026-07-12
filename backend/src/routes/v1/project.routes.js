const express = require("express");
const router = express.Router();
const Project = require("../../models/Project");
const { authenticate, authorize } = require("../../middlewares/auth");
const { ApiResponse } = require("../../utils/ApiResponse");
const { ApiError } = require("../../utils/ApiError");
const { PERMISSIONS } = require("../../constants/roles");
const { getPagination, paginatedResponse, getSort } = require("../../utils/helpers");
const { auditLog } = require("../../middlewares/logger");

router.use(authenticate);

router.get("/", authorize(PERMISSIONS.PROJECT_READ), async (req, res) => {
  const { page = 1, limit = 10, status, search, sortBy = "createdAt", sortOrder = "desc" } = req.query;
  const { skip } = getPagination({ page, limit });
  const filter = { isArchived: false };
  if (status) filter.status = status;
  if (search) filter.$text = { $search: search };

  // Non-admins only see their projects
  if (!["super_admin", "admin"].includes(req.user.role)) {
    filter.$or = [
      { owner: req.user._id },
      { "members.user": req.user._id },
    ];
  }

  const [projects, total] = await Promise.all([
    Project.find(filter)
      .sort(getSort(sortBy, sortOrder))
      .skip(skip)
      .limit(parseInt(limit))
      .populate("owner", "firstName lastName avatar")
      .populate("team", "name")
      .select("-milestones"),
    Project.countDocuments(filter),
  ]);

  ApiResponse.success(res, paginatedResponse(projects, total, parseInt(page), parseInt(limit)));
});

router.post("/", authorize(PERMISSIONS.PROJECT_CREATE), auditLog("create", "Project"), async (req, res) => {
  const project = await Project.create({ ...req.body, owner: req.user._id, createdBy: req.user._id });
  ApiResponse.created(res, project, "Project created successfully");
});

router.get("/:id", authorize(PERMISSIONS.PROJECT_READ), async (req, res) => {
  const project = await Project.findById(req.params.id)
    .populate("owner", "firstName lastName avatar email")
    .populate("team", "name members")
    .populate("members.user", "firstName lastName avatar email")
    .populate("createdBy", "firstName lastName");
  if (!project) throw ApiError.notFound("Project not found");
  ApiResponse.success(res, project);
});

router.put("/:id", authorize(PERMISSIONS.PROJECT_UPDATE), auditLog("update", "Project"), async (req, res) => {
  const project = await Project.findByIdAndUpdate(req.params.id, req.body, { new: true, runValidators: true });
  if (!project) throw ApiError.notFound("Project not found");
  ApiResponse.success(res, project, "Project updated successfully");
});

router.delete("/:id", authorize(PERMISSIONS.PROJECT_DELETE), auditLog("delete", "Project"), async (req, res) => {
  const project = await Project.findByIdAndDelete(req.params.id);
  if (!project) throw ApiError.notFound("Project not found");
  ApiResponse.success(res, null, "Project deleted successfully");
});

// Add/remove project member
router.post("/:id/members", authorize(PERMISSIONS.PROJECT_UPDATE), async (req, res) => {
  const { userId, role = "contributor" } = req.body;
  const project = await Project.findById(req.params.id);
  if (!project) throw ApiError.notFound("Project not found");
  const exists = project.members.some((m) => m.user.toString() === userId);
  if (!exists) project.members.push({ user: userId, role });
  await project.save();
  ApiResponse.success(res, project, "Member added");
});

router.delete("/:id/members/:userId", authorize(PERMISSIONS.PROJECT_UPDATE), async (req, res) => {
  const project = await Project.findById(req.params.id);
  if (!project) throw ApiError.notFound("Project not found");
  project.members = project.members.filter((m) => m.user.toString() !== req.params.userId);
  await project.save();
  ApiResponse.success(res, project, "Member removed");
});

// Milestones
router.post("/:id/milestones", authorize(PERMISSIONS.PROJECT_UPDATE), async (req, res) => {
  const project = await Project.findById(req.params.id);
  if (!project) throw ApiError.notFound("Project not found");
  project.milestones.push(req.body);
  await project.save();
  ApiResponse.success(res, project.milestones, "Milestone added");
});

router.patch("/:id/milestones/:milestoneId", authorize(PERMISSIONS.PROJECT_UPDATE), async (req, res) => {
  const project = await Project.findById(req.params.id);
  if (!project) throw ApiError.notFound("Project not found");
  const milestone = project.milestones.id(req.params.milestoneId);
  if (!milestone) throw ApiError.notFound("Milestone not found");
  Object.assign(milestone, req.body);
  if (req.body.isCompleted) milestone.completedAt = new Date();
  await project.save();
  ApiResponse.success(res, milestone, "Milestone updated");
});

module.exports = router;
