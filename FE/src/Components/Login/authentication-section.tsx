
import { ethers } from "ethers"
import { Button } from "../UI/buttonlogin"
import { Separator } from "../UI/separator"

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
  const authenticateUser = async () => {
    if (!account || !provider) return

    try {
      onConnectingChange(true)

      const ethersProvider = new ethers.BrowserProvider(provider)
      const signer = await ethersProvider.getSigner()

      // Tạo tin nhắn cho người dùng ký
      const message = `Chào mừng đến với Ứng dụng Web3!\n\nVui lòng ký tin nhắn này để xác thực.\n\nYêu cầu này sẽ không kích hoạt giao dịch blockchain hoặc tốn phí gas.\n\nĐịa chỉ ví: ${account}\nThời gian: ${Date.now()}`

      // Yêu cầu chữ ký từ người dùng
      const signature = await signer.signMessage(message)

      // Trong ứng dụng thực tế, bạn sẽ xác minh chữ ký này trên backend
      console.log("Chữ ký:", signature)

      // Cho mục đích demo, chúng ta chỉ đặt trạng thái đã xác thực
      onAuthenticated()
      localStorage.setItem("web3auth", "true")
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
        <Button onClick={authenticateUser} disabled={isConnecting} className="w-full">
          {isConnecting ? "Đang ký..." : "Ký tin nhắn"}
        </Button>
      </div>
    </>
  )
}

