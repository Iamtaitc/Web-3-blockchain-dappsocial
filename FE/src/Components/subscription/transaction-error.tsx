import { AlertCircle } from "lucide-react"
import { Alert, AlertTitle, AlertDescription } from "./premium-ui-components"

interface TransactionErrorProps {
  error: any
  className?: string
}

export default function TransactionError({ error, className = "" }: TransactionErrorProps) {
  // Parse error code and message
  const errorCode = error?.code || (error?.message?.includes("INSUFFICIENT_FUNDS") ? "INSUFFICIENT_FUNDS" : null)
  const errorMessage = getSimplifiedErrorMessage(errorCode, error?.message)

  return (
    <Alert variant="destructive" className={`mb-4 ${className}`}>
      <AlertCircle className="h-4 w-4" />
      <AlertTitle>Lỗi giao dịch</AlertTitle>
      <AlertDescription>{errorMessage}</AlertDescription>
    </Alert>
  )
}

function getSimplifiedErrorMessage(code: string | number | null, message?: string): string {
  // Default message if we can't determine a specific error
  const simplifiedMessage = "Đã xảy ra lỗi khi xử lý giao dịch"

  // Handle common error codes
  if (code) {
    switch (code) {
      case 4001:
        return "Bạn đã từ chối giao dịch"
      case -32000:
      case "INSUFFICIENT_FUNDS":
        return "Số dư ví không đủ để thực hiện giao dịch"
      case -32602:
        return "Tham số giao dịch không hợp lệ"
      case -32603:
        return "Lỗi nội bộ từ ví. Vui lòng kiểm tra số dư và thử lại."
      case "ACTION_REJECTED":
        return "Bạn đã từ chối ký giao dịch"
    }
  }

  // Try to extract a more specific message from the error message
  if (message) {
    if (message.includes("insufficient funds")) {
      return "Số dư ví không đủ để thực hiện giao dịch"
    } else if (message.includes("user rejected")) {
      return "Bạn đã từ chối giao dịch"
    } else if (message.includes("gas")) {
      return "Lỗi phí gas: Không đủ ETH để trả phí giao dịch"
    }
  }

  return simplifiedMessage
}
