"use client"

import type React from "react"
import { useState, useEffect } from "react"
import { Bell, Send, AlertCircle, CheckCircle, Clock, Info, Trash2 } from "lucide-react"
import AdminApi from "../../services/AdminApi" // Adjust the import path based on your project structure

interface Notification {
  _id: string;
  content: string; // Trường content chứa cả title và content
  sentAt: string;
  recipientCount: number;
  type: string;
  walletAddress?: string;
}

const SystemNotifications = () => {
  const [title, setTitle] = useState("")
  const [content, setContent] = useState("")
  const [walletAddress, setWalletAddress] = useState("")
  const [isUserNotification, setIsUserNotification] = useState(false)
  const [isSubmitting, setIsSubmitting] = useState(false)
  const [notificationStatus, setNotificationStatus] = useState<"idle" | "loading" | "success" | "error">("idle")
  const [errorMessage, setErrorMessage] = useState("")
  const [recipientCount, setRecipientCount] = useState(0)

  // Recent notifications
  const [recentNotifications, setRecentNotifications] = useState<Notification[]>([])
  const [loadingNotifications, setLoadingNotifications] = useState(true)

  // Fetch notifications on mount
  useEffect(() => {
    const fetchNotifications = async () => {
      setLoadingNotifications(true)
      try {
        const response = await AdminApi.getNotifications({ page: 1, limit: 20 })
        console.log("Notifications response:", response)
        if (response.success && Array.isArray(response.data?.notifications)) {
          setRecentNotifications(response.data.notifications)
        } else {
          console.error("Invalid notifications data:", response)
          setErrorMessage("Failed to fetch notifications. Invalid data format.")
          setRecentNotifications([])
        }
      } catch (error) {
        console.error("Error fetching notifications:", error)
        setErrorMessage("Failed to fetch notifications. Please try again.")
        setRecentNotifications([])
      } finally {
        setLoadingNotifications(false)
      }
    }

    fetchNotifications()
  }, [])

  // Handle form submission
  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault()

    // Validate inputs
    if (!title || !content) {
      setErrorMessage("Please fill in all fields")
      return
    }

    if (isUserNotification && !walletAddress) {
      setErrorMessage("Please enter a wallet address")
      return
    }

    setErrorMessage("")
    setNotificationStatus("loading")
    setIsSubmitting(true)

    try {
      let response
      if (isUserNotification) {
        // Send notification to specific user
        response = await AdminApi.createUserNotification(walletAddress, title, content)
      } else {
        // Send system announcement
        response = await AdminApi.createSystemAnnouncement(title, content)
      }

      console.log("Create notification response:", response)
      if (response.success) {
        setRecipientCount(isUserNotification ? 1 : (response.data.recipientCount || 0))
        setNotificationStatus("success")

        // Fetch updated notifications
        const updatedResponse = await AdminApi.getNotifications({ page: 1, limit: 20 })
        console.log("Updated notifications response:", updatedResponse)
        if (updatedResponse.success && Array.isArray(updatedResponse.data?.notifications)) {
          setRecentNotifications(updatedResponse.data.notifications)
        } else {
          setErrorMessage("Failed to refresh notifications list.")
        }
      } else {
        setNotificationStatus("error")
        setErrorMessage(response.message || "Failed to send notification.")
      }
    } catch (error) {
      console.error("Error sending notification:", error)
      setNotificationStatus("error")
      setErrorMessage("Failed to send notification. Please try again.")
    } finally {
      setIsSubmitting(false)
    }
  }

  // Handle delete notification
  const handleDelete = async (notificationId: string) => {
    try {
      const response = await AdminApi.deleteNotification(notificationId)
      console.log("Delete notification response:", response)
      if (response.success) {
        setRecentNotifications(recentNotifications.filter((notif) => notif._id !== notificationId))
      } else {
        setErrorMessage("Failed to delete notification.")
      }
    } catch (error) {
      console.error("Error deleting notification:", error)
      setErrorMessage("Failed to delete notification.")
    }
  }

  // Reset form
  const resetForm = () => {
    setTitle("")
    setContent("")
    setWalletAddress("")
    setIsUserNotification(false)
    setNotificationStatus("idle")
    setErrorMessage("")
  }

  // Tách title và content từ trường content
  const parseNotificationContent = (content: string): { title: string; message: string } => {
    const separatorIndex = content.indexOf(": ");
    if (separatorIndex !== -1) {
      const title = content.substring(0, separatorIndex).trim();
      const message = content.substring(separatorIndex + 2).trim();
      return { title, message };
    }
    return { title: "N/A", message: content };
  }

  return (
    <div className="space-y-6">
      <div className="flex justify-between items-center">
        <h1 className="text-2xl font-bold text-gray-900 dark:text-white">System Notifications</h1>
      </div>

      <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
        {/* Notification Form */}
        <div className="bg-white dark:bg-gray-800 shadow rounded-lg p-6">
          <h2 className="text-lg font-medium text-gray-900 dark:text-white mb-4">Send Notification</h2>
          <form onSubmit={handleSubmit}>
            <div className="space-y-4">
              {/* Toggle for notification type */}
              <div className="flex items-center">
                <label className="mr-3 text-sm font-medium text-gray-700 dark:text-gray-300">
                  Send to specific wallet
                </label>
                <button
                  type="button"
                  onClick={() => setIsUserNotification(!isUserNotification)}
                  className={`relative inline-flex h-6 w-11 items-center rounded-full transition-colors duration-200 ${
                    isUserNotification ? "bg-emerald-600" : "bg-gray-200 dark:bg-gray-600"
                  }`}
                >
                  <span
                    className={`inline-block h-4 w-4 transform rounded-full bg-white transition-transform duration-200 ${
                      isUserNotification ? "translate-x-6" : "translate-x-1"
                    }`}
                  />
                </button>
              </div>

              {/* Wallet Address Input (shown if sending to specific wallet) */}
              {isUserNotification && (
                <div>
                  <label htmlFor="walletAddress" className="block text-sm font-medium text-gray-700 dark:text-gray-300">
                    Wallet Address
                  </label>
                  <input
                    type="text"
                    name="walletAddress"
                    id="walletAddress"
                    className="mt-1 block w-full border border-gray-300 dark:border-gray-700 rounded-md shadow-sm py-2 px-3 focus:outline-none focus:ring-emerald-500 focus:border-emerald-500 sm:text-sm bg-white dark:bg-gray-800 text-gray-900 dark:text-white"
                    placeholder="Enter wallet address"
                    value={walletAddress}
                    onChange={(e) => setWalletAddress(e.target.value)}
                    disabled={isSubmitting || notificationStatus === "success"}
                  />
                </div>
              )}

              <div>
                <label htmlFor="title" className="block text-sm font-medium text-gray-700 dark:text-gray-300">
                  Notification Title
                </label>
                <input
                  type="text"
                  name="title"
                  id="title"
                  className="mt-1 block w-full border border-gray-300 dark:border-gray-700 rounded-md shadow-sm py-2 px-3 focus:outline-none focus:ring-emerald-500 focus:border-emerald-500 sm:text-sm bg-white dark:bg-gray-800 text-gray-900 dark:text-white"
                  placeholder="Enter notification title"
                  value={title}
                  onChange={(e) => setTitle(e.target.value)}
                  disabled={isSubmitting || notificationStatus === "success"}
                />
              </div>
              <div>
                <label htmlFor="content" className="block text-sm font-medium text-gray-700 dark:text-gray-300">
                  Notification Content
                </label>
                <textarea
                  name="content"
                  id="content"
                  rows={5}
                  className="mt-1 block w-full border border-gray-300 dark:border-gray-700 rounded-md shadow-sm py-2 px-3 focus:outline-none focus:ring-emerald-500 focus:border-emerald-500 sm:text-sm bg-white dark:bg-gray-800 text-gray-900 dark:text-white"
                  placeholder="Enter notification content"
                  value={content}
                  onChange={(e) => setContent(e.target.value)}
                  disabled={isSubmitting || notificationStatus === "success"}
                />
              </div>

              <div className="bg-blue-50 dark:bg-blue-900/30 p-4 rounded-md">
                <div className="flex">
                  <div className="flex-shrink-0">
                    <Info className="h-5 w-5 text-blue-400 dark:text-blue-500" aria-hidden="true" />
                  </div>
                  <div className="ml-3">
                    <h3 className="text-sm font-medium text-blue-800 dark:text-blue-300">Information</h3>
                    <div className="mt-2 text-sm text-blue-700 dark:text-blue-400">
                      <p>
                        {isUserNotification
                          ? "This notification will be sent to the specified wallet address."
                          : "This notification will be sent to all active users on the platform. Users will receive this notification in their notification center and via email if they have email notifications enabled."}
                      </p>
                    </div>
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
                {notificationStatus === "success" ? (
                  <button
                    type="button"
                    onClick={resetForm}
                    className="inline-flex items-center px-4 py-2 border border-transparent rounded-md shadow-sm text-sm font-medium text-white bg-emerald-600 hover:bg-emerald-700 focus:outline-none focus:ring-2 focus:ring-offset-2 focus:ring-emerald-500"
                  >
                    Send Another Notification
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
                        Sending...
                      </>
                    ) : (
                      <>
                        <Send className="h-4 w-4 mr-2" />
                        Send Notification
                      </>
                    )}
                  </button>
                )}
              </div>
            </div>
          </form>
        </div>

        {/* Notification Status */}
        <div className="bg-white dark:bg-gray-800 shadow rounded-lg p-6">
          <h2 className="text-lg font-medium text-gray-900 dark:text-white mb-4">Notification Status</h2>

          {notificationStatus === "idle" ? (
            <div className="flex flex-col items-center justify-center h-64 text-gray-500 dark:text-gray-400">
              <Bell className="h-12 w-12 mb-4" />
              <p className="text-center">No notifications sent recently</p>
              <p className="text-center text-sm mt-2">Fill out the form to send a notification</p>
            </div>
          ) : notificationStatus === "loading" ? (
            <div className="flex flex-col items-center justify-center h-64">
              <div className="animate-spin rounded-full h-12 w-12 border-t-2 border-b-2 border-emerald-500 mb-4"></div>
              <p className="text-center text-gray-700 dark:text-gray-300">Sending notification...</p>
              <p className="text-center text-sm text-gray-500 dark:text-gray-400 mt-2">This may take a few moments</p>
            </div>
          ) : notificationStatus === "success" ? (
            <div className="rounded-md bg-green-50 dark:bg-green-900/30 p-4 mb-4">
              <div className="flex">
                <div className="flex-shrink-0">
                  <CheckCircle className="h-5 w-5 text-green-400 dark:text-green-500" aria-hidden="true" />
                </div>
                <div className="ml-3">
                  <h3 className="text-sm font-medium text-green-800 dark:text-green-300">
                    Notification sent successfully
                  </h3>
                  <div className="mt-2 text-sm text-green-700 dark:text-green-400">
                    <p>
                      {isUserNotification
                        ? `Your notification has been sent to wallet ${walletAddress}.`
                        : `Your notification has been sent to ${recipientCount.toLocaleString()} users.`}
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
                  <h3 className="text-sm font-medium text-red-800 dark:text-red-300">Failed to send notification</h3>
                  <div className="mt-2 text-sm text-red-700 dark:text-red-400">
                    <p>{errorMessage || "An error occurred while sending your notification."}</p>
                  </div>
                </div>
              </div>
            </div>
          )}

          {notificationStatus === "success" && (
            <div className="mt-4">
              <h3 className="text-sm font-medium text-gray-700 dark:text-gray-300 mb-2">Notification Details</h3>
              <div className="bg-gray-50 dark:bg-gray-700 rounded-md p-4">
                {isUserNotification && (
                  <div className="flex justify-between items-center mb-2">
                    <span className="text-sm text-gray-500 dark:text-gray-400">Wallet Address:</span>
                    <span className="text-sm font-medium text-gray-900 dark:text-white">{walletAddress}</span>
                  </div>
                )}
                <div className="flex justify-between items-center mb-2">
                  <span className="text-sm text-gray-500 dark:text-gray-400">Title:</span>
                  <span className="text-sm font-medium text-gray-900 dark:text-white">{title}</span>
                </div>
                <div className="mb-2">
                  <span className="text-sm text-gray-500 dark:text-gray-400">Content:</span>
                  <p className="mt-1 text-sm text-gray-900 dark:text-white">{content}</p>
                </div>
                <div className="flex justify-between items-center mb-2">
                  <span className="text-sm text-gray-500 dark:text-gray-400">Recipients:</span>
                  <span className="text-sm font-medium text-gray-900 dark:text-white">
                    {isUserNotification ? "1 user" : `${recipientCount.toLocaleString()} users`}
                  </span>
                </div>
                <div className="flex justify-between items-center">
                  <span className="text-sm text-gray-500 dark:text-gray-400">Sent at:</span>
                  <span className="text-sm font-medium text-gray-900 dark:text-white">
                    {new Date().toLocaleString()}
                  </span>
                </div>
              </div>
            </div>
          )}
        </div>
      </div>

      {/* Recent Notifications */}
      <div className="bg-white dark:bg-gray-800 shadow rounded-lg overflow-hidden">
        <div className="px-6 py-4 border-b border-gray-200 dark:border-gray-700">
          <h2 className="text-lg font-medium text-gray-900 dark:text-white">Recent Notifications</h2>
        </div>
        <div className="overflow-x-auto">
          {loadingNotifications ? (
            <div className="flex justify-center items-center h-48">
              <div className="animate-spin rounded-full h-8 w-8 border-t-2 border-b-2 border-emerald-500"></div>
            </div>
          ) : recentNotifications.length === 0 ? (
            <div className="flex justify-center items-center h-48 text-gray-500 dark:text-gray-400">
              <p>No notifications found.</p>
            </div>
          ) : (
            <table className="min-w-full divide-y divide-gray-200 dark:divide-gray-700">
              <thead className="bg-gray-50 dark:bg-gray-700">
                <tr>
                  <th
                    scope="col"
                    className="px-6 py-3 text-left text-xs font-medium text-gray-500 dark:text-gray-400 uppercase tracking-wider"
                  >
                    Type
                  </th>
                  <th
                    scope="col"
                    className="px-6 py-3 text-left text-xs font-medium text-gray-500 dark:text-gray-400 uppercase tracking-wider"
                  >
                    Title
                  </th>
                  <th
                    scope="col"
                    className="px-6 py-3 text-left text-xs font-medium text-gray-500 dark:text-gray-400 uppercase tracking-wider"
                  >
                    Content
                  </th>
                  <th
                    scope="col"
                    className="px-6 py-3 text-left text-xs font-medium text-gray-500 dark:text-gray-400 uppercase tracking-wider"
                  >
                    Recipients
                  </th>
                  <th
                    scope="col"
                    className="px-6 py-3 text-left text-xs font-medium text-gray-500 dark:text-gray-400 uppercase tracking-wider"
                  >
                    Sent At
                  </th>
                  <th
                    scope="col"
                    className="px-6 py-3 text-left text-xs font-medium text-gray-500 dark:text-gray-400 uppercase tracking-wider"
                  >
                    Action
                  </th>
                </tr>
              </thead>
              <tbody className="bg-white dark:bg-gray-800 divide-y divide-gray-200 dark:divide-gray-700">
                {recentNotifications.map((notification) => {
                  const { title, message } = parseNotificationContent(notification.content);
                  return (
                    <tr key={notification._id || Math.random().toString()}>
                      <td className="px-6 py-4 whitespace-nowrap text-sm font-medium text-gray-900 dark:text-white">
                        {notification.type === "system" ? "System" : notification.type === "user" ? `User (${notification.walletAddress || "N/A"})` : "N/A"}
                      </td>
                      <td className="px-6 py-4 whitespace-nowrap text-sm font-medium text-gray-900 dark:text-white">
                        {title}
                      </td>
                      <td className="px-6 py-4 text-sm text-gray-500 dark:text-gray-400 max-w-xs truncate">
                        {message}
                      </td>
                      <td className="px-6 py-4 whitespace-nowrap text-sm text-gray-500 dark:text-gray-400">
                        {(notification.recipientCount || 0).toLocaleString()}
                      </td>
                      <td className="px-6 py-4 whitespace-nowrap text-sm text-gray-500 dark:text-gray-400">
                        {notification.sentAt ? new Date(notification.sentAt).toLocaleString() : "N/A"}
                      </td>
                      <td className="px-6 py-4 whitespace-nowrap text-sm text-gray-500 dark:text-gray-400">
                        <button
                          onClick={() => handleDelete(notification._id)}
                          className="text-red-600 hover:text-red-800 dark:text-red-400 dark:hover:text-red-300"
                        >
                          <Trash2 className="h-5 w-5" />
                        </button>
                      </td>
                    </tr>
                  );
                })}
              </tbody>
            </table>
          )}
        </div>
      </div>
    </div>
  )
}

export default SystemNotifications