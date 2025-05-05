import type { WalletOption } from "./types";
import okxicon from "../../assets/okx.png";

export const walletOptions: WalletOption[] = [
  {
    id: "metamask",
    name: "MetaMask",
    icon: (
      <svg width="24" height="24" viewBox="0 0 24 24" fill="none" xmlns="http://www.w3.org/2000/svg">
        <path d="M19.4 4.5L12.025 8.575L13.35 5.675L19.4 4.5Z" fill="#E17726" />
        <path d="M4.6 4.5L11.925 8.625L10.65 5.675L4.6 4.5Z" fill="#E27625" />
        <path d="M16.9 16.25L14.9 19.325L19.025 20.525L20.15 16.325L16.9 16.25Z" fill="#E27625" />
        <path d="M3.85 16.325L4.975 20.525L9.1 19.325L7.1 16.25L3.85 16.325Z" fill="#E27625" />
        <path d="M8.85 10.85L7.7 12.75L11.775 12.975L11.625 8.5L8.85 10.85Z" fill="#E27625" />
        <path d="M15.15 10.85L12.325 8.45L12.225 12.975L16.3 12.75L15.15 10.85Z" fill="#E27625" />
        <path d="M9.1 19.325L11.525 18L9.4 16.35L9.1 19.325Z" fill="#E27625" />
        <path d="M12.475 18L14.9 19.325L14.6 16.35L12.475 18Z" fill="#E27625" />
        <path d="M14.9 19.325L12.475 18L12.675 19.75L12.65 20.475L14.9 19.325Z" fill="#D5BFB2" />
        <path d="M9.1 19.325L11.35 20.475L11.325 19.75L11.525 18L9.1 19.325Z" fill="#D5BFB2" />
        <path d="M11.4 15.025L9.35 14.375L10.825 13.625L11.4 15.025Z" fill="#233447" />
        <path d="M12.6 15.025L13.175 13.625L14.65 14.375L12.6 15.025Z" fill="#233447" />
        <path d="M9.1 19.325L9.425 16.25L7.1 16.325L9.1 19.325Z" fill="#CC6228" />
        <path d="M14.575 16.25L14.9 19.325L16.9 16.325L14.575 16.25Z" fill="#CC6228" />
        <path d="M16.3 12.75L12.225 12.975L12.6 15.025L13.175 13.625L14.65 14.375L16.3 12.75Z" fill="#CC6228" />
        <path d="M9.35 14.375L10.825 13.625L11.4 15.025L11.775 12.975L7.7 12.75L9.35 14.375Z" fill="#CC6228" />
        <path d="M7.7 12.75L9.4 16.35L9.35 14.375L7.7 12.75Z" fill="#E27525" />
        <path d="M14.65 14.375L14.6 16.35L16.3 12.75L14.65 14.375Z" fill="#E27525" />
        <path d="M11.775 12.975L11.4 15.025L11.875 17.375L12 14.125L11.775 12.975Z" fill="#E27525" />
        <path d="M12.225 12.975L12 14.125L12.125 17.375L12.6 15.025L12.225 12.975Z" fill="#E27525" />
        <path d="M12.6 15.025L12.125 17.375L12.475 18L14.6 16.35L14.65 14.375L12.6 15.025Z" fill="#F5841F" />
        <path d="M9.35 14.375L9.4 16.35L11.525 18L11.875 17.375L11.4 15.025L9.35 14.375Z" fill="#F5841F" />
        <path
          d="M12.65 20.475L12.675 19.75L12.5 19.6H11.5L11.325 19.75L11.35 20.475L9.1 19.325L10 20.05L11.475 21H12.525L14 20.05L14.9 19.325L12.65 20.475Z"
          fill="#C0AC9D"
        />
        <path
          d="M12.475 18L12.125 17.375H11.875L11.525 18L11.325 19.75L11.5 19.6H12.5L12.675 19.75L12.475 18Z"
          fill="#161616"
        />
        <path
          d="M19.75 8.5L20.35 5.675L19.4 4.5L12.475 8.25L15.15 10.85L18.95 11.975L19.75 10.975L19.4 10.725L19.95 10.225L19.525 9.9L20.075 9.475L19.75 8.5Z"
          fill="#763E1A"
        />
        <path
          d="M3.65 5.675L4.25 8.5L3.9 9.475L4.45 9.9L4.025 10.225L4.575 10.725L4.225 10.975L5.025 11.975L8.825 10.85L11.5 8.25L4.575 4.5L3.65 5.675Z"
          fill="#763E1A"
        />
        <path d="M18.95 11.975L15.15 10.85L16.3 12.75L14.6 16.35L16.9 16.325H20.15L18.95 11.975Z" fill="#F5841F" />
        <path d="M8.825 10.85L5.025 11.975L3.85 16.325H7.1L9.4 16.35L7.7 12.75L8.825 10.85Z" fill="#F5841F" />
        <path
          d="M12.225 12.975L12.475 8.25L13.35 5.675H10.65L11.5 8.25L11.775 12.975L11.85 14.15L11.875 17.375H12.125L12.15 14.15L12.225 12.975Z"
          fill="#F5841F"
        />
      </svg>
    ),
    color: "bg-orange-100 text-orange-900 hover:bg-orange-200",
    checkInstalled: () => {
      return (
        typeof window !== "undefined" && typeof window.ethereum !== "undefined" && (window.ethereum.isMetaMask || false)
      )
    },
    getProvider: () => {
      if (typeof window !== "undefined" && window.ethereum && window.ethereum.isMetaMask) {
        return window.ethereum
      }
      // For older MetaMask versions or specific detection
      if (typeof window !== "undefined" && window.ethereum && window.ethereum.providers) {
        const provider = window.ethereum.providers.find((p: any) => p.isMetaMask)
        if (provider) return provider
      }
      return window.ethereum // Fallback
    },
  },
  {
    id: "walletconnect",
    name: "WalletConnect",
    icon: (
      <svg width="24" height="24" viewBox="0 0 24 24" fill="none" xmlns="http://www.w3.org/2000/svg">
        <path
          d="M7.09 11.119C10.05 8.159 14.95 8.159 17.91 11.119L18.28 11.489C18.42 11.629 18.42 11.859 18.28 11.999L17.22 13.059C17.15 13.129 17.04 13.129 16.97 13.059L16.46 12.549C14.32 10.409 10.68 10.409 8.54 12.549L7.99 13.099C7.92 13.169 7.81 13.169 7.74 13.099L6.68 12.039C6.54 11.899 6.54 11.669 6.68 11.529L7.09 11.119ZM20.59 13.799L21.53 14.739C21.67 14.879 21.67 15.109 21.53 15.249L16.76 20.019C16.62 20.159 16.39 20.159 16.25 20.019L12.95 16.719C12.92 16.689 12.86 16.689 12.83 16.719L9.53 20.019C9.39 20.159 9.16 20.159 9.02 20.019L4.24 15.239C4.1 15.099 4.1 14.869 4.24 14.729L5.18 13.789C5.32 13.649 5.55 13.649 5.69 13.789L9 17.089C9.03 17.119 9.09 17.119 9.12 17.089L12.42 13.789C12.56 13.649 12.79 13.649 12.93 13.789L16.24 17.099C16.27 17.129 16.33 17.129 16.36 17.099L19.66 13.799C19.81 13.659 20.04 13.659 20.18 13.799H20.59Z"
          fill="#3B99FC"
        />
      </svg>
    ),
    color: "bg-blue-100 text-blue-900 hover:bg-blue-200",
    checkInstalled: () => {
      return (
        typeof window !== "undefined" &&
        typeof window.ethereum !== "undefined" &&
        (window.ethereum.isWalletConnect || false)
      )
    },
    getProvider: () => {
      if (typeof window !== "undefined" && window.ethereum && window.ethereum.isWalletConnect) {
        return window.ethereum
      }
      if (typeof window !== "undefined" && window.ethereum && window.ethereum.providers) {
        const provider = window.ethereum.providers.find((p: any) => p.isWalletConnect)
        if (provider) return provider
      }
      return window.ethereum // Fallback
    },
  },
  {
    id: "coinbase",
    name: "Coinbase Wallet",
    icon: (
      <svg width="24" height="24" viewBox="0 0 24 24" fill="none" xmlns="http://www.w3.org/2000/svg">
        <path
          d="M12 2C6.48 2 2 6.48 2 12C2 17.52 6.48 22 12 22C17.52 22 22 17.52 22 12C22 6.48 17.52 2 12 2ZM12 20C7.59 20 4 16.41 4 12C4 7.59 7.59 4 12 4C16.41 4 20 7.59 20 12C20 16.41 16.41 20 12 20ZM11 7H13V9H11V7ZM16 10.25V12H15C15 13.66 13.66 15 12 15C10.34 15 9 13.66 9 12H8V10.25C8 10.11 8.11 10 8.25 10H9.75C9.89 10 10 10.11 10 10.25V11H14V10.25C14 10.11 14.11 10 14.25 10H15.75C15.89 10 16 10.11 16 10.25Z"
          fill="#0052FF"
        />
      </svg>
    ),
    color: "bg-blue-100 text-blue-900 hover:bg-blue-200",
    checkInstalled: () => {
      return (
        typeof window !== "undefined" &&
        typeof window.ethereum !== "undefined" &&
        (window.ethereum.isCoinbaseWallet || false)
      )
    },
    getProvider: () => {
      if (typeof window !== "undefined" && window.ethereum && window.ethereum.isCoinbaseWallet) {
        return window.ethereum
      }
      if (typeof window !== "undefined" && window.ethereum && window.ethereum.providers) {
        const provider = window.ethereum.providers.find((p: any) => p.isCoinbaseWallet)
        if (provider) return provider
      }
      return window.ethereum // Fallback
    },
  },
  {
    id: "okx",
    name: "OKX Wallet",
    icon: <img src={okxicon} alt="OKX" width={24} height={24}  />,
    color: "bg-gray-100 text-white hover:bg-gray-200",
    checkInstalled: () => {
      // More comprehensive check for OKX wallet
      return (
        typeof window !== "undefined" &&
        // Check for various possible identifiers
        ((typeof window.ethereum !== "undefined" &&
          (window.ethereum.isOkxWallet || window.ethereum.isOKExWallet || window.ethereum.isOKX)) ||
          // Check for okxwallet global object
          typeof window.okxwallet !== "undefined" ||
          // Check for okexchain global object (older versions)
          typeof window.okexchain !== "undefined")
      )
    },
    getProvider: () => {
      // Try to get the OKX provider in different ways
      if (typeof window !== "undefined") {
        // First check if okxwallet global object exists
        if (window.okxwallet) {
          return window.okxwallet
        }

        // Then check if okexchain global object exists (older versions)
        if (window.okexchain) {
          return window.okexchain
        }

        // Check if ethereum object has OKX identifiers
        if (window.ethereum) {
          if (window.ethereum.isOkxWallet || window.ethereum.isOKExWallet || window.ethereum.isOKX) {
            return window.ethereum
          }

          // Check providers array for OKX wallet
          if (window.ethereum.providers) {
            const provider = window.ethereum.providers.find((p: any) => p.isOkxWallet || p.isOKExWallet || p.isOKX)
            if (provider) return provider
          }
        }

        // Fallback to ethereum provider
        return window.ethereum
      }
      return null
    },
  },
]

