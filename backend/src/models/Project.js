const mongoose = require("mongoose");
const { PROJECT_STATUS } = require("../constants/enums");

const milestoneSchema = new mongoose.Schema({
  title: { type: String, required: true, trim: true },
  description: { type: String },
  dueDate: { type: Date, required: true },
  isCompleted: { type: Boolean, default: false },
  completedAt: { type: Date },
});

const projectSchema = new mongoose.Schema(
  {
    name: {
      type: String,
      required: [true, "Project name is required"],
      trim: true,
      maxlength: [150, "Project name cannot exceed 150 characters"],
    },
    description: {
      type: String,
      maxlength: [2000, "Description cannot exceed 2000 characters"],
    },
    status: {
      type: String,
      enum: Object.values(PROJECT_STATUS),
      default: PROJECT_STATUS.PLANNING,
    },
    priority: {
      type: String,
      enum: ["low", "medium", "high", "critical"],
      default: "medium",
    },
    owner: { type: mongoose.Schema.Types.ObjectId, ref: "User", required: true },
    team: { type: mongoose.Schema.Types.ObjectId, ref: "Team" },
    members: [
      {
        user: { type: mongoose.Schema.Types.ObjectId, ref: "User" },
        role: { type: String, enum: ["owner", "lead", "contributor", "viewer"], default: "contributor" },
        addedAt: { type: Date, default: Date.now },
      },
    ],
    startDate: { type: Date },
    endDate: { type: Date },
    milestones: [milestoneSchema],
    budget: {
      allocated: { type: Number, default: 0 },
      spent: { type: Number, default: 0 },
      currency: { type: String, default: "USD" },
    },
    progress: { type: Number, default: 0, min: 0, max: 100 },
    tags: [{ type: String, trim: true }],
    coverImage: { url: { type: String }, publicId: { type: String } },
    isArchived: { type: Boolean, default: false },
    createdBy: { type: mongoose.Schema.Types.ObjectId, ref: "User" },
  },
  { timestamps: true, toJSON: { virtuals: true }, toObject: { virtuals: true } }
);

projectSchema.index({ name: "text", description: "text" });
projectSchema.index({ status: 1 });
projectSchema.index({ owner: 1 });
projectSchema.index({ team: 1 });
projectSchema.index({ "members.user": 1 });
projectSchema.index({ endDate: 1 });
projectSchema.index({ isArchived: 1 });
projectSchema.index({ createdAt: -1 });

projectSchema.virtual("isOverdue").get(function () {
  return this.endDate && this.endDate < new Date() && this.status !== "completed";
});

projectSchema.virtual("daysRemaining").get(function () {
  if (!this.endDate) return null;
  return Math.ceil((this.endDate - new Date()) / (1000 * 60 * 60 * 24));
});

module.exports = mongoose.model("Project", projectSchema);
