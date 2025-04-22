// services/reward/index.js
const checkInService = require("./checkin.service");
const pointsService = require("./points.service");
const tokenService = require("./token.service");
const taskService = require("./task.service");

/**
 * Service tổng hợp xử lý các chức năng liên quan đến điểm thưởng và tokens
 */
class RewardPointsService {
  constructor() {
    // Đăng ký các phương thức từ check-in service
    this.checkIn = checkInService.checkIn.bind(checkInService);

    // Đăng ký các phương thức từ points service
    this.getUserPoints = pointsService.getUserPoints.bind(pointsService);
    this.getUserRewards = pointsService.getUserRewards.bind(pointsService);

    // Đăng ký các phương thức từ token service
    this.claimTokens = tokenService.claimTokens.bind(tokenService);
    this.handleFirstLogin = tokenService.handleFirstLogin.bind(tokenService);

    // Đăng ký các phương thức từ task service
    this.completeTask = taskService.completeTask.bind(taskService);
  }
}

module.exports = new RewardPointsService();
