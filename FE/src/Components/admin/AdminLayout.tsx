"use client"

import { useState, useEffect } from "react"
import { Outlet, Link, useLocation, useNavigate } from "react-router-dom"
import {
  LayoutDashboard,
  Users,
  FileText,
  CheckSquare,
  Coins,
  Bell,
  Settings,
  FileCode,
  Database,
  Moon,
  Sun,
  LogOut,
  Menu,
  X,
} from "lucide-react"

const AdminLayout = () => {
  const [darkMode, setDarkMode] = useState(false)
  const [sidebarOpen, setSidebarOpen] = useState(true)
  const [mobileMenuOpen, setMobileMenuOpen] = useState(false)
  const location = useLocation()
  const navigate = useNavigate()

  // Toggle dark mode
  const toggleDarkMode = () => {
    setDarkMode(!darkMode)
    document.documentElement.classList.toggle("dark")
  }

  // Toggle sidebar on desktop
  const toggleSidebar = () => {
    setSidebarOpen(!sidebarOpen)
  }

  // Toggle mobile menu
  const toggleMobileMenu = () => {
    setMobileMenuOpen(!mobileMenuOpen)
  }

  // Close mobile menu when route changes
  useEffect(() => {
    setMobileMenuOpen(false)
  }, [location])

  // Handle return to home
  const handleReturn = () => {
    navigate("/home")
  }

  // Navigation items
  const navItems = [
    { path: "/admin", icon: <LayoutDashboard size={20} />, label: "Dashboard" },
    { path: "/admin/users", icon: <Users size={20} />, label: "User Management" },
    { path: "/admin/content", icon: <FileText size={20} />, label: "Content Moderation" },
    { path: "/admin/tasks", icon: <CheckSquare size={20} />, label: "Task Management" },
    { path: "/admin/tokens", icon: <Coins size={20} />, label: "Token Management" },
    { path: "/admin/notifications", icon: <Bell size={20} />, label: "System Notifications" },
    { path: "/admin/configuration", icon: <Settings size={20} />, label: "System Configuration" },
    { path: "/admin/logs", icon: <FileCode size={20} />, label: "Log Management" },
    { path: "/admin/blockchain", icon: <Database size={20} />, label: "Blockchain Sync" },
  ]

  return (
    <div className={`min-h-screen ${darkMode ? "dark" : ""}`}>
      <div className="flex h-screen w-screen bg-gray-100 dark:bg-gray-900 text-gray-800 dark:text-gray-200">
        {/* Sidebar - Desktop and Mobile */}
        <aside
          className={`fixed inset-y-0 left-0 z-50 w-64 bg-white dark:bg-gray-800 shadow-lg transform transition-transform duration-300 ease-in-out lg:translate-x-0 lg:static lg:inset-auto lg:z-auto ${
            mobileMenuOpen ? "translate-x-0" : "-translate-x-full"
          } lg:${sidebarOpen ? "w-64" : "w-20"}`}
        >
          <div className="flex items-center justify-between h-16 px-4 border-b dark:border-gray-700">
            <Link to="/admin" className="flex items-center">
              <span className="text-xl font-bold text-emerald-600 dark:text-emerald-500">DIGIX</span>
              <span className={`ml-2 font-semibold ${sidebarOpen ? "lg:block" : "lg:hidden"} hidden lg:block`}>Admin</span>
            </Link>
            <button
              onClick={() => setMobileMenuOpen(false)}
              className="p-2 rounded-md lg:hidden text-gray-500 hover:text-gray-700 dark:text-gray-400 dark:hover:text-gray-200"
            >
              <X size={20} />
            </button>
          </div>

          <nav className="px-2 py-4">
            <ul className="space-y-1">
              {navItems.map((item) => (
                <li key={item.path}>
                  <Link
                    to={item.path}
                    className={`flex items-center px-4 py-3 rounded-lg transition-colors ${
                      location.pathname === item.path
                        ? "bg-emerald-100 text-emerald-700 dark:bg-emerald-900 dark:text-emerald-300"
                        : "text-gray-700 dark:text-gray-300 hover:bg-gray-100 dark:hover:bg-gray-700"
                    }`}
                  >
                    <span className="mr-3">{item.icon}</span>
                    <span className={`${sidebarOpen ? "lg:block" : "lg:hidden"} hidden lg:block`}>{item.label}</span>
                  </Link>
                </li>
              ))}
            </ul>
          </nav>

          <div className="absolute bottom-0 w-full border-t dark:border-gray-700 p-4">
            <div className="flex items-center justify-between">
              <button
                onClick={toggleDarkMode}
                className="p-2 rounded-md text-gray-500 hover:text-gray-700 dark:text-gray-400 dark:hover:text-gray-200"
              >
                {darkMode ? <Sun size={20} /> : <Moon size={20} />}
              </button>
              <button 
                onClick={handleReturn}
                className="flex items-center text-red-500 hover:text-red-700 dark:hover:text-red-400"
              >
                <LogOut size={20} className="mr-2" />
                <span className={`${sidebarOpen ? "lg:block" : "lg:hidden"} hidden lg:block`}>Return</span>
              </button>
            </div>
          </div>
        </aside>

        {/* Main Content */}
        <div className="flex-1 flex flex-col overflow-hidden w-full">
          {/* Header */}
          <header className="flex items-center justify-between h-16 px-6 bg-white dark:bg-gray-800 shadow z-10">
            <div className="flex items-center">
              {/* Hamburger menu button for mobile */}
              <button
                onClick={toggleMobileMenu}
                className="p-2 rounded-md lg:hidden text-gray-500 hover:text-gray-700 dark:text-gray-400 dark:hover:text-gray-200 mr-2"
              >
                <Menu size={24} />
              </button>
              
              {/* Toggle sidebar button for desktop */}
              <button
                onClick={toggleSidebar}
                className="hidden lg:block p-2 rounded-md text-gray-500 hover:text-gray-700 dark:text-gray-400 dark:hover:text-gray-200"
              >
                <Menu size={20} />
              </button>
            </div>
            <div className="flex items-center">
              <div className="mr-4 text-sm">
                <span className="text-gray-500 dark:text-gray-400">Connected as:</span>
                <span className="ml-2 font-medium">0x7F3c...N5O6P7Q</span>
              </div>
              <div className="w-10 h-10 rounded-full bg-emerald-500 flex items-center justify-center text-white font-bold">
                A
              </div>
            </div>
          </header>

          {/* Main Content */}
          <main className="flex-1 w-full overflow-x-hidden overflow-y-auto bg-gray-100 dark:bg-gray-900 p-6">
            <Outlet />
          </main>
        </div>
      </div>
    </div>
  )
}

export default AdminLayout