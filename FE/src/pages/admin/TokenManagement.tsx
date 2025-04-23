"use client"

import type React from "react"

import { useState } from "react"
import { Send, AlertCircle, CheckCircle, Clock, ArrowRight } from "lucide-react"

const TokenManagement = () => {
  const [walletAddress, setWalletAddress] = useState("")
  const [tokenAmount, setTokenAmount] = useState("")
  const [isSubmitting, setIsSubmitting] = useState(false)
  const [transactionStatus, setTransactionStatus] = useState<"idle" | "loading" | "success" | "error">("idle")
  const [transactionHash, setTransactionHash] = useState("")
  const [errorMessage, setErrorMessage] = useState("")

  // Handle form submission
  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault()

    // Validate inputs
    if (!walletAddress || !tokenAmount) {
      setErrorMessage("Please fill in all fields")
      return
    }

    if (!/^0x[a-fA-F0-9]{40}$/.test(walletAddress)) {
      setErrorMessage("Invalid wallet address format")
      return
    }

    const amount = Number.parseFloat(tokenAmount)
    if (isNaN(amount) || amount <= 0) {
      setErrorMessage("Token amount must be a positive number")
      return
    }

    // Reset error message
    setErrorMessage("")
    setTransactionStatus("loading")
    setIsSubmitting(true)

    try {
      // Simulate API call to mint tokens
      await new Promise((resolve) => setTimeout(resolve, 2000))

      // Generate a fake transaction hash
      const hash = "0x" + Array.from({ length: 64 }, () => Math.floor(Math.random() * 16).toString(16)).join("")
      setTransactionHash(hash)
      setTransactionStatus("success")
    } catch (error) {
      console.error("Error minting tokens:", error)
      setTransactionStatus("error")
      setErrorMessage("Failed to mint tokens. Please try again.")
    } finally {
      setIsSubmitting(false)
    }
  }

  // Reset form
  const resetForm = () => {
    setWalletAddress("")
    setTokenAmount("")
    setTransactionStatus("idle")
    setTransactionHash("")
    setErrorMessage("")
  }

  return (
    <div className="space-y-6">
      <div className="flex justify-between items-center">
        <h1 className="text-2xl font-bold text-gray-900 dark:text-white">Token Management</h1>
      </div>

      <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
        {/* Mint Token Form */}
        <div className="bg-white dark:bg-gray-800 shadow rounded-lg p-6">
          <h2 className="text-lg font-medium text-gray-900 dark:text-white mb-4">Mint DX Tokens</h2>
          <form onSubmit={handleSubmit}>
            <div className="space-y-4">
              <div>
                <label htmlFor="walletAddress" className="block text-sm font-medium text-gray-700 dark:text-gray-300">
                  Recipient Wallet Address
                </label>
                <input
                  type="text"
                  name="walletAddress"
                  id="walletAddress"
                  className="mt-1 block w-full border border-gray-300 dark:border-gray-700 rounded-md shadow-sm py-2 px-3 focus:outline-none focus:ring-emerald-500 focus:border-emerald-500 sm:text-sm bg-white dark:bg-gray-800 text-gray-900 dark:text-white"
                  placeholder="0x..."
                  value={walletAddress}
                  onChange={(e) => setWalletAddress(e.target.value)}
                  disabled={isSubmitting || transactionStatus === "success"}
                />
              </div>
              <div>
                <label htmlFor="tokenAmount" className="block text-sm font-medium text-gray-700 dark:text-gray-300">
                  Token Amount
                </label>
                <div className="mt-1 relative rounded-md shadow-sm">
                  <input
                    type="number"
                    name="tokenAmount"
                    id="tokenAmount"
                    className="block w-full border border-gray-300 dark:border-gray-700 rounded-md shadow-sm py-2 px-3 focus:outline-none focus:ring-emerald-500 focus:border-emerald-500 sm:text-sm bg-white dark:bg-gray-800 text-gray-900 dark:text-white"
                    placeholder="0.00"
                    value={tokenAmount}
                    onChange={(e) => setTokenAmount(e.target.value)}
                    disabled={isSubmitting || transactionStatus === "success"}
                  />
                  <div className="absolute inset-y-0 right-0 pr-3 flex items-center pointer-events-none">
                    <span className="text-gray-500 dark:text-gray-400 sm:text-sm">DX</span>
                  </div>
                </div>
              </div>

              {errorMessage && (
                <div className="rounded-md bg-red-50 dark:bg-red-900/30 p-4">
                  <div className="flex">
                    <div className="flex-shrink-0">
                      <AlertCircle className="h-5 w-5 text-red-400 dark:text-red-500" aria-hidden="true" />
                    </div>
                    <div className="ml-3">
                      <h3 className="text-sm font-medium text-red-800 dark:text-red-300">{errorMessage}</h3>
                    </div>
                  </div>
                </div>
              )}

              <div className="flex justify-end">
                {transactionStatus === "success" ? (
                  <button
                    type="button"
                    onClick={resetForm}
                    className="inline-flex items-center px-4 py-2 border border-transparent rounded-md shadow-sm text-sm font-medium text-white bg-emerald-600 hover:bg-emerald-700 focus:outline-none focus:ring-2 focus:ring-offset-2 focus:ring-emerald-500"
                  >
                    Mint More Tokens
                  </button>
                ) : (
                  <button
                    type="submit"
                    disabled={isSubmitting}
                    className="inline-flex items-center px-4 py-2 border border-transparent rounded-md shadow-sm text-sm font-medium text-white bg-emerald-600 hover:bg-emerald-700 focus:outline-none focus:ring-2 focus:ring-offset-2 focus:ring-emerald-500 disabled:opacity-50 disabled:cursor-not-allowed"
                  >
                    {isSubmitting ? (
                      <>
                        <Clock className="h-4 w-4 mr-2 animate-spin" />
                        Processing...
                      </>
                    ) : (
                      <>
                        <Send className="h-4 w-4 mr-2" />
                        Mint Tokens
                      </>
                    )}
                  </button>
                )}
              </div>
            </div>
          </form>
        </div>

        {/* Transaction Status */}
        <div className="bg-white dark:bg-gray-800 shadow rounded-lg p-6">
          <h2 className="text-lg font-medium text-gray-900 dark:text-white mb-4">Transaction Status</h2>

          {transactionStatus === "idle" ? (
            <div className="flex flex-col items-center justify-center h-64 text-gray-500 dark:text-gray-400">
              <Clock className="h-12 w-12 mb-4" />
              <p className="text-center">No recent transactions</p>
              <p className="text-center text-sm mt-2">Fill out the form to mint tokens</p>
            </div>
          ) : transactionStatus === "loading" ? (
            <div className="flex flex-col items-center justify-center h-64">
              <div className="animate-spin rounded-full h-12 w-12 border-t-2 border-b-2 border-emerald-500 mb-4"></div>
              <p className="text-center text-gray-700 dark:text-gray-300">Processing transaction...</p>
              <p className="text-center text-sm text-gray-500 dark:text-gray-400 mt-2">This may take a few moments</p>
            </div>
          ) : transactionStatus === "success" ? (
            <div className="rounded-md bg-green-50 dark:bg-green-900/30 p-4 mb-4">
              <div className="flex">
                <div className="flex-shrink-0">
                  <CheckCircle className="h-5 w-5 text-green-400 dark:text-green-500" aria-hidden="true" />
                </div>
                <div className="ml-3">
                  <h3 className="text-sm font-medium text-green-800 dark:text-green-300">Transaction successful</h3>
                  <div className="mt-2 text-sm text-green-700 dark:text-green-400">
                    <p>
                      {tokenAmount} DX tokens have been minted and sent to {walletAddress.substring(0, 6)}...
                      {walletAddress.substring(walletAddress.length - 4)}
                    </p>
                  </div>
                </div>
              </div>
            </div>
          ) : (
            <div className="rounded-md bg-red-50 dark:bg-red-900/30 p-4 mb-4">
              <div className="flex">
                <div className="flex-shrink-0">
                  <AlertCircle className="h-5 w-5 text-red-400 dark:text-red-500" aria-hidden="true" />
                </div>
                <div className="ml-3">
                  <h3 className="text-sm font-medium text-red-800 dark:text-red-300">Transaction failed</h3>
                  <div className="mt-2 text-sm text-red-700 dark:text-red-400">
                    <p>{errorMessage || "An error occurred while processing your transaction."}</p>
                  </div>
                </div>
              </div>
            </div>
          )}

          {transactionStatus === "success" && (
            <div className="mt-4">
              <h3 className="text-sm font-medium text-gray-700 dark:text-gray-300 mb-2">Transaction Details</h3>
              <div className="bg-gray-50 dark:bg-gray-700 rounded-md p-4">
                <div className="flex justify-between items-center mb-2">
                  <span className="text-sm text-gray-500 dark:text-gray-400">Amount:</span>
                  <span className="text-sm font-medium text-gray-900 dark:text-white">{tokenAmount} DX</span>
                </div>
                <div className="flex justify-between items-center mb-2">
                  <span className="text-sm text-gray-500 dark:text-gray-400">Recipient:</span>
                  <span className="text-sm font-medium text-gray-900 dark:text-white">
                    {walletAddress.substring(0, 6)}...{walletAddress.substring(walletAddress.length - 4)}
                  </span>
                </div>
                <div className="flex justify-between items-center mb-2">
                  <span className="text-sm text-gray-500 dark:text-gray-400">Transaction Hash:</span>
                  <span className="text-sm font-medium text-gray-900 dark:text-white">
                    {transactionHash.substring(0, 6)}...{transactionHash.substring(transactionHash.length - 4)}
                  </span>
                </div>
                <div className="flex justify-between items-center">
                  <span className="text-sm text-gray-500 dark:text-gray-400">Status:</span>
                  <span className="inline-flex items-center px-2.5 py-0.5 rounded-full text-xs font-medium bg-green-100 text-green-800 dark:bg-green-900 dark:text-green-300">
                    Confirmed
                  </span>
                </div>
              </div>
              <div className="mt-4">
                <a
                  href={`https://etherscan.io/tx/${transactionHash}`}
                  target="_blank"
                  rel="noopener noreferrer"
                  className="inline-flex items-center text-sm text-emerald-600 dark:text-emerald-500 hover:text-emerald-500 dark:hover:text-emerald-400"
                >
                  View on Etherscan
                  <ArrowRight className="ml-1 h-4 w-4" />
                </a>
              </div>
            </div>
          )}
        </div>
      </div>

      {/* Token Information */}
      <div className="bg-white dark:bg-gray-800 shadow rounded-lg p-6">
        <h2 className="text-lg font-medium text-gray-900 dark:text-white mb-4">Token Information</h2>
        <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
          <div className="bg-gray-50 dark:bg-gray-700 rounded-lg p-4">
            <h3 className="text-sm font-medium text-gray-500 dark:text-gray-400 mb-2">Token Name</h3>
            <p className="text-lg font-bold text-gray-900 dark:text-white">DigiX Token (DX)</p>
          </div>
          <div className="bg-gray-50 dark:bg-gray-700 rounded-lg p-4">
            <h3 className="text-sm font-medium text-gray-500 dark:text-gray-400 mb-2">Contract Address</h3>
            <p className="text-lg font-bold text-gray-900 dark:text-white">0x1a2b...3c4d</p>
          </div>
          <div className="bg-gray-50 dark:bg-gray-700 rounded-lg p-4">
            <h3 className="text-sm font-medium text-gray-500 dark:text-gray-400 mb-2">Total Supply</h3>
            <p className="text-lg font-bold text-gray-900 dark:text-white">1,000,000,000 DX</p>
          </div>
        </div>
      </div>

      {/* Recent Transactions */}
      <div className="bg-white dark:bg-gray-800 shadow rounded-lg overflow-hidden">
        <div className="px-6 py-4 border-b border-gray-200 dark:border-gray-700">
          <h2 className="text-lg font-medium text-gray-900 dark:text-white">Recent Transactions</h2>
        </div>
        <div className="overflow-x-auto">
          <table className="min-w-full divide-y divide-gray-200 dark:divide-gray-700">
            <thead className="bg-gray-50 dark:bg-gray-700">
              <tr>
                <th
                  scope="col"
                  className="px-6 py-3 text-left text-xs font-medium text-gray-500 dark:text-gray-400 uppercase tracking-wider"
                >
                  Transaction Hash
                </th>
                <th
                  scope="col"
                  className="px-6 py-3 text-left text-xs font-medium text-gray-500 dark:text-gray-400 uppercase tracking-wider"
                >
                  Recipient
                </th>
                <th
                  scope="col"
                  className="px-6 py-3 text-left text-xs font-medium text-gray-500 dark:text-gray-400 uppercase tracking-wider"
                >
                  Amount
                </th>
                <th
                  scope="col"
                  className="px-6 py-3 text-left text-xs font-medium text-gray-500 dark:text-gray-400 uppercase tracking-wider"
                >
                  Date
                </th>
                <th
                  scope="col"
                  className="px-6 py-3 text-left text-xs font-medium text-gray-500 dark:text-gray-400 uppercase tracking-wider"
                >
                  Status
                </th>
              </tr>
            </thead>
            <tbody className="bg-white dark:bg-gray-800 divide-y divide-gray-200 dark:divide-gray-700">
              {transactionStatus === "success" ? (
                <tr>
                  <td className="px-6 py-4 whitespace-nowrap text-sm text-gray-500 dark:text-gray-400">
                    <a
                      href={`https://etherscan.io/tx/${transactionHash}`}
                      target="_blank"
                      rel="noopener noreferrer"
                      className="text-emerald-600 dark:text-emerald-500 hover:text-emerald-500 dark:hover:text-emerald-400"
                    >
                      {transactionHash.substring(0, 6)}...{transactionHash.substring(transactionHash.length - 4)}
                    </a>
                  </td>
                  <td className="px-6 py-4 whitespace-nowrap text-sm text-gray-500 dark:text-gray-400">
                    {walletAddress.substring(0, 6)}...{walletAddress.substring(walletAddress.length - 4)}
                  </td>
                  <td className="px-6 py-4 whitespace-nowrap text-sm text-gray-500 dark:text-gray-400">
                    {tokenAmount} DX
                  </td>
                  <td className="px-6 py-4 whitespace-nowrap text-sm text-gray-500 dark:text-gray-400">
                    {new Date().toLocaleString()}
                  </td>
                  <td className="px-6 py-4 whitespace-nowrap">
                    <span className="inline-flex items-center px-2.5 py-0.5 rounded-full text-xs font-medium bg-green-100 text-green-800 dark:bg-green-900 dark:text-green-300">
                      Confirmed
                    </span>
                  </td>
                </tr>
              ) : (
                <tr>
                  <td
                    colSpan={5}
                    className="px-6 py-4 whitespace-nowrap text-sm text-gray-500 dark:text-gray-400 text-center"
                  >
                    No recent transactions
                  </td>
                </tr>
              )}
            </tbody>
          </table>
        </div>
      </div>
    </div>
  )
}

export default TokenManagement
