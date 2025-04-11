import { createSlice, createAsyncThunk, type PayloadAction } from "@reduxjs/toolkit"
import { authAPI } from "../../services/api"

// Định nghĩa kiểu dữ liệu cho user
interface User {
  id: string
  walletAddress: string
  username: string
  avatarURI?: string
  isVerified: boolean
}

// Định nghĩa kiểu dữ liệu cho state
interface AuthState {
  isAuthenticated: boolean
  isLoading: boolean
  token: string | null
  refreshToken: string | null
  user: User | null
  walletAddress: string | null
  walletType: string | null
  provider: any
  error: string | null
}

// State ban đầu
const initialState: AuthState = {
  isAuthenticated: localStorage.getItem("token") ? true : false,
  isLoading: false,
  token: localStorage.getItem("token"),
  refreshToken: localStorage.getItem("refreshToken"),
  user: JSON.parse(localStorage.getItem("user") || "null"),
  walletAddress: localStorage.getItem("walletAddress"),
  walletType: localStorage.getItem("walletType"),
  provider: null,
  error: null,
}

// Async thunk để kết nối ví
export const connectWallet = createAsyncThunk(
  "auth/connectWallet",
  async (walletAddress: string, { rejectWithValue }) => {
    try {
      const response = await authAPI.connectWallet(walletAddress)
      if (response.success) {
        return response.data
      } else {
        return rejectWithValue(response.error || "Không thể kết nối ví")
      }
    } catch (error: any) {
      return rejectWithValue(error.response?.data?.error || "Lỗi kết nối ví")
    }
  },
)

// Async thunk để đăng nhập (không cần nonce)
export const loginWithSignature = createAsyncThunk(
  "auth/loginWithSignature",
  async ({ walletAddress, signature }: { walletAddress: string; signature: string }, { rejectWithValue }) => {
    try {
      const response = await authAPI.login(walletAddress, signature)

      // Kiểm tra kết quả trả về từ API
      if (response.success) {
        // Lưu vào localStorage
        localStorage.setItem("token", response.data.token)
        localStorage.setItem("refreshToken", response.data.refreshToken)
        localStorage.setItem("user", JSON.stringify(response.data.user))

        return response.data
      } else {
        return rejectWithValue(response.error || "Đăng nhập thất bại")
      }
    } catch (error: any) {
      // Kiểm tra nếu lỗi có chứa response data
      if (error.response?.data) {
        // Nếu API trả về thành công nhưng có lỗi trong quá trình xử lý
        if (error.response.data.success) {
          // Lưu vào localStorage
          localStorage.setItem("token", error.response.data.data.token)
          localStorage.setItem("refreshToken", error.response.data.data.refreshToken)
          localStorage.setItem("user", JSON.stringify(error.response.data.data.user))

          return error.response.data.data
        }
        return rejectWithValue(error.response.data.error || "Lỗi đăng nhập")
      }
      return rejectWithValue(error.message || "Lỗi đăng nhập")
    }
  },
)

// Async thunk để đăng xuất
export const logoutUser = createAsyncThunk("auth/logoutUser", async (_, { getState, rejectWithValue }) => {
  try {
    const state = getState() as { auth: AuthState }
    const refreshToken = state.auth.refreshToken

    if (refreshToken) {
      const response = await authAPI.logout(refreshToken)

      // Xóa khỏi localStorage
      localStorage.removeItem("token")
      localStorage.removeItem("refreshToken")
      localStorage.removeItem("user")
      localStorage.removeItem("walletAddress")
      localStorage.removeItem("walletType")

      return response.data
    }

    // Xóa khỏi localStorage ngay cả khi không có refreshToken
    localStorage.removeItem("token")
    localStorage.removeItem("refreshToken")
    localStorage.removeItem("user")
    localStorage.removeItem("walletAddress")
    localStorage.removeItem("walletType")

    return { message: "Đã đăng xuất" }
  } catch (error: any) {
    // Xóa khỏi localStorage ngay cả khi có lỗi
    localStorage.removeItem("token")
    localStorage.removeItem("refreshToken")
    localStorage.removeItem("user")
    localStorage.removeItem("walletAddress")
    localStorage.removeItem("walletType")

    return rejectWithValue(error.response?.data?.error || "Lỗi đăng xuất")
  }
})

