"use client"

import { useState } from "react"
import { Shield, AlertCircle } from "lucide-react"

const AdminLogin = () => {
  const [walletAddress, setWalletAddress] = useState("")
  const [error, setError] = useState("")
  const [loading, setLoading] = useState(false)

  const connectWallet = async () => {
    setLoading(true)
    setError("")

    try {
      // In a real app, you would connect to the user's wallet
      // For demo purposes, we'll just simulate a connection
      setTimeout(() => {
        if (typeof window !== "undefined" && window.ethereum) {
          window.ethereum
            .request({ method: "eth_requestAccounts" })
            .then((accounts: string[]) => {
              if (accounts.length > 0) {
                setWalletAddress(accounts[0])
                // Redirect would happen automatically via the router
                window.location.href = "/admin"
              } else {
                setError("No accounts found. Please create an account in your wallet.")
              }
              setLoading(false)
            })
            .catch((err: Error) => {
              console.error("Error connecting wallet:", err)
              setError(err.message || "Failed to connect wallet. Please try again.")
              setLoading(false)
            })
        } else {
          setError("No Ethereum wallet detected. Please install a wallet extension.")
          setLoading(false)
        }
      }, 1000)
    } catch (err: any) {
      console.error("Error connecting wallet:", err)
      setError(err.message || "Failed to connect wallet. Please try again.")
      setLoading(false)
    }
  }

  return (
    <div className="min-h-screen w-screen flex items-center justify-center bg-gray-100 dark:bg-gray-900 p-4">
      <div className="max-w-md w-full bg-white dark:bg-gray-800 rounded-lg shadow-lg p-8">
        <div className="text-center mb-8">
          <div className="inline-flex items-center justify-center w-16 h-16 rounded-full bg-emerald-100 dark:bg-emerald-900 text-emerald-600 dark:text-emerald-300 mb-4">
            <Shield size={32} />
          </div>
          <h1 className="text-2xl font-bold text-gray-900 dark:text-white">Admin Access</h1>
          <p className="text-gray-600 dark:text-gray-400 mt-2">Connect your wallet to access the admin dashboard</p>
        </div>

        {error && (
          <div className="mb-6 p-4 bg-red-50 dark:bg-red-900/30 border border-red-200 dark:border-red-800 rounded-lg flex items-start">
            <AlertCircle className="text-red-500 mr-2 flex-shrink-0 mt-0.5" size={16} />
            <p className="text-red-600 dark:text-red-400 text-sm">{error}</p>
          </div>
        )}

        <button
          onClick={connectWallet}
          disabled={loading}
          className="w-full py-3 px-4 bg-emerald-600 hover:bg-emerald-700 text-white rounded-lg font-medium transition-colors focus:outline-none focus:ring-2 focus:ring-emerald-500 focus:ring-offset-2 dark:focus:ring-offset-gray-800 disabled:opacity-50 disabled:cursor-not-allowed"
        >
          {loading ? "Connecting..." : "Connect Wallet"}
        </button>

        <p className="text-xs text-gray-500 dark:text-gray-400 text-center mt-6">
          Only authorized admin wallets can access this dashboard
        </p>
      </div>
    </div>
  )
}

export default AdminLogin
