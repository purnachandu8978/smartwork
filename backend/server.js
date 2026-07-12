require("dotenv").config();
require("express-async-errors");
const http = require("http");
const app = require("./src/app");
const connectDB = require("./src/config/database");
const { initSocket } = require("./src/sockets");
const logger = require("./src/utils/logger");

const PORT = process.env.PORT || 5000;

const startServer = async () => {
  try {
    await connectDB();
    const server = http.createServer(app);
    initSocket(server);

    server.listen(PORT, () => {
      logger.info(`🚀 SmartWork Hub API running on port ${PORT}`);
      logger.info(`📚 Swagger docs: http://localhost:${PORT}/api-docs`);
      logger.info(`🌍 Environment: ${process.env.NODE_ENV}`);
    });

    // Graceful shutdown
    const shutdown = (signal) => {
      logger.info(`${signal} received. Shutting down gracefully...`);
      server.close(() => {
        logger.info("HTTP server closed.");
        process.exit(0);
      });
    };

    process.on("SIGTERM", () => shutdown("SIGTERM"));
    process.on("SIGINT", () => shutdown("SIGINT"));
    process.on("unhandledRejection", (err) => {
      logger.error("UNHANDLED REJECTION:", err);
      shutdown("UNHANDLED REJECTION");
    });
  } catch (err) {
    logger.error("Failed to start server:", err);
    process.exit(1);
  }
};

startServer();
