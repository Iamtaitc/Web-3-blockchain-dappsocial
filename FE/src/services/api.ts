import axios from "axios"
import { store } from "../store"
import { logout, refreshToken } from "../store/slices/authSlice"

// Tạo instance axios với URL cơ sở
const api = axios.create({
  baseURL: "http://localhost:3001/v1",
  headers: {
    "Content-Type": "application/json",
  },
})

// Interceptor cho request - thêm token vào header nếu có
api.interceptors.request.use(
  (config) => {
    // Lấy token từ localStorage thay vì Redux store
    const token = localStorage.getItem("token")

    if (token) {
      config.headers.Authorization = `Bearer ${token}`
    }

    // Log request để debug
    console.log("API Request:", {
      url: config.url,
      method: config.method,
      data: config.data,
      headers: config.headers,
    })

    return config
  },
  (error) => {
    return Promise.reject(error)
  },
)

// Interceptor cho response - xử lý lỗi và refresh token
api.interceptors.response.use(
  (response) => {
    // Log response để debug
    console.log("API Response:", {
      url: response.config.url,
      status: response.status,
      data: response.data,
    })

    return response
  },
  async (error) => {
    // Log error để debug
    console.error("API Error:", {
      url: error.config?.url,
      status: error.response?.status,
      data: error.response?.data,
      message: error.message,
    })

    // Nếu response có data và success là true, trả về response data
    if (error.response?.data?.success === true) {
      console.log("API trả về thành công mặc dù có lỗi HTTP:", error.response.data)
      return { data: error.response.data }
    }

    const originalRequest = error.config

    // Nếu lỗi 401 (Unauthorized) và chưa thử refresh token
    if (error.response?.status === 401 && !originalRequest._retry) {
      originalRequest._retry = true

      try {
        // Lấy refreshToken từ localStorage thay vì Redux store
        const refreshTokenValue = localStorage.getItem("refreshToken")

        if (!refreshTokenValue) {
          // Nếu không có refresh token, đăng xuất
          store.dispatch(logout())
          return Promise.reject(error)
        }

        // Gọi API refresh token
        const response = await axios.post("http://localhost:3001/v1/refresh-token", {
          refreshToken: refreshTokenValue,
        })

        if (response.data.success) {
          // Lưu token mới vào localStorage
          localStorage.setItem("token", response.data.data.token)
          localStorage.setItem("refreshToken", response.data.data.refreshToken)

          // Lưu token mới vào store
          store.dispatch(
            refreshToken({
              token: response.data.data.token,
              refreshToken: response.data.data.refreshToken,
            }),
          )

          // Cập nhật token trong header và thử lại request
          api.defaults.headers.common["Authorization"] = `Bearer ${response.data.data.token}`
          return api(originalRequest)
        } else {
          // Nếu refresh token thất bại, đăng xuất
          store.dispatch(logout())
        }
      } catch (refreshError) {
        // Nếu có lỗi khi refresh token, đăng xuất
        store.dispatch(logout())
        return Promise.reject(refreshError)
      }
    }

    return Promise.reject(error)
  },
)

// Các hàm gọi API
export const authAPI = {
  // Kết nối ví để lấy nonce
  connectWallet: async (walletAddress: string) => {
    try {
      // Đảm bảo địa chỉ ví được chuyển thành chữ thường
      const formattedAddress = walletAddress.toLowerCase()
      const response = await api.post("/connect-wallet", { walletAddress: formattedAddress })
      return response.data
    } catch (error: any) {
      // Kiểm tra nếu lỗi có chứa response data và success là true
      if (error.response?.data?.success === true) {
        return error.response.data
      }
      console.error("connectWallet error:", error.message)
      throw error
    }
  },

  // Đăng nhập với địa chỉ ví và chữ ký
  login: async (walletAddress: string, signature: string) => {
    try {
      // Đảm bảo địa chỉ ví được chuyển thành chữ thường
      const formattedAddress = walletAddress.toLowerCase()

      // Tạo payload chỉ với địa chỉ ví và chữ ký
      const payload = {
        walletAddress: formattedAddress,
        signature,
      }

      console.log("Gửi request đăng nhập với payload:", payload)
      const response = await api.post("/login", payload)
      console.log("Response đăng nhập đầy đủ:", response)

      // Kiểm tra dữ liệu trả về
      if (response.data.success && response.data.data) {
        const { token, refreshToken, user } = response.data.data
        if (!token || !refreshToken || !user) {
          console.error("API trả về thiếu dữ liệu:", response.data)
        }
      }

      return response.data
    } catch (error: any) {
      // Kiểm tra nếu lỗi có chứa response data và success là true
      if (error.response?.data?.success === true) {
        console.log("API trả về thành công trong lỗi:", error.response.data)
        return error.response.data
      }
      console.error("login error:", error.message)
      throw error
    }
  },

  // Đăng xuất
  logout: async (refreshToken: string) => {
    try {
      const response = await api.post("/logout", { refreshToken })

      // Xóa khỏi localStorage
      localStorage.removeItem("token")
      localStorage.removeItem("refreshToken")
      localStorage.removeItem("user")
      localStorage.removeItem("walletAddress")
      localStorage.removeItem("walletType")

      return response.data
    } catch (error: any) {
      // Xóa khỏi localStorage ngay cả khi có lỗi
      localStorage.removeItem("token")
      localStorage.removeItem("refreshToken")
      localStorage.removeItem("user")
      localStorage.removeItem("walletAddress")
      localStorage.removeItem("walletType")

      // Kiểm tra nếu lỗi có chứa response data và success là true
      if (error.response?.data?.success === true) {
        return error.response.data
      }
      console.error("logout error:", error.message)
      throw error
    }
  },

  // Làm mới token
  refreshToken: async (refreshToken: string) => {
    try {
      const response = await api.post("/refresh-token", { refreshToken })

      if (response.data.success) {
        // Lưu token mới vào localStorage
        localStorage.setItem("token", response.data.data.token)
        localStorage.setItem("refreshToken", response.data.data.refreshToken)
      }

      return response.data
    } catch (error: any) {
      // Kiểm tra nếu lỗi có chứa response data và success là true
      if (error.response?.data?.success === true) {
        return error.response.data
      }
      console.error("refreshToken error:", error.message)
      throw error
    }
  },
}

export default api
