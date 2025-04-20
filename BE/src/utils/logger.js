// utils/logger.js
const winston = require("winston");
const { createLogger, format, transports } = winston;
const path = require("path");
const fs = require("fs");
const DailyRotateFile = require("winston-daily-rotate-file");
const SlackHook = require("winston-slack-webhook-transport");
const TelegramBot = require("node-telegram-bot-api");
const dotenv = require('dotenv');
dotenv.config({ path: path.resolve(__dirname, '../../.env') });

// Đảm bảo thư mục logs tồn tại
const logsDir = path.join(process.cwd(), "logs");
if (!fs.existsSync(logsDir)) {
  fs.mkdirSync(logsDir);
}

// Cấu hình màu cho console
const colors = {
  error: "red",
  warn: "yellow",
  info: "green",
  http: "magenta",
  debug: "blue",
};

// Thêm màu cho winston
winston.addColors(colors);

// Telegram bot để gửi thông báo đến admin
let telegramBot = null;
let adminChatIds = [];

if (process.env.TELEGRAM_BOT_TOKEN) {
  telegramBot = new TelegramBot(process.env.TELEGRAM_BOT_TOKEN);

  // Danh sách chat ID của admins
  if (process.env.ADMIN_CHAT_IDS) {
    adminChatIds = process.env.ADMIN_CHAT_IDS.split(",");
  }
}

// Custom format cho console
const consoleFormat = format.combine(
  format.timestamp({ format: "YYYY-MM-DD HH:mm:ss" }),
  format.colorize({ all: true }),
  format.printf(
    (info) =>
      `${info.timestamp} ${info.level}: ${info.message} ${info.metadata ? JSON.stringify(info.metadata) : ""}`
  )
);

// Format cho file logs
const fileFormat = format.combine(
  format.timestamp({ format: "YYYY-MM-DD HH:mm:ss" }),
  format.json()
);

// Custom transport để gửi thông báo qua Telegram cho admin
class TelegramTransport extends winston.Transport {
  constructor(opts) {
    super(opts);
    this.name = "TelegramTransport";
    this.level = opts.level || "error";
  }

  log(info, callback) {
    const { level, message, metadata } = info;

    if (telegramBot && adminChatIds.length > 0) {
      const formattedMessage = `🚨 *${level.toUpperCase()}*\n📅 ${new Date().toISOString()}\n\n${message}\n\n${metadata ? `*Details:* \`\`\`${JSON.stringify(metadata, null, 2)}\`\`\`` : ""}`;

      adminChatIds.forEach((chatId) => {
        telegramBot
          .sendMessage(chatId, formattedMessage, { parse_mode: "Markdown" })
          .catch((err) =>
            console.error("Failed to send Telegram message:", err)
          );
      });
    }

    callback();
  }
}

// Tạo logger
const logger = createLogger({
  level: process.env.NODE_ENV === "production" ? "info" : "debug",
  defaultMeta: { service: process.env.SERVICE_NAME || "reward-service" },
  transports: [
    // Ghi log vào console
    new transports.Console({
      level: "debug",
      format: consoleFormat,
    }),

    // Ghi log thông thường vào file, tự động xoay hàng ngày
    new DailyRotateFile({
      dirname: logsDir,
      filename: "app-%DATE%.log",
      datePattern: "YYYY-MM-DD",
      maxSize: "20m",
      maxFiles: "14d",
      format: fileFormat,
      level: "info",
    }),

    // Ghi log lỗi vào file riêng
    new DailyRotateFile({
      dirname: logsDir,
      filename: "error-%DATE%.log",
      datePattern: "YYYY-MM-DD",
      maxSize: "20m",
      maxFiles: "30d",
      format: fileFormat,
      level: "error",
    }),
  ],
  // Bắt lỗi khi không thể ghi log
  exceptionHandlers: [
    new transports.Console({
      format: consoleFormat,
    }),
    new DailyRotateFile({
      dirname: logsDir,
      filename: "exceptions-%DATE%.log",
      datePattern: "YYYY-MM-DD",
      maxSize: "20m",
      maxFiles: "30d",
      format: fileFormat,
    }),
  ],
  // Bắt rejection từ Promise không được xử lý
  rejectionHandlers: [
    new transports.Console({
      format: consoleFormat,
    }),
    new DailyRotateFile({
      dirname: logsDir,
      filename: "rejections-%DATE%.log",
      datePattern: "YYYY-MM-DD",
      maxSize: "20m",
      maxFiles: "30d",
      format: fileFormat,
    }),
  ],
});

// Thêm transport Slack nếu có webhook URL
if (process.env.SLACK_WEBHOOK_URL) {
  logger.add(
    new SlackHook({
      webhookUrl: process.env.SLACK_WEBHOOK_URL,
      channel: process.env.SLACK_CHANNEL || "#alerts",
      username: process.env.SLACK_USERNAME || "RewardSystem-Bot",
      level: "error",
      formatter: (info) => ({
        text: `*${info.level.toUpperCase()}*: ${info.message}`,
        attachments: [
          {
            color:
              info.level === "error"
                ? "danger"
                : info.level === "warn"
                  ? "warning"
                  : "good",
            fields: [
              {
                title: "Service",
                value: info.defaultMeta?.service || "reward-service",
                short: true,
              },
              {
                title: "Environment",
                value: process.env.NODE_ENV || "development",
                short: true,
              },
              {
                title: "Time",
                value: new Date().toISOString(),
                short: true,
              },
            ],
            ...(info.metadata && {
              text: `\`\`\`${JSON.stringify(info.metadata, null, 2)}\`\`\``,
            }),
          },
        ],
      }),
    })
  );
}

