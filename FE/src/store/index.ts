import { configureStore } from "@reduxjs/toolkit";
import authReducer from "./slices/authSlice";
import farmReducer from "./slices/farmSlice";
import gameReducer from "./slices/gameSlice";
import questReducer from "./slices/questSlice";
import dashboardReducer from "./slices/dashboardSlice";
import userReducer from "./slices/userSlice";
import notificationReducer from "./slices/notificationSlice";
import nftReducer from "./slices/nftSlice";
import subscriptionReducer from "./slices/subscriptionSlice";

// Middleware để đồng bộ localStorage với Redux
const localStorageMiddleware = (store) => (next) => (action) => {
  const result = next(action);

  const state = store.getState();

  if (
    action.type === "auth/setAuthData" ||
    action.type === "auth/loginWithSignature/fulfilled" ||
    action.type === "auth/refreshToken"
  ) {
    if (state.auth.token) {
      localStorage.setItem("token", state.auth.token);
    }

    if (state.auth.refreshToken) {
      localStorage.setItem("refreshToken", state.auth.refreshToken);
    }

    if (state.auth.user) {
      localStorage.setItem("user", JSON.stringify(state.auth.user));
    }

    if (state.auth.walletAddress) {
      localStorage.setItem("walletAddress", state.auth.walletAddress);
    }

    if (state.auth.walletType) {
      localStorage.setItem("walletType", state.auth.walletType);
    }

    if (state.auth.balance) {
      localStorage.setItem("balance", JSON.stringify(state.auth.balance));
    }

    console.log("LocalStorage đã được cập nhật từ Redux store");
  }

  if (action.type === "auth/logout" || action.type === "auth/logoutUser/fulfilled") {
    localStorage.removeItem("token");
    localStorage.removeItem("refreshToken");
    localStorage.removeItem("user");
    localStorage.removeItem("walletAddress");
    localStorage.removeItem("walletType");
    localStorage.removeItem("balance");

    console.log("LocalStorage đã được xóa sau khi đăng xuất");
  }

  return result;
};

export const store = configureStore({
  reducer: {
    auth: authReducer,
    farm: farmReducer,
    game: gameReducer,
    quest: questReducer,
    dashboard: dashboardReducer,
    user: userReducer,
    notification: notificationReducer,
    nft: nftReducer,
    subscription: subscriptionReducer,
  },
  middleware: (getDefaultMiddleware) =>
    getDefaultMiddleware({
      serializableCheck: {
        ignoredActions: ["auth/setProvider"],
        ignoredPaths: ["auth.provider"],
      },
    }).concat(localStorageMiddleware),
});

export type RootState = ReturnType<typeof store.getState>;
export type AppDispatch = typeof store.dispatch;