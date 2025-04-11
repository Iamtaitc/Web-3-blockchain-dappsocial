"use client"

import type React from "react"

import { useState } from "react"
import { Save, AlertCircle, CheckCircle, Info, Plus, Trash2 } from "lucide-react"

// Mock configuration data
const mockConfig = {
  platformName: "DigiX",
  platformDescription: "Web3 Social Platform and NFT Marketplace",
  tokenContractAddress: "0x1a2b3c4d5e6f7g8h9i0j1k2l3m4n5o6p7q8r9s0t",
  nftContractAddress: "0xa1b2c3d4e5f6g7h8i9j0k1l2m3n4o5p6q7r8s9t0",
  adminAddresses: ["0x7F3c4D5e6F7g8H9i0J1k2L3m4N5o6P7q8R9s0T", "0x1A2b3C4d5E6f7G8h9I0j1K2l3M4n5O6p7Q8r9"],
  maxUploadSize: 10, // in MB
  maxNFTsPerUser: 50,
  maxPostsPerDay: 20,
  referralReward: 100, // in tokens
  dailyLoginReward: 10, // in tokens
  maintenanceMode: false,
  enableEmailNotifications: true,
  enablePushNotifications: true,
  enableSocialSharing: true,
  enableNFTMarketplace: true,
  enableTokenSwap: false,
  enableGovernance: false,
}

