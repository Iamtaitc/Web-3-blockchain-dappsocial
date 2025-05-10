import type { ReactNode } from "react"

export interface WalletOption {
  id: string
  name: string
  icon: ReactNode
  color: string
  checkInstalled: () => boolean
  getProvider: () => any
}

export interface WalletConnectionResult {
  success: boolean
  account?: string
  provider?: any
  error?: string
  showQR?: boolean
}


