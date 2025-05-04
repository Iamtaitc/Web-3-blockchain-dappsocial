import axios from "axios"

// Tạo instance axios với URL cơ sở
const instance = axios.create({
  // baseURL: "http://localhost:3001/v1/",
  baseURL: "https://455c-2402-800-620e-7d98-cdac-1b66-86db-a4f9.ngrok-free.app/v1/", // có thể bật lại khi cần
  headers: {
    "Content-Type": "application/json",
  },
})

// // Thêm interceptor cho request để đính kèm token xác thực
// instance.interceptors.request.use(
//   (config) => {
//     const token = localStorage.getItem("token")
//     if (token) {
//       config.headers.Authorization = `Bearer ${token}`
//     }
//     return config
//   },
//   (error) => {
//     return Promise.reject(error)
//   },
// )

// // Thêm interceptor cho response để xử lý lỗi
// instance.interceptors.response.use(
//   (response) => {
//     return response
//   },
//   (error) => {
//     // Xử lý lỗi 401 Unauthorized
//     if (error.response && error.response.status === 401) {
//       // Xóa dữ liệu trong local storage và chuyển hướng đến trang đăng nhập
//       localStorage.clear()
//       window.location.href = "/login"
//     }
//     return Promise.reject(error)
//   },
// )

export default instance
