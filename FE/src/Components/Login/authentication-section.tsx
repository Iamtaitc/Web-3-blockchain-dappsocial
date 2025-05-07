"use client"

import { ethers } from "ethers"
import { Button } from "../UI/buttonlogin"
import { Separator } from "../UI/separator"
import { useDispatch } from "react-redux"
import { setAuthData } from "../../store/slices/authSlice"
import type { AppDispatch } from "../../store"
import { authAPI } from "../../services/api"
import { store } from "../../store" // Import store trực tiếp

interface AuthenticationSectionProps {
  account: string
  provider: any
  isConnecting: boolean
  onAuthenticated: () => void
  onError: (message: string) => void
  onConnectingChange: (isConnecting: boolean) => void
}

export function AuthenticationSection({
  account,
  provider,
  isConnecting,
  onAuthenticated,
  onError,
  onConnectingChange,
}: AuthenticationSectionProps) {
  const dispatch = useDispatch<AppDispatch>() 
  const authenticateUser = async () => {
    if (!account || !provider) return

    try {
      onConnectingChange(true)

      // 1. Lấy nonce từ API
      console.log("Bước 1: Đang lấy nonce từ API cho địa chỉ:", account)
      const nonceResponse = await authAPI.connectWallet(account)
      console.log("Kết quả lấy nonce:", nonceResponse)

      if (!nonceResponse.success) {
        throw new Error(nonceResponse.error || "Không thể lấy nonce từ server")
      }

      // 2. Lấy message từ response
      const message = nonceResponse.data.message
      console.log("Bước 2: Tin nhắn cần ký:", message)

      // 3. Tạo provider ethers và lấy signer
      console.log("Bước 3: Đang lấy signer từ provider")
      const ethersProvider = new ethers.BrowserProvider(provider)
      const signer = await ethersProvider.getSigner()
      console.log("Signer address:", await signer.getAddress())

      // 4. Yêu cầu chữ ký từ người dùng
      console.log("Bước 4: Đang yêu cầu chữ ký từ người dùng")
      try {
        const signature = await signer.signMessage(message)
        console.log("Chữ ký nhận được:", signature)

        // 5. Gửi chữ ký và địa chỉ ví lên API để xác thực
        console.log("Bước 5: Đang gửi chữ ký lên API", {
          walletAddress: account,
          signature,
        })

        // Gọi API trực tiếp
        const loginResponse = await authAPI.login(account, signature)
        console.log("Kết quả đăng nhập trực tiếp:", loginResponse)
        console.log("Chi tiết response data:", JSON.stringify(loginResponse.data, null, 2))

        // Kiểm tra kết quả trả về từ API
        if (loginResponse.success && loginResponse.data) {
          console.log("Đăng nhập thành công, cập nhật Redux store")
          console.log("Token từ API:", loginResponse.data.token)
          console.log("RefreshToken từ API:", loginResponse.data.refreshToken)
          console.log("User từ API:", loginResponse.data.user)

          // Kiểm tra dữ liệu đầy đủ trước khi dispatch
          if (loginResponse.data.token && loginResponse.data.refreshToken && loginResponse.data.user) {
            // Lưu vào localStorage trước
            localStorage.setItem("token", loginResponse.data.token)
            localStorage.setItem("refreshToken", loginResponse.data.refreshToken)
            localStorage.setItem("user", JSON.stringify(loginResponse.data.user))

            // Lưu vào Redux store
            dispatch(
              setAuthData({
                token: loginResponse.data.token,
                refreshToken: loginResponse.data.refreshToken,
                user: loginResponse.data.user,
              }),
            )

            // Kiểm tra Redux store sau khi dispatch
            setTimeout(() => {
              const authState = store.getState().auth
              console.log("Redux store sau khi dispatch (từ store.getState()):", {
                isAuthenticated: authState.isAuthenticated,
                token: authState.token,
                refreshToken: authState.refreshToken,
                user: authState.user,
              })
            }, 100)

            // Gọi callback thành công
            onAuthenticated()
          } else {
            console.error("Dữ liệu không đầy đủ:", loginResponse.data)
            throw new Error("Dữ liệu xác thực không đầy đủ")
          }
        } else {
          // Nếu API trả về lỗi
          throw new Error(loginResponse.error || "Xác thực thất bại")
        }
      } catch (signError: any) {
        console.error("Lỗi khi ký tin nhắn hoặc đăng nhập:", signError)

        // Kiểm tra lỗi từ chối ký
        if (
          signError.code === "ACTION_REJECTED" || // Lỗi từ chối của ethers.js
          signError.code === 4001 || // Lỗi từ chối của MetaMask
          signError.message.includes("rejected") || // Kiểm tra thông báo lỗi có chứa "rejected"
          signError.message.includes("user rejected") || // Kiểm tra thông báo lỗi có chứa "user rejected"
          signError.message.includes("User denied") // Kiểm tra thông báo lỗi có chứa "User denied"
        ) {
          throw new Error("Bạn không ký tin nhắn")
        }
        // Kiểm tra nếu có response data và response data thành công
        else if (signError.response?.data?.success) {
          console.log("API trả về thành công nhưng có lỗi xử lý:", signError.response.data)

          // Lưu vào localStorage trước
          localStorage.setItem("token", signError.response.data.data.token)
          localStorage.setItem("refreshToken", signError.response.data.data.refreshToken)
          localStorage.setItem("user", JSON.stringify(signError.response.data.data.user))

          // Lưu dữ liệu trực tiếp vào Redux store
          dispatch(
            setAuthData({
              token: signError.response.data.data.token,
              refreshToken: signError.response.data.data.refreshToken,
              user: signError.response.data.data.user,
            }),
          )

          // Kiểm tra Redux store sau khi dispatch
          setTimeout(() => {
            const authState = store.getState().auth
            console.log("Redux store sau khi dispatch (từ store.getState() - lỗi xử lý):", {
              isAuthenticated: authState.isAuthenticated,
              token: authState.token,
              refreshToken: authState.refreshToken,
              user: authState.user,
            })
          }, 100)

          // Gọi callback thành công
          onAuthenticated()
          return
        } else {
          throw signError
        }
      }
    } catch (err: any) {
      console.error("Lỗi khi xác thực:", err)
      onError(err.message || "Không thể xác thực")
    } finally {
      onConnectingChange(false)
    }
  }

  return (
    <>
      <Separator className="my-4" />
      <div className="text-center ">
        <p className="text-sm text-muted-foreground mb-3">Vui lòng ký tin nhắn để xác thực ví của bạn</p>
        <Button onClick={authenticateUser} disabled={isConnecting} className="text-white w-full">
          {isConnecting ? "Đang ký..." : "Ký tin nhắn"}
        </Button>
      </div>
    </>
  )
}
