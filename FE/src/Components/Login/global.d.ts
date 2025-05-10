// Add TypeScript declarations for window.ethereum
declare global {
    interface Window {
      ethereum: any & {
        providers?: any[]
        isMetaMask?: boolean
        isWalletConnect?: boolean
        isCoinbaseWallet?: boolean
        isOkxWallet?: boolean
        isOKExWallet?: boolean
        isOKX?: boolean
      }
      okxwallet?: any
      okexchain?: any
    }
  }
  
  export {}
  
  