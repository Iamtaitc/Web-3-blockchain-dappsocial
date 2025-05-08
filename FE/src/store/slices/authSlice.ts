import { createSlice, createAsyncThunk, type PayloadAction } from "@reduxjs/toolkit";
import { authAPI } from "../../services/api";

// Định nghĩa kiểu dữ liệu cho user
interface User {
  [x: string]: any;
  id: string;
  walletAddress: string;
  username: string;
  avatarURI?: string;
  isVerified: boolean;
}

// Định nghĩa kiểu dữ liệu cho state
interface AuthState {
  isAuthenticated: boolean;
  isLoading: boolean;
  token: string | null;
  refreshToken: string | null;
  user: User | null;
  walletAddress: string | null;
  walletType: string | null;
  provider: any;
  error: string | null;
  balance: { dx: string } | null; // Thêm trường balance
}
// Khởi tạo giá trị mặc định cho balance nếu chưa tồn tại
// Hàm khởi tạo giá trị mặc định cho balance
const initializeBalance = () => {
  const balance = localStorage.getItem("balance");
  if (!balance || balance === "undefined") {
    localStorage.setItem("balance", JSON.stringify({ dx: "0" }));
    return { dx: "0" };
  }
  try {
    return JSON.parse(balance);
  } catch (e) {
    localStorage.setItem("balance", JSON.stringify({ dx: "0" }));
    return { dx: "0" };
  }
};
// State ban đầu
const initialState: AuthState = {
  isAuthenticated: localStorage.getItem("token") ? true : false,
  isLoading: false,
  token: localStorage.getItem("token"),
  refreshToken: localStorage.getItem("refreshToken"),
  user: localStorage.getItem("user") ? JSON.parse(localStorage.getItem("user")!) : null,
  walletAddress: localStorage.getItem("walletAddress"),
  walletType: localStorage.getItem("walletType"),
  provider: null,
  error: null,
  balance: initializeBalance(),
};


// Async thunk để kết nối ví
export const connectWallet = createAsyncThunk(
  "auth/connectWallet",
  async (walletAddress: string, { rejectWithValue }) => {
    try {
      const response = await authAPI.connectWallet(walletAddress);
      if (response.success) {
        return response.data;
      } else {
        return rejectWithValue(response.error || "Không thể kết nối ví");
      }
    } catch (error: any) {
      return rejectWithValue(error.response?.data?.error || "Lỗi kết nối ví");
    }
  },
);

// Async thunk để đăng nhập (không cần nonce)
export const loginWithSignature = createAsyncThunk(
  "auth/loginWithSignature",
  async ({ walletAddress, signature }: { walletAddress: string; signature: string }, { rejectWithValue }) => {
    try {
      const response = await authAPI.login(walletAddress, signature);

      if (response.success) {
        localStorage.setItem("token", response.data.token);
        localStorage.setItem("refreshToken", response.data.refreshToken);
        localStorage.setItem("user", JSON.stringify(response.data.user));

        return response.data;
      } else {
        return rejectWithValue(response.error || "Đăng nhập thất bại");
      }
    } catch (error: any) {
      if (error.response?.data) {
        if (error.response.data.success) {
          localStorage.setItem("token", error.response.data.data.token);
          localStorage.setItem("refreshToken", error.response.data.data.refreshToken);
          localStorage.setItem("user", JSON.stringify(error.response.data.data.user));

          return error.response.data.data;
        }
        return rejectWithValue(error.response.data.error || "Lỗi đăng nhập");
      }
      return rejectWithValue(error.message || "Lỗi đăng nhập");
    }
  },
);

// Async thunk để đăng xuất
export const logoutUser = createAsyncThunk("auth/logoutUser", async (_, { getState, rejectWithValue }) => {
  try {
    const state = getState() as { auth: AuthState };
    const refreshToken = state.auth.refreshToken;

    if (refreshToken) {
      const response = await authAPI.logout(refreshToken);

      localStorage.removeItem("token");
      localStorage.removeItem("refreshToken");
      localStorage.removeItem("user");
      localStorage.removeItem("walletAddress");
      localStorage.removeItem("walletType");
      localStorage.removeItem("balance");

      return response.data;
    }

    localStorage.removeItem("token");
    localStorage.removeItem("refreshToken");
    localStorage.removeItem("user");
    localStorage.removeItem("walletAddress");
    localStorage.removeItem("walletType");
    localStorage.removeItem("balance");

    return { message: "Đã đăng xuất" };
  } catch (error: any) {
    localStorage.removeItem("token");
    localStorage.removeItem("refreshToken");
    localStorage.removeItem("user");
    localStorage.removeItem("walletAddress");
    localStorage.removeItem("walletType");
    localStorage.removeItem("balance");

    return rejectWithValue(error.response?.data?.error || "Lỗi đăng xuất");
  }
});

