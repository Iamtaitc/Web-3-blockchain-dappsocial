"use client"

import type React from "react"
import { useState, useEffect } from "react"
import { Link, useLocation } from "react-router-dom"
import {
  FaHome,
  FaSearch,
  FaLeaf,
  FaPlus,
  FaCrown,
  FaQuestion,
  FaWallet,
  FaBars,
  FaSignInAlt,
  FaCog,
  FaSignOutAlt,
  FaExternalLinkAlt,
  FaUser,
} from "react-icons/fa"
import { formatAddress } from "./Login/wallet-utils"
import { WalletLoginModal } from "./Login/wallet-login-modal"

const Navbar: React.FC = () => {
  const location = useLocation()
  const currentPath = location.pathname
  const [menuOpen, setMenuOpen] = useState(false)
  const [isWalletModalOpen, setIsWalletModalOpen] = useState(false)
  const [account, setAccount] = useState<string | null>(null)
  const [isAuthenticated, setIsAuthenticated] = useState(false)
  const [walletName, setWalletName] = useState<string>("")

  // Kiểm tra xem ví đã được kết nối khi component được mount
  useEffect(() => {
    const checkConnection = async () => {
      if (typeof window !== "undefined" && window.ethereum) {
        try {
          const accounts = await window.ethereum.request({ method: "eth_accounts" })
          if (accounts.length > 0) {
            setAccount(accounts[0])

            // Cố gắng phát hiện ví nào đang được kết nối
            let detectedWalletName = "Wallet"
            if (window.ethereum.isMetaMask) detectedWalletName = "MetaMask"
            else if (window.ethereum.isCoinbaseWallet) detectedWalletName = "Coinbase"
            else if (window.ethereum.isWalletConnect) detectedWalletName = "WalletConnect"
            else if (window.ethereum.isOkxWallet || window.ethereum.isOKExWallet || window.ethereum.isOKX)
              detectedWalletName = "OKX"

            setWalletName(detectedWalletName)

            // Kiểm tra xem người dùng đã được xác thực trước đó chưa
            const authStatus = localStorage.getItem("web3auth")
            if (authStatus) {
              setIsAuthenticated(true)
            }
          }
        } catch (err) {
          console.error("Không thể lấy tài khoản", err)
        }
      }
    }

    checkConnection()
  }, [])

  // Lắng nghe sự thay đổi tài khoản
  useEffect(() => {
    if (typeof window !== "undefined" && window.ethereum) {
      const handleAccountsChanged = (accounts: string[]) => {
        if (accounts.length === 0) {
          // Người dùng đã ngắt kết nối ví
          handleDisconnect()
        } else {
          setAccount(accounts[0])
        }
      }

      window.ethereum.on("accountsChanged", handleAccountsChanged)

      return () => {
        window.ethereum.removeListener("accountsChanged", handleAccountsChanged)
      }
    }
  }, [])

  // Close menu when clicking outside
  useEffect(() => {
    const handleClickOutside = (event: MouseEvent) => {
      // Kiểm tra xem click có phải là bên ngoài menu không
      const target = event.target as HTMLElement
      if (menuOpen && !target.closest(".menu-container")) {
        setMenuOpen(false)
      }
    }

    document.addEventListener("click", handleClickOutside)
    return () => {
      document.removeEventListener("click", handleClickOutside)
    }
  }, [menuOpen])

  // Toggle menu
  const toggleMenu = (e: React.MouseEvent) => {
    e.stopPropagation()
    setMenuOpen(!menuOpen)
  }

  // Xử lý kết nối ví thành công
  const handleWalletSuccess = (address: string, walletType: string) => {
    setAccount(address)
    setWalletName(walletType)
    setIsWalletModalOpen(false)
  }

  // Xử lý ngắt kết nối ví
  const handleDisconnect = async () => {
    try {
      // Xóa trạng thái ứng dụng
      setAccount(null)
      setIsAuthenticated(false)
      setWalletName("")
      localStorage.removeItem("web3auth")
      setMenuOpen(false)

      // Nếu có provider, thử ngắt kết nối
      if (window.ethereum) {
        try {
          // Đây là một phương thức không chính thức có thể hoạt động với một số phiên bản MetaMask
          await window.ethereum.request({
            method: "wallet_revokePermissions",
            params: [{ eth_accounts: {} }],
          })
        } catch (e) {
          console.log("Ví không hỗ trợ revokePermissions", e)
        }
      }
    } catch (err) {
      console.error("Lỗi khi ngắt kết nối:", err)
    }
  }

  // Mở modal đăng nhập ví
  const openWalletModal = (e: React.MouseEvent) => {
    e.stopPropagation()
    setIsWalletModalOpen(true)
    setMenuOpen(false)
  }

  return (
    <>
      <nav className="w-[200px] h-screen bg-black text-white fixed top-0 left-0 flex flex-col border-r border-gray-800 font-mono">
        <div className="p-6">
          <div className="text-2xl font-bold">
            <span className="text-white">DIGI</span>
            <span className="text-green-500">X</span>
          </div>
        </div>

        <ul className="flex-1 py-4">
          <NavItem to="/" icon={<FaHome />} label="Home" isActive={currentPath === "/"} />
          <NavItem to="/dashboard" icon={<FaSearch />} label="Dashboard" isActive={currentPath === "/dashboard"} />
          <NavItem to="/farm" icon={<FaLeaf />} label="Farm" isActive={currentPath === "/farm"} />
          <NavItem to="/add-nft" icon={<FaPlus />} label="Add NFT" isActive={currentPath === "/add-nft"} />
          <NavItem to="/premium" icon={<FaCrown />} label="Premium" isActive={currentPath === "/premium"} />
          <NavItem to="/quest" icon={<FaQuestion />} label="Quest" isActive={currentPath === "/quest"} />
          <NavItem to="/wallet" icon={<FaWallet />} label="Wallet" isActive={currentPath === "/wallet"} />
        </ul>

        <div
          className={`p-4 mt-auto border-t border-gray-800 flex items-center text-gray-400 cursor-pointer relative menu-container ${menuOpen ? "bg-gray-800 text-white" : "hover:bg-gray-800"}`}
          onClick={toggleMenu}
        >
          <FaBars className="mr-3" />
          <span>Menu</span>

          {menuOpen && (
            <div className="absolute left-0 bottom-full mb-2 w-full bg-gray-900 rounded-lg shadow-lg border border-gray-800 overflow-hidden z-50">
              {account ? (
                // Hiển thị thông tin ví khi đã kết nối
                <>
                  <div className="p-3 border-b border-gray-800">
                    <div className="flex items-center space-x-2 mb-1">
                      <div className="w-4 h-4 rounded-full bg-green-500 flex items-center justify-center">
                        <FaWallet className="text-white text-xs" />
                      </div>
                      <span className="text-white text-sm font-medium">{walletName}</span>
                    </div>
                    <div className="text-gray-400 text-xs truncate">{formatAddress(account)}</div>
                  </div>

                  <Link
                    to={`https://etherscan.io/address/${account}`}
                    target="_blank"
                    className="flex items-center space-x-3 p-3 hover:bg-gray-800 cursor-pointer transition-colors"
                    onClick={(e) => e.stopPropagation()}
                  >
                    <FaExternalLinkAlt className="text-gray-400" />
                    <span className="text-gray-400">Xem trên Etherscan</span>
                  </Link>

                  {isAuthenticated && (
                    <Link
                      to="/profile"
                      className="flex items-center space-x-3 p-3 hover:bg-gray-800 cursor-pointer transition-colors"
                      onClick={(e) => e.stopPropagation()}
                    >
                      <FaUser className="text-gray-400" />
                      <span className="text-gray-400">Hồ sơ</span>
                    </Link>
                  )}

                  <Link
                    to="/settings"
                    className="flex items-center space-x-3 p-3 hover:bg-gray-800 cursor-pointer transition-colors"
                    onClick={(e) => e.stopPropagation()}
                  >
                    <FaCog className="text-gray-400" />
                    <span className="text-gray-400">Cài đặt</span>
                  </Link>

                  <div
                    className="flex items-center space-x-3 p-3 hover:bg-gray-800 cursor-pointer transition-colors border-t border-gray-800"
                    onClick={(e) => {
                      e.stopPropagation()
                      handleDisconnect()
                    }}
                  >
                    <FaSignOutAlt className="text-red-400" />
                    <span className="text-red-400">Ngắt kết nối</span>
                  </div>
                </>
              ) : (
                // Hiển thị tùy chọn đăng nhập khi chưa kết nối ví
                <>
                  <div
                    className="flex items-center space-x-3 p-3 hover:bg-gray-800 cursor-pointer transition-colors"
                    onClick={openWalletModal}
                  >
                    <FaSignInAlt className="text-gray-400" />
                    <span className="text-gray-400">Login</span>
                  </div>
                  <Link
                    to="/settings"
                    className="flex items-center space-x-3 p-3 hover:bg-gray-800 cursor-pointer transition-colors"
                    onClick={(e) => e.stopPropagation()}
                  >
                    <FaCog className="text-gray-400" />
                    <span className="text-gray-400">Setting</span>
                  </Link>
                </>
              )}
            </div>
          )}
        </div>
      </nav>

      {/* Modal đăng nhập ví */}
      <WalletLoginModal
        isOpen={isWalletModalOpen}
        onClose={() => setIsWalletModalOpen(false)}
        onSuccess={handleWalletSuccess}
      />
    </>
  )
}

interface NavItemProps {
  to: string
  icon: React.ReactNode
  label: string
  isActive: boolean
}

const NavItem: React.FC<NavItemProps> = ({ to, icon, label, isActive }) => {
  return (
    <li
      className={`my-1 px-2 py-2 rounded-lg transition-all duration-200 ${
        isActive
          ? "bg-gradient-to-r from-emerald-500 to-teal-500 text-white shadow-md"
          : "hover:bg-gray-50 text-gray-600"
      }`}
    >
      <Link to={to} className="flex items-center">
        <span className={`mr-3 ${isActive ? "text-white" : "text-emerald-500"}`}>{icon}</span>
        <span className={isActive ? "text-white" : "text-gray-700"}>{label}</span>
      </Link>
    </li>
  )
}

export default Navbar

