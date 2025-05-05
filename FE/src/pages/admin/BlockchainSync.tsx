"use client"

import { useState } from "react"
import { RefreshCw, AlertCircle, CheckCircle, Clock, Database, List, ArrowRight } from "lucide-react"

const BlockchainSync = () => {
  const [syncStatus, setSyncStatus] = useState<"idle" | "loading" | "success" | "error">("idle")
  const [errorMessage, setErrorMessage] = useState("")
  const [lastSyncTime, setLastSyncTime] = useState<string | null>("2023-06-15T14:30:00Z")
  const [syncResults, setSyncResults] = useState<any | null>(null)

  // Handle sync
  const handleSync = async () => {
    setSyncStatus("loading")
    setErrorMessage("")

    try {
      // Simulate API call to sync blockchain data
      await new Promise((resolve) => setTimeout(resolve, 3000))

      // Generate mock sync results
      const results = {
        startTime: new Date().toISOString(),
        endTime: new Date(Date.now() + 3000).toISOString(),
        blocksProcessed: Math.floor(Math.random() * 1000) + 500,
        transactionsProcessed: Math.floor(Math.random() * 10000) + 1000,
        newUsers: Math.floor(Math.random() * 50),
        newNFTs: Math.floor(Math.random() * 100),
        errors: Math.random() > 0.8 ? ["Failed to process block #12345"] : [],
      }

      setSyncResults(results)
      setLastSyncTime(new Date().toISOString())
      setSyncStatus("success")
    } catch (error) {
      console.error("Error syncing blockchain data:", error)
      setSyncStatus("error")
      setErrorMessage("Failed to sync blockchain data. Please try again.")
    }
  }

  return (
    <div className="space-y-6">
      <div className="flex justify-between items-center">
        <h1 className="text-2xl font-bold text-gray-900 dark:text-white">Blockchain Synchronization</h1>
      </div>

      <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
        {/* Sync Control */}
        <div className="bg-white dark:bg-gray-800 shadow rounded-lg p-6">
          <h2 className="text-lg font-medium text-gray-900 dark:text-white mb-4">Sync Control</h2>
          <div className="space-y-4">
            <div className="flex items-center justify-between">
              <span className="text-sm text-gray-500 dark:text-gray-400">Last Sync:</span>
              <span className="text-sm font-medium text-gray-900 dark:text-white">
                {lastSyncTime ? new Date(lastSyncTime).toLocaleString() : "Never"}
              </span>
            </div>

            <div className="flex items-center justify-between">
              <span className="text-sm text-gray-500 dark:text-gray-400">Status:</span>
              <span className="text-sm font-medium">
                {syncStatus === "idle" && <span className="text-gray-500 dark:text-gray-400">Idle</span>}
                {syncStatus === "loading" && <span className="text-blue-500">Syncing...</span>}
                {syncStatus === "success" && <span className="text-green-500">Sync Completed</span>}
                {syncStatus === "error" && <span className="text-red-500">Sync Failed</span>}
              </span>
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

            <button
              onClick={handleSync}
              disabled={syncStatus === "loading"}
              className="w-full inline-flex justify-center items-center px-4 py-2 border border-transparent rounded-md shadow-sm text-sm font-medium text-white bg-emerald-600 hover:bg-emerald-700 focus:outline-none focus:ring-2 focus:ring-offset-2 focus:ring-emerald-500 disabled:opacity-50 disabled:cursor-not-allowed"
            >
              {syncStatus === "loading" ? (
                <>
                  <Clock className="h-5 w-5 mr-2 animate-spin" />
                  Syncing...
                </>
              ) : (
                <>
                  <RefreshCw className="h-5 w-5 mr-2" />
                  Force Sync Blockchain Data
                </>
              )}
            </button>

            <div className="bg-blue-50 dark:bg-blue-900/30 p-4 rounded-md">
              <div className="flex">
                <div className="flex-shrink-0">
                  <Database className="h-5 w-5 text-blue-400 dark:text-blue-500" aria-hidden="true" />
                </div>
                <div className="ml-3">
                  <h3 className="text-sm font-medium text-blue-800 dark:text-blue-300">Information</h3>
                  <div className="mt-2 text-sm text-blue-700 dark:text-blue-400">
                    <p>
                      Blockchain synchronization will fetch the latest data from the blockchain and update the platform
                      database. This process may take several minutes to complete.
                    </p>
                  </div>
                </div>
              </div>
            </div>
          </div>
        </div>

        {/* Sync Results */}
        <div className="bg-white dark:bg-gray-800 shadow rounded-lg p-6">
          <h2 className="text-lg font-medium text-gray-900 dark:text-white mb-4">Sync Results</h2>

          {syncStatus === "idle" && !syncResults ? (
            <div className="flex flex-col items-center justify-center h-64 text-gray-500 dark:text-gray-400">
              <Database className="h-12 w-12 mb-4" />
              <p className="text-center">No recent sync results</p>
              <p className="text-center text-sm mt-2">Click the sync button to start synchronization</p>
            </div>
          ) : syncStatus === "loading" ? (
            <div className="flex flex-col items-center justify-center h-64">
              <div className="animate-spin rounded-full h-12 w-12 border-t-2 border-b-2 border-emerald-500 mb-4"></div>
              <p className="text-center text-gray-700 dark:text-gray-300">Syncing blockchain data...</p>
              <p className="text-center text-sm text-gray-500 dark:text-gray-400 mt-2">This may take several minutes</p>
            </div>
          ) : syncStatus === "success" && syncResults ? (
            <div className="space-y-4">
              <div className="rounded-md bg-green-50 dark:bg-green-900/30 p-4 mb-4">
                <div className="flex">
                  <div className="flex-shrink-0">
                    <CheckCircle className="h-5 w-5 text-green-400 dark:text-green-500" aria-hidden="true" />
                  </div>
                  <div className="ml-3">
                    <h3 className="text-sm font-medium text-green-800 dark:text-green-300">
                      Synchronization completed successfully
                    </h3>
                  </div>
                </div>
              </div>

              <div className="bg-gray-50 dark:bg-gray-700 rounded-md p-4">
                <h3 className="text-sm font-medium text-gray-700 dark:text-gray-300 mb-2">Sync Details</h3>
                <div className="space-y-2">
                  <div className="flex justify-between">
                    <span className="text-sm text-gray-500 dark:text-gray-400">Start Time:</span>
                    <span className="text-sm text-gray-900 dark:text-white">
                      {new Date(syncResults.startTime).toLocaleString()}
                    </span>
                  </div>
                  <div className="flex justify-between">
                    <span className="text-sm text-gray-500 dark:text-gray-400">End Time:</span>
                    <span className="text-sm text-gray-900 dark:text-white">
                      {new Date(syncResults.endTime).toLocaleString()}
                    </span>
                  </div>
                  <div className="flex justify-between">
                    <span className="text-sm text-gray-500 dark:text-gray-400">Duration:</span>
                    <span className="text-sm text-gray-900 dark:text-white">
                      {Math.round(
                        (new Date(syncResults.endTime).getTime() - new Date(syncResults.startTime).getTime()) / 1000,
                      )}{" "}
                      seconds
                    </span>
                  </div>
                </div>
              </div>

              <div className="bg-gray-50 dark:bg-gray-700 rounded-md p-4">
                <h3 className="text-sm font-medium text-gray-700 dark:text-gray-300 mb-2">Processed Data</h3>
                <div className="grid grid-cols-2 gap-4">
                  <div className="bg-white dark:bg-gray-800 p-3 rounded-md">
                    <div className="flex items-center">
                      <Database className="h-5 w-5 text-emerald-500 mr-2" />
                      <span className="text-sm font-medium text-gray-900 dark:text-white">Blocks</span>
                    </div>
                    <p className="mt-2 text-2xl font-bold text-emerald-600 dark:text-emerald-500">
                      {syncResults.blocksProcessed.toLocaleString()}
                    </p>
                  </div>
                  <div className="bg-white dark:bg-gray-800 p-3 rounded-md">
                    <div className="flex items-center">
                      <ArrowRight className="h-5 w-5 text-blue-500 mr-2" />
                      <span className="text-sm font-medium text-gray-900 dark:text-white">Transactions</span>
                    </div>
                    <p className="mt-2 text-2xl font-bold text-blue-600 dark:text-blue-500">
                      {syncResults.transactionsProcessed.toLocaleString()}
                    </p>
                  </div>
                  <div className="bg-white dark:bg-gray-800 p-3 rounded-md">
                    <div className="flex items-center">
                      <List className="h-5 w-5 text-purple-500 mr-2" />
                      <span className="text-sm font-medium text-gray-900 dark:text-white">New Users</span>
                    </div>
                    <p className="mt-2 text-2xl font-bold text-purple-600 dark:text-purple-500">
                      {syncResults.newUsers.toLocaleString()}
                    </p>
                  </div>
                  <div className="bg-white dark:bg-gray-800 p-3 rounded-md">
                    <div className="flex items-center">
                      <List className="h-5 w-5 text-amber-500 mr-2" />
                      <span className="text-sm font-medium text-gray-900 dark:text-white">New NFTs</span>
                    </div>
                    <p className="mt-2 text-2xl font-bold text-amber-600 dark:text-amber-500">
                      {syncResults.newNFTs.toLocaleString()}
                    </p>
                  </div>
                </div>
              </div>

              {syncResults.errors.length > 0 && (
                <div className="bg-red-50 dark:bg-red-900/30 rounded-md p-4">
                  <h3 className="text-sm font-medium text-red-800 dark:text-red-300 mb-2">Errors</h3>
                  <ul className="list-disc pl-5 space-y-1">
                    {syncResults.errors.map((error: string, index: number) => (
                      <li key={index} className="text-sm text-red-700 dark:text-red-400">
                        {error}
                      </li>
                    ))}
                  </ul>
                </div>
              )}
            </div>
          ) : syncStatus === "error" ? (
            <div className="flex flex-col items-center justify-center h-64 text-red-500">
              <AlertCircle className="h-12 w-12 mb-4" />
              <p className="text-center">Synchronization failed</p>
              <p className="text-center text-sm mt-2">{errorMessage || "An error occurred during synchronization"}</p>
            </div>
          ) : null}
        </div>
      </div>

      {/* Sync History */}
      <div className="bg-white dark:bg-gray-800 shadow rounded-lg overflow-hidden">
        <div className="px-6 py-4 border-b border-gray-200 dark:border-gray-700">
          <h2 className="text-lg font-medium text-gray-900 dark:text-white">Sync History</h2>
        </div>
        <div className="overflow-x-auto">
          <table className="min-w-full divide-y divide-gray-200 dark:divide-gray-700">
            <thead className="bg-gray-50 dark:bg-gray-700">
              <tr>
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
                  Blocks
                </th>
                <th
                  scope="col"
                  className="px-6 py-3 text-left text-xs font-medium text-gray-500 dark:text-gray-400 uppercase tracking-wider"
                >
                  Transactions
                </th>
                <th
                  scope="col"
                  className="px-6 py-3 text-left text-xs font-medium text-gray-500 dark:text-gray-400 uppercase tracking-wider"
                >
                  Duration
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
              {syncResults && (
                <tr>
                  <td className="px-6 py-4 whitespace-nowrap text-sm text-gray-500 dark:text-gray-400">
                    {new Date(syncResults.startTime).toLocaleString()}
                  </td>
                  <td className="px-6 py-4 whitespace-nowrap text-sm text-gray-500 dark:text-gray-400">
                    {syncResults.blocksProcessed.toLocaleString()}
                  </td>
                  <td className="px-6 py-4 whitespace-nowrap text-sm text-gray-500 dark:text-gray-400">
                    {syncResults.transactionsProcessed.toLocaleString()}
                  </td>
                  <td className="px-6 py-4 whitespace-nowrap text-sm text-gray-500 dark:text-gray-400">
                    {Math.round(
                      (new Date(syncResults.endTime).getTime() - new Date(syncResults.startTime).getTime()) / 1000,
                    )}{" "}
                    seconds
                  </td>
                  <td className="px-6 py-4 whitespace-nowrap">
                    <span className="px-2 inline-flex text-xs leading-5 font-semibold rounded-full bg-green-100 text-green-800 dark:bg-green-900 dark:text-green-300">
                      Completed
                    </span>
                  </td>
                </tr>
              )}
              <tr>
                <td className="px-6 py-4 whitespace-nowrap text-sm text-gray-500 dark:text-gray-400">
                  2023-06-15 14:30:00
                </td>
                <td className="px-6 py-4 whitespace-nowrap text-sm text-gray-500 dark:text-gray-400">1,245</td>
                <td className="px-6 py-4 whitespace-nowrap text-sm text-gray-500 dark:text-gray-400">8,732</td>
                <td className="px-6 py-4 whitespace-nowrap text-sm text-gray-500 dark:text-gray-400">145 seconds</td>
                <td className="px-6 py-4 whitespace-nowrap">
                  <span className="px-2 inline-flex text-xs leading-5 font-semibold rounded-full bg-green-100 text-green-800 dark:bg-green-900 dark:text-green-300">
                    Completed
                  </span>
                </td>
              </tr>
              <tr>
                <td className="px-6 py-4 whitespace-nowrap text-sm text-gray-500 dark:text-gray-400">
                  2023-06-14 10:15:00
                </td>
                <td className="px-6 py-4 whitespace-nowrap text-sm text-gray-500 dark:text-gray-400">987</td>
                <td className="px-6 py-4 whitespace-nowrap text-sm text-gray-500 dark:text-gray-400">5,421</td>
                <td className="px-6 py-4 whitespace-nowrap text-sm text-gray-500 dark:text-gray-400">98 seconds</td>
                <td className="px-6 py-4 whitespace-nowrap">
                  <span className="px-2 inline-flex text-xs leading-5 font-semibold rounded-full bg-green-100 text-green-800 dark:bg-green-900 dark:text-green-300">
                    Completed
                  </span>
                </td>
              </tr>
              <tr>
                <td className="px-6 py-4 whitespace-nowrap text-sm text-gray-500 dark:text-gray-400">
                  2023-06-13 18:45:00
                </td>
                <td className="px-6 py-4 whitespace-nowrap text-sm text-gray-500 dark:text-gray-400">1,102</td>
                <td className="px-6 py-4 whitespace-nowrap text-sm text-gray-500 dark:text-gray-400">7,845</td>
                <td className="px-6 py-4 whitespace-nowrap text-sm text-gray-500 dark:text-gray-400">132 seconds</td>
                <td className="px-6 py-4 whitespace-nowrap">
                  <span className="px-2 inline-flex text-xs leading-5 font-semibold rounded-full bg-red-100 text-red-800 dark:bg-red-900 dark:text-red-300">
                    Failed
                  </span>
                </td>
              </tr>
            </tbody>
          </table>
        </div>
      </div>
    </div>
  )
}

export default BlockchainSync
