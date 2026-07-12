const express = require("express");
const router = express.Router();
const Notification = require("../../models/Notification");
const { authenticate } = require("../../middlewares/auth");
const { ApiResponse } = require("../../utils/ApiResponse");
const { ApiError } = require("../../utils/ApiError");

router.use(authenticate);

router.get("/", async (req, res) => {
  const { page = 1, limit = 20, isRead } = req.query;
  const skip = (page - 1) * limit;
  const filter = { recipient: req.user._id };
  if (isRead !== undefined) filter.isRead = isRead === "true";

  const [notifications, total, unreadCount] = await Promise.all([
    Notification.find(filter)
      .sort({ createdAt: -1 })
      .skip(skip)
      .limit(parseInt(limit))
      .populate("sender", "firstName lastName avatar"),
    Notification.countDocuments(filter),
    Notification.countDocuments({ recipient: req.user._id, isRead: false }),
  ]);

  ApiResponse.success(res, { notifications, total, unreadCount });
});

router.patch("/:id/read", async (req, res) => {
  const notification = await Notification.findOne({ _id: req.params.id, recipient: req.user._id });
  if (!notification) throw ApiError.notFound("Notification not found");
  await notification.markAsRead();
  ApiResponse.success(res, notification, "Marked as read");
});

router.patch("/mark-all-read", async (req, res) => {
  await Notification.updateMany(
    { recipient: req.user._id, isRead: false },
    { isRead: true, readAt: new Date() }
  );
  ApiResponse.success(res, null, "All notifications marked as read");
});

router.delete("/:id", async (req, res) => {
  await Notification.findOneAndDelete({ _id: req.params.id, recipient: req.user._id });
  ApiResponse.success(res, null, "Notification deleted");
});

module.exports = router;
