import { createSlice, createAsyncThunk, PayloadAction } from "@reduxjs/toolkit"
import userApi, { UserProfile, FollowUser } from "../../services/user.api"

interface UserState {
  profiles: Record<string, UserProfile> // Lưu trữ profile theo địa chỉ ví
  currentProfile: UserProfile | null
  loading: boolean
  error: string | null
}

const initialState: UserState = {
  profiles: {},
  currentProfile: null,
  loading: false,
  error: null
}

// Thunk để lấy thông tin profile người dùng
export const fetchUserProfile = createAsyncThunk(
  "user/fetchUserProfile",
  async (address: string, { rejectWithValue }) => {
    try {
      const profile = await userApi.getUserProfile(address)
      return profile
    } catch (error: any) {
      return rejectWithValue(error.message || "Không thể tải thông tin người dùng")
    }
  }
)

// Thunk để cập nhật profile người dùng
export const updateUserProfile = createAsyncThunk(
  "user/updateUserProfile",
  async (formData: FormData, { rejectWithValue }) => {
    try {
      const updatedProfile = await userApi.updateProfile(formData)
      return updatedProfile
    } catch (error: any) {
      return rejectWithValue(error.message || "Không thể cập nhật thông tin người dùng")
    }
  }
)

// Thunk để theo dõi người dùng
export const followUserThunk = createAsyncThunk(
  "user/followUser",
  async (address: string, { rejectWithValue }) => {
    try {
      const result = await userApi.followUser(address)
      return { address, result }
    } catch (error: any) {
      return rejectWithValue(error.message || "Không thể theo dõi người dùng")
    }
  }
)

// Thunk để hủy theo dõi người dùng
export const unfollowUserThunk = createAsyncThunk(
  "user/unfollowUser",
  async (address: string, { rejectWithValue }) => {
    try {
      const result = await userApi.unfollowUser(address)
      return { address, result }
    } catch (error: any) {
      return rejectWithValue(error.message || "Không thể hủy theo dõi người dùng")
    }
  }
)

const userSlice = createSlice({
  name: "user",
  initialState,
  reducers: {
    clearUserProfile: (state) => {
      state.currentProfile = null
      state.error = null
    },
    setCurrentProfile: (state, action: PayloadAction<UserProfile>) => {
      state.currentProfile = action.payload
      state.profiles[action.payload.walletAddress] = action.payload
    }
  },
  extraReducers: (builder) => {
    builder
      // Xử lý fetchUserProfile
      .addCase(fetchUserProfile.pending, (state) => {
        state.loading = true
        state.error = null
      })
      .addCase(fetchUserProfile.fulfilled, (state, action: PayloadAction<UserProfile>) => {
        state.loading = false
        state.currentProfile = action.payload
        // Lưu profile vào cache theo địa chỉ ví
        state.profiles[action.payload.walletAddress] = action.payload
      })
      .addCase(fetchUserProfile.rejected, (state, action) => {
        state.loading = false
        state.error = action.payload as string
      })
      
      // Xử lý updateUserProfile
      .addCase(updateUserProfile.pending, (state) => {
        state.loading = true
        state.error = null
      })
      .addCase(updateUserProfile.fulfilled, (state, action: PayloadAction<UserProfile>) => {
        state.loading = false
        state.currentProfile = action.payload
        // Cập nhật profile trong cache
        state.profiles[action.payload.walletAddress] = action.payload
        // Cập nhật trong localStorage nếu là người dùng hiện tại
        const userString = localStorage.getItem("user")
        if (userString) {
          try {
            const user = JSON.parse(userString)
            if (user.walletAddress === action.payload.walletAddress) {
              localStorage.setItem("user", JSON.stringify({
                ...user,
                username: action.payload.username,
                avatarURI: action.payload.avatarURI,
                subscription: action.payload.subscription
              }))
            }
          } catch (e) {
            console.error("Error updating user in localStorage:", e)
          }
        }
      })
      .addCase(updateUserProfile.rejected, (state, action) => {
        state.loading = false
        state.error = action.payload as string
      })
      
      // Xử lý follow user
      .addCase(followUserThunk.fulfilled, (state, action) => {
        const { address } = action.payload
        if (state.profiles[address]) {
          state.profiles[address].isFollowing = true
          state.profiles[address].followerCount += 1
        }
        if (state.currentProfile && state.currentProfile.walletAddress === address) {
          state.currentProfile.isFollowing = true
          state.currentProfile.followerCount += 1
        }
      })
      
      // Xử lý unfollow user
      .addCase(unfollowUserThunk.fulfilled, (state, action) => {
        const { address } = action.payload
        if (state.profiles[address]) {
          state.profiles[address].isFollowing = false
          state.profiles[address].followerCount = Math.max(0, state.profiles[address].followerCount - 1)
        }
        if (state.currentProfile && state.currentProfile.walletAddress === address) {
          state.currentProfile.isFollowing = false
          state.currentProfile.followerCount = Math.max(0, state.currentProfile.followerCount - 1)
        }
      })
  }
})

export const { clearUserProfile, setCurrentProfile } = userSlice.actions
export default userSlice.reducer