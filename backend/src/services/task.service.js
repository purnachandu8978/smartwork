const Task = require("../models/Task");
const Project = require("../models/Project");
const Notification = require("../models/Notification");
const { ApiError } = require("../utils/ApiError");
const { getPagination, paginatedResponse, getSort } = require("../utils/helpers");
const { NOTIFICATION_TYPE } = require("../constants/enums");

class TaskService {
  async getTasks({ projectId, assignee, status, priority, search, tags, page, limit, sortBy, sortOrder }) {
    const { skip } = getPagination({ page, limit });
    const sort = getSort(sortBy, sortOrder);

    const filter = { isArchived: false };
    if (projectId) filter.project = projectId;
    if (assignee) filter.assignee = assignee;
    if (status) filter.status = { $in: Array.isArray(status) ? status : [status] };
    if (priority) filter.priority = { $in: Array.isArray(priority) ? priority : [priority] };
    if (tags) filter.tags = { $in: Array.isArray(tags) ? tags : [tags] };
    if (search) filter.$text = { $search: search };

    const [tasks, total] = await Promise.all([
      Task.find(filter)
        .sort(sort)
        .skip(skip)
        .limit(limit)
        .populate("assignee", "firstName lastName avatar email")
        .populate("reporter", "firstName lastName avatar")
        .populate("project", "name status"),
      Task.countDocuments(filter),
    ]);

    return paginatedResponse(tasks, total, page, limit);
  }

  async getTaskById(id) {
    const task = await Task.findById(id)
      .populate("assignee", "firstName lastName avatar email")
      .populate("reporter", "firstName lastName avatar")
      .populate("project", "name status")
      .populate("dependencies", "title status priority")
      .populate("comments.author", "firstName lastName avatar")
      .populate("timeLogs.user", "firstName lastName")
      .populate("activity.actor", "firstName lastName avatar");

    if (!task) throw ApiError.notFound("Task not found");
    return task;
  }

  async createTask(data, creatorId) {
    const task = await Task.create({ ...data, reporter: creatorId, createdBy: creatorId });

    // Update project progress
    if (data.project) {
      await this._updateProjectProgress(data.project);
    }

    // Notify assignee
    if (data.assignee && data.assignee.toString() !== creatorId.toString()) {
      await Notification.create({
        recipient: data.assignee,
        sender: creatorId,
        type: NOTIFICATION_TYPE.TASK_ASSIGNED,
        title: "New Task Assigned",
        message: `You have been assigned: ${data.title}`,
        link: `/tasks/${task._id}`,
      });
    }

    return task;
  }

  async updateTask(id, updates, userId) {
    const task = await Task.findById(id);
    if (!task) throw ApiError.notFound("Task not found");

    const changedFields = [];
    const trackableFields = ["title", "status", "priority", "assignee", "dueDate", "description"];

    trackableFields.forEach((field) => {
      if (updates[field] !== undefined && String(updates[field]) !== String(task[field])) {
        changedFields.push({ field, oldValue: task[field], newValue: updates[field] });
      }
    });

    // Add activity entries
    changedFields.forEach(({ field, oldValue, newValue }) => {
      task.activity.push({ actor: userId, action: `changed ${field}`, field, oldValue, newValue });
    });

    Object.assign(task, updates);

    if (updates.status === "done" && !task.completedAt) {
      task.completedAt = new Date();
    }

    await task.save();

    if (task.project) {
      await this._updateProjectProgress(task.project);
    }

    return task;
  }

  async deleteTask(id) {
    const task = await Task.findByIdAndDelete(id);
    if (!task) throw ApiError.notFound("Task not found");
    if (task.project) await this._updateProjectProgress(task.project);
    return { message: "Task deleted successfully" };
  }

  async addComment(taskId, { content, attachments }, userId) {
    const task = await Task.findById(taskId);
    if (!task) throw ApiError.notFound("Task not found");

    task.comments.push({ author: userId, content, attachments });
    task.activity.push({ actor: userId, action: "added a comment" });
    await task.save();

    // Notify assignee
    if (task.assignee && task.assignee.toString() !== userId.toString()) {
      await Notification.create({
        recipient: task.assignee,
        sender: userId,
        type: NOTIFICATION_TYPE.TASK_COMMENTED,
        title: "New comment on your task",
        message: `Someone commented on: ${task.title}`,
        link: `/tasks/${taskId}`,
      });
    }

    return task.comments[task.comments.length - 1];
  }

  async logTime(taskId, { startTime, endTime, description }, userId) {
    const task = await Task.findById(taskId);
    if (!task) throw ApiError.notFound("Task not found");

    const duration = Math.round((new Date(endTime) - new Date(startTime)) / 60000); // minutes
    task.timeLogs.push({ user: userId, startTime, endTime, duration, description, date: new Date(startTime) });
    task.activity.push({ actor: userId, action: `logged ${duration} minutes` });
    await task.save();

    return task.timeLogs[task.timeLogs.length - 1];
  }

  async getKanbanBoard(projectId) {
    const filter = { isArchived: false };
    if (projectId) filter.project = projectId;

    const tasks = await Task.find(filter)
      .sort({ order: 1, createdAt: 1 })
      .populate("assignee", "firstName lastName avatar")
      .populate("project", "name");

    const columns = ["backlog", "todo", "in_progress", "review", "testing", "done"];
    const board = {};
    columns.forEach((col) => {
      board[col] = tasks.filter((t) => t.status === col);
    });

    return board;
  }

  async updateTaskOrder(taskId, status, order) {
    const task = await Task.findByIdAndUpdate(taskId, { status, order }, { new: true });
    if (!task) throw ApiError.notFound("Task not found");
    if (task.project) await this._updateProjectProgress(task.project);
    return task;
  }

  async _updateProjectProgress(projectId) {
    const tasks = await Task.find({ project: projectId, isArchived: false }).select("status");
    if (!tasks.length) return;
    const done = tasks.filter((t) => t.status === "done").length;
    const progress = Math.round((done / tasks.length) * 100);
    await Project.findByIdAndUpdate(projectId, { progress });
  }
}

module.exports = new TaskService();
