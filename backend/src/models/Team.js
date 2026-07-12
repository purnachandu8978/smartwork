const mongoose = require("mongoose");

const teamSchema = new mongoose.Schema(
  {
    name: {
      type: String,
      required: [true, "Team name is required"],
      trim: true,
      maxlength: [100, "Team name cannot exceed 100 characters"],
    },
    description: { type: String, maxlength: [500, "Description cannot exceed 500 characters"] },
    leader: {
      type: mongoose.Schema.Types.ObjectId,
      ref: "User",
      required: true,
    },
    members: [
      {
        user: { type: mongoose.Schema.Types.ObjectId, ref: "User", required: true },
        role: { type: String, enum: ["lead", "member"], default: "member" },
        joinedAt: { type: Date, default: Date.now },
      },
    ],
    projects: [{ type: mongoose.Schema.Types.ObjectId, ref: "Project" }],
    avatar: {
      url: { type: String, default: "" },
      color: { type: String, default: "#6366f1" },
    },
    isActive: { type: Boolean, default: true },
    createdBy: { type: mongoose.Schema.Types.ObjectId, ref: "User" },
  },
  { timestamps: true, toJSON: { virtuals: true }, toObject: { virtuals: true } }
);

teamSchema.index({ name: 1 });
teamSchema.index({ leader: 1 });
teamSchema.index({ "members.user": 1 });
teamSchema.index({ isActive: 1 });

teamSchema.virtual("memberCount").get(function () {
  return this.members?.length || 0;
});

module.exports = mongoose.model("Team", teamSchema);