// Thêm transport Telegram nếu có token
if (telegramBot && adminChatIds.length > 0) {
  logger.add(
    new TelegramTransport({
      level: "error",
    })
  );
}

// Thêm phương thức để ghi log transaction blockchain
logger.transaction = (txHash, from, to, amount, type) => {
  logger.info(`Blockchain transaction completed: ${type}`, {
    txHash,
    from,
    to,
    amount,
    type,
  });
};

// Thêm phương thức để ghi log hoạt động của admin
logger.adminAction = (adminId, action, details) => {
  logger.info(`Admin action: ${action}`, {
    adminId,
    action,
    details,
    timestamp: new Date(),
  });
};

// Thêm phương thức để ghi log sự kiện bảo mật
logger.security = (event, details) => {
  const level = details.severity || "warn";
  logger[level](`Security event: ${event}`, {
    ...details,
    timestamp: new Date(),
  });
};

// Thêm phương thức để ghi performance metrics
logger.performance = (operation, durationMs, details = {}) => {
  const level = durationMs > 1000 ? "warn" : "debug";
  logger[level](`Performance: ${operation} took ${durationMs}ms`, {
    operation,
    durationMs,
    ...details,
  });
};

// Middleware để ghi log HTTP requests cho Express
logger.httpLoggerMiddleware = (req, res, next) => {
  const start = Date.now();

  // Khi response hoàn tất, ghi log
  res.on("finish", () => {
    const duration = Date.now() - start;
    const logLevel = res.statusCode >= 400 ? "warn" : "http";
    const userId = req.user?.id || req.user?.walletAddress || "anonymous";

    logger[logLevel](`HTTP ${req.method} ${req.originalUrl}`, {
      method: req.method,
      url: req.originalUrl,
      statusCode: res.statusCode,
      responseTime: duration,
      ip: req.ip,
      userAgent: req.get("User-Agent"),
      userId,
    });

    // Ghi metrics cho requests chậm
    if (duration > 1000) {
      logger.performance(`HTTP ${req.method} ${req.originalUrl}`, duration, {
        statusCode: res.statusCode,
      });
    }
  });

  next();
};

// Trang admin dashboard cho logs
logger.setupAdminRoutes = (app) => {
  app.get("/admin/logs", (req, res) => {
    // Kiểm tra quyền admin
    if (!req.user || !req.user.isAdmin) {
      return res.status(403).send("Access denied");
    }

    // Lấy danh sách log files
    const logFiles = fs
      .readdirSync(logsDir)
      .filter((file) => file.endsWith(".log"))
      .sort((a, b) => {
        return (
          fs.statSync(path.join(logsDir, b)).mtime.getTime() -
          fs.statSync(path.join(logsDir, a)).mtime.getTime()
        );
      });

    res.render("admin/logs", { logFiles });
  });

  // API để lấy nội dung file log
  app.get("/admin/logs/:filename", (req, res) => {
    // Kiểm tra quyền admin
    if (!req.user || !req.user.isAdmin) {
      return res.status(403).send("Access denied");
    }

    const filename = req.params.filename;
    const filePath = path.join(logsDir, filename);

    // Kiểm tra file tồn tại và là file log hợp lệ
    if (!fs.existsSync(filePath) || !filename.endsWith(".log")) {
      return res.status(404).send("Log file not found");
    }

    // Đọc nội dung file
    fs.readFile(filePath, "utf8", (err, data) => {
      if (err) {
        logger.error(`Error reading log file: ${filename}`, {
          error: err.message,
        });
        return res.status(500).send("Error reading log file");
      }

      // Phân tích logs thành JSON để hiển thị đẹp hơn
      try {
        const logs = data
          .split("\n")
          .filter((line) => line.trim())
          .map((line) => JSON.parse(line));

        if (req.query.format === "json") {
          res.json(logs);
        } else {
          res.render("admin/logviewer", { filename, logs });
        }
      } catch (e) {
        // Nếu không phân tích được JSON, trả về text thô
        res.setHeader("Content-Type", "text/plain");
        res.send(data);
      }
    });
  });
};

module.exports = logger;
