import axios from "axios"

// Tạo instance axios với URL cơ sở
const instance = axios.create({
  // baseURL: "http://localhost:3001/v1/",
  baseURL: "https://f9ee-2402-800-620e-2d27-8450-83c5-9a9f-54a3.ngrok-free.app/v1/",
  headers: {
    "Content-Type": "application/json",
  },
})

export default instance