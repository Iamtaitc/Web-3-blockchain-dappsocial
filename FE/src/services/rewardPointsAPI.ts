import instance from "./api";

// Định nghĩa interface cho response của checkIn
interface CheckInResponse {
  success: boolean;
  message: string;
  data: {
    streak: number;
    pointsEarned: number;
    tokensEarned: number;
    checkIn: {
      currentStreak: number;
      lastCheckIn?: Date;
      history: Array<{
        date: Date;
        streak: number;
        pointsEarned: number;
        tokensEarned: number;
      }>;
    };
  };
  timestamp: string;
}

// Định nghĩa interface cho response của getUserPoints
interface GetUserPointsResponse {
  success: boolean;
  message: string;
  data: {
    points: number;
    todayPoints: number;
    checkInStreak: number;
    lastCheckIn: Date | null;
    pendingTokens: number;
    claimedTokens: number;
    totalPoints: number;
  };
  timestamp: string;
}

// Định nghĩa interface cho response của claimTokens
interface ClaimTokensResponse {
  success: boolean;
  message: string;
  data: {
    amount: number;
    totalPending: number;
    subscriptionLevel: number;
    transactionHash?: string;
  };
  timestamp: string;
  error?: {
    nextClaimTime?: Date;
  };
}

// Định nghĩa interface cho response của getUserRewards
interface GetUserRewardsResponse {
  success: boolean;
  message: string;
  data: {
    pendingTokens: number;
    claimedTokens: number;
    totalPoints: number;
    checkIn: {
      currentStreak: number;
      lastCheckIn: Date | null;
      history: Array<{
        date: Date;
        streak: number;
        pointsEarned: number;
        tokensEarned: number;
      }>;
    };
    lastClaimTime?: Date;
    claimHistory: Array<{
      amount: number;
      timestamp: Date;
      transactionHash?: string;
    }>;
  };
  timestamp: string;
}

// Định nghĩa interface cho response của handleFirstLogin
interface FirstLoginResponse {
  success: boolean;
  message: string;
  isFirstLogin: boolean;
  data: {
    pendingTokens: number;
  };
  timestamp: string;
}

export const RewardPointsService = {
  // Check-in hàng ngày
  checkIn: async (): Promise<CheckInResponse> => {
    try {
      const response = await instance.post("/reward/check-in");
      console.log("checkIn response:", response.data);
      return response.data;
    } catch (error: any) {
      console.error("checkIn error:", error.message);
      throw error;
    }
  },

  // Lấy thông tin điểm thưởng người dùng
  getUserPoints: async (): Promise<GetUserPointsResponse> => {
    try {
      const response = await instance.get("/reward/points");
      console.log("getUserPoints response:", response.data);
      return response.data;
    } catch (error: any) {
      console.error("getUserPoints error:", error.message);
      throw error;
    }
  },

  // Claim tokens từ pending sang claimed
  claimTokens: async (): Promise<ClaimTokensResponse> => {
    try {
      const response = await instance.post("/reward/claim");
      console.log("claimTokens response:", response.data);
      return response.data;
    } catch (error: any) {
      console.error("claimTokens error:", error.message);
      throw error;
    }
  },

  // Lấy thông tin rewards của người dùng
  getUserRewards: async (): Promise<GetUserRewardsResponse> => {
    try {
      const response = await instance.get("/reward/info");
      console.log("getUserRewards response:", response.data);
      return response.data;
    } catch (error: any) {
      console.error("getUserRewards error:", error.message);
      throw error;
    }
  },

  // Xử lý đăng nhập lần đầu và rewards chào mừng
  handleFirstLogin: async (): Promise<FirstLoginResponse> => {
    try {
      const response = await instance.post("/reward/first-login");
      console.log("handleFirstLogin response:", response.data);
      return response.data;
    } catch (error: any) {
      console.error("handleFirstLogin error:", error.message);
      throw error;
    }
  },
};