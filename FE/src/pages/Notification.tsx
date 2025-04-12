"use client"

import type React from "react"
import { useState, useEffect } from "react"
import { Bell, Check, CheckCheck, ExternalLink } from "lucide-react"
import axios from "axios"
import { Link } from "react-router-dom"

// Define notification types
interface Notification {
  _id: string
  type: string
  content: string
  read: boolean
  createdAt: string
  targetType?: string
  targetId?: string
  sender?: string
}

interface PaginationInfo {
  total: number
  page: number
  limit: number
  pages: number
}

interface NotificationResponse {
  notifications: Notification[]
  pagination: PaginationInfo
  unreadCount: number
}

const NotificationPage: React.FC = () => {
  const [notifications, setNotifications] = useState<Notification[]>([])
  const [loading, setLoading] = useState<boolean>(true)
  const [error, setError] = useState<string | null>(null)
  const [pagination, setPagination] = useState<PaginationInfo>({
    total: 0,
    page: 1,
    limit: 10,
    pages: 0,
  })
  const [unreadCount, setUnreadCount] = useState<number>(0)
  const [showUnreadOnly, setShowUnreadOnly] = useState<boolean>(false)

  // Fetch notifications
  const fetchNotifications = async (page = 1, unreadOnly = false) => {
    setLoading(true)
    try {
      const response = await axios.get<NotificationResponse>(`${process.env.REACT_APP_API_URL}/api/notifications`, {
        params: {
          page,
          limit: 10,
          unread: unreadOnly,
        },
        headers: {
          Authorization: `Bearer ${localStorage.getItem("token")}`,
        },
      })

      setNotifications(response.data.notifications)
      setPagination(response.data.pagination)
      setUnreadCount(response.data.unreadCount)
      setError(null)
    } catch (err) {
      console.error("Error fetching notifications:", err)
      setError("Failed to load notifications. Please try again later.")
    } finally {
      setLoading(false)
    }
  }

  // Mark notification as read
  const markAsRead = async (notificationId: string) => {
    try {
      await axios.post(
        `${process.env.REACT_APP_API_URL}/api/notifications/${notificationId}/read`,
        {},
        {
          headers: {
            Authorization: `Bearer ${localStorage.getItem("token")}`,
          },
        },
      )

      // Update local state
      setNotifications((prev) =>
        prev.map((notification) =>
          notification._id === notificationId ? { ...notification, read: true } : notification,
        ),
      )
      setUnreadCount((prev) => Math.max(0, prev - 1))
    } catch (err) {
      console.error("Error marking notification as read:", err)
    }
  }

  // Mark all notifications as read
  const markAllAsRead = async () => {
    try {
      await axios.post(
        `${process.env.REACT_APP_API_URL}/api/notifications/mark-all-read`,
        {},
        {
          headers: {
            Authorization: `Bearer ${localStorage.getItem("token")}`,
          },
        },
      )

      // Update local state
      setNotifications((prev) => prev.map((notification) => ({ ...notification, read: true })))
      setUnreadCount(0)
    } catch (err) {
      console.error("Error marking all notifications as read:", err)
    }
  }

  // Toggle between all and unread notifications
  const toggleUnreadFilter = () => {
    setShowUnreadOnly(!showUnreadOnly)
    fetchNotifications(1, !showUnreadOnly)
  }

  // Handle pagination
  const handlePageChange = (newPage: number) => {
    if (newPage > 0 && newPage <= pagination.pages) {
      fetchNotifications(newPage, showUnreadOnly)
    }
  }

  // Initial fetch
  useEffect(() => {
    fetchNotifications(1, showUnreadOnly)
  }, [])

  // Format date
  const formatDate = (dateString: string) => {
    const date = new Date(dateString)
    const now = new Date()
    const diffMs = now.getTime() - date.getTime()
    const diffMins = Math.floor(diffMs / (1000 * 60))
    const diffHours = Math.floor(diffMs / (1000 * 60 * 60))
    const diffDays = Math.floor(diffMs / (1000 * 60 * 60 * 24))

    if (diffMins < 60) {
      return `${diffMins} minute${diffMins !== 1 ? "s" : ""} ago`
    } else if (diffHours < 24) {
      return `${diffHours} hour${diffHours !== 1 ? "s" : ""} ago`
    } else if (diffDays < 7) {
      return `${diffDays} day${diffDays !== 1 ? "s" : ""} ago`
    } else {
      return date.toLocaleDateString()
    }
  }

  // Get notification icon based on type
  const getNotificationIcon = (type: string) => {
    switch (type) {
      case "transaction":
        return <ExternalLink className="text-blue-500" size={18} />
      case "system":
        return <Bell className="text-purple-500" size={18} />
      case "reward":
        return <Bell className="text-yellow-500" size={18} />
      default:
        return <Bell className="text-gray-500" size={18} />
    }
  }

  return (
    <div className="p-6 ml-[200px] max-w-4xl mx-auto">
      <div className="flex justify-between items-center mb-6">
        <h1 className="text-2xl font-bold text-gray-800">Notifications</h1>
        <div className="flex space-x-4">
          <button
            onClick={toggleUnreadFilter}
            className={`px-4 py-2 rounded-md text-sm font-medium transition-colors ${
              showUnreadOnly ? "bg-emerald-500 text-white" : "bg-gray-200 text-gray-700 hover:bg-gray-300"
            }`}
          >
            {showUnreadOnly ? "Showing Unread" : "Show All"}
          </button>
          <button
            onClick={markAllAsRead}
            className="flex items-center px-4 py-2 bg-gray-200 hover:bg-gray-300 rounded-md text-sm font-medium text-gray-700 transition-colors"
            disabled={unreadCount === 0}
          >
            <CheckCheck size={16} className="mr-2" />
            Mark All Read
          </button>
        </div>
      </div>

      {error && <div className="bg-red-100 border border-red-400 text-red-700 px-4 py-3 rounded mb-4">{error}</div>}

      {loading ? (
        <div className="flex justify-center items-center h-64">
          <div className="animate-spin rounded-full h-12 w-12 border-t-2 border-b-2 border-emerald-500"></div>
        </div>
      ) : notifications.length === 0 ? (
        <div className="bg-gray-50 rounded-lg p-8 text-center">
          <Bell size={48} className="mx-auto text-gray-400 mb-4" />
          <h3 className="text-lg font-medium text-gray-700 mb-2">No notifications</h3>
          <p className="text-gray-500">
            {showUnreadOnly ? "You have no unread notifications." : "You don't have any notifications yet."}
          </p>
        </div>
      ) : (
        <div className="bg-white rounded-lg shadow overflow-hidden">
          <ul className="divide-y divide-gray-200">
            {notifications.map((notification) => (
              <li
                key={notification._id}
                className={`p-4 hover:bg-gray-50 transition-colors ${!notification.read ? "bg-emerald-50" : ""}`}
              >
                <div className="flex items-start">
                  <div className="flex-shrink-0 pt-1">{getNotificationIcon(notification.type)}</div>
                  <div className="ml-3 flex-1">
                    <div className="flex items-center justify-between">
                      <p className={`text-sm ${!notification.read ? "font-medium text-gray-900" : "text-gray-700"}`}>
                        {notification.content}
                      </p>
                      {!notification.read && (
                        <button
                          onClick={() => markAsRead(notification._id)}
                          className="ml-2 p-1 text-gray-400 hover:text-emerald-500 rounded-full hover:bg-emerald-50"
                          title="Mark as read"
                        >
                          <Check size={16} />
                        </button>
                      )}
                    </div>
                    <p className="mt-1 text-xs text-gray-500">{formatDate(notification.createdAt)}</p>
                    {notification.targetType && notification.targetId && (
                      <Link
                        to={`/${notification.targetType}/${notification.targetId}`}
                        className="mt-2 inline-flex items-center text-xs font-medium text-emerald-500 hover:text-emerald-600"
                      >
                        View details
                        <ExternalLink size={12} className="ml-1" />
                      </Link>
                    )}
                  </div>
                </div>
              </li>
            ))}
          </ul>
        </div>
      )}

      {/* Pagination */}
      {pagination.pages > 1 && (
        <div className="flex justify-center mt-6">
          <nav className="flex items-center space-x-2">
            <button
              onClick={() => handlePageChange(pagination.page - 1)}
              disabled={pagination.page === 1}
              className="px-3 py-1 rounded-md bg-gray-200 text-gray-700 disabled:opacity-50 disabled:cursor-not-allowed"
            >
              Previous
            </button>
            {Array.from({ length: pagination.pages }, (_, i) => i + 1).map((page) => (
              <button
                key={page}
                onClick={() => handlePageChange(page)}
                className={`px-3 py-1 rounded-md ${
                  pagination.page === page ? "bg-emerald-500 text-white" : "bg-gray-200 text-gray-700 hover:bg-gray-300"
                }`}
              >
                {page}
              </button>
            ))}
            <button
              onClick={() => handlePageChange(pagination.page + 1)}
              disabled={pagination.page === pagination.pages}
              className="px-3 py-1 rounded-md bg-gray-200 text-gray-700 disabled:opacity-50 disabled:cursor-not-allowed"
            >
              Next
            </button>
          </nav>
        </div>
      )}
    </div>
  )
}

export default NotificationPage
