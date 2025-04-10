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
} from "react-icons/fa"

const Navbar: React.FC = () => {
  const location = useLocation()
  const currentPath = location.pathname
  const [menuOpen, setMenuOpen] = useState(false)

  // Close menu when clicking outside
  useEffect(() => {
    const handleClickOutside = () => {
      if (menuOpen) setMenuOpen(false)
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

  return (
    <nav className="w-[200px] h-screen bg-white text-gray-700 fixed top-0 left-0 flex flex-col border-r border-gray-200 font-mono shadow-lg z-50">
      <div className="p-6 border-b border-gray-100">
        <div className="text-2xl font-bold">
          <span className="text-gray-800">DIGI</span>
          <span className="text-emerald-500">X</span>
        </div>
      </div>

      <ul className="flex-1 py-4 px-2">
        <NavItem to="/" icon={<FaHome />} label="Home" isActive={currentPath === "/"} />
        <NavItem to="/dashboard" icon={<FaSearch />} label="Dashboard" isActive={currentPath === "/dashboard"} />
        <NavItem to="/farm" icon={<FaLeaf />} label="Farm" isActive={currentPath === "/farm"} />
        <NavItem to="/add-nft" icon={<FaPlus />} label="Add NFT" isActive={currentPath === "/add-nft"} />
        <NavItem to="/premium" icon={<FaCrown />} label="Premium" isActive={currentPath === "/premium"} />
        <NavItem to="/quest" icon={<FaQuestion />} label="Quest" isActive={currentPath === "/quest"} />
        <NavItem to="/wallet" icon={<FaWallet />} label="Wallet" isActive={currentPath === "/wallet"} />
      </ul>

      <div
        className={`p-4 mt-auto border-t border-gray-200 flex items-center cursor-pointer relative ${
          menuOpen ? "bg-gray-100 text-gray-800" : "text-gray-600 hover:bg-gray-50"
        }`}
        onClick={toggleMenu}
      >
        <FaBars className="mr-3" />
        <span>Menu</span>

        {menuOpen && (
          <div className="absolute left-0 bottom-full mb-2 w-full bg-white rounded-lg shadow-lg border border-gray-200 overflow-hidden z-50">
            <Link
              to="/login"
              className="flex items-center space-x-3 p-3 hover:bg-gray-50 cursor-pointer transition-colors"
              onClick={(e) => e.stopPropagation()}
            >
              <FaSignInAlt className="text-emerald-500" />
              <span className="text-gray-700">Login</span>
            </Link>
            <Link
              to="/settings"
              className="flex items-center space-x-3 p-3 hover:bg-gray-50 cursor-pointer transition-colors"
              onClick={(e) => e.stopPropagation()}
            >
              <FaCog className="text-emerald-500" />
              <span className="text-gray-700">Settings</span>
            </Link>
          </div>
        )}
      </div>
    </nav>
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

