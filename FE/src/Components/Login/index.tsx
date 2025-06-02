"use client"

import { useState, useEffect } from "react"
import { useNavigate } from "react-router-dom"
import { Card, CardContent, CardDescription, CardFooter, CardHeader, CardTitle } from "../UI/cardlogin"
import { Wallet, LogOut, AlertCircle, ArrowLeft } from "lucide-react"
import { Button } from "../UI/buttonlogin"
import { AuthenticationSection } from "./authentication-section"
import { WalletConnectQR } from "./wallet-connect-qr"
import { walletOptions } from "./wallet-config"
import { connectToWallet, disconnectWallet } from "./wallet-utils"

export default function WalletLogin() {
  const navigate = useNavigate()
  const [account, setAccount] = useState<string | null>(null)
  const [isConnecting, setIsConnecting] = useState(false)
  const [error, setError] = useState<string | null>(null)
  const [isAuthenticated, setIsAuthenticated] = useState(false)
  const [currentProvider, setCurrentProvider] = useState<any>(null)
  const [connectedWalletId, setConnectedWalletId] = useState<string | null>(null)
  const [showQRCode, setShowQRCode] = useState(false)

  // Kiểm tra xem ví đã được kết nối khi component được mount
  useEffect(() => {
    const checkConnection = async () => {
      if (typeof window !== "undefined" && window.ethereum) {
        try {
          const accounts = await window.ethereum.request({ method: "eth_accounts" })
          if (accounts.length > 0) {
            setAccount(accounts[0])
            setCurrentProvider(window.ethereum)

            // Cố gắng phát hiện ví nào đang được kết nối
            let detectedWalletId = "unknown"
            if (window.ethereum.isMetaMask) detectedWalletId = "metamask"
            else if (window.ethereum.isCoinbaseWallet) detectedWalletId = "coinbase"
            else if (window.ethereum.isWalletConnect) detectedWalletId = "walletconnect"
            else if (window.ethereum.isOkxWallet || window.ethereum.isOKExWallet || window.ethereum.isOKX)
              detectedWalletId = "okx"

            setConnectedWalletId(detectedWalletId)

            // Kiểm tra xem người dùng đã được xác thực trước đó chưa
            const authStatus = localStorage.getItem("web3auth")
            if (authStatus) {
              setIsAuthenticated(true)
            }
          }
        } catch (err) {
          console.error("Không thể lấy tài khoản", err)
        }
      }
    }

    checkConnection()
  }, [])

  // Lắng nghe sự thay đổi tài khoản
  useEffect(() => {
    if (currentProvider) {
      const handleAccountsChanged = (accounts: string[]) => {
        if (accounts.length === 0) {
          // Người dùng đã ngắt kết nối ví
          handleDisconnect()
        } else {
          setAccount(accounts[0])
          setIsAuthenticated(false)
        }
      }

      currentProvider.on("accountsChanged", handleAccountsChanged)

      return () => {
        currentProvider.removeListener("accountsChanged", handleAccountsChanged)
      }
    }
  }, [currentProvider])

  // Xử lý kết nối ví
  const handleConnectWallet = async (walletId: string) => {
    setIsConnecting(true)
    setError(null)
    setShowQRCode(false)

    try {
      // Đối với WalletConnect, hiển thị QR code
      if (walletId === "walletconnect") {
        setShowQRCode(true)
        setIsConnecting(false)
        return
      }

      // Đối với các ví khác, sử dụng hàm connectToWallet
      const result = await connectToWallet(walletId, walletOptions)

      if (result.success) {
        // Kết nối thành công
        setAccount(result.account)
        setCurrentProvider(result.provider)
        setConnectedWalletId(walletId)
      } else {
        // Hiển thị lỗi
        setError(result.error)
      }
    } catch (err: any) {
      console.error("Lỗi khi kết nối ví:", err)
      setError(err.message || "Không thể kết nối ví")
    } finally {
      setIsConnecting(false)
    }
  }

  // Xử lý kết nối thành công từ WalletConnect
  const handleWalletConnectSuccess = (account: string, provider: any) => {
    setAccount(account)
    setCurrentProvider(provider)
    setConnectedWalletId("walletconnect")
    setShowQRCode(false)
  }

  // Xử lý ngắt kết nối ví
  const handleDisconnect = async () => {
    try {
      setIsConnecting(true)

      await disconnectWallet(currentProvider, connectedWalletId)

      // Xóa trạng thái ứng dụng
      setAccount(null)
      setIsAuthenticated(false)
      setCurrentProvider(null)
      setConnectedWalletId(null)
      setShowQRCode(false)
      localStorage.removeItem("web3auth")

      // Làm mới UI để hiển thị lại các tùy chọn ví
      setTimeout(() => {
        setIsConnecting(false)
        setError(null)
      }, 50)
    } catch (err) {
      console.error("Lỗi khi ngắt kết nối:", err)
    }
  }

  // Lấy tên của ví đã kết nối
  const getConnectedWalletName = () => {
    if (!connectedWalletId) return ""
    const wallet = walletOptions.find((w) => w.id === connectedWalletId)
    return wallet ? wallet.name : ""
  }

  return (
    <div className="min-h-screen flex items-center justify-center bg-gradient-to-br from-blue-50 to-indigo-50 p-4">
      <div className="w-full max-w-md">
        <Button variant="ghost" className="mb-4 text-gray-600 hover:text-gray-900" onClick={() => navigate("/")}>
          <ArrowLeft className="mr-2 h-4 w-4" />
          Quay lại trang chủ
        </Button>

        <Card className="w-full shadow-lg border-0">
          <CardHeader className="pb-4">
            <CardTitle className="flex items-center gap-2 text-2xl">
              <Wallet className="h-6 w-6 text-blue-500" />
              {isAuthenticated ? "Ví đã kết nối" : "Kết nối ví"}
            </CardTitle>
            <CardDescription className="text-base">
              {isAuthenticated
                ? "Bạn đã được xác thực với ví của mình"
                : account
                  ? "Ký một tin nhắn để xác thực"
                  : "Kết nối ví của bạn để truy cập ứng dụng"}
            </CardDescription>
          </CardHeader>
          <CardContent className="space-y-4">
            {error && (
              <div className="mb-4 p-4 bg-red-50 border border-red-200 text-red-800 rounded-lg flex items-center gap-2">
                <AlertCircle className="h-5 w-5 flex-shrink-0" />
                <p className="text-sm">{error}</p>
              </div>
            )}

            {!account ? (
              showQRCode ? (
                // Hiển thị QR code cho WalletConnect
                <div className="flex justify-center">
                  <WalletConnectQR onClose={() => setShowQRCode(false)} onConnect={handleWalletConnectSuccess} />
                </div>
              ) : (
                // Hiển thị các tùy chọn ví với thiết kế mới
                <div className="space-y-3">
                  <h3 className="text-sm font-medium text-gray-500 mb-2">Chọn ví để kết nối:</h3>
                  {walletOptions.map((wallet) => (
                    <button
                      key={wallet.id}
                      disabled={isConnecting}
                      onClick={() => handleConnectWallet(wallet.id)}
                      className={`w-full flex items-center justify-between p-4 rounded-xl transition-colors ${
                        wallet.id === "metamask"
                          ? "bg-orange-500 hover:bg-orange-600 text-white"
                          : wallet.id === "walletconnect"
                            ? "bg-blue-500 hover:bg-blue-600 text-white"
                            : wallet.id === "coinbase"
                              ? "bg-blue-500 hover:bg-blue-600 text-white"
                              : "bg-gray-800 hover:bg-gray-900 text-white"
                      }`}
                    >
                      <div className="flex items-center gap-3">
                        {wallet.icon}
                        <span className="font-medium">{wallet.name}</span>
                      </div>
                      <ArrowLeft className="h-5 w-5 text-white rotate-180" />
                    </button>
                  ))}
                </div>
              )
            ) : (
              <>
                {/* Hiển thị thông tin ví đã kết nối với thiết kế mới */}
                <div className="flex items-center justify-between p-4 bg-blue-50 border border-blue-100 rounded-lg shadow-sm">
                  <div className="flex items-center gap-3">
                    <div className="w-10 h-10 rounded-full bg-blue-500 flex items-center justify-center">
                      <Wallet className="h-5 w-5 text-white" />
                    </div>
                    <div>
                      <p className="text-sm font-semibold text-gray-900">
                        {account.substring(0, 6)}...{account.substring(account.length - 4)}
                      </p>
                      <p className="text-xs text-gray-500">{getConnectedWalletName()} Wallet</p>
                    </div>
                  </div>
                  {isAuthenticated && (
                    <div className="px-3 py-1 bg-green-100 text-green-700 text-xs font-medium rounded-full">
                      Đã xác thực
                    </div>
                  )}
                </div>

                {/* Hiển thị phần xác thực nếu chưa xác thực */}
                {!isAuthenticated && (
                  <AuthenticationSection
                    account={account}
                    provider={currentProvider}
                    isConnecting={isConnecting}
                    onAuthenticated={() => setIsAuthenticated(true)}
                    onError={(msg) => setError(msg)}
                    onConnectingChange={(state) => setIsConnecting(state)}
                  />
                )}
              </>
            )}
          </CardContent>
          {account && (
            <CardFooter className="flex flex-col gap-2 border-t pt-4">
              <Button
                variant="outline"
                onClick={handleDisconnect}
                className="text-red-500 hover:text-red-600 hover:bg-red-50 w-full"
              >
                <LogOut className="h-4 w-4 mr-2" />
                Ngắt kết nối ví
              </Button>
              <p className="text-xs text-gray-500 text-center mt-2">
                Lưu ý: Để đăng xuất hoàn toàn khỏi ví, bạn cũng nên ngắt kết nối thủ công từ ứng dụng ví của mình.
              </p>
            </CardFooter>
          )}
        </Card>

        {!account && (
          <div className="mt-6 text-center">
            <p className="text-sm text-gray-600">Chưa có ví? Tìm hiểu thêm về các ví tiền điện tử</p>
            <div className="mt-2 flex justify-center gap-4">
              <a
                href="https://metamask.io/"
                target="_blank"
                rel="noopener noreferrer"
                className="text-xs text-blue-600 hover:underline"
              >
                MetaMask
              </a>
              <a
                href="https://www.coinbase.com/wallet"
                target="_blank"
                rel="noopener noreferrer"
                className="text-xs text-blue-600 hover:underline"
              >
                Coinbase Wallet
              </a>
              <a
                href="https://walletconnect.com/"
                target="_blank"
                rel="noopener noreferrer"
                className="text-xs text-blue-600 hover:underline"
              >
                WalletConnect
              </a>
            </div>
          </div>
        )}
      </div>
    </div>
  )
}