// Tạo slice
const authSlice = createSlice({
  name: "auth",
  initialState,
  reducers: {
    setWallet: (state, action: PayloadAction<{ address: string; type: string }>) => {
      state.walletAddress = action.payload.address;
      state.walletType = action.payload.type;
      localStorage.setItem("walletAddress", action.payload.address);
      localStorage.setItem("walletType", action.payload.type);
    },

    setProvider: (state, action: PayloadAction<any>) => {
      state.provider = action.payload;
    },

    refreshToken: (state, action: PayloadAction<{ token: string; refreshToken: string }>) => {
      state.token = action.payload.token;
      state.refreshToken = action.payload.refreshToken;
      state.isAuthenticated = true;
      localStorage.setItem("token", action.payload.token);
      localStorage.setItem("refreshToken", action.payload.refreshToken);

      console.log("Token đã được làm mới:", {
        token: state.token,
        refreshToken: state.refreshToken,
        isAuthenticated: state.isAuthenticated,
      });
    },

    setAuthData: (state, action: PayloadAction<{ token: string; refreshToken: string; user: User; balance: { dx: string } }>) => {
      console.log("setAuthData được gọi với payload:", action.payload);

      state.isAuthenticated = true;
      state.token = action.payload.token;
      state.refreshToken = action.payload.refreshToken;
      state.user = action.payload.user;
      state.balance = action.payload.balance;

      localStorage.setItem("token", action.payload.token);
      localStorage.setItem("refreshToken", action.payload.refreshToken);
      localStorage.setItem("user", JSON.stringify(action.payload.user));
      localStorage.setItem("balance", JSON.stringify(action.payload.balance));

      console.log("Redux state sau khi cập nhật trong setAuthData:", {
        isAuthenticated: state.isAuthenticated,
        token: state.token,
        refreshToken: state.refreshToken,
        user: state.user,
        balance: state.balance,
      });
    },

    logout: (state) => {
      state.isAuthenticated = false;
      state.token = null;
      state.refreshToken = null;
      state.user = null;
      state.walletAddress = null;
      state.walletType = null;
      state.provider = null;
      state.balance = null;

      localStorage.removeItem("token");
      localStorage.removeItem("refreshToken");
      localStorage.removeItem("user");
      localStorage.removeItem("walletAddress");
      localStorage.removeItem("walletType");
      localStorage.removeItem("balance");

      console.log("Đã đăng xuất, Redux state đã được reset");
    },

    clearError: (state) => {
      state.error = null;
    },
  },
  extraReducers: (builder) => {
    builder
      .addCase(connectWallet.pending, (state) => {
        state.isLoading = true;
        state.error = null;
      })
      .addCase(connectWallet.fulfilled, (state) => {
        state.isLoading = false;
      })
      .addCase(connectWallet.rejected, (state, action) => {
        state.isLoading = false;
        state.error = action.payload as string;
      })
      .addCase(loginWithSignature.pending, (state) => {
        state.isLoading = true;
        state.error = null;
      })
      .addCase(loginWithSignature.fulfilled, (state, action) => {
        console.log("loginWithSignature.fulfilled được gọi với payload:", action.payload);

        state.isLoading = false;
        state.isAuthenticated = true;
        state.token = action.payload.token;
        state.refreshToken = action.payload.refreshToken;
        state.user = action.payload.user;

        console.log("Redux state sau khi cập nhật trong loginWithSignature.fulfilled:", {
          isAuthenticated: state.isAuthenticated,
          token: state.token,
          refreshToken: state.refreshToken,
          user: state.user,
        });
      })
      .addCase(loginWithSignature.rejected, (state, action) => {
        state.isLoading = false;
        state.error = action.payload as string;
      })
      .addCase(logoutUser.pending, (state) => {
        state.isLoading = true;
      })
      .addCase(logoutUser.fulfilled, (state) => {
        state.isAuthenticated = false;
        state.token = null;
        state.refreshToken = null;
        state.user = null;
        state.balance = null;
        state.isLoading = false;
      })
      .addCase(logoutUser.rejected, (state, action) => {
        state.isLoading = false;
        state.error = action.payload as string;

        state.isAuthenticated = false;
        state.token = null;
        state.refreshToken = null;
        state.user = null;
        state.balance = null;
      });
  },
});

export const { setWallet, setProvider, refreshToken, setAuthData, logout, clearError } = authSlice.actions;

export default authSlice.reducer;