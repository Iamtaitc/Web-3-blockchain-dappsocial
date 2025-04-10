"use client"

import { useState, useEffect } from "react"
import { QRCodeSVG } from "qrcode.react"
import { X } from "lucide-react"
import EthereumProvider from "@walletconnect/ethereum-provider"

interface WalletConnectQRProps {
  onClose: () => void
  onConnect: (account: string, provider: any) => void
}

export function WalletConnectQR({ onClose, onConnect }: WalletConnectQRProps) {
  const [uri, setUri] = useState<string>("")
  const [isLoading, setIsLoading] = useState(true)
  const [error, setError] = useState<string | null>(null)
  const [provider, setProvider] = useState<any>(null)

  useEffect(() => {
    // Khởi tạo WalletConnect với projectId thực tế
    const initWalletConnect = async () => {
      try {
        setIsLoading(true)

        // Khởi tạo provider với projectId của bạn
        const wcProvider = await EthereumProvider.init({
          projectId: "54ab99e1e95fd6c6333bee419a9b94b9", // ProjectId bạn đã cung cấp
          chains: [1], // Ethereum mainnet
          optionalChains: [5, 56, 137], // Goerli, BSC, Polygon
          showQrModal: false, // Tắt modal mặc định vì chúng ta sẽ hiển thị QR code của riêng mình
          methods: ["eth_sendTransaction", "personal_sign", "eth_signTypedData"],
          events: ["chainChanged", "accountsChanged"],
        })

        // Lưu provider để sử dụng sau này
        setProvider(wcProvider)

        // Đăng ký sự kiện display_uri để lấy URI cho QR code
        wcProvider.on("display_uri", (uri: string) => {
          console.log("Đã nhận URI:", uri)
          setUri(uri)
          setIsLoading(false)
        })

        // Đăng ký sự kiện connect để xử lý khi kết nối thành công
        wcProvider.on("connect", () => {
          console.log("WalletConnect đã kết nối!")
          handleConnectionSuccess(wcProvider)
        })

        // Đăng ký sự kiện disconnect để xử lý khi ngắt kết nối
        wcProvider.on("disconnect", () => {
          console.log("WalletConnect đã ngắt kết nối")
          onClose()
        })

        // Bắt đầu kết nối - điều này sẽ kích hoạt sự kiện display_uri
        await wcProvider.connect()
      } catch (err: any) {
        console.error("Lỗi khi khởi tạo WalletConnect:", err)
        setError(err.message || "Không thể khởi tạo WalletConnect")
        setIsLoading(false)
      }
    }

    initWalletConnect()

    // Dọn dẹp khi component bị hủy
    return () => {
      if (provider) {
        provider.removeAllListeners()
        provider.disconnect().catch(console.error)
      }
    }
  }, [onClose])

  // Xử lý khi kết nối thành công
  const handleConnectionSuccess = async (wcProvider: any) => {
    try {
      // Lấy tài khoản đã kết nối
      const accounts = await wcProvider.request({ method: "eth_accounts" })

      if (accounts && accounts.length > 0) {
        // Gọi callback onConnect với tài khoản và provider
        onConnect(accounts[0], wcProvider)
      } else {
        setError("Không tìm thấy tài khoản sau khi kết nối")
      }
    } catch (err: any) {
      console.error("Lỗi khi lấy tài khoản:", err)
      setError(err.message || "Lỗi khi kết nối với ví")
    }
  }

  // Làm mới kết nối
  const handleRefresh = async () => {
    setIsLoading(true)
    setError(null)

    // Ngắt kết nối hiện tại nếu có
    if (provider) {
      await provider.disconnect().catch(console.error)
    }

    // Khởi tạo lại WalletConnect
    const initWalletConnect = async () => {
      try {
        // Khởi tạo provider với projectId của bạn
        const wcProvider = await EthereumProvider.init({
          projectId: "54ab99e1e95fd6c6333bee419a9b94b9",
          chains: [1],
          optionalChains: [5, 56, 137],
          showQrModal: false,
          methods: ["eth_sendTransaction", "personal_sign", "eth_signTypedData"],
          events: ["chainChanged", "accountsChanged"],
        })

        // Lưu provider để sử dụng sau này
        setProvider(wcProvider)

        // Đăng ký sự kiện display_uri để lấy URI cho QR code
        wcProvider.on("display_uri", (uri: string) => {
          console.log("Đã nhận URI mới:", uri)
          setUri(uri)
          setIsLoading(false)
        })

        // Đăng ký sự kiện connect để xử lý khi kết nối thành công
        wcProvider.on("connect", () => {
          console.log("WalletConnect đã kết nối!")
          handleConnectionSuccess(wcProvider)
        })

        // Bắt đầu kết nối - điều này sẽ kích hoạt sự kiện display_uri
        await wcProvider.connect()
      } catch (err: any) {
        console.error("Lỗi khi làm mới WalletConnect:", err)
        setError(err.message || "Không thể làm mới kết nối")
        setIsLoading(false)
      }
    }

    initWalletConnect()
  }

  // Thêm CSS cho container chính để giống với thiết kế
  return (
    <div className="flex flex-col items-center bg-white p-6 rounded-xl shadow-sm">
      {/* Header với logo và nút đóng */}
      <div className="w-full flex items-center justify-between mb-6">
        <div className="flex items-center">
          <svg width="28" height="28" viewBox="0 0 28 28" fill="none" xmlns="http://www.w3.org/2000/svg">
            <path
              d="M7.09 11.119C10.05 8.159 14.95 8.159 17.91 11.119L18.28 11.489C18.42 11.629 18.42 11.859 18.28 11.999L17.22 13.059C17.15 13.129 17.04 13.129 16.97 13.059L16.46 12.549C14.32 10.409 10.68 10.409 8.54 12.549L7.99 13.099C7.92 13.169 7.81 13.169 7.74 13.099L6.68 12.039C6.54 11.899 6.54 11.669 6.68 11.529L7.09 11.119ZM20.59 13.799L21.53 14.739C21.67 14.879 21.67 15.109 21.53 15.249L16.76 20.019C16.62 20.159 16.39 20.159 16.25 20.019L12.95 16.719C12.92 16.689 12.86 16.689 12.83 16.719L9.53 20.019C9.39 20.159 9.16 20.159 9.02 20.019L4.24 15.239C4.1 15.099 4.1 14.869 4.24 14.729L5.18 13.789C5.32 13.649 5.55 13.649 5.69 13.789L9 17.089C9.03 17.119 9.09 17.119 9.12 17.089L12.42 13.789C12.56 13.649 12.79 13.649 12.93 13.789L16.24 17.099C16.27 17.129 16.33 17.129 16.36 17.099L19.66 13.799C19.81 13.659 20.04 13.659 20.18 13.799H20.59Z"
              fill="#3B99FC"
            />
          </svg>
          <span className="ml-2 font-medium text-gray-800">WalletConnect</span>
        </div>
        <button onClick={onClose} className="rounded-full p-1 hover:bg-gray-100" aria-label="Đóng">
          <X className="h-5 w-5 text-gray-600" />
        </button>
      </div>

      {/* Nội dung QR code */}
      {isLoading ? (
        <div className="flex flex-col items-center justify-center h-64 w-64">
          <div className="w-10 h-10 relative mb-4">
            <div className="absolute inset-0 flex items-center justify-center">
              <div className="w-5 h-8 border-2 border-blue-500 border-t-0 border-b-0"></div>
            </div>
          </div>
          <p className="text-sm text-gray-500">Đang tạo mã QR...</p>
        </div>
      ) : error ? (
        <div className="flex flex-col items-center justify-center h-64 w-64">
          <p className="text-red-500">{error}</p>
          <button onClick={handleRefresh} className="mt-4 px-4 py-2 bg-primary text-white rounded-md">
            Thử lại
          </button>
        </div>
      ) : (
        <div className="flex flex-col items-center">
          <div className="border border-gray-200 p-4 rounded-lg bg-white">
            <QRCodeSVG value={uri} size={220} />
          </div>
          <p className="mt-4 text-sm text-center text-gray-600">Quét mã QR với ví tương thích WalletConnect</p>
          <div className="mt-4 flex justify-between w-full">
            <button
              className="text-sm text-blue-500 hover:underline"
              onClick={() => window.open("https://walletconnect.com/registry/wallets", "_blank")}
            >
              Không có ví?
            </button>
            <button className="text-sm text-blue-500 hover:underline" onClick={handleRefresh}>
              Làm mới
            </button>
          </div>
        </div>
      )}
    </div>
  )
}

