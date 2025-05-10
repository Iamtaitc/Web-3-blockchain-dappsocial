import type { WalletOption } from "./types"

export function formatAddress(address: string): string {
  return `${address.substring(0, 6)}...${address.substring(address.length - 4)}`
}

export async function connectToWallet(walletId: string, walletOptions: WalletOption[]) {
  try {
    // Tìm ví được chọn
    const selectedWallet = walletOptions.find((wallet) => wallet.id === walletId)

    if (!selectedWallet) {
      return {
        success: false,
        error: "Lựa chọn ví không hợp lệ",
      }
    }

    // Kiểm tra xem ví cụ thể có được cài đặt không
    if (!selectedWallet.checkInstalled()) {
      return {
        success: false,
        error: `${selectedWallet.name} chưa được cài đặt. Vui lòng cài đặt trước.`,
      }
    }

    // Xử lý kết nối cho từng loại ví

    // Đối với OKX wallet
    if (walletId === "okx") {
      // Thử các phương thức khác nhau để kết nối với OKX wallet
      let provider = null

      // Thử window.okxwallet trước
      if (window.okxwallet) {
        provider = window.okxwallet
      }
      // Thử window.okexchain (phiên bản cũ hơn)
      else if (window.okexchain) {
        provider = window.okexchain
      }
      // Thử window.ethereum với các định danh OKX
      else if (
        window.ethereum &&
        (window.ethereum.isOkxWallet || window.ethereum.isOKExWallet || window.ethereum.isOKX)
      ) {
        provider = window.ethereum
      }
      // Kiểm tra mảng providers
      else if (window.ethereum && window.ethereum.providers) {
        provider = window.ethereum.providers.find((p: any) => p.isOkxWallet || p.isOKExWallet || p.isOKX)
      }

      if (!provider) {
        return {
          success: false,
          error: "OKX Wallet chưa được phát hiện. Vui lòng cài đặt trước.",
        }
      }

      try {
        const accounts = await provider.request({ method: "eth_requestAccounts" })

        if (accounts.length === 0) {
          return {
            success: false,
            error: "Không tìm thấy tài khoản trong OKX Wallet. Vui lòng kiểm tra ví của bạn và thử lại.",
          }
        }

        return {
          success: true,
          account: accounts[0],
          provider,
        }
      } catch (err: any) {
        return {
          success: false,
          error: err.message || "Không thể kết nối với OKX Wallet",
        }
      }
    }

    // Đối với MetaMask
    if (walletId === "metamask") {
      let provider = null

      // Kiểm tra xem MetaMask có được cài đặt không
      if (window.ethereum && window.ethereum.isMetaMask) {
        provider = window.ethereum
      }
      // Kiểm tra mảng providers cho MetaMask
      else if (window.ethereum && window.ethereum.providers) {
        provider = window.ethereum.providers.find((p: any) => p.isMetaMask)
      }

      if (!provider) {
        return {
          success: false,
          error: "MetaMask chưa được cài đặt. Vui lòng cài đặt trước.",
        }
      }

      try {
        const accounts = await provider.request({ method: "eth_requestAccounts" })

        if (accounts.length === 0) {
          return {
            success: false,
            error: "Không tìm thấy tài khoản trong MetaMask. Vui lòng kiểm tra ví của bạn và thử lại.",
          }
        }

        return {
          success: true,
          account: accounts[0],
          provider,
        }
      } catch (err: any) {
        return {
          success: false,
          error: err.message || "Không thể kết nối với MetaMask",
        }
      }
    }

    // Đối với Coinbase Wallet
    if (walletId === "coinbase") {
      let provider = null

      // Kiểm tra xem Coinbase Wallet có được cài đặt không
      if (window.ethereum && window.ethereum.isCoinbaseWallet) {
        provider = window.ethereum
      }
      // Kiểm tra mảng providers cho Coinbase Wallet
      else if (window.ethereum && window.ethereum.providers) {
        provider = window.ethereum.providers.find((p: any) => p.isCoinbaseWallet)
      }

      if (!provider) {
        return {
          success: false,
          error: "Coinbase Wallet chưa được cài đặt. Vui lòng cài đặt trước.",
        }
      }

      try {
        const accounts = await provider.request({ method: "eth_requestAccounts" })

        if (accounts.length === 0) {
          return {
            success: false,
            error: "Không tìm thấy tài khoản trong Coinbase Wallet. Vui lòng kiểm tra ví của bạn và thử lại.",
          }
        }

        return {
          success: true,
          account: accounts[0],
          provider,
        }
      } catch (err: any) {
        return {
          success: false,
          error: err.message || "Không thể kết nối với Coinbase Wallet",
        }
      }
    }

    // Fallback cho các ví khác
    return {
      success: false,
      error: "Loại ví không được hỗ trợ",
    }
  } catch (err: any) {
    console.error("Lỗi trong connectToWallet:", err)
    return {
      success: false,
      error: err.message || "Không thể kết nối ví",
    }
  }
}

export async function disconnectWallet(provider: any, walletId: string | null) {
  if (!provider) return

  // Đối với WalletConnect, sử dụng phương thức disconnect của provider
  if (walletId === "walletconnect") {
    try {
      await provider.disconnect()
    } catch (e) {
      console.log("Lỗi khi ngắt kết nối WalletConnect:", e)
    }
    return
  }

  // Đối với MetaMask và một số ví khác, chúng ta có thể thử "quên" trang web này
  if (provider && provider._metamask) {
    try {
      // Đây là một phương thức không chính thức có thể hoạt động với một số phiên bản MetaMask
      await provider.request({
        method: "wallet_revokePermissions",
        params: [{ eth_accounts: {} }],
      })
    } catch (e) {
      console.log("Ví không hỗ trợ revokePermissions", e)
    }
  }
}

