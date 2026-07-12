const mongoose = require("mongoose");

const calendarEventSchema = new mongoose.Schema(
  {
    title: {
      type: String,
      required: [true, "Event title is required"],
      trim: true,
      maxlength: [200, "Title cannot exceed 200 characters"],
    },
    description: { type: String, maxlength: [2000, "Description cannot exceed 2000 characters"] },
    startDate: { type: Date, required: true },
    endDate: { type: Date, required: true },
    allDay: { type: Boolean, default: false },
    type: {
      type: String,
      enum: ["meeting", "deadline", "reminder", "holiday", "event", "task"],
      default: "event",
    },
    color: { type: String, default: "#6366f1" },
    location: { type: String },
    organizer: { type: mongoose.Schema.Types.ObjectId, ref: "User", required: true },
    attendees: [
      {
        user: { type: mongoose.Schema.Types.ObjectId, ref: "User" },
        status: { type: String, enum: ["pending", "accepted", "declined"], default: "pending" },
        respondedAt: { type: Date },
      },
    ],
    project: { type: mongoose.Schema.Types.ObjectId, ref: "Project" },
    task: { type: mongoose.Schema.Types.ObjectId, ref: "Task" },
    isRecurring: { type: Boolean, default: false },
    recurrence: {
      frequency: { type: String, enum: ["daily", "weekly", "monthly", "yearly"] },
      interval: { type: Number, default: 1 },
      endDate: { type: Date },
      daysOfWeek: [{ type: Number }],
    },
    reminders: [
      {
        type: { type: String, enum: ["email", "push"], default: "push" },
        minutesBefore: { type: Number, default: 15 },
      },
    ],
    isPublic: { type: Boolean, default: true },
  },
  { timestamps: true }
);

calendarEventSchema.index({ startDate: 1, endDate: 1 });
calendarEventSchema.index({ organizer: 1 });
calendarEventSchema.index({ "attendees.user": 1 });

module.exports = mongoose.model("CalendarEvent", calendarEventSchema);
