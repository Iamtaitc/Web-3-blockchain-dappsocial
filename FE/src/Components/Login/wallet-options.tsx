  "use client"

  import { Button } from "../UI/buttonlogin"
  import { ChevronRight } from "lucide-react"
  import { cn } from "../../lib/utils"
  import type { WalletOption } from "./types"

  interface WalletOptionsProps {
    walletOptions: WalletOption[]
    onConnectWallet: (walletId: string) => void
    isConnecting: boolean
    simplified?: boolean
  }
  
  export function WalletOptions({
    walletOptions,
    onConnectWallet,
    isConnecting,
    simplified = false,
  }: WalletOptionsProps) {
    if (simplified) {
      return (
        <div className="space-y-3 inset-0 z-[50]">
          {walletOptions.map((wallet) => (
            <button
              key={wallet.id}
              disabled={isConnecting}
              onClick={() => onConnectWallet(wallet.id)}
              className={`w-full text-white flex items-center inset-0 z-[9999] justify-between p-4 rounded-xl transition-colors ${
                wallet.id === "metamask"
                  ? "bg-orange-400 hover:bg-orange-500"
                  : wallet.id === "walletconnect"
                    ? "bg-blue-400 hover:bg-blue-500"
                    : wallet.id === "coinbase"
                      ? "bg-blue-400 hover:bg-blue-500"
                      : "bg-gray-800 hover:bg-gray-900"
              }`}
            >
              <div className="flex items-center gap-3">
                {wallet.icon}
                <span className="font-medium">{wallet.name}</span>
              </div>
              <ChevronRight className="h-5 w-5 text-gray-400" />
            </button>
          ))}
        </div>
      )
    }
  
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
