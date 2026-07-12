const express = require("express");
const router = express.Router();
const Team = require("../../models/Team");
const { authenticate, authorize, authorizeRoles } = require("../../middlewares/auth");
const { ApiResponse } = require("../../utils/ApiResponse");
const { ApiError } = require("../../utils/ApiError");
const { PERMISSIONS, ROLES } = require("../../constants/roles");
const { auditLog } = require("../../middlewares/logger");

router.use(authenticate);

router.get("/", authorize(PERMISSIONS.TEAM_READ), async (req, res) => {
  const filter = { isActive: true };
  if (!["super_admin", "admin"].includes(req.user.role)) {
    filter["members.user"] = req.user._id;
  }
  const teams = await Team.find(filter)
    .populate("leader", "firstName lastName avatar email")
    .populate("members.user", "firstName lastName avatar email role");
  ApiResponse.success(res, teams);
});

router.post("/", authorizeRoles(ROLES.SUPER_ADMIN, ROLES.ADMIN), auditLog("create", "Team"), async (req, res) => {
  const team = await Team.create({ ...req.body, createdBy: req.user._id });
  ApiResponse.created(res, team, "Team created successfully");
});

router.get("/:id", authorize(PERMISSIONS.TEAM_READ), async (req, res) => {
  const team = await Team.findById(req.params.id)
    .populate("leader", "firstName lastName avatar email")
    .populate("members.user", "firstName lastName avatar email role department position")
    .populate("projects", "name status progress");
  if (!team) throw ApiError.notFound("Team not found");
  ApiResponse.success(res, team);
});

router.put("/:id", authorizeRoles(ROLES.SUPER_ADMIN, ROLES.ADMIN, ROLES.MANAGER), auditLog("update", "Team"), async (req, res) => {
  const team = await Team.findByIdAndUpdate(req.params.id, req.body, { new: true, runValidators: true });
  if (!team) throw ApiError.notFound("Team not found");
  ApiResponse.success(res, team, "Team updated");
});

router.delete("/:id", authorizeRoles(ROLES.SUPER_ADMIN, ROLES.ADMIN), auditLog("delete", "Team"), async (req, res) => {
  const team = await Team.findByIdAndDelete(req.params.id);
  if (!team) throw ApiError.notFound("Team not found");
  ApiResponse.success(res, null, "Team deleted");
});

router.post("/:id/members", authorizeRoles(ROLES.SUPER_ADMIN, ROLES.ADMIN, ROLES.MANAGER), async (req, res) => {
  const { userId, role = "member" } = req.body;
  const team = await Team.findById(req.params.id);
  if (!team) throw ApiError.notFound("Team not found");
  const exists = team.members.some((m) => m.user.toString() === userId);
  if (exists) throw ApiError.conflict("User already in team");
  team.members.push({ user: userId, role });
  await team.save();
  ApiResponse.success(res, team, "Member added to team");
});

router.delete("/:id/members/:userId", authorizeRoles(ROLES.SUPER_ADMIN, ROLES.ADMIN, ROLES.MANAGER), async (req, res) => {
  const team = await Team.findById(req.params.id);
  if (!team) throw ApiError.notFound("Team not found");
  team.members = team.members.filter((m) => m.user.toString() !== req.params.userId);
  await team.save();
  ApiResponse.success(res, team, "Member removed from team");
});

module.exports = router;
