"use client"

import type React from "react"
import { useState, useEffect, useRef } from "react"
import { Link, useLocation } from "react-router-dom"
import {
  Home,
  Search,
  Leaf,
  PlusCircle,
  Crown,
  Target,
  Wallet,
  Menu,
  LogIn,
  Settings,
  ExternalLink,
  User,
  LogOut,
  ChevronDown,
} from "lucide-react"
import { WalletLoginModal } from "./Login/wallet-login-modal"

// Utility function to format wallet address
const formatAddress = (address: string): string => {
  if (!address) return ""
  return `${address.substring(0, 6)}...${address.substring(address.length - 4)}`
}

const Navbar: React.FC = () => {
  const location = useLocation()
  const currentPath = location.pathname
  const [menuOpen, setMenuOpen] = useState(false)
  const [isWalletModalOpen, setIsWalletModalOpen] = useState(false)
  const [account, setAccount] = useState<string | null>(null)
  const [isAuthenticated, setIsAuthenticated] = useState(false)
  const [walletName, setWalletName] = useState<string>("")
  const menuRef = useRef<HTMLDivElement>(null)

  // Check if wallet is connected when component mounts
  useEffect(() => {
    const checkConnection = async () => {
      if (typeof window !== "undefined" && window.ethereum) {
        try {
          const accounts = await window.ethereum.request({ method: "eth_accounts" })
          if (accounts.length > 0) {
            setAccount(accounts[0])

            // Try to detect which wallet is connected
            let detectedWalletName = "Wallet"
            if (window.ethereum.isMetaMask) detectedWalletName = "MetaMask"
            else if (window.ethereum.isCoinbaseWallet) detectedWalletName = "Coinbase"
            else if (window.ethereum.isWalletConnect) detectedWalletName = "WalletConnect"
            else if (window.ethereum.isOkxWallet || window.ethereum.isOKExWallet || window.ethereum.isOKX)
              detectedWalletName = "OKX"

            setWalletName(detectedWalletName)

            // Check if user was previously authenticated
            const authStatus = localStorage.getItem("web3auth")
            if (authStatus) {
              setIsAuthenticated(true)
            }
          }
        } catch (err) {
          console.error("Could not get accounts", err)
        }
      }
    }

    checkConnection()
  }, [])

  // Listen for account changes
  useEffect(() => {
    if (typeof window !== "undefined" && window.ethereum) {
      const handleAccountsChanged = (accounts: string[]) => {
        if (accounts.length === 0) {
          // User disconnected wallet
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
      if (menuRef.current && !menuRef.current.contains(event.target as Node)) {
        setMenuOpen(false)
      }
    }

    document.addEventListener("mousedown", handleClickOutside)
    return () => {
      document.removeEventListener("mousedown", handleClickOutside)
    }
  }, [])

  // Toggle menu
  const toggleMenu = (e: React.MouseEvent) => {
    e.stopPropagation()
    setMenuOpen(!menuOpen)
  }

  // Handle successful wallet connection
  const handleWalletSuccess = (address: string, walletType: string) => {
    setAccount(address)
    setWalletName(walletType)
    setIsWalletModalOpen(false)
  }

  // Handle wallet disconnection
  const handleDisconnect = async () => {
    try {
      // Clear app state
      setAccount(null)
      setIsAuthenticated(false)
      setWalletName("")
      localStorage.removeItem("web3auth")
      setMenuOpen(false)

      // If provider exists, try to disconnect
      if (window.ethereum) {
        try {
          // This is an unofficial method that might work with some MetaMask versions
          await window.ethereum.request({
            method: "wallet_revokePermissions",
            params: [{ eth_accounts: {} }],
          })
        } catch (e) {
          console.log("Wallet doesn't support revokePermissions", e)
        }
      }
    } catch (err) {
      console.error("Error disconnecting:", err)
    }
  }

  // Open wallet login modal
  const openWalletModal = (e: React.MouseEvent) => {
    e.stopPropagation()
    setIsWalletModalOpen(true)
    setMenuOpen(false)
  }

  return (
    <>
      <nav className="w-[200px] h-screen bg-white text-gray-700 fixed top-0 left-0 flex flex-col border-r border-gray-200 font-mono shadow-lg z-50">
        <div className="p-6 border-b border-gray-100">
          <div className="text-2xl font-bold">
            <span className="text-gray-800">DIGI</span>
            <span className="text-emerald-500">X</span>
          </div>
        </div>

        <ul className="flex-1 py-4 px-2">
          <NavItem to="/" icon={<Home size={18} />} label="Home" isActive={currentPath === "/"} />
          <NavItem
            to="/dashboard"
            icon={<Search size={18} />}
            label="Dashboard"
            isActive={currentPath === "/dashboard"}
          />
          <NavItem to="/farm" icon={<Leaf size={18} />} label="Farm" isActive={currentPath === "/farm"} />
          <NavItem
            to="/add-nft"
            icon={<PlusCircle size={18} />}
            label="Add NFT"
            isActive={currentPath === "/add-nft"}
          />
          <NavItem to="/premium" icon={<Crown size={18} />} label="Premium" isActive={currentPath === "/premium"} />
          <NavItem to="/quest" icon={<Target size={18} />} label="Quest" isActive={currentPath === "/quest"} />
          <NavItem to="/wallet" icon={<Wallet size={18} />} label="Wallet" isActive={currentPath === "/wallet"} />
        </ul>

        <div ref={menuRef} className="relative">
          <div
            className={`p-4 mt-auto border-t border-gray-200 flex items-center justify-between cursor-pointer ${
              menuOpen ? "bg-gray-100 text-gray-800" : "text-gray-600 hover:bg-gray-50"
            }`}
            onClick={toggleMenu}
          >
            <div className="flex items-center">
              <Menu size={18} className="mr-3" />
              <span>Menu</span>
            </div>
            <ChevronDown size={16} className={`transition-transform duration-200 ${menuOpen ? "rotate-180" : ""}`} />
          </div>

          {menuOpen && (
            <div className="absolute left-0 bottom-full mb-2 w-full bg-white rounded-lg shadow-lg border border-gray-200 overflow-hidden z-50">
              {account ? (
                // Show wallet info when connected
                <>
                  <div className="p-3 border-b border-gray-200">
                    <div className="flex items-center space-x-2 mb-1">
                      <div className="w-4 h-4 rounded-full bg-emerald-500 flex items-center justify-center">
                        <Wallet className="text-white" size={10} />
                      </div>
                      <span className="text-gray-800 text-sm font-medium">{walletName}</span>
                    </div>
                    <div className="text-gray-500 text-xs truncate">{formatAddress(account)}</div>
                  </div>

                  <Link
                    to={`https://etherscan.io/address/${account}`}
                    target="_blank"
                    className="flex items-center space-x-3 p-3 hover:bg-gray-50 cursor-pointer transition-colors"
                    onClick={(e) => e.stopPropagation()}
                  >
                    <ExternalLink size={16} className="text-gray-500" />
                    <span className="text-gray-700">View on Etherscan</span>
                  </Link>

                  {isAuthenticated && (
                    <Link
                      to="/profile"
                      className="flex items-center space-x-3 p-3 hover:bg-gray-50 cursor-pointer transition-colors"
                      onClick={(e) => e.stopPropagation()}
                    >
                      <User size={16} className="text-gray-500" />
                      <span className="text-gray-700">Profile</span>
                    </Link>
                  )}

                  <Link
                    to="/settings"
                    className="flex items-center space-x-3 p-3 hover:bg-gray-50 cursor-pointer transition-colors"
                    onClick={(e) => e.stopPropagation()}
                  >
                    <Settings size={16} className="text-gray-500" />
                    <span className="text-gray-700">Settings</span>
                  </Link>

                  <div
                    className="flex items-center space-x-3 p-3 hover:bg-gray-50 cursor-pointer transition-colors border-t border-gray-200"
                    onClick={(e) => {
                      e.stopPropagation()
                      handleDisconnect()
                    }}
                  >
                    <LogOut size={16} className="text-red-500" />
                    <span className="text-red-500">Disconnect</span>
                  </div>
                </>
              ) : (
                // Show login options when not connected
                <>
                  <div
                    className="flex items-center space-x-3 p-3 hover:bg-gray-50 cursor-pointer transition-colors"
                    onClick={openWalletModal}
                  >
                    <LogIn size={16} className="text-emerald-500" />
                    <span className="text-gray-700">Login</span>
                  </div>
                  <Link
                    to="/settings"
                    className="flex items-center space-x-3 p-3 hover:bg-gray-50 cursor-pointer transition-colors"
                    onClick={(e) => e.stopPropagation()}
                  >
                    <Settings size={16} className="text-emerald-500" />
                    <span className="text-gray-700">Settings</span>
                  </Link>
                </>
              )}
            </div>
          )}
        </div>
      </nav>

      {/* Wallet login modal */}
      {isWalletModalOpen && (
        <WalletLoginModal
          isOpen={isWalletModalOpen}
          onClose={() => setIsWalletModalOpen(false)}
          onSuccess={handleWalletSuccess}
        />
      )}
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

