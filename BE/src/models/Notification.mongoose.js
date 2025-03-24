const mongoose = require("mongoose");

const NotificationSchema = new mongoose.Schema({
  recipient: {
    type: String,
    required: true,
    lowercase: true,
    trim: true,
    index: true,
  },
  type: {
    type: String,
    enum: [
      "like",
      "comment",
      "follow",
      "mention",
      "purchase",
      "sale",
      "system",
    ],
    required: true,
  },
  sender: { type: String, lowercase: true, trim: true },
  content: { type: String, required: true },
  read: { type: Boolean, default: false },
  targetType: {
    type: String,
    enum: ["post", "comment", "user", "nft", null],
    default: null,
  },
  targetId: { type: String, default: null },
  createdAt: { type: Date, default: Date.now, index: true },
});

const Notification = mongoose.model("Notification", NotificationSchema);
module.exports = Notification;
