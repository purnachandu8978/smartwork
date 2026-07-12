const mongoose = require("mongoose");
const { LEAVE_TYPE, LEAVE_STATUS } = require("../constants/enums");

const leaveSchema = new mongoose.Schema(
  {
    employee: {
      type: mongoose.Schema.Types.ObjectId,
      ref: "User",
      required: true,
    },
    type: {
      type: String,
      enum: Object.values(LEAVE_TYPE),
      required: true,
    },
    status: {
      type: String,
      enum: Object.values(LEAVE_STATUS),
      default: LEAVE_STATUS.PENDING,
    },
    startDate: { type: Date, required: true },
    endDate: { type: Date, required: true },
    days: { type: Number, required: true },
    reason: {
      type: String,
      required: [true, "Reason is required"],
      maxlength: [1000, "Reason cannot exceed 1000 characters"],
    },
    approver: { type: mongoose.Schema.Types.ObjectId, ref: "User" },
    approvedAt: { type: Date },
    rejectionReason: { type: String },
    attachments: [
      {
        name: { type: String },
        url: { type: String },
        publicId: { type: String },
      },
    ],
    isHalfDay: { type: Boolean, default: false },
    halfDayPeriod: { type: String, enum: ["morning", "afternoon"] },
  },
  { timestamps: true }
);

leaveSchema.index({ employee: 1, status: 1 });
leaveSchema.index({ startDate: -1 });
leaveSchema.index({ type: 1 });

// Auto calculate days
leaveSchema.pre("validate", function (next) {
  if (this.startDate && this.endDate) {
    const ms = this.endDate - this.startDate;
    this.days = this.isHalfDay ? 0.5 : Math.ceil(ms / (1000 * 60 * 60 * 24)) + 1;
  }
  next();
});

module.exports = mongoose.model("Leave", leaveSchema);
