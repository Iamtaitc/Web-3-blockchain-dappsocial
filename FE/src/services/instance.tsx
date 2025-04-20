// src/services/instance.ts
import axios from "axios";
import { store } from "../store";
import { logout, refreshToken } from "../store/slices/authSlice";

const instance = axios.create({
  baseURL: "https://ecdc-2402-800-620e-51e0-3961-c24d-4cbf-488b.ngrok-free.app/v1/",
  headers: {
    "Content-Type": "application/json",
    // Thêm header để bypass kiểm tra ngrok
    "ngrok-skip-browser-warning": "true",
  },
});

// Interceptor cho request
instance.interceptors.request.use(
  (config) => {
    const token = localStorage.getItem("token");
    if (token) {
      config.headers.Authorization = `Bearer ${token}`;
    }
    return config;
  },
  (error) => Promise.reject(error),
);

// Interceptor cho response
instance.interceptors.response.use(
  (response) => response,
  async (error) => {
    const originalRequest = error.config;

    if (error.response?.status === 401 && !originalRequest._retry) {
      originalRequest._retry = true;
      try {
        const refreshTokenValue = localStorage.getItem("refreshToken");
        if (!refreshTokenValue) {
          store.dispatch(logout());
          return Promise.reject(error);
        }

        const response = await instance.post("/refresh-token", {
          refreshToken: refreshTokenValue,
        });

        if (response.data.success) {
          localStorage.setItem("token", response.data.data.token);
          localStorage.setItem("refreshToken", response.data.data.refreshToken);

          store.dispatch(
            refreshToken({
              token: response.data.data.token,
              refreshToken: response.data.data.refreshToken,
            }),
          );

          originalRequest.headers.Authorization = `Bearer ${response.data.data.token}`;
          return instance(originalRequest);
        } else {
          store.dispatch(logout());
        }
      } catch (refreshError) {
        store.dispatch(logout());
        return Promise.reject(refreshError);
      }
    }

    return Promise.reject(error);
  },
);

export default instance;