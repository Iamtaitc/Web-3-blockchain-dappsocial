import { Wallet } from "lucide-react"
import { formatAddress } from "./wallet-utils"

interface ConnectedWalletProps {
  account: string
  walletName: string
  isAuthenticated: boolean
}

export function ConnectedWallet({ account, walletName, isAuthenticated }: ConnectedWalletProps) {
  return (
    <div className="flex items-center justify-between p-3 bg-white border border-gray-200 rounded-md shadow-sm">
  <div className="flex items-center gap-3">
    <div className="w-9 h-9 rounded-full bg-blue-100 flex items-center justify-center">
      <Wallet className="h-4 w-4 text-blue-500" />
    </div>
    <div>
      <p className="text-sm text-gray-900 font-semibold">{formatAddress(account)}</p>
      <p className="text-xs text-gray-500">{walletName} Wallet</p>
    </div>
  </div>
  {isAuthenticated && (
    <div className="px-2 py-1 bg-green-100 text-green-700 text-xs font-medium rounded-full">
      Authenticated
    </div>
  )}
</div>

  )
}

