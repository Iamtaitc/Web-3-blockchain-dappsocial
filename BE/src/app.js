const express = require("express");
const cors = require("cors");
const helmet = require("helmet");
const compression = require("compression");
const fileUpload = require("express-fileupload");
const path = require("path");
const { globalLimit } = require("./middleware/rateLimit");
const ConnectDB = require("./configs/configs.mongoose");
const config = require("./configs/config.env");
// Create Express app
const app = express();

// Middleware
app.use(helmet());
app.use(cors(config.CORS_OPTIONS));
app.use(compression());
app.use(express.json({ limit: "10mb" }));
app.use(express.urlencoded({ extended: true, limit: "10mb" }));
app.use(
  fileUpload({
    limits: { fileSize: config.MAX_FILE_SIZE },
    useTempFiles: true,
    tempFileDir: "/tmp/",
    abortOnLimit: true,
  })
);
app.use(globalLimit);

// Routes
app.use("/api", require("./routers"));

// Serve static files
app.use("/static", express.static(path.join(__dirname, "public")));

// Root route
app.get("/", (req, res) => {
  res.json({
    name: "DeSo Social API",
    version: "1.0.0",
    status: "active",
  });
});

// Error handling middleware
app.use((err, req, res, next) => {
  console.error("Global error handler:", err);

  res.status(err.status || 500).json({
    error: err.message || "Internal Server Error",
    ...(process.env.NODE_ENV === "development" && { stack: err.stack }),
  });
});

// Connect to MongoDB
ConnectDB();


// Handle uncaught exceptions
process.on("uncaughtException", (err) => {
  console.error("Uncaught Exception:", err);
  process.exit(1);
});

// Handle unhandled promise rejections
process.on("unhandledRejection", (reason, promise) => {
  console.error("Unhandled Rejection at:", promise, "reason:", reason);
});

module.exports = app;
