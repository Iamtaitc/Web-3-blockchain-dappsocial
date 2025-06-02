"use client"

import { useEffect } from "react"
import { useNavigate, useLocation } from "react-router-dom"
import { useLoginModal } from "./login-modal-provider"

interface UseLoginRedirectOptions {
  redirectTo?: string
  modalOnMobile?: boolean
  requireSignature?: boolean
  actionMessage?: string
}

export function useLoginRedirect(options: UseLoginRedirectOptions = {}) {
  const navigate = useNavigate()
  const location = useLocation()
  const { openLoginModal } = useLoginModal()
  const { redirectTo = "/login", modalOnMobile = true, requireSignature = true, actionMessage } = options

  useEffect(() => {
    // Kiểm tra xem người dùng đã đăng nhập chưa
    const isAuthenticated = localStorage.getItem("token") !== null

    if (!isAuthenticated) {
      // Nếu đang ở trang đăng nhập, không làm gì cả
      if (location.pathname === "/login") {
        return
      }

      // Kiểm tra xem có phải thiết bị di động không
      const isMobile = window.innerWidth < 768

      if (isMobile && modalOnMobile) {
        // Trên thiết bị di động, mở modal đăng nhập
        openLoginModal({
          requireSignature,
          actionMessage: actionMessage || "Vui lòng đăng nhập để tiếp tục",
          onSuccess: () => {
            // Sau khi đăng nhập thành công, không cần chuyển hướng vì người dùng vẫn ở trang hiện tại
          },
        })
      } else {
        // Trên desktop hoặc nếu modalOnMobile = false, chuyển hướng đến trang đăng nhập
        navigate(redirectTo, { state: { from: location.pathname } })
      }
    }
  }, [location.pathname, navigate, openLoginModal, redirectTo, modalOnMobile, requireSignature, actionMessage])
}
