const mongoose = require("mongoose");
// Import các model
const User = require("./User.mongoose");
const Task = require("./Task.mongoose");
const Notification = require("./Notification.mongoose");
const Subscription = require("./Subscription.mongoose");
const Comment = require("./Comment.mongoose");
const Post = require("./Post.mongoose");
const NFTCache = require("./NFTCache.mongoose");
const CompletedTask = require("./CompletedTask.mongoose");
const Follow = require("./Follow.mongoose");
const Like = require("./Like.mongoose");
const SavePost = require("./SavePost.mongoose");
const Collection = require("./Collection.mongoose");
const Report = require("./Report.mongoose");
const RewardPoints = require("./RewardPoints.mongoose");

// Xuất tất cả model để sử dụng ở nơi khác
module.exports = {
  User,
  Task,
  Notification,
  Subscription,
  Comment,
  Post,
  NFTCache,
  CompletedTask,
  Follow,
  Like,
  SavePost,
  Report,
  Collection,
  RewardPoints,
};
