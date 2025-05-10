const mongoose = require("mongoose");
require("dotenv").config();
const { initEventListeners } = require("../services/event.services");
const { initScheduledTasks } = require("../utils/scheduler.utils");
const { updateAllTrendingScores } = require("../services/analytics.services");
const { 
  User,
  Task,
  Notification,
  CheckIn,
  Comment,
  Post,
  NFTCache,
  CompletedTask,
  Follow,
  Like,
  SavePost,
  Collection,
  Report,
  RewardPoints,
 } = require("../models/index");
const connectDB = async () => {
  try {
    await mongoose.connect("mongodb://localhost:27017/deso_social", {
      useNewUrlParser: true,
      useUnifiedTopology: true,
    });
    // console.log("📌 Model đã đăng ký:", mongoose.modelNames());

    console.log("Connected to MongoDB database");

    // Khởi tạo blockchain event listeners
    if (process.env.ENABLE_BLOCKCHAIN_EVENTS === "true") {
      initEventListeners();
    }

    // Khởi tạo scheduled tasks
    if (process.env.ENABLE_SCHEDULED_TASKS === "true") {
      initScheduledTasks();

      // Cập nhật trending scores ngay khi khởi động
      updateAllTrendingScores();
    }
    // console.log("Danh sách collection hiện có:", await mongoose.connection.db.listCollections().toArray());

  } catch (error) {
    console.error("MongoDB connection error:", error);
    process.exit(1);
  }
};

module.exports = connectDB;
