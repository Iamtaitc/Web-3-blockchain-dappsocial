  "use client"

  import { Button } from "../UI/buttonlogin"
  import { ChevronRight } from "lucide-react"
  import { cn } from "../../lib/utils"
  import type { WalletOption } from "./types"

  interface WalletOptionsProps {
    walletOptions: WalletOption[]
    onConnectWallet: (walletId: string) => void
    isConnecting: boolean
  }

  export function WalletOptions({ walletOptions, onConnectWallet, isConnecting }: WalletOptionsProps) {
    return (
      <div className="space-y-2">
        {walletOptions.map((wallet) => (
          <Button
            key={wallet.id}
            variant="outline"
            className={cn("w-full justify-between h-12", wallet.color)}
            disabled={isConnecting}
            onClick={() => onConnectWallet(wallet.id)}
          >
            <div className="flex items-center gap-2">
              {wallet.icon}
              <span>{wallet.name}</span>
            </div>
            <ChevronRight className="h-4 w-4" />
          </Button>
        ))}
      </div>
    )
  }

