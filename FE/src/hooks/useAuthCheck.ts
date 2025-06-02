// hooks/useAuthCheck.ts
"use client"

import { useEffect, useState } from "react"
import { useDispatch, useSelector } from "react-redux"
import { setAuthData } from "../store/slices/authSlice"
import type { RootState, AppDispatch } from "../store"

export const useAuthCheck = () => {
  const [isChecking, setIsChecking] = useState(true)
  const dispatch = useDispatch<AppDispatch>()
  const { isAuthenticated } = useSelector((state: RootState) => state.auth)

  useEffect(() => {
    const checkAuth = () => {
      try {
        const token = localStorage.getItem("token")
        const refreshToken = localStorage.getItem("refreshToken")
        const user = localStorage.getItem("user")

        if (token && refreshToken && user) {
          // Nếu có dữ liệu trong localStorage nhưng Redux store chưa được cập nhật
          if (!isAuthenticated) {
            dispatch(
              setAuthData({
                token,
                refreshToken,
                user: JSON.parse(user),
                balance: {
                  dx: ""
                }
              }),
            )
            console.log("Đã khôi phục trạng thái đăng nhập từ localStorage")
          }
        }
      } catch (error) {
        console.error("Lỗi khi kiểm tra xác thực:", error)
      } finally {
        setIsChecking(false)
      }
    }

    checkAuth()
  }, [dispatch, isAuthenticated])

  return { isChecking, isAuthenticated } // Thêm isAuthenticated vào return
}