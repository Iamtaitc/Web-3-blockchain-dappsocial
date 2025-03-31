"use client"

import { useState, useEffect } from "react"
import { X } from "lucide-react"
import { WalletOptions } from "./wallet-options"
import { walletOptions } from "./wallet-config"
import { connectToWallet } from "./wallet-utils"
import { WalletConnectQR } from "./wallet-connect-qr"   
import { AuthenticationSection } from "./authentication-section"
import { ConnectedWallet } from "./connected-wallet"

interface WalletLoginModalProps {
  isOpen: boolean
  onClose: () => void
  onSuccess?: (address: string, walletType: string, isAuthenticated: boolean) => void
  requireSignature?: boolean
  actionMessage?: string
}

export function WalletLoginModal({
  isOpen,
  onClose,
  onSuccess,
  requireSignature = false,
  actionMessage,
}: WalletLoginModalProps) {
  const [isClosing, setIsClosing] = useState(false)
  const [isConnecting, setIsConnecting] = useState(false)
  const [error, setError] = useState<string | null>(null)
  const [showQRCode, setShowQRCode] = useState(false)
  const [account, setAccount] = useState<string | null>(null)
  const [currentProvider, setCurrentProvider] = useState<any>(null)
  const [connectedWalletId, setConnectedWalletId] = useState<string | null>(null)
  const [isAuthenticated, setIsAuthenticated] = useState(false)
  const [step, setStep] = useState<"connect" | "authenticate">("connect")

  useEffect(() => {
    if (!isOpen) {
      setIsClosing(false)
      setError(null)
      setShowQRCode(false)

      // Nếu không yêu cầu chữ ký, reset state khi đóng modal
      if (!requireSignature) {
        setAccount(null)
        setCurrentProvider(null)
        setConnectedWalletId(null)
        setIsAuthenticated(false)
        setStep("connect")
      }
    }
  }, [isOpen, requireSignature])

  const handleClose = () => {
    setIsClosing(true)
    setTimeout(() => {
      onClose()
    }, 200)
  }

  // Xử lý kết nối ví
  const handleConnectWallet = async (walletId: string) => {
    setIsConnecting(true)
    setError(null)

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

        // Luôn chuyển sang bước xác thực, nhưng không hiển thị lỗi nếu người dùng từ chối
        setStep("authenticate")

        // Nếu không yêu cầu chữ ký bắt buộc, vẫn thông báo thành công
        // if (!requireSignature && onSuccess) {
        //   const walletName = getWalletNameById(walletId)
        //   onSuccess(result.account!, walletName, false)
        // }
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

    // Luôn chuyển sang bước xác thực, nhưng không hiển thị lỗi nếu người dùng từ chối
    setStep("authenticate")

    // Nếu không yêu cầu chữ ký bắt buộc, vẫn thông báo thành công
    if (!requireSignature && onSuccess) {
      onSuccess(account, "WalletConnect", false)
    }
  }
  
  // Xử lý xác thực thành công
  const handleAuthenticated = () => {
    setIsAuthenticated(true)

    if (onSuccess && account) {
      const walletName = getWalletNameById(connectedWalletId || "")
      onSuccess(account, walletName, true)
    }
  }

  // Lấy tên ví từ ID
  const getWalletNameById = (id: string) => {
    const wallet = walletOptions.find((w) => w.id === id)
    return wallet ? wallet.name : ""
  }

  if (!isOpen) return null

  return (
    <div className="fixed inset-0 !z-[9999] bg-black/50 backdrop-blur-sm flex items-center justify-center">
      <div
        className={`w-full max-w-md bg-white rounded-xl shadow-lg transition-all duration-200 
        ${isClosing ? "opacity-0 scale-95" : "opacity-100 scale-100"}`}
        onClick={(e) => e.stopPropagation()}
      >
        <div className="p-6">
          <div className="flex items-center justify-between mb-6">
            <div>
              <h2 className="text-xl font-bold text-gray-900">{step === "connect" ? "Kết nối ví" : "Xác thực ví"}</h2>
              <p className="text-sm text-gray-500 mt-1">
                {step === "connect"
                  ? actionMessage || "Kết nối ví của bạn để truy cập ứng dụng"
                  : "Vui lòng ký tin nhắn để xác thực ví của bạn"}
              </p>
            </div>
            <button onClick={handleClose} className="rounded-full p-1 hover:bg-gray-100 transition-colors">
              <X className="h-5 w-5 text-gray-500" />
            </button>
          </div>

          {error && (
            <div className="mb-4 p-3 bg-red-100 border border-red-200 text-red-800 rounded-md flex items-center gap-2">
              <p className="text-sm">{error}</p>
            </div>
          )}

          {step === "connect" ? (
            showQRCode ? (
              <div className="flex justify-center">
                <WalletConnectQR onClose={() => setShowQRCode(false)} onConnect={handleWalletConnectSuccess} />
              </div>
            ) : (
              <div className="space-y-3">
                <WalletOptions
                  walletOptions={walletOptions}
                  onConnectWallet={handleConnectWallet}
                  isConnecting={isConnecting}
                  simplified={true}
                />
              </div>
            )
          ) : (
            <div className="space-y-4">
              <ConnectedWallet
                account={account || ""}
                walletName={getWalletNameById(connectedWalletId || "")}
                isAuthenticated={isAuthenticated}
              />

              {!isAuthenticated && (
                <AuthenticationSection
                  account={account || ""}
                  provider={currentProvider}
                  isConnecting={isConnecting}
                  onAuthenticated={handleAuthenticated}
                  onError={(msg) => setError(msg)}
                  onConnectingChange={(state) => setIsConnecting(state)}
                />
              )}
            </div>
          )}
        </div>
      </div>
    </div>
  )
}

