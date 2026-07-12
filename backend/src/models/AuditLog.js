const mongoose = require("mongoose");
const { AUDIT_ACTIONS } = require("../constants/enums");

const auditLogSchema = new mongoose.Schema(
  {
    actor: { type: mongoose.Schema.Types.ObjectId, ref: "User", required: true },
    action: { type: String, enum: Object.values(AUDIT_ACTIONS), required: true },
    resource: { type: String, required: true }, // e.g. 'Task', 'User', 'Project'
    resourceId: { type: mongoose.Schema.Types.ObjectId },
    description: { type: String },
    before: { type: mongoose.Schema.Types.Mixed },
    after: { type: mongoose.Schema.Types.Mixed },
    ip: { type: String },
    userAgent: { type: String },
    status: { type: String, enum: ["success", "failed"], default: "success" },
  },
  { timestamps: true }
);

auditLogSchema.index({ actor: 1 });
auditLogSchema.index({ resource: 1, resourceId: 1 });
auditLogSchema.index({ action: 1 });
auditLogSchema.index({ createdAt: -1 });
// TTL: auto-delete after 90 days
auditLogSchema.index({ createdAt: 1 }, { expireAfterSeconds: 90 * 24 * 60 * 60 });

module.exports = mongoose.model("AuditLog", auditLogSchema);
