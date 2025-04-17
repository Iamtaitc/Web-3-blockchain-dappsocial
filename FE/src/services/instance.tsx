import axios from "axios"

// Tạo instance axios
const instance = axios.create({
  baseURL: "https://dfed-2a09-bac5-d5cb-16d2-00-246-bf.ngrok-free.app/v1/",
  headers: {
    "Content-Type": "application/json",
  },
})

// 👉 Gắn interceptor để tự động đính kèm token
instance.interceptors.request.use(
  (config) => {
    const token = localStorage.getItem("token") // Hoặc tên key bạn lưu token
    if (token) {
      config.headers.Authorization = `Bearer ${token}`
    }
    return config
  },
  (error) => Promise.reject(error)
)

export default instance
