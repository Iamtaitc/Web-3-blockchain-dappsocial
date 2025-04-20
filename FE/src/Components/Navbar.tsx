"use client"

import type React from "react"
import { useState, useEffect, useRef } from "react"
import { Link, useLocation, useNavigate } from "react-router-dom"
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
  Shield,
} from "lucide-react"
import { WalletLoginModal } from "./Login/wallet-login-modal"
import { useSelector, useDispatch } from "react-redux"
import type { RootState, AppDispatch } from "../store"
import { useAuth } from "../hooks/useAuth"
import { refreshToken as refreshTokenAction } from "../store/slices/authSlice"
import api from "../services/api"
import { store } from "../store" // Import store trực tiếp
import NotificationButton from "../Components/NotificationButton"
// Utility function to format wallet address
const formatAddress = (address: string): string => {
  if (!address) return ""
  return `${address.substring(0, 6)}...${address.substring(address.length - 4)}`
}

const Navbar = () => {
  const location = useLocation()
  const navigate = useNavigate()
  const currentPath = location.pathname
  const [menuOpen, setMenuOpen] = useState(false)
  const [isWalletModalOpen, setIsWalletModalOpen] = useState(false)
  const menuRef = useRef<HTMLDivElement>(null)
  const dispatch = useDispatch<AppDispatch>()

  // Lấy thông tin xác thực từ Redux store
  const {
    isAuthenticated,
    walletAddress,
    walletType,
    user,
    token,
    refreshToken: refreshTokenValue,
  } = useSelector((state: RootState) => state.auth)
  const { logout: handleLogout, connectWallet, authenticate } = useAuth()

  // Kiểm tra và làm mới token khi component mount
  useEffect(() => {
    const checkAndRefreshToken = async () => {
      // Kiểm tra xem có token trong localStorage nhưng không có trong Redux store không
      const localToken = localStorage.getItem("token")
      const localRefreshToken = localStorage.getItem("refreshToken")
      const localUser = localStorage.getItem("user")

      // Nếu có dữ liệu trong localStorage nhưng không có trong Redux store
      if (localToken && localRefreshToken && localUser && !token) {
        console.log("Phát hiện token trong localStorage nhưng không có trong Redux store, đang khôi phục...")

        // Kiểm tra Redux store trực tiếp
        const authState = store.getState().auth
        console.log("Redux store hiện tại:", {
          isAuthenticated: authState.isAuthenticated,
          token: authState.token,
          refreshToken: authState.refreshToken,
          user: authState.user,
        })

        // Nếu token hết hạn, làm mới token
        if (isTokenExpired(localToken) && localRefreshToken) {
          try {
            // Gọi API để làm mới token
            const response = await api.post("/refresh-token", { refreshToken: localRefreshToken })

            if (response.data.success) {
              // Cập nhật token mới vào Redux store
              dispatch(
                refreshTokenAction({
                  token: response.data.data.token,
                  refreshToken: response.data.data.refreshToken,
                }),
              )

              console.log("Token đã được làm mới thành công")
            }
          } catch (error) {
            console.error("Lỗi khi làm mới token:", error)
            // Xóa dữ liệu đăng nhập nếu có lỗi
            localStorage.removeItem("token")
            localStorage.removeItem("refreshToken")
            localStorage.removeItem("user")
          }
        } else {
          // Nếu token còn hạn, khôi phục trạng thái đăng nhập
          try {
            dispatch({
              type: "auth/setAuthData",
              payload: {
                token: localToken,
                refreshToken: localRefreshToken,
                user: JSON.parse(localUser),
              },
            })

            console.log("Đã khôi phục trạng thái đăng nhập từ localStorage")

            // Kiểm tra Redux store sau khi dispatch
            setTimeout(() => {
              const updatedAuthState = store.getState().auth
              console.log("Redux store sau khi khôi phục:", {
                isAuthenticated: updatedAuthState.isAuthenticated,
                token: updatedAuthState.token,
                refreshToken: updatedAuthState.refreshToken,
                user: updatedAuthState.user,
              })
            }, 100)
          } catch (error) {
            console.error("Lỗi khi khôi phục trạng thái đăng nhập:", error)
          }
        }
      }
    }

    checkAndRefreshToken()
  }, [dispatch, token])



  // Kiểm tra xem token có hết hạn không
  const isTokenExpired = (token: string): boolean => {
    try {
      const payload = JSON.parse(atob(token.split(".")[1]))
      const expiry = payload.exp * 1000 // Chuyển đổi thành milliseconds
      return Date.now() > expiry
    } catch (error) {
      return true // Nếu có lỗi khi parse token, coi như token đã hết hạn
    }
  }

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

  // Kiểm tra nếu đang ở trang add-nft và chưa đăng nhập thì hiện modal đăng nhập
  useEffect(() => {
    if (currentPath === "/add-nft" && !isAuthenticated) {
      setIsWalletModalOpen(true)
    }
  }, [currentPath, isAuthenticated])

  // Toggle menu
  const toggleMenu = (e: React.MouseEvent) => {
    e.stopPropagation()
    setMenuOpen(!menuOpen)
  }

  // Handle successful wallet connection
  const handleWalletSuccess = () => {
    setIsWalletModalOpen(false)

    // Kiểm tra Redux store sau khi đăng nhập thành công
    setTimeout(() => {
      const authState = store.getState().auth
      console.log("Redux store sau khi đăng nhập thành công:", {
        isAuthenticated: authState.isAuthenticated,
        token: authState.token,
        refreshToken: authState.refreshToken,
        user: authState.user,
      })
    }, 100)
  }

  // Handle wallet disconnection
  const handleDisconnect = async () => {
    try {
      await handleLogout()
      setMenuOpen(false)

      // Nếu đang ở trang yêu cầu đăng nhập, chuyển hướng về trang chủ
      if (currentPath === "/add-nft" || currentPath === "/profile") {
        navigate("/")
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

  // Kiểm tra quyền admin
  const isAdmin = user?.isVerified || false

  return (
    <>
      <nav className="w-[200px] h-screen bg-white text-gray-700 fixed top-0 left-0 flex flex-col border-r border-gray-200 font-mono shadow-lg z-50">
        <div className="p-6 border-b border-gray-100">
          <div className="text-2xl font-bold">
            <span className="text-gray-800">DIGI</span>
            <span className="text-emerald-500">X</span>
          </div>
        </div>

        {/* Bỏ phần hiển thị thông tin người dùng ở đầu sidebar */}
        {/* Chỉ giữ lại trong dropdown menu */}

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
            isActive={currentPath === "/add-nft" || currentPath.startsWith("/add-nft/")}
          />
          <NavItem to="/premium" icon={<Crown size={18} />} label="Premium" isActive={currentPath === "/premium"} />
          <NavItem to="/quest" icon={<Target size={18} />} label="Quest" isActive={currentPath === "/quest"} />
          <NavItem to="/wallet" icon={<Wallet size={18} />} label="Wallet" isActive={currentPath === "/wallet"} />
        </ul>
        <div className="mt-auto border-t border-gray-200">
          <div className="p-4 flex items-center justify-between">
            <div className="flex items-center">
              <Menu size={18} className="mr-3" />
              <span>Menu</span>
            </div>

            <div className="flex items-center">
              <Link to="/notifications">
                <NotificationButton />
              </Link>
              <div ref={menuRef} className="relative ml-2">
                <div
                  className={`cursor-pointer ${menuOpen ? "text-gray-800" : "text-gray-600 hover:text-gray-800"}`}
                  onClick={toggleMenu}
                >
                  <ChevronDown
                    size={16}
                    className={`transition-transform duration-200 ${menuOpen ? "rotate-180" : ""}`}
                  />
                </div>

                {menuOpen && (
                  <div className="absolute left-0 bottom-full mb-2 w-400 bg-white rounded-lg shadow-lg border border-gray-200 overflow-hidden z-50">
                    {isAuthenticated && walletAddress ? (
                      // Show wallet info when connected
                      <>
                        <div className="p-3 border-b border-gray-200">
                          <div className="flex items-center space-x-2 mb-1">
                            <div className="w-4 h-4 rounded-full bg-emerald-500 flex items-center justify-center">
                              <Wallet className="text-white" size={10} />
                            </div>
                            <span className="text-gray-800 text-sm font-medium">{walletType || "Wallet"}</span>
                            {isAdmin && (
                              <div className="bg-blue-100 text-blue-800 text-xs px-1.5 py-0.5 rounded-full flex items-center">
                                <Shield size={10} className="mr-1" />
                                Admin
                              </div>
                            )}
                          </div>
                          <div className="text-gray-500 text-xs truncate">{formatAddress(walletAddress)}</div>
                          {user?.username && <div className="text-gray-700 text-sm font-medium mt-1">@{user.username}</div>}
                        </div>

                        <Link
                          to={`https://etherscan.io/address/${walletAddress}`}
                          target="_blank"
                          className="flex items-center space-x-3 p-3 hover:bg-gray-50 cursor-pointer transition-colors"
                          onClick={(e) => e.stopPropagation()}
                        >
                          <ExternalLink size={16} className="text-gray-500" />
                          <span className="text-gray-700">View on Etherscan</span>
                        </Link>

                        <Link
                          to="/profile"
                          className="flex items-center space-x-3 p-3 hover:bg-gray-50 cursor-pointer transition-colors"
                          onClick={(e) => e.stopPropagation()}
                        >
                          <User size={16} className="text-gray-500" />
                          <span className="text-gray-700">Profile</span>
                        </Link>

                        <Link
                          to="/Setting"
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
                          to="/Setting"
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
            </div>
          </div>
        </div>
      </nav>

      {/* Wallet login modal */}
      {isWalletModalOpen && (
        <WalletLoginModal
          isOpen={isWalletModalOpen}
          onClose={() => setIsWalletModalOpen(false)}
          onSuccess={handleWalletSuccess}
          requireSignature={true}
          actionMessage={
            currentPath === "/add-nft" ? "Vui lòng đăng nhập để tạo NFT" : "Kết nối ví để truy cập ứng dụng"
          }
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

const NavItem = ({ to, icon, label, isActive }: NavItemProps) => {
  return (
    <li
      className={`my-1 px-2 py-2 rounded-lg transition-all duration-200 ${isActive
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
