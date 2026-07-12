const mongoose = require("mongoose");
const { TASK_STATUS, TASK_PRIORITY } = require("../constants/enums");

const commentSchema = new mongoose.Schema(
  {
    author: { type: mongoose.Schema.Types.ObjectId, ref: "User", required: true },
    content: { type: String, required: true, maxlength: [2000, "Comment cannot exceed 2000 characters"] },
    attachments: [
      {
        name: { type: String },
        url: { type: String },
        publicId: { type: String },
        type: { type: String },
      },
    ],
    isEdited: { type: Boolean, default: false },
    editedAt: { type: Date },
  },
  { timestamps: true }
);

const timeLogSchema = new mongoose.Schema({
  user: { type: mongoose.Schema.Types.ObjectId, ref: "User", required: true },
  startTime: { type: Date, required: true },
  endTime: { type: Date },
  duration: { type: Number }, // minutes
  description: { type: String },
  date: { type: Date, required: true },
});

const activitySchema = new mongoose.Schema(
  {
    actor: { type: mongoose.Schema.Types.ObjectId, ref: "User", required: true },
    action: { type: String, required: true },
    field: { type: String },
    oldValue: { type: mongoose.Schema.Types.Mixed },
    newValue: { type: mongoose.Schema.Types.Mixed },
  },
  { timestamps: true }
);

const taskSchema = new mongoose.Schema(
  {
    title: {
      type: String,
      required: [true, "Task title is required"],
      trim: true,
      maxlength: [200, "Title cannot exceed 200 characters"],
    },
    description: {
      type: String,
      maxlength: [5000, "Description cannot exceed 5000 characters"],
    },
    status: {
      type: String,
      enum: Object.values(TASK_STATUS),
      default: TASK_STATUS.TODO,
    },
    priority: {
      type: String,
      enum: Object.values(TASK_PRIORITY),
      default: TASK_PRIORITY.MEDIUM,
    },
    project: { type: mongoose.Schema.Types.ObjectId, ref: "Project" },
    assignee: { type: mongoose.Schema.Types.ObjectId, ref: "User" },
    reporter: { type: mongoose.Schema.Types.ObjectId, ref: "User", required: true },
    dueDate: { type: Date },
    startDate: { type: Date },
    completedAt: { type: Date },
    estimatedHours: { type: Number, min: 0 },
    tags: [{ type: String, trim: true, lowercase: true }],
    attachments: [
      {
        name: { type: String, required: true },
        url: { type: String, required: true },
        publicId: { type: String },
        size: { type: Number },
        mimeType: { type: String },
        uploadedBy: { type: mongoose.Schema.Types.ObjectId, ref: "User" },
        uploadedAt: { type: Date, default: Date.now },
      },
    ],
    comments: [commentSchema],
    timeLogs: [timeLogSchema],
    activity: [activitySchema],
    dependencies: [{ type: mongoose.Schema.Types.ObjectId, ref: "Task" }],
    order: { type: Number, default: 0 },
    isArchived: { type: Boolean, default: false },
    createdBy: { type: mongoose.Schema.Types.ObjectId, ref: "User" },
  },
  { timestamps: true, toJSON: { virtuals: true }, toObject: { virtuals: true } }
);

// ─── Indexes ─────────────────────────────────────────────────────────────────
taskSchema.index({ title: "text", description: "text", tags: "text" });
taskSchema.index({ project: 1, status: 1 });
taskSchema.index({ assignee: 1 });
taskSchema.index({ reporter: 1 });
taskSchema.index({ status: 1 });
taskSchema.index({ priority: 1 });
taskSchema.index({ dueDate: 1 });
taskSchema.index({ isArchived: 1 });
taskSchema.index({ createdAt: -1 });
taskSchema.index({ "comments._id": 1 });

// ─── Virtuals ────────────────────────────────────────────────────────────────
taskSchema.virtual("isOverdue").get(function () {
  return this.dueDate && this.dueDate < new Date() && this.status !== "done";
});

taskSchema.virtual("totalTimeLogged").get(function () {
  return this.timeLogs?.reduce((acc, log) => acc + (log.duration || 0), 0) || 0;
});

taskSchema.virtual("commentCount").get(function () {
  return this.comments?.length || 0;
});

module.exports = mongoose.model("Task", taskSchema);
