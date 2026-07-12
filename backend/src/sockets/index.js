const { Server } = require("socket.io");
const { verifyAccessToken } = require("../config/jwt");
const User = require("../models/User");
const Message = require("../models/Message");
const Notification = require("../models/Notification");
const logger = require("../utils/logger");

// Track online users: { userId: socketId }
const onlineUsers = new Map();

const initSocket = (server) => {
  const io = new Server(server, {
    cors: {
      origin: process.env.CLIENT_URL || "http://localhost:5173",
      credentials: true,
    },
    pingTimeout: 60000,
  });

  // ─── Authentication Middleware ─────────────────────────────────────────────
  io.use(async (socket, next) => {
    try {
      const token = socket.handshake.auth.token || socket.handshake.headers.authorization?.replace("Bearer ", "");
      if (!token) return next(new Error("Authentication required"));

      const decoded = verifyAccessToken(token);
      const user = await User.findById(decoded.id).select("firstName lastName avatar role");
      if (!user || !user.isActive) return next(new Error("Unauthorized"));

      socket.user = user;
      next();
    } catch (err) {
      next(new Error("Invalid token"));
    }
  });

  io.on("connection", (socket) => {
    const userId = socket.user._id.toString();
    onlineUsers.set(userId, socket.id);

    logger.info(`Socket connected: ${socket.user.firstName} (${userId})`);

    // Broadcast online status
    io.emit("user:online", { userId, user: socket.user });
    socket.emit("users:online", Array.from(onlineUsers.keys()));

    // ─── Chat ─────────────────────────────────────────────────────────────────
    socket.on("chat:join", async (room) => {
      socket.join(room);
      logger.info(`${socket.user.firstName} joined room: ${room}`);

      // Send last 50 messages
      const messages = await Message.find({ room, isDeleted: false })
        .sort({ createdAt: -1 })
        .limit(50)
        .populate("sender", "firstName lastName avatar")
        .lean();

      socket.emit("chat:history", messages.reverse());
    });

    socket.on("chat:leave", (room) => {
      socket.leave(room);
    });

    socket.on("chat:message", async (data) => {
      const { room, content, type = "text", attachments = [], replyTo } = data;

      const message = await Message.create({
        room,
        sender: socket.user._id,
        content,
        type,
        attachments,
        replyTo,
      });

      const populated = await message.populate("sender", "firstName lastName avatar");

      io.to(room).emit("chat:message", populated);
    });

    socket.on("chat:typing", (data) => {
      socket.to(data.room).emit("chat:typing", {
        userId,
        userName: socket.user.firstName,
        isTyping: data.isTyping,
      });
    });

    socket.on("chat:read", async (data) => {
      await Message.updateMany(
        { room: data.room, "readBy.user": { $ne: socket.user._id } },
        { $push: { readBy: { user: socket.user._id, readAt: new Date() } } }
      );
      socket.to(data.room).emit("chat:read", { userId, room: data.room });
    });

    socket.on("chat:react", async (data) => {
      const { messageId, emoji, room } = data;
      const message = await Message.findById(messageId);
      if (!message) return;

      const reaction = message.reactions.find((r) => r.emoji === emoji);
      if (reaction) {
        const idx = reaction.users.indexOf(socket.user._id);
        if (idx === -1) reaction.users.push(socket.user._id);
        else reaction.users.splice(idx, 1);
      } else {
        message.reactions.push({ emoji, users: [socket.user._id] });
      }
      await message.save();
      io.to(room).emit("chat:reaction", { messageId, reactions: message.reactions });
    });

    // ─── Notifications ────────────────────────────────────────────────────────
    socket.on("notification:ack", async (notificationId) => {
      await Notification.findOneAndUpdate(
        { _id: notificationId, recipient: socket.user._id },
        { isRead: true, readAt: new Date() }
      );
    });

    // ─── Task Live Updates ────────────────────────────────────────────────────
    socket.on("task:join", (projectId) => {
      socket.join(`project:${projectId}`);
    });

    socket.on("task:updated", (data) => {
      socket.to(`project:${data.projectId}`).emit("task:updated", data);
    });

    // ─── Disconnect ───────────────────────────────────────────────────────────
    socket.on("disconnect", () => {
      onlineUsers.delete(userId);
      io.emit("user:offline", { userId });
      logger.info(`Socket disconnected: ${socket.user.firstName}`);
    });
  });

  // Export helper to push notifications from HTTP routes
  global.io = io;
  global.onlineUsers = onlineUsers;

  logger.info("✅ Socket.io initialized");
  return io;
};

/**
 * Send real-time notification to a user if they're online
 */
const sendNotification = async (recipientId, notification) => {
  const socketId = onlineUsers.get(recipientId.toString());
  if (socketId && global.io) {
    global.io.to(socketId).emit("notification:new", notification);
  }
};

module.exports = { initSocket, sendNotification, onlineUsers };