const SystemConfiguration = () => {
  const [config, setConfig] = useState(mockConfig)
  const [isSubmitting, setIsSubmitting] = useState(false)
  const [configStatus, setConfigStatus] = useState<"idle" | "loading" | "success" | "error">("idle")
  const [errorMessage, setErrorMessage] = useState("")
  const [newAdminAddress, setNewAdminAddress] = useState("")

  // Handle form submission
  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault()

    // Validate inputs
    if (!config.platformName || !config.tokenContractAddress || !config.nftContractAddress) {
      setErrorMessage("Please fill in all required fields")
      return
    }

    if (config.adminAddresses.length === 0) {
      setErrorMessage("At least one admin address is required")
      return
    }

    // Reset error message
    setErrorMessage("")
    setConfigStatus("loading")
    setIsSubmitting(true)

    try {
      // Simulate API call to update configuration
      await new Promise((resolve) => setTimeout(resolve, 2000))
      setConfigStatus("success")
    } catch (error) {
      console.error("Error updating configuration:", error)
      setConfigStatus("error")
      setErrorMessage("Failed to update configuration. Please try again.")
    } finally {
      setIsSubmitting(false)
    }
  }

  // Handle input change
  const handleInputChange = (e: React.ChangeEvent<HTMLInputElement | HTMLTextAreaElement | HTMLSelectElement>) => {
    const { name, value, type } = e.target

    // Handle checkboxes
    if (type === "checkbox") {
      const checkbox = e.target as HTMLInputElement
      setConfig({
        ...config,
        [name]: checkbox.checked,
      })
    } else if (type === "number") {
      setConfig({
        ...config,
        [name]: Number(value),
      })
    } else {
      setConfig({
        ...config,
        [name]: value,
      })
    }
  }

  // Add admin address
  const handleAddAdmin = () => {
    if (!newAdminAddress) {
      setErrorMessage("Please enter an admin address")
      return
    }

    if (!/^0x[a-fA-F0-9]{40}$/.test(newAdminAddress)) {
      setErrorMessage("Invalid wallet address format")
      return
    }

    if (config.adminAddresses.includes(newAdminAddress)) {
      setErrorMessage("This address is already an admin")
      return
    }

    setConfig({
      ...config,
      adminAddresses: [...config.adminAddresses, newAdminAddress],
    })
    setNewAdminAddress("")
    setErrorMessage("")
  }

  // Remove admin address
  const handleRemoveAdmin = (address: string) => {
    if (config.adminAddresses.length <= 1) {
      setErrorMessage("At least one admin address is required")
      return
    }

    setConfig({
      ...config,
      adminAddresses: config.adminAddresses.filter((addr) => addr !== address),
    })
  }

  return (
    <div className="space-y-6">
      <div className="flex justify-between items-center">
        <h1 className="text-2xl font-bold text-gray-900 dark:text-white">System Configuration</h1>
      </div>

      <div className="bg-white dark:bg-gray-800 shadow rounded-lg overflow-hidden">
        <div className="px-6 py-4 border-b border-gray-200 dark:border-gray-700">
          <h2 className="text-lg font-medium text-gray-900 dark:text-white">Platform Settings</h2>
        </div>
        <form onSubmit={handleSubmit}>
          <div className="p-6 space-y-6">
            {/* Platform Information */}
            <div>
              <h3 className="text-base font-medium text-gray-900 dark:text-white mb-4">Platform Information</h3>
              <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
                <div>
                  <label htmlFor="platformName" className="block text-sm font-medium text-gray-700 dark:text-gray-300">
                    Platform Name <span className="text-red-500">*</span>
                  </label>
                  <input
                    type="text"
                    name="platformName"
                    id="platformName"
                    className="mt-1 block w-full border border-gray-300 dark:border-gray-700 rounded-md shadow-sm py-2 px-3 focus:outline-none focus:ring-emerald-500 focus:border-emerald-500 sm:text-sm bg-white dark:bg-gray-800 text-gray-900 dark:text-white"
                    value={config.platformName}
                    onChange={handleInputChange}
                    required
                  />
                </div>
                <div>
                  <label
                    htmlFor="platformDescription"
                    className="block text-sm font-medium text-gray-700 dark:text-gray-300"
                  >
                    Platform Description
                  </label>
                  <input
                    type="text"
                    name="platformDescription"
                    id="platformDescription"
                    className="mt-1 block w-full border border-gray-300 dark:border-gray-700 rounded-md shadow-sm py-2 px-3 focus:outline-none focus:ring-emerald-500 focus:border-emerald-500 sm:text-sm bg-white dark:bg-gray-800 text-gray-900 dark:text-white"
                    value={config.platformDescription}
                    onChange={handleInputChange}
                  />
                </div>
              </div>
            </div>

            {/* Contract Addresses */}
            <div>
              <h3 className="text-base font-medium text-gray-900 dark:text-white mb-4">Contract Addresses</h3>
              <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
                <div>
                  <label
                    htmlFor="tokenContractAddress"
                    className="block text-sm font-medium text-gray-700 dark:text-gray-300"
                  >
                    Token Contract Address <span className="text-red-500">*</span>
                  </label>
                  <input
                    type="text"
                    name="tokenContractAddress"
                    id="tokenContractAddress"
                    className="mt-1 block w-full border border-gray-300 dark:border-gray-700 rounded-md shadow-sm py-2 px-3 focus:outline-none focus:ring-emerald-500 focus:border-emerald-500 sm:text-sm bg-white dark:bg-gray-800 text-gray-900 dark:text-white"
                    value={config.tokenContractAddress}
                    onChange={handleInputChange}
                    required
                  />
                </div>
                <div>
                  <label
                    htmlFor="nftContractAddress"
                    className="block text-sm font-medium text-gray-700 dark:text-gray-300"
                  >
                    NFT Contract Address <span className="text-red-500">*</span>
                  </label>
                  <input
                    type="text"
                    name="nftContractAddress"
                    id="nftContractAddress"
                    className="mt-1 block w-full border border-gray-300 dark:border-gray-700 rounded-md shadow-sm py-2 px-3 focus:outline-none focus:ring-emerald-500 focus:border-emerald-500 sm:text-sm bg-white dark:bg-gray-800 text-gray-900 dark:text-white"
                    value={config.nftContractAddress}
                    onChange={handleInputChange}
                    required
                  />
                </div>
              </div>
            </div>

            {/* Admin Addresses */}
            <div>
              <h3 className="text-base font-medium text-gray-900 dark:text-white mb-4">Admin Addresses</h3>
              <div className="space-y-4">
                <div className="flex items-end space-x-2">
                  <div className="flex-grow">
                    <label
                      htmlFor="newAdminAddress"
                      className="block text-sm font-medium text-gray-700 dark:text-gray-300"
                    >
                      Add Admin Address
                    </label>
                    <input
                      type="text"
                      name="newAdminAddress"
                      id="newAdminAddress"
                      className="mt-1 block w-full border border-gray-300 dark:border-gray-700 rounded-md shadow-sm py-2 px-3 focus:outline-none focus:ring-emerald-500 focus:border-emerald-500 sm:text-sm bg-white dark:bg-gray-800 text-gray-900 dark:text-white"
                      placeholder="0x..."
                      value={newAdminAddress}
                      onChange={(e) => setNewAdminAddress(e.target.value)}
                    />
                  </div>
                  <button
                    type="button"
                    onClick={handleAddAdmin}
                    className="inline-flex items-center px-4 py-2 border border-transparent rounded-md shadow-sm text-sm font-medium text-white bg-emerald-600 hover:bg-emerald-700 focus:outline-none focus:ring-2 focus:ring-offset-2 focus:ring-emerald-500"
                  >
                    <Plus className="h-4 w-4 mr-2" />
                    Add
                  </button>
                </div>

                <div className="bg-gray-50 dark:bg-gray-700 rounded-md p-4">
                  <h4 className="text-sm font-medium text-gray-700 dark:text-gray-300 mb-2">Current Admin Addresses</h4>
                  <ul className="space-y-2">
                    {config.adminAddresses.map((address) => (
                      <li key={address} className="flex items-center justify-between">
                        <span className="text-sm text-gray-900 dark:text-white">{address}</span>
                        <button
                          type="button"
                          onClick={() => handleRemoveAdmin(address)}
                          className="text-red-600 dark:text-red-500 hover:text-red-900 dark:hover:text-red-400"
                        >
                          <Trash2 className="h-4 w-4" />
                        </button>
                      </li>
                    ))}
                  </ul>
                </div>
              </div>
            </div>

            {/* Platform Limits */}
            <div>
              <h3 className="text-base font-medium text-gray-900 dark:text-white mb-4">Platform Limits</h3>
              <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
                <div>
                  <label htmlFor="maxUploadSize" className="block text-sm font-medium text-gray-700 dark:text-gray-300">
                    Max Upload Size (MB)
                  </label>
                  <input
                    type="number"
                    name="maxUploadSize"
                    id="maxUploadSize"
                    min="1"
                    max="100"
                    className="mt-1 block w-full border border-gray-300 dark:border-gray-700 rounded-md shadow-sm py-2 px-3 focus:outline-none focus:ring-emerald-500 focus:border-emerald-500 sm:text-sm bg-white dark:bg-gray-800 text-gray-900 dark:text-white"
                    value={config.maxUploadSize}
                    onChange={handleInputChange}
                  />
                </div>
                <div>
                  <label
                    htmlFor="maxNFTsPerUser"
                    className="block text-sm font-medium text-gray-700 dark:text-gray-300"
                  >
                    Max NFTs Per User
                  </label>
                  <input
                    type="number"
                    name="maxNFTsPerUser"
                    id="maxNFTsPerUser"
                    min="1"
                    className="mt-1 block w-full border border-gray-300 dark:border-gray-700 rounded-md shadow-sm py-2 px-3 focus:outline-none focus:ring-emerald-500 focus:border-emerald-500 sm:text-sm bg-white dark:bg-gray-800 text-gray-900 dark:text-white"
                    value={config.maxNFTsPerUser}
                    onChange={handleInputChange}
                  />
                </div>
                <div>
                  <label
                    htmlFor="maxPostsPerDay"
                    className="block text-sm font-medium text-gray-700 dark:text-gray-300"
                  >
                    Max Posts Per Day
                  </label>
                  <input
                    type="number"
                    name="maxPostsPerDay"
                    id="maxPostsPerDay"
                    min="1"
                    className="mt-1 block w-full border border-gray-300 dark:border-gray-700 rounded-md shadow-sm py-2 px-3 focus:outline-none focus:ring-emerald-500 focus:border-emerald-500 sm:text-sm bg-white dark:bg-gray-800 text-gray-900 dark:text-white"
                    value={config.maxPostsPerDay}
                    onChange={handleInputChange}
                  />
                </div>
              </div>
            </div>

            {/* Rewards */}
            <div>
              <h3 className="text-base font-medium text-gray-900 dark:text-white mb-4">Rewards</h3>
              <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
                <div>
                  <label
                    htmlFor="referralReward"
                    className="block text-sm font-medium text-gray-700 dark:text-gray-300"
                  >
                    Referral Reward (DX)
                  </label>
                  <input
                    type="number"
                    name="referralReward"
                    id="referralReward"
                    min="0"
                    className="mt-1 block w-full border border-gray-300 dark:border-gray-700 rounded-md shadow-sm py-2 px-3 focus:outline-none focus:ring-emerald-500 focus:border-emerald-500 sm:text-sm bg-white dark:bg-gray-800 text-gray-900 dark:text-white"
                    value={config.referralReward}
                    onChange={handleInputChange}
                  />
                </div>
                <div>
                  <label
                    htmlFor="dailyLoginReward"
                    className="block text-sm font-medium text-gray-700 dark:text-gray-300"
                  >
                    Daily Login Reward (DX)
                  </label>
                  <input
                    type="number"
                    name="dailyLoginReward"
                    id="dailyLoginReward"
                    min="0"
                    className="mt-1 block w-full border border-gray-300 dark:border-gray-700 rounded-md shadow-sm py-2 px-3 focus:outline-none focus:ring-emerald-500 focus:border-emerald-500 sm:text-sm bg-white dark:bg-gray-800 text-gray-900 dark:text-white"
                    value={config.dailyLoginReward}
                    onChange={handleInputChange}
                  />
                </div>
              </div>
            </div>

            {/* Feature Toggles */}
            <div>
              <h3 className="text-base font-medium text-gray-900 dark:text-white mb-4">Feature Toggles</h3>
              <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
                <div className="flex items-center">
                  <input
                    type="checkbox"
                    name="maintenanceMode"
                    id="maintenanceMode"
                    className="h-4 w-4 text-emerald-600 focus:ring-emerald-500 border-gray-300 dark:border-gray-700 rounded"
                    checked={config.maintenanceMode}
                    onChange={(e) => setConfig({ ...config, maintenanceMode: e.target.checked })}
                  />
                  <label htmlFor="maintenanceMode" className="ml-2 block text-sm text-gray-900 dark:text-white">
                    Maintenance Mode
                  </label>
                </div>
                <div className="flex items-center">
                  <input
                    type="checkbox"
                    name="enableEmailNotifications"
                    id="enableEmailNotifications"
                    className="h-4 w-4 text-emerald-600 focus:ring-emerald-500 border-gray-300 dark:border-gray-700 rounded"
                    checked={config.enableEmailNotifications}
                    onChange={(e) => setConfig({ ...config, enableEmailNotifications: e.target.checked })}
                  />
                  <label
                    htmlFor="enableEmailNotifications"
                    className="ml-2 block text-sm text-gray-900 dark:text-white"
                  >
                    Enable Email Notifications
                  </label>
                </div>
                <div className="flex items-center">
                  <input
                    type="checkbox"
                    name="enablePushNotifications"
                    id="enablePushNotifications"
                    className="h-4 w-4 text-emerald-600 focus:ring-emerald-500 border-gray-300 dark:border-gray-700 rounded"
                    checked={config.enablePushNotifications}
                    onChange={(e) => setConfig({ ...config, enablePushNotifications: e.target.checked })}
                  />
                  <label htmlFor="enablePushNotifications" className="ml-2 block text-sm text-gray-900 dark:text-white">
                    Enable Push Notifications
                  </label>
                </div>
                <div className="flex items-center">
                  <input
                    type="checkbox"
                    name="enableSocialSharing"
                    id="enableSocialSharing"
                    className="h-4 w-4 text-emerald-600 focus:ring-emerald-500 border-gray-300 dark:border-gray-700 rounded"
                    checked={config.enableSocialSharing}
                    onChange={(e) => setConfig({ ...config, enableSocialSharing: e.target.checked })}
                  />
                  <label htmlFor="enableSocialSharing" className="ml-2 block text-sm text-gray-900 dark:text-white">
                    Enable Social Sharing
                  </label>
                </div>
                <div className="flex items-center">
                  <input
                    type="checkbox"
                    name="enableNFTMarketplace"
                    id="enableNFTMarketplace"
                    className="h-4 w-4 text-emerald-600 focus:ring-emerald-500 border-gray-300 dark:border-gray-700 rounded"
                    checked={config.enableNFTMarketplace}
                    onChange={(e) => setConfig({ ...config, enableNFTMarketplace: e.target.checked })}
                  />
                  <label htmlFor="enableNFTMarketplace" className="ml-2 block text-sm text-gray-900 dark:text-white">
                    Enable NFT Marketplace
                  </label>
                </div>
                <div className="flex items-center">
                  <input
                    type="checkbox"
                    name="enableTokenSwap"
                    id="enableTokenSwap"
                    className="h-4 w-4 text-emerald-600 focus:ring-emerald-500 border-gray-300 dark:border-gray-700 rounded"
                    checked={config.enableTokenSwap}
                    onChange={(e) => setConfig({ ...config, enableTokenSwap: e.target.checked })}
                  />
                  <label htmlFor="enableTokenSwap" className="ml-2 block text-sm text-gray-900 dark:text-white">
                    Enable Token Swap
                  </label>
                </div>
                <div className="flex items-center">
                  <input
                    type="checkbox"
                    name="enableGovernance"
                    id="enableGovernance"
                    className="h-4 w-4 text-emerald-600 focus:ring-emerald-500 border-gray-300 dark:border-gray-700 rounded"
                    checked={config.enableGovernance}
                    onChange={(e) => setConfig({ ...config, enableGovernance: e.target.checked })}
                  />
                  <label htmlFor="enableGovernance" className="ml-2 block text-sm text-gray-900 dark:text-white">
                    Enable Governance
                  </label>
                </div>
              </div>
            </div>

            {/* Status Messages */}
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

            {configStatus === "success" && (
              <div className="rounded-md bg-green-50 dark:bg-green-900/30 p-4">
                <div className="flex">
                  <div className="flex-shrink-0">
                    <CheckCircle className="h-5 w-5 text-green-400 dark:text-green-500" aria-hidden="true" />
                  </div>
                  <div className="ml-3">
                    <h3 className="text-sm font-medium text-green-800 dark:text-green-300">
                      Configuration updated successfully
                    </h3>
                  </div>
                </div>
              </div>
            )}

            <div className="bg-blue-50 dark:bg-blue-900/30 p-4 rounded-md">
              <div className="flex">
                <div className="flex-shrink-0">
                  <Info className="h-5 w-5 text-blue-400 dark:text-blue-500" aria-hidden="true" />
                </div>
                <div className="ml-3">
                  <h3 className="text-sm font-medium text-blue-800 dark:text-blue-300">Information</h3>
                  <div className="mt-2 text-sm text-blue-700 dark:text-blue-400">
                    <p>
                      Changes to the configuration will take effect immediately. Some changes may require users to
                      refresh their browsers or restart the application.
                    </p>
                  </div>
                </div>
              </div>
            </div>
          </div>

          <div className="px-6 py-4 bg-gray-50 dark:bg-gray-700 text-right">
            <button
              type="submit"
              disabled={isSubmitting}
              className="inline-flex items-center px-4 py-2 border border-transparent rounded-md shadow-sm text-sm font-medium text-white bg-emerald-600 hover:bg-emerald-700 focus:outline-none focus:ring-2 focus:ring-offset-2 focus:ring-emerald-500 disabled:opacity-50 disabled:cursor-not-allowed"
            >
              {isSubmitting ? (
                <>
                  <svg
                    className="animate-spin -ml-1 mr-2 h-4 w-4 text-white"
                    xmlns="http://www.w3.org/2000/svg"
                    fill="none"
                    viewBox="0 0 24 24"
                  >
                    <circle
                      className="opacity-25"
                      cx="12"
                      cy="12"
                      r="10"
                      stroke="currentColor"
                      strokeWidth="4"
                    ></circle>
                    <path
                      className="opacity-75"
                      fill="currentColor"
                      d="M4 12a8 8 0 018-8V0C5.373 0 0 5.373 0 12h4zm2 5.291A7.962 7.962 0 014 12H0c0 3.042 1.135 5.824 3 7.938l3-2.647z"
                    ></path>
                  </svg>
                  Saving...
                </>
              ) : (
                <>
                  <Save className="h-4 w-4 mr-2" />
                  Save Configuration
                </>
              )}
            </button>
          </div>
        </form>
      </div>
    </div>
  )
}

export default SystemConfiguration
