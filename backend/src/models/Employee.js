const mongoose = require("mongoose");

const employeeSchema = new mongoose.Schema(
  {
    user: {
      type: mongoose.Schema.Types.ObjectId,
      ref: "User",
      required: true,
      unique: true,
    },
    employeeId: {
      type: String,
      unique: true,
      required: true,
    },
    department: { type: String, required: true, trim: true },
    position: { type: String, required: true, trim: true },
    employmentType: {
      type: String,
      enum: ["full_time", "part_time", "contract", "intern"],
      default: "full_time",
    },
    joiningDate: { type: Date, required: true },
    probationEndDate: { type: Date },
    reportingTo: { type: mongoose.Schema.Types.ObjectId, ref: "User" },
    salary: {
      amount: { type: Number },
      currency: { type: String, default: "USD" },
      paymentFrequency: { type: String, enum: ["monthly", "biweekly", "weekly"] },
    },
    bankDetails: {
      bankName: { type: String },
      accountNumber: { type: String, select: false },
      routingNumber: { type: String, select: false },
    },
    emergencyContact: {
      name: { type: String },
      relationship: { type: String },
      phone: { type: String },
    },
    address: {
      street: { type: String },
      city: { type: String },
      state: { type: String },
      country: { type: String },
      zipCode: { type: String },
    },
    skills: [{ type: String, trim: true }],
    documents: [
      {
        name: { type: String, required: true },
        type: { type: String },
        url: { type: String, required: true },
        publicId: { type: String },
        uploadedAt: { type: Date, default: Date.now },
      },
    ],
    leaveBalance: {
      annual: { type: Number, default: 20 },
      sick: { type: Number, default: 10 },
      casual: { type: Number, default: 5 },
      compensatory: { type: Number, default: 0 },
    },
    isOnProbation: { type: Boolean, default: false },
    separationDate: { type: Date },
    separationReason: { type: String },
  },
  { timestamps: true, toJSON: { virtuals: true }, toObject: { virtuals: true } }
);

employeeSchema.index({ user: 1 });
employeeSchema.index({ department: 1 });
employeeSchema.index({ employeeId: 1 });

employeeSchema.virtual("yearsOfService").get(function () {
  if (!this.joiningDate) return 0;
  const ms = new Date() - this.joiningDate;
  return parseFloat((ms / (1000 * 60 * 60 * 24 * 365)).toFixed(1));
});

// Auto-generate employeeId
employeeSchema.pre("validate", async function (next) {
  if (!this.employeeId) {
    const count = await this.constructor.countDocuments();
    this.employeeId = `EMP${String(count + 1).padStart(4, "0")}`;
  }
  next();
});

module.exports = mongoose.model("Employee", employeeSchema);
