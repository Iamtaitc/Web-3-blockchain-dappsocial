"use client"

import { useState } from "react"
import { FaMoon, FaSun, FaCheck, FaGlobe, FaBell, FaLock, FaUserShield, FaQuestionCircle } from "react-icons/fa"
import { useTheme } from "../context/theme-context"

const Settings = () => {
  const { theme, setTheme } = useTheme()
  const [activeTab, setActiveTab] = useState("appearance")

  const handleThemeChange = (newTheme: "dark" | "light") => {
    console.log("Changing theme to:", newTheme)
    setTheme(newTheme)
  }

  return (
    <div className="w-full min-h-screen bg-black text-white font-mono">
      <h1 className="text-3xl font-bold mb-8">Settings</h1>

      <div className="max-w-4xl mx-auto grid grid-cols-1 md:grid-cols-4 gap-6">
        {/* Sidebar */}
        <div className="bg-gray-900 rounded-lg p-4">
          <nav className="space-y-2">
            <button
              onClick={() => setActiveTab("appearance")}
              className={`w-full text-left px-4 py-2 rounded-lg flex items-center ${
                activeTab === "appearance"
                  ? "bg-gray-800 text-white"
                  : "text-gray-400 hover:bg-gray-800 hover:text-white"
              }`}
            >
              <FaSun className="mr-2" /> Appearance
            </button>
            <button
              onClick={() => setActiveTab("language")}
              className={`w-full text-left px-4 py-2 rounded-lg flex items-center ${
                activeTab === "language" ? "bg-gray-800 text-white" : "text-gray-400 hover:bg-gray-800 hover:text-white"
              }`}
            >
              <FaGlobe className="mr-2" /> Language
            </button>
            <button
              onClick={() => setActiveTab("notifications")}
              className={`w-full text-left px-4 py-2 rounded-lg flex items-center ${
                activeTab === "notifications"
                  ? "bg-gray-800 text-white"
                  : "text-gray-400 hover:bg-gray-800 hover:text-white"
              }`}
            >
              <FaBell className="mr-2" /> Notifications
            </button>
            <button
              onClick={() => setActiveTab("security")}
              className={`w-full text-left px-4 py-2 rounded-lg flex items-center ${
                activeTab === "security" ? "bg-gray-800 text-white" : "text-gray-400 hover:bg-gray-800 hover:text-white"
              }`}
            >
              <FaLock className="mr-2" /> Security
            </button>
            <button
              onClick={() => setActiveTab("privacy")}
              className={`w-full text-left px-4 py-2 rounded-lg flex items-center ${
                activeTab === "privacy" ? "bg-gray-800 text-white" : "text-gray-400 hover:bg-gray-800 hover:text-white"
              }`}
            >
              <FaUserShield className="mr-2" /> Privacy
            </button>
            <button
              onClick={() => setActiveTab("help")}
              className={`w-full text-left px-4 py-2 rounded-lg flex items-center ${
                activeTab === "help" ? "bg-gray-800 text-white" : "text-gray-400 hover:bg-gray-800 hover:text-white"
              }`}
            >
              <FaQuestionCircle className="mr-2" /> Help & Support
            </button>
          </nav>
        </div>

        {/* Main Content */}
        <div className="md:col-span-3 bg-gray-900 rounded-lg p-6">
          {activeTab === "appearance" && (
            <div>
              <h2 className="text-xl font-bold mb-6">Appearance</h2>

              <div className="space-y-6">
                <div>
                  <h3 className="text-lg font-medium mb-4">Theme</h3>
                  <div className="grid grid-cols-2 gap-4">
                    <div
                      className={`p-4 rounded-lg cursor-pointer transition-all duration-300 ${
                        theme === "dark"
                          ? "bg-gray-800 border-2 border-green-500"
                          : "bg-gray-700 border-2 border-transparent hover:border-gray-600"
                      }`}
                      onClick={() => handleThemeChange("dark")}
                    >
                      <div className="flex justify-between items-center mb-3">
                        <span>Dark</span>
                        {theme === "dark" && <FaCheck className="text-green-500" />}
                      </div>
                      <div className="bg-gray-900 h-24 rounded-md flex items-center justify-center">
                        <FaMoon className="text-gray-400 text-2xl" />
                      </div>
                    </div>

                    <div
                      className={`p-4 rounded-lg cursor-pointer transition-all duration-300 ${
                        theme === "light"
                          ? "bg-white border-2 border-green-500 text-gray-800"
                          : "bg-gray-200 border-2 border-transparent hover:border-gray-400 text-gray-800"
                      }`}
                      onClick={() => handleThemeChange("light")}
                    >
                      <div className="flex justify-between items-center mb-3">
                        <span>Light</span>
                        {theme === "light" && <FaCheck className="text-green-500" />}
                      </div>
                      <div className="bg-white h-24 rounded-md flex items-center justify-center shadow-inner">
                        <FaSun className="text-amber-500 text-2xl" />
                      </div>
                    </div>
                  </div>
                </div>
              </div>
            </div>
          )}

          {activeTab === "language" && (
            <div>
              <h2 className="text-xl font-bold mb-6">Language</h2>
              <p className="text-gray-400">Language settings will be available soon.</p>
            </div>
          )}

          {activeTab === "notifications" && (
            <div>
              <h2 className="text-xl font-bold mb-6">Notifications</h2>
              <p className="text-gray-400">Notification settings will be available soon.</p>
            </div>
          )}

          {activeTab === "security" && (
            <div>
              <h2 className="text-xl font-bold mb-6">Security</h2>
              <p className="text-gray-400">Security settings will be available soon.</p>
            </div>
          )}

          {activeTab === "privacy" && (
            <div>
              <h2 className="text-xl font-bold mb-6">Privacy</h2>
              <p className="text-gray-400">Privacy settings will be available soon.</p>
            </div>
          )}

          {activeTab === "help" && (
            <div>
              <h2 className="text-xl font-bold mb-6">Help & Support</h2>
              <p className="text-gray-400">Help and support options will be available soon.</p>
            </div>
          )}
        </div>
      </div>
    </div>
  )
}

export default Settings

