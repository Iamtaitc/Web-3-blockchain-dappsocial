import { Wallet } from "lucide-react"
import { formatAddress } from "./wallet-utils"

interface ConnectedWalletProps {
  account: string
  walletName: string
  isAuthenticated: boolean
}

export function ConnectedWallet({ account, walletName, isAuthenticated }: ConnectedWalletProps) {
  return (
    <div className="flex items-center justify-between p-3 bg-secondary rounded-md">
      <div className="flex items-center gap-2">
        <div className="w-8 h-8 rounded-full bg-primary/10 flex items-center justify-center">
          <Wallet className="h-4 w-4 text-primary" />
        </div>
        <div>
          <p className="text-sm text-gray-700 font-medium">{formatAddress(account)}</p>
          <p className="text-xs text-muted-foreground">{walletName} Wallet</p>
        </div>
      </div>
      {isAuthenticated && <div className="px-2 py-1 bg-green-100 text-green-800 text-xs rounded-full">
        authenticated</div>}
    </div>
  )
}

