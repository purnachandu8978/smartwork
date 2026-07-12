const express = require("express");
const router = express.Router();
const userService = require("../../services/user.service");
const { authenticate, authorizeRoles } = require("../../middlewares/auth");
const { avatarUpload } = require("../../config/cloudinary");
const { ApiResponse } = require("../../utils/ApiResponse");
const { auditLog } = require("../../middlewares/logger");
const { ROLES } = require("../../constants/roles");

router.use(authenticate);

router.get("/", authorizeRoles(ROLES.SUPER_ADMIN, ROLES.ADMIN, ROLES.MANAGER), async (req, res) => {
  const result = await userService.getUsers({
    ...req.query,
    page: parseInt(req.query.page) || 1,
    limit: parseInt(req.query.limit) || 10,
  });
  ApiResponse.success(res, result);
});

router.get("/stats", authorizeRoles(ROLES.SUPER_ADMIN, ROLES.ADMIN), async (req, res) => {
  const stats = await userService.getDashboardStats();
  ApiResponse.success(res, stats);
});

router.get("/:id", async (req, res) => {
  const user = await userService.getUserById(req.params.id);
  ApiResponse.success(res, user);
});

router.put("/:id", auditLog("update", "User"), async (req, res) => {
  const user = await userService.updateUser(req.params.id, req.body, req.user._id, req.user.role);
  ApiResponse.success(res, user, "User updated successfully");
});

router.patch("/:id/avatar", avatarUpload.single("avatar"), async (req, res) => {
  const result = await userService.updateAvatar(req.params.id, req.file);
  ApiResponse.success(res, result, "Avatar updated successfully");
});

router.patch("/:id/status", authorizeRoles(ROLES.SUPER_ADMIN, ROLES.ADMIN), auditLog("update", "User"), async (req, res) => {
  const result = await userService.toggleUserStatus(req.params.id);
  ApiResponse.success(res, result, result.message);
});

router.delete("/:id", authorizeRoles(ROLES.SUPER_ADMIN, ROLES.ADMIN), auditLog("delete", "User"), async (req, res) => {
  const result = await userService.deleteUser(req.params.id, req.user._id);
  ApiResponse.success(res, result, result.message);
});

module.exports = router;
