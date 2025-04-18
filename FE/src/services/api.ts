import instance from "./instance"
import { store } from "../store"
import { logout, refreshToken } from "../store/slices/authSlice"

// Interceptor cho request - thêm token vào header nếu có
instance.interceptors.request.use(
  (config) => {
    const token = localStorage.getItem("token")
    if (token) {
      config.headers.Authorization = `Bearer ${token}`
    }

    console.log("API Request:", {
      url: config.url,
      method: config.method,
      data: config.data,
      headers: config.headers,
    })

    return config
  },
  (error) => Promise.reject(error),
)

// Interceptor cho response - xử lý lỗi và refresh token nếu cần
instance.interceptors.response.use(
  (response) => {
    console.log("API Response:", {
      url: response.config.url,
      status: response.status,
      data: response.data,
    })
    return response
  },
  async (error) => {
    console.error("API Error:", {
      url: error.config?.url,
      status: error.response?.status,
      data: error.response?.data,
      message: error.message,
    })

    if (error.response?.data?.success === true) {
      console.log("API trả về thành công mặc dù có lỗi HTTP:", error.response.data)
      return { data: error.response.data }
    }

    const originalRequest = error.config

    if (error.response?.status === 401 && !originalRequest._retry) {
      originalRequest._retry = true
      try {
        const refreshTokenValue = localStorage.getItem("refreshToken")
        if (!refreshTokenValue) {
          store.dispatch(logout())
          return Promise.reject(error)
        }

        const response = await instance.post("refresh-token", {
          refreshToken: refreshTokenValue,
        })

        if (response.data.success) {
          localStorage.setItem("token", response.data.data.token)
          localStorage.setItem("refreshToken", response.data.data.refreshToken)

          store.dispatch(
            refreshToken({
              token: response.data.data.token,
              refreshToken: response.data.data.refreshToken,
            }),
          )

          instance.defaults.headers.common["Authorization"] = `Bearer ${response.data.data.token}`
          return instance(originalRequest)
        } else {
          store.dispatch(logout())
        }
      } catch (refreshError) {
        store.dispatch(logout())
        return Promise.reject(refreshError)
      }
    }

    return Promise.reject(error)
  },
)

// Các hàm gọi API
export const authAPI = {
  connectWallet: async (walletAddress: string) => {
    try {
      const formattedAddress = walletAddress.toLowerCase()
      const response = await instance.post("/connect-wallet", { walletAddress: formattedAddress })
      return response.data
    } catch (error: any) {
      if (error.response?.data?.success === true) {
        return error.response.data
      }
      console.error("connectWallet error:", error.message)
      throw error
    }
  },

  login: async (walletAddress: string, signature: string) => {
    try {
      const formattedAddress = walletAddress.toLowerCase()
      const payload = { walletAddress: formattedAddress, signature }

      console.log("Gửi request đăng nhập với payload:", payload)
      const response = await instance.post("/login", payload)
      console.log("Response đăng nhập đầy đủ:", response)

      if (response.data.success && response.data.data) {
        const { token, refreshToken, user } = response.data.data
        if (!token || !refreshToken || !user) {
          console.error("API trả về thiếu dữ liệu:", response.data)
        }
      }

      return response.data
    } catch (error: any) {
      if (error.response?.data?.success === true) {
        console.log("API trả về thành công trong lỗi:", error.response.data)
        return error.response.data
      }
      console.error("login error:", error.message)
      throw error
    }
  },

  logout: async (refreshToken: string) => {
    try {
      const response = await instance.post("/logout", { refreshToken })

      localStorage.removeItem("token")
      localStorage.removeItem("refreshToken")
      localStorage.removeItem("user")
      localStorage.removeItem("walletAddress")
      localStorage.removeItem("walletType")

      return response.data
    } catch (error: any) {
      localStorage.removeItem("token")
      localStorage.removeItem("refreshToken")
      localStorage.removeItem("user")
      localStorage.removeItem("walletAddress")
      localStorage.removeItem("walletType")

      if (error.response?.data?.success === true) {
        return error.response.data
      }
      console.error("logout error:", error.message)
      throw error
    }
  },

  refreshToken: async (refreshToken: string) => {
    try {
      const response = await instance.post("/refresh-token", { refreshToken })

      if (response.data.success) {
        localStorage.setItem("token", response.data.data.token)
        localStorage.setItem("refreshToken", response.data.data.refreshToken)
      }

      return response.data
    } catch (error: any) {
      if (error.response?.data?.success === true) {
        return error.response.data
      }
      console.error("refreshToken error:", error.message)
      throw error
    }
  },
}

export default instance