// Tạo slice
const authSlice = createSlice({
  name: "auth",
  initialState,
  reducers: {
    // Đặt địa chỉ ví và loại ví
    setWallet: (state, action: PayloadAction<{ address: string; type: string }>) => {
      state.walletAddress = action.payload.address
      state.walletType = action.payload.type
      localStorage.setItem("walletAddress", action.payload.address)
      localStorage.setItem("walletType", action.payload.type)
    },

    // Đặt provider
    setProvider: (state, action: PayloadAction<any>) => {
      state.provider = action.payload
    },

    // Làm mới token
    refreshToken: (state, action: PayloadAction<{ token: string; refreshToken: string }>) => {
      state.token = action.payload.token
      state.refreshToken = action.payload.refreshToken
      state.isAuthenticated = true
      localStorage.setItem("token", action.payload.token)
      localStorage.setItem("refreshToken", action.payload.refreshToken)

      console.log("Token đã được làm mới:", {
        token: state.token,
        refreshToken: state.refreshToken,
        isAuthenticated: state.isAuthenticated,
      })
    },

    // Thêm action mới để đặt dữ liệu xác thực trực tiếp
    setAuthData: (state, action: PayloadAction<{ token: string; refreshToken: string; user: User }>) => {
      console.log("setAuthData được gọi với payload:", action.payload)

      state.isAuthenticated = true
      state.token = action.payload.token
      state.refreshToken = action.payload.refreshToken
      state.user = action.payload.user

      // Lưu vào localStorage
      localStorage.setItem("token", action.payload.token)
      localStorage.setItem("refreshToken", action.payload.refreshToken)
      localStorage.setItem("user", JSON.stringify(action.payload.user))

      console.log("Redux state sau khi cập nhật trong setAuthData:", {
        isAuthenticated: state.isAuthenticated,
        token: state.token,
        refreshToken: state.refreshToken,
        user: state.user,
      })
    },

    // Đăng xuất
    logout: (state) => {
      state.isAuthenticated = false
      state.token = null
      state.refreshToken = null
      state.user = null
      state.walletAddress = null
      state.walletType = null
      state.provider = null

      // Xóa khỏi localStorage
      localStorage.removeItem("token")
      localStorage.removeItem("refreshToken")
      localStorage.removeItem("user")
      localStorage.removeItem("walletAddress")
      localStorage.removeItem("walletType")

      console.log("Đã đăng xuất, Redux state đã được reset")
    },

    // Xóa lỗi
    clearError: (state) => {
      state.error = null
    },
  },
  extraReducers: (builder) => {
    // Xử lý kết nối ví
    builder
      .addCase(connectWallet.pending, (state) => {
        state.isLoading = true
        state.error = null
      })
      .addCase(connectWallet.fulfilled, (state) => {
        state.isLoading = false
      })
      .addCase(connectWallet.rejected, (state, action) => {
        state.isLoading = false
        state.error = action.payload as string
      })

    // Xử lý đăng nhập
    builder
      .addCase(loginWithSignature.pending, (state) => {
        state.isLoading = true
        state.error = null
      })
      .addCase(loginWithSignature.fulfilled, (state, action) => {
        console.log("loginWithSignature.fulfilled được gọi với payload:", action.payload)

        state.isLoading = false
        state.isAuthenticated = true
        state.token = action.payload.token
        state.refreshToken = action.payload.refreshToken
        state.user = action.payload.user

        console.log("Redux state sau khi cập nhật trong loginWithSignature.fulfilled:", {
          isAuthenticated: state.isAuthenticated,
          token: state.token,
          refreshToken: state.refreshToken,
          user: state.user,
        })
      })
      .addCase(loginWithSignature.rejected, (state, action) => {
        state.isLoading = false
        state.error = action.payload as string
      })

    // Xử lý đăng xuất
    builder
      .addCase(logoutUser.pending, (state) => {
        state.isLoading = true
      })
      .addCase(logoutUser.fulfilled, (state) => {
        state.isAuthenticated = false
        state.token = null
        state.refreshToken = null
        state.user = null
        state.isLoading = false
      })
      .addCase(logoutUser.rejected, (state, action) => {
        state.isLoading = false
        state.error = action.payload as string

        // Ngay cả khi có lỗi, vẫn đăng xuất
        state.isAuthenticated = false
        state.token = null
        state.refreshToken = null
        state.user = null
      })
  },
})

export const { setWallet, setProvider, refreshToken, setAuthData, logout, clearError } = authSlice.actions

export default authSlice.reducer
