"use client"

import { useCallback, useEffect } from "react"
import { useDispatch, useSelector } from "react-redux"
import { ethers } from "ethers"
import {
  setWallet,
  setProvider,
  connectWallet,
  loginWithSignature,
  logoutUser,
  logout,
  refreshToken as refreshTokenAction,
  setAuthData,
} from "../store/slices/authSlice"
import type { RootState, AppDispatch } from "../store"
import { connectToWallet, disconnectWallet } from "../components/Login/wallet-utils"
import { walletOptions } from "../components/Login/wallet-config"

export const useAuth = () => {
  const dispatch = useDispatch<AppDispatch>()
  const {
    isAuthenticated,
    isLoading,
    walletAddress,
    walletType,
    provider,
    user,
    error,
    token,
    refreshToken: refreshTokenValue,
  } = useSelector((state: RootState) => state.auth)

  // Kiểm tra trạng thái đăng nhập khi component mount
  useEffect(() => {
    const checkAuthStatus = async () => {
      // Kiểm tra nếu có token và refresh token trong localStorage
      const savedToken = localStorage.getItem("token")
      const savedRefreshToken = localStorage.getItem("refreshToken")
      const savedUser = localStorage.getItem("user")
      const savedWalletAddress = localStorage.getItem("walletAddress")
      const savedWalletType = localStorage.getItem("walletType")

      if (savedToken && savedRefreshToken && savedUser && savedWalletAddress) {
        try {
          // Kiểm tra xem token có hết hạn không
          const isExpired = isTokenExpired(savedToken)

          if (isExpired && savedRefreshToken) {
            // Nếu token hết hạn, thử làm mới token
            await handleRefreshToken(savedRefreshToken)
          } else if (!isExpired) {
            // Nếu token còn hạn, khôi phục trạng thái đăng nhập
            dispatch(
              setAuthData({
                token: savedToken,
                refreshToken: savedRefreshToken,
                user: JSON.parse(savedUser),
              }),
            )
            dispatch(setWallet({ address: savedWalletAddress, type: savedWalletType || "Wallet" }))

            // Thử kết nối lại với ví nếu có thể
            if (window.ethereum) {
              try {
                const accounts = await window.ethereum.request({ method: "eth_accounts" })
                if (accounts.length > 0 && accounts[0].toLowerCase() === savedWalletAddress.toLowerCase()) {
                  dispatch(setProvider(window.ethereum))
                }
              } catch (err) {
                console.error("Không thể kết nối lại với ví:", err)
              }
            }
          }
        } catch (error) {
          console.error("Lỗi khi khôi phục trạng thái đăng nhập:", error)
          // Nếu có lỗi, xóa dữ liệu đăng nhập
          localStorage.removeItem("token")
          localStorage.removeItem("refreshToken")
          localStorage.removeItem("user")
          localStorage.removeItem("walletAddress")
          localStorage.removeItem("walletType")
        }
      }
    }

    checkAuthStatus()
  }, [dispatch])

  // Kiểm tra xem token có hết hạn không
  const isTokenExpired = (token: string): boolean => {
    try {
      const payload = JSON.parse(atob(token.split(".")[1]))
      const expiry = payload.exp * 1000 // Chuyển đổi thành milliseconds
      return Date.now() > expiry
    } catch (error) {
      return true // Nếu có lỗi khi parse token, coi như token đã hết hạn
    }
  }

  // Kết nối ví
  const handleConnectWallet = useCallback(
    async (walletId: string) => {
      try {
        // Kết nối với ví
        const result = await connectToWallet(walletId, walletOptions)

        if (result.success && result.account) {
          // Lưu thông tin ví vào Redux
          const walletName = walletOptions.find((w) => w.id === walletId)?.name || walletId
          dispatch(setWallet({ address: result.account, type: walletName }))
          dispatch(setProvider(result.provider))

          // Gọi API để lấy nonce
          await dispatch(connectWallet(result.account))

          return { success: true, account: result.account, provider: result.provider }
        } else {
          return { success: false, error: result.error || "Không thể kết nối ví" }
        }
      } catch (error: any) {
        return { success: false, error: error.message || "Lỗi kết nối ví" }
      }
    },
    [dispatch],
  )

  // Xác thực bằng chữ ký
  const handleAuthenticate = useCallback(async () => {
    if (!walletAddress || !provider) {
      return { success: false, error: "Chưa kết nối ví" }
    }

    try {
      // Lấy nonce từ API
      const nonceResult = await dispatch(connectWallet(walletAddress)).unwrap()

      // Tạo provider ethers
      const ethersProvider = new ethers.BrowserProvider(provider)
      const signer = await ethersProvider.getSigner()

      // Ký tin nhắn
      const signature = await signer.signMessage(nonceResult.message)

      // Gọi API đăng nhập với chữ ký (không cần nonce)
      const loginResult = await dispatch(loginWithSignature({ walletAddress, signature })).unwrap()

      return { success: true, data: loginResult }
    } catch (error: any) {
      // Kiểm tra lỗi từ chối ký
      if (
        error.code === "ACTION_REJECTED" || // Lỗi từ chối của ethers.js
        error.code === 4001 || // Lỗi từ chối của MetaMask
        error.message.includes("rejected") || // Kiểm tra thông báo lỗi có chứa "rejected"
        error.message.includes("user rejected") || // Kiểm tra thông báo lỗi có chứa "user rejected"
        error.message.includes("User denied") // Kiểm tra thông báo lỗi có chứa "User denied"
      ) {
        return {
          success: false,
          error: "Bạn đã từ chối ký tin nhắn. Vui lòng ký tin nhắn để đăng nhập.",
        }
      }

      return {
        success: false,
        error: error.message || "Lỗi xác thực",
      }
    }
  }, [dispatch, walletAddress, provider])

  // Làm mới token
  const handleRefreshToken = useCallback(
    async (tokenToRefresh = refreshTokenValue) => {
      if (!tokenToRefresh) {
        return { success: false, error: "Không có refresh token" }
      }

      try {
        // Gọi API để làm mới token
        const response = await fetch("http://localhost:3001/v1/refresh-token", {
          method: "POST",
          headers: {
            "Content-Type": "application/json",
          },
          body: JSON.stringify({ refreshToken: tokenToRefresh }),
        })

        const data = await response.json()

        if (data.success) {
          // Cập nhật token mới vào Redux store
          dispatch(
            refreshTokenAction({
              token: data.data.token,
              refreshToken: data.data.refreshToken,
            }),
          )
          return { success: true, data: data.data }
        } else {
          return { success: false, error: data.error || "Không thể làm mới token" }
        }
      } catch (error: any) {
        return { success: false, error: error.message || "Lỗi làm mới token" }
      }
    },
    [dispatch, refreshTokenValue],
  )

  // Đăng xuất
  const handleLogout = useCallback(async () => {
    try {
      // Ngắt kết nối ví
      if (provider) {
        await disconnectWallet(provider, walletType as string)
      }

      // Gọi API đăng xuất
      await dispatch(logoutUser())

      return { success: true }
    } catch (error: any) {
      // Nếu có lỗi khi gọi API, vẫn đăng xuất ở phía client
      dispatch(logout())

      return {
        success: false,
        error: error.message || "Lỗi đăng xuất",
      }
    }
  }, [dispatch, provider, walletType])

  return {
    isAuthenticated,
    isLoading,
    walletAddress,
    walletType,
    user,
    error,
    token,
    refreshTokenValue,
    connectWallet: handleConnectWallet,
    authenticate: handleAuthenticate,
    refreshToken: handleRefreshToken,
    logout: handleLogout,
  }
}
