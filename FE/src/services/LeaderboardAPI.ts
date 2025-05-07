
import instance from "./api";

// Định nghĩa interface cho response của getUserLeaderboard
interface UserLeaderboardResponse {
  success: boolean;
  message: string;
  data: {
    leaderboard: Array<{
      walletAddress: string;
      username: string;
      points: number;
      rank: number;
    }>;
    pagination: {
      total: number;
      page: number;
      limit: number;
      totalPages: number;
    };
    period: string;
    currentUserRank?: {
      rank: number;
      points: number;
    };
  };
  timestamp: string;
  error?: any;
}

// Định nghĩa interface cho response của getNFTLeaderboard
interface NFTLeaderboardResponse {
  success: boolean;
  message: string;
  data: {
    leaderboard: Array<{
      nftId: string;
      name: string;
      value: number;
      likes: number;
      views: number;
    }>;
    pagination: {
      total: number;
      page: number;
      limit: number;
      totalPages: number;
    };
    sortBy: string;
  };
  timestamp: string;
  error?: any;
}

// Định nghĩa interface cho response của getPostLeaderboard
interface PostLeaderboardResponse {
  success: boolean;
  message: string;
  data: {
    leaderboard: Array<{
      postId: string;
      author: string;
      likes: number;
      comments: number;
      interactions: number;
    }>;
    pagination: {
      total: number;
      page: number;
      limit: number;
      totalPages: number;
    };
    period: string;
  };
  timestamp: string;
  error?: any;
}

// Định nghĩa interface cho response của getTagLeaderboard
interface TagLeaderboardResponse {
  success: boolean;
  message: string;
  data: {
    leaderboard: Array<{
      tag: string;
      usageCount: number;
    }>;
    period: string;
  };
  timestamp: string;
  error?: any;
}

// Định nghĩa interface cho response của getCurrentUserRank
interface CurrentUserRankResponse {
  success: boolean;
  message: string;
  data: {
    rank: number;
    points: number;
  };
  timestamp: string;
  error?: any;
}

export const LeaderboardAPI = {
  // Lấy bảng xếp hạng người dùng
  getUserLeaderboard: async (
    page: number = 1,
    limit: number = 20,
    period: string = 'alltime'
  ): Promise<UserLeaderboardResponse> => {
    try {
      const response = await instance.get("/user/leader-board", {
        params: { page, limit, period },
      });
      console.log("getUserLeaderboard response:", response.data);
      return response.data;
    } catch (error: any) {
      console.error("getUserLeaderboard error:", error.message);
      throw error;
    }
  },

  // Lấy bảng xếp hạng NFT
  getNFTLeaderboard: async (
    page: number = 1,
    limit: number = 20,
    sortBy: string = 'value'
  ): Promise<NFTLeaderboardResponse> => {
    try {
      const response = await instance.get("/user/leader-board/nft", {
        params: { page, limit, sortBy },
      });
      console.log("getNFTLeaderboard response:", response.data);
      return response.data;
    } catch (error: any) {
      console.error("getNFTLeaderboard error:", error.message);
      throw error;
    }
  },

  // Lấy bảng xếp hạng bài đăng
  getPostLeaderboard: async (
    page: number = 1,
    limit: number = 20,
    period: string = 'weekly'
  ): Promise<PostLeaderboardResponse> => {
    try {
      const response = await instance.get("/user/leader-board/post", {
        params: { page, limit, period },
      });
      console.log("getPostLeaderboard response:", response.data);
      return response.data;
    } catch (error: any) {
      console.error("getPostLeaderboard error:", error.message);
      throw error;
    }
  },

  // Lấy bảng xếp hạng tags
  getTagLeaderboard: async (
    limit: number = 20,
    period: string = 'weekly'
  ): Promise<TagLeaderboardResponse> => {
    try {
      const response = await instance.get("/user/leader-board/tag", {
        params: { limit, period },
      });
      console.log("getTagLeaderboard response:", response.data);
      return response.data;
    } catch (error: any) {
      console.error("getTagLeaderboard error:", error.message);
      throw error;
    }
  },

  // Lấy thứ hạng của người dùng hiện tại
  getCurrentUserRank: async (): Promise<CurrentUserRankResponse> => {
    try {
      const response = await instance.get("/user/leader-board/rank");
      console.log("getCurrentUserRank response:", response.data);
      return response.data;
    } catch (error: any) {
      console.error("getCurrentUserRank error:", error.message);
      throw error;
    }
  },
};

export default LeaderboardAPI;
