import instance from "./instance"

import type { AxiosResponse } from "axios"

// Types
export interface UserProfile {
  walletAddress: string
  username: string
  ensName?: string
  bio?: string
  avatarURI: string | null
  coverURI: string | null
  followerCount: number
  followingCount: number
  postCount: number
  points: number
  subscription: {
    level: number
    isActive: boolean
    expiration: string
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
    const response: AxiosResponse<{ data: UserProfile }> = await instance.get(`/user/${address}`)
    return response.data.data
  },

  // Update user profile
  updateProfile: async (data: FormData): Promise<UserProfile> => {
    const response: AxiosResponse<{ data: UserProfile }> = await instance.patch("/user/update", data, {
      headers: {
        "Content-Type": "multipart/form-data",
      },
    })
    return response.data.data
  },

  // Follow a user
  followUser: async (address: string): Promise<FollowUser> => {
    const response: AxiosResponse<{ data: FollowUser }> = await instance.post(`/user/follower/${address}`)
    return response.data.data
  },

  // Unfollow a user
  unfollowUser: async (address: string): Promise<FollowUser> => {
    const response: AxiosResponse<{ data: FollowUser }> = await instance.post(`/user/unfollower/${address}`)
    return response.data.data
  },

  // Get user followers
  getUserFollowers: async (address: string, page = 1, limit = 20): Promise<PaginatedResponse<UserListItem>> => {
    const response: AxiosResponse<PaginatedResponse<UserListItem>> = await instance.get(
      `/user/followers/${address}?page=${page}&limit=${limit}`,
    )
    return response.data
  },

  // Get user following
  getUserFollowing: async (address: string, page = 1, limit = 20): Promise<PaginatedResponse<UserListItem>> => {
    const response: AxiosResponse<PaginatedResponse<UserListItem>> = await instance.get(
      `/user/following/${address}?page=${page}&limit=${limit}`,
    )
    return response.data
  },

  // Get leaderboard
  getLeaderboard: async (page = 1, limit = 20): Promise<PaginatedResponse<LeaderboardUser>> => {
    const response: AxiosResponse<PaginatedResponse<LeaderboardUser>> = await instance.post(
      `/user/leaderboard?page=${page}&limit=${limit}`,
    )
    return response.data
  },

  // Search users
  searchUsers: async (query: string): Promise<{ success: boolean; data: any[] }> => {
    // This is a mock implementation since the actual endpoint wasn't provided
    // You'll need to implement the actual API call when available
    return {
      success: true,
      data: [],
    }
  },
}

export default userApi
