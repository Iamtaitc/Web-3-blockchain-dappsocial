import { configureStore } from "@reduxjs/toolkit"
import authReducer from "./slices/authSlice"
import farmReducer from "./slices/farmSlice"
import gameReducer from "./slices/gameSlice"
import questReducer from "./slices/questSlice"
import dashboardReducer from "./slices/dashboardSlice"
import notificationReducer from "./slices/notificationSlice"

// Middleware để đồng bộ localStorage với Redux
const localStorageMiddleware = (store) => (next) => (action) => {
  // Thực hiện action trước
  const result = next(action)

  // Sau khi action được xử lý, kiểm tra và cập nhật localStorage
  const state = store.getState()

  // Nếu action liên quan đến auth
  if (
    action.type === "auth/setAuthData" ||
    action.type === "auth/loginWithSignature/fulfilled" ||
    action.type === "auth/refreshToken"
  ) {
    if (state.auth.token) {
      localStorage.setItem("token", state.auth.token)
    }

    if (state.auth.refreshToken) {
      localStorage.setItem("refreshToken", state.auth.refreshToken)
    }

    if (state.auth.user) {
      localStorage.setItem("user", JSON.stringify(state.auth.user))
    }

    if (state.auth.walletAddress) {
      localStorage.setItem("walletAddress", state.auth.walletAddress)
    }

    if (state.auth.walletType) {
      localStorage.setItem("walletType", state.auth.walletType)
    }

    console.log("LocalStorage đã được cập nhật từ Redux store")
  }

  // Nếu action là logout
  if (action.type === "auth/logout" || action.type === "auth/logoutUser/fulfilled") {
    localStorage.removeItem("token")
    localStorage.removeItem("refreshToken")
    localStorage.removeItem("user")
    localStorage.removeItem("walletAddress")
    localStorage.removeItem("walletType")

    console.log("LocalStorage đã được xóa sau khi đăng xuất")
  }

  return result
}

export const store = configureStore({
  reducer: {
    auth: authReducer,
    farm: farmReducer,
    game: gameReducer,
    quest: questReducer,
    dashboard: dashboardReducer,
    notification: notificationReducer, // Thêm notificationReducer vào store
  },
  middleware: (getDefaultMiddleware) =>
    getDefaultMiddleware({
      serializableCheck: {
        // Bỏ qua các action không serializable
        ignoredActions: ["auth/setProvider"],
        // Bỏ qua các path trong state không serializable
        ignoredPaths: ["auth.provider"],
      },
    }).concat(localStorageMiddleware),
})

export type RootState = ReturnType<typeof store.getState>
export type AppDispatch = typeof store.dispatch