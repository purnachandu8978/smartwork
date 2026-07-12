const express = require("express");
const router = express.Router();
const CalendarEvent = require("../../models/CalendarEvent");
const { authenticate } = require("../../middlewares/auth");
const { ApiResponse } = require("../../utils/ApiResponse");
const { ApiError } = require("../../utils/ApiError");

router.use(authenticate);

router.get("/", async (req, res) => {
  const { startDate, endDate } = req.query;
  const filter = {
    $or: [{ organizer: req.user._id }, { "attendees.user": req.user._id }, { isPublic: true }],
  };
  if (startDate && endDate) {
    filter.startDate = { $gte: new Date(startDate) };
    filter.endDate = { $lte: new Date(endDate) };
  }
  const events = await CalendarEvent.find(filter)
    .populate("organizer", "firstName lastName avatar")
    .populate("attendees.user", "firstName lastName avatar")
    .sort({ startDate: 1 });
  ApiResponse.success(res, events);
});

router.post("/", async (req, res) => {
  const event = await CalendarEvent.create({ ...req.body, organizer: req.user._id });
  ApiResponse.created(res, event, "Event created");
});

router.get("/:id", async (req, res) => {
  const event = await CalendarEvent.findById(req.params.id)
    .populate("organizer", "firstName lastName avatar")
    .populate("attendees.user", "firstName lastName avatar");
  if (!event) throw ApiError.notFound("Event not found");
  ApiResponse.success(res, event);
});

router.put("/:id", async (req, res) => {
  const event = await CalendarEvent.findOne({ _id: req.params.id, organizer: req.user._id });
  if (!event) throw ApiError.notFound("Event not found or not yours");
  Object.assign(event, req.body);
  await event.save();
  ApiResponse.success(res, event, "Event updated");
});

router.delete("/:id", async (req, res) => {
  const event = await CalendarEvent.findOneAndDelete({ _id: req.params.id, organizer: req.user._id });
  if (!event) throw ApiError.notFound("Event not found or not yours");
  ApiResponse.success(res, null, "Event deleted");
});

router.patch("/:id/respond", async (req, res) => {
  const { status } = req.body;
  const event = await CalendarEvent.findById(req.params.id);
  if (!event) throw ApiError.notFound("Event not found");
  const attendee = event.attendees.find((a) => a.user.toString() === req.user._id.toString());
  if (attendee) { attendee.status = status; attendee.respondedAt = new Date(); }
  await event.save();
  ApiResponse.success(res, event, "RSVP updated");
});

module.exports = router;
