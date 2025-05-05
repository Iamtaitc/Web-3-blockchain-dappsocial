import axios from "axios"

// Tạo instance axios với URL cơ sở
const instance = axios.create({
  baseURL: "http://localhost:3001/v1/",
  // baseURL: "https://455c-2402-800-620e-7d98-cdac-1b66-86db-a4f9.ngrok-free.app/v1/", // có thể bật lại khi cần
  headers: {
    "Content-Type": "application/json",
  },
})


export default instance
