const TASK_STATUS = {
  BACKLOG: "backlog",
  TODO: "todo",
  IN_PROGRESS: "in_progress",
  REVIEW: "review",
  TESTING: "testing",
  DONE: "done",
};

const TASK_PRIORITY = {
  LOW: "low",
  MEDIUM: "medium",
  HIGH: "high",
  URGENT: "urgent",
};

const PROJECT_STATUS = {
  PLANNING: "planning",
  ACTIVE: "active",
  ON_HOLD: "on_hold",
  COMPLETED: "completed",
  CANCELLED: "cancelled",
};

const LEAVE_TYPE = {
  ANNUAL: "annual",
  SICK: "sick",
  CASUAL: "casual",
  UNPAID: "unpaid",
  MATERNITY: "maternity",
  PATERNITY: "paternity",
  COMPENSATORY: "compensatory",
};

const LEAVE_STATUS = {
  PENDING: "pending",
  APPROVED: "approved",
  REJECTED: "rejected",
  CANCELLED: "cancelled",
};

const NOTIFICATION_TYPE = {
  TASK_ASSIGNED: "task_assigned",
  TASK_UPDATED: "task_updated",
  TASK_COMMENTED: "task_commented",
  PROJECT_ASSIGNED: "project_assigned",
  LEAVE_REQUESTED: "leave_requested",
  LEAVE_APPROVED: "leave_approved",
  LEAVE_REJECTED: "leave_rejected",
  MESSAGE_RECEIVED: "message_received",
  MENTION: "mention",
  SYSTEM: "system",
};

const AUDIT_ACTIONS = {
  CREATE: "create",
  UPDATE: "update",
  DELETE: "delete",
  LOGIN: "login",
  LOGOUT: "logout",
  PASSWORD_CHANGE: "password_change",
  ROLE_CHANGE: "role_change",
  PERMISSION_CHANGE: "permission_change",
};

const ATTENDANCE_STATUS = {
  PRESENT: "present",
  ABSENT: "absent",
  HALF_DAY: "half_day",
  ON_LEAVE: "on_leave",
  HOLIDAY: "holiday",
  WEEKEND: "weekend",
};

module.exports = {
  TASK_STATUS,
  TASK_PRIORITY,
  PROJECT_STATUS,
  LEAVE_TYPE,
  LEAVE_STATUS,
  NOTIFICATION_TYPE,
  AUDIT_ACTIONS,
  ATTENDANCE_STATUS,
};
