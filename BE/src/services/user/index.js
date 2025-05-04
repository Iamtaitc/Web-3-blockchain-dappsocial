// services/user/index.js
const profileService = require('./profile.services');
const followService = require('./follow.services');
const leaderboardService = require('./leaderboard.services');

/**
 * Tổng hợp các services cho User
 */
class UserServices {
  constructor() {
    // Đăng ký các phương thức từ profile service
    this.getUserProfile = profileService.getUserProfile.bind(profileService);
    this.updateProfile = profileService.updateProfile.bind(profileService);
    
    // Đăng ký các phương thức từ follow service
    this.followUser = followService.followUser.bind(followService);
    this.unfollowUser = followService.unfollowUser.bind(followService);
    this.getUserFollowers = followService.getUserFollowers.bind(followService);
    this.getUserFollowing = followService.getUserFollowing.bind(followService);
    
    // Đăng ký các phương thức từ leaderboard service
    this.getLeaderboard = leaderboardService.getLeaderboard.bind(leaderboardService);
  }
}

module.exports = new UserServices();