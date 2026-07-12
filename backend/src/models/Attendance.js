const mongoose = require("mongoose");
const { ATTENDANCE_STATUS } = require("../constants/enums");

const attendanceSchema = new mongoose.Schema(
  {
    user: {
      type: mongoose.Schema.Types.ObjectId,
      ref: "User",
      required: true,
    },
    date: { type: Date, required: true },
    checkIn: { type: Date },
    checkOut: { type: Date },
    workHours: { type: Number, default: 0 }, // in hours
    status: {
      type: String,
      enum: Object.values(ATTENDANCE_STATUS),
      default: ATTENDANCE_STATUS.ABSENT,
    },
    location: {
      ip: { type: String },
      coordinates: {
        lat: { type: Number },
        lng: { type: Number },
      },
    },
    notes: { type: String, maxlength: [500, "Notes cannot exceed 500 characters"] },
    isManual: { type: Boolean, default: false },
    approvedBy: { type: mongoose.Schema.Types.ObjectId, ref: "User" },
  },
  { timestamps: true }
);

attendanceSchema.index({ user: 1, date: 1 }, { unique: true });
attendanceSchema.index({ date: -1 });
attendanceSchema.index({ status: 1 });

// Calculate work hours on save
attendanceSchema.pre("save", function (next) {
  if (this.checkIn && this.checkOut) {
    const ms = this.checkOut - this.checkIn;
    this.workHours = parseFloat((ms / (1000 * 60 * 60)).toFixed(2));
    if (this.workHours >= 4) this.status = "present";
    else if (this.workHours > 0) this.status = "half_day";
  }
  next();
});

module.exports = mongoose.model("Attendance", attendanceSchema);
