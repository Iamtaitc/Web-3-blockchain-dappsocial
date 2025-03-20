"use client"

import { useState, useEffect } from "react"
import { Card, CardContent, CardDescription, CardFooter, CardHeader, CardTitle } from "../UI/cardlogin"
import { Wallet, AlertCircle } from "lucide-react"
import { Button } from "../UI/buttonlogin"
import { LogOut } from "lucide-react"

import { WalletOptions } from "./wallet-options"
import { ConnectedWallet } from "./connected-wallet"
import { AuthenticationSection } from "./authentication-section"
import { WalletConnectQR } from "./wallet-connect-qr"
import { walletOptions } from "./wallet-config"
import { connectToWallet, disconnectWallet } from "./wallet-utils"

export default function WalletLogin() {
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
    <Card className="w-full">
      <CardHeader>
        <CardTitle className="flex items-center gap-2">
          <Wallet className="h-5 w-5" />
          {isAuthenticated ? "Ví đã kết nối" : "Kết nối ví"}
        </CardTitle>
        <CardDescription>
          {isAuthenticated
            ? "Bạn đã được xác thực với ví của mình"
            : account
              ? "Ký một tin nhắn để xác thực"
              : "Kết nối ví của bạn để truy cập ứng dụng"}
        </CardDescription>
      </CardHeader>
      <CardContent>
        {error && (
          <div className="mb-4 p-3 bg-red-100 border border-red-200 text-red-800 rounded-md flex items-center gap-2">
            <AlertCircle className="h-4 w-4" />
            <p className="text-sm">{error}</p>
          </div>
        )}

        {!account ? (
          showQRCode ? (
            // Hiển thị QR code cho WalletConnect với thiết kế mới
            <div className="flex justify-center">
              <WalletConnectQR onClose={() => setShowQRCode(false)} onConnect={handleWalletConnectSuccess} />
            </div>
          ) : (
            // Hiển thị các tùy chọn ví
            <WalletOptions
              walletOptions={walletOptions}
              onConnectWallet={handleConnectWallet}
              isConnecting={isConnecting}
            />
          )
        ) : (
          <>
            {/* Hiển thị thông tin ví đã kết nối */}
            <ConnectedWallet
              account={account}
              walletName={getConnectedWalletName()}
              isAuthenticated={isAuthenticated}
            />

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
            size="sm"
            onClick={handleDisconnect}
            className="text-red-500 hover:text-red-600 hover:bg-red-50 self-end"
          >
            <LogOut className="h-4 w-4 mr-2" />
            Ngắt kết nối
          </Button>
          <p className="text-xs text-muted-foreground text-center mt-2">
            Lưu ý: Để đăng xuất hoàn toàn khỏi ví, bạn cũng nên ngắt kết nối thủ công từ ứng dụng ví của mình.
          </p>
        </CardFooter>
      )}
    </Card>
  )
}

