import instance from "./instance"
import type { AxiosResponse } from "axios"

// Types
export interface UserProfile {
  walletAddress: string
  username: string | null
  ensName: string | null
  bio: string | null
  avatarURI: string | null
  coverURI: string | null
  followerCount: number
  followingCount: number
  postCount: number
  points: number
  subscription: {
    level: number
    isActive: boolean
    expiration: string | null
  }
  isVerified: boolean
  isFollowing: boolean
  createdAt: string
}

export interface FollowUser {
  follower: string
  following: string
}

export interface UserListItem {
  isFollowedByCurrentUser: boolean
  walletAddress: string
  username: string
  avatarURI: string | null
  followedAt: string
}

export interface PaginatedResponse<T> {
  data: T[]
  pagination: {
    total: number
    page: number
    limit: number
    totalPages: number
  }
  message: string
}

export interface LeaderboardUser {
  walletAddress: string
  username: string
  avatarURI: string | null
  points: number
  followerCount: number
  postCount: number
  subscriptionLevel: number
}

// User API service
const userApi = {
  // Get user profile
  getUserProfile: async (address: string): Promise<UserProfile> => {
    try {
      const response: AxiosResponse<{ data: UserProfile }> = await instance.get(`/user/${address}`)
      return response.data.data
    } catch (error) {
      console.error("Error fetching user profile:", error)
      throw error
    }
  },

  // Update user profile
  updateProfile: async (data: FormData): Promise<UserProfile> => {
    try {
      const response: AxiosResponse<{ data: UserProfile }> = await instance.patch("/user/update", data, {
        headers: {
          "Content-Type": "multipart/form-data",
        },
      })
      return response.data.data
    } catch (error) {
      console.error("Error updating user profile:", error)
      throw error
    }
  },

  // Follow a user
  followUser: async (address: string): Promise<FollowUser> => {
    try {
      const response: AxiosResponse<{ data: FollowUser }> = await instance.post(`/user/follower/${address}`)
      return response.data.data
    } catch (error) {
      console.error("Error following user:", error)
      throw error
    }
  },

  // Unfollow a user
  unfollowUser: async (address: string): Promise<FollowUser> => {
    try {
      const response: AxiosResponse<{ data: FollowUser }> = await instance.post(`/user/unfollower/${address}`)
      return response.data.data
    } catch (error) {
      console.error("Error unfollowing user:", error)
      throw error
    }
  },

  // Get user followers
  getUserFollowers: async (address: string, page = 1, limit = 20): Promise<PaginatedResponse<UserListItem>> => {
    try {
      const response: AxiosResponse<PaginatedResponse<UserListItem>> = await instance.get(
        `/user/followers/${address}?page=${page}&limit=${limit}`,
      )
      return response.data
    } catch (error) {
      console.error("Error fetching user followers:", error)
      throw error
    }
  },

  // Get user following
  getUserFollowing: async (address: string, page = 1, limit = 20): Promise<PaginatedResponse<UserListItem>> => {
    try {
      const response: AxiosResponse<PaginatedResponse<UserListItem>> = await instance.get(
        `/user/following/${address}?page=${page}&limit=${limit}`,
      )
      return response.data
    } catch (error) {
      console.error("Error fetching user following:", error)
      throw error
    }
  },

  // Get leaderboard
  getLeaderboard: async (page = 1, limit = 20): Promise<PaginatedResponse<LeaderboardUser>> => {
    try {
      const response: AxiosResponse<PaginatedResponse<LeaderboardUser>> = await instance.post(
        `/user/leaderboard?page=${page}&limit=${limit}`,
      )
      return response.data
    } catch (error) {
      console.error("Error fetching leaderboard:", error)
      throw error
    }
  },

  // Search users
  searchUsers: async (
    query: string,
    limit = 10,
    page = 1,
    sortBy = "followers",
  ): Promise<PaginatedResponse<UserProfile>> => {
    try {
      if (!query || query.length < 2) {
        throw new Error("Chuỗi tìm kiếm phải có ít nhất 2 ký tự")
      }

      const response: AxiosResponse<PaginatedResponse<UserProfile>> = await instance.get("/search/users", {
        params: {
          query,
          limit,
          page,
          sortBy,
        },
      })

      return response.data
    } catch (error: any) {
      console.error("Error searching users:", error.message)
      throw new Error(error.response?.data?.message || "Tìm kiếm người dùng thất bại")
    }
  },

  // Hàm giả lập để nâng cấp đăng ký (sẽ được triển khai trong ứng dụng thực tế)
  upgradeSubscription: async (address: string, level: number): Promise<{ success: boolean }> => {
    return new Promise((resolve) => {
      setTimeout(() => {
        resolve({ success: true })
      }, 1000)
    })
  },
}

export default userApi