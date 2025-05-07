// src/services/instance.ts
import axios from "axios";


const instance = axios.create({
  baseURL: "https://6481-2a09-bac5-d5cf-16c8-00-245-df.ngrok-free.app/v1/",
  // baseURL: "http://localhost:3001/v1/",
  headers: {
    "Content-Type": "application/json",
    // Thêm header để bypass kiểm tra ngrok
    "ngrok-skip-browser-warning": "true",
  },
});



export default instance;