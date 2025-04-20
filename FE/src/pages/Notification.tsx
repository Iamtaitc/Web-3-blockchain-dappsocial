"use client"

import type React from "react"
import { useState, useEffect } from "react"
import { Bell, Check, CheckCheck, ExternalLink } from "lucide-react"
import { Link } from "react-router-dom"
import instance from "../services/api" // Import axios instance từ api.ts

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
  success: boolean
  message: string
  data: {
    notifications: Notification[]
    pagination: PaginationInfo
    unreadCount: number
  }
  timestamp: string
}

const NotificationPage: React.FC = () => {
  const [notifications, setNotifications] = useState<Notification[]>([])
  const [loading, setLoading] = useState<boolean>(true)
  const [error, setError] = useState<string | null>(null)
  const [successMessage, setSuccessMessage] = useState<string | null>(null) // Thêm thông báo thành công
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
      const response = await instance.get<NotificationResponse>("/notifications", {
        params: {
          page,
          limit: 10,
          unread: unreadOnly,
        },
      })

      if (response.data.success) {
        setNotifications(response.data.data.notifications)
        setPagination(response.data.data.pagination)
        setUnreadCount(response.data.data.unreadCount)
        setError(null)
      } else {
        setError(response.data.message || "Không thể tải thông báo. Vui lòng thử lại.")
      }
    } catch (err: any) {
      console.error("Error fetching notifications:", err)
      setError(err.response?.data?.message || "Lỗi kết nối server. Vui lòng thử lại sau.")
    } finally {
      setLoading(false)
    }
  }

  // Mark notification as read
  const markAsRead = async (notificationId: string) => {
    try {
      const response = await instance.patch(`/notifications/${notificationId}/read`, {})
      if (response.data.success) {
        setNotifications((prev) =>
          prev.map((notification) =>
            notification._id === notificationId ? { ...notification, read: true } : notification,
          ),
        )
        setUnreadCount((prev) => Math.max(0, prev - 1))
        setSuccessMessage("Đã đánh dấu thông báo là đã đọc.")
        setTimeout(() => setSuccessMessage(null), 3000) // Ẩn thông báo sau 3s
      } else {
        setError(response.data.message || "Không thể đánh dấu đã đọc. Vui lòng thử lại.")
      }
    } catch (err: any) {
      console.error("Error marking notification as read:", err)
      setError(err.response?.data?.message || "Lỗi khi đánh dấu đã đọc. Vui lòng thử lại.")
    }
  }

  // Mark all notifications as read
  const markAllAsRead = async () => {
    try {
      const response = await instance.patch("/notifications/read/all", {})
      if (response.data.success) {
        setNotifications((prev) => prev.map((notification) => ({ ...notification, read: true })))
        setUnreadCount(0)
        setSuccessMessage("Đã đánh dấu tất cả thông báo là đã đọc.")
        setTimeout(() => setSuccessMessage(null), 3000)
      } else {
        setError(response.data.message || "Không thể đánh dấu tất cả đã đọc. Vui lòng thử lại.")
      }
    } catch (err: any) {
      console.error("Error marking all notifications as read:", err)
      setError(err.response?.data?.message || "Lỗi khi đánh dấu tất cả đã đọc. Vui lòng thử lại.")
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
      return `${diffMins} phút trước`
    } else if (diffHours < 24) {
      return `${diffHours} giờ trước`
    } else if (diffDays < 7) {
      return `${diffDays} ngày trước`
    } else {
      return date.toLocaleDateString("vi-VN")
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
        <h1 className="text-2xl font-bold text-gray-800">Thông Báo</h1>
        <div className="flex space-x-4">
          <button
            onClick={toggleUnreadFilter}
            className={`px-4 py-2 rounded-md text-sm font-medium transition-colors ${
              showUnreadOnly ? "bg-emerald-500 text-white" : "bg-gray-200 text-gray-700 hover:bg-gray-300"
            }`}
          >
            {showUnreadOnly ? "Chỉ hiện chưa đọc" : "Hiện tất cả"}
          </button>
          <button
            onClick={markAllAsRead}
            className="flex items-center px-4 py-2 bg-gray-200 hover:bg-gray-300 rounded-md text-sm font-medium text-gray-700 transition-colors"
            disabled={unreadCount === 0}
          >
            <CheckCheck size={16} className="mr-2" />
            Đánh dấu tất cả đã đọc
          </button>
        </div>
      </div>

      {successMessage && (
        <div className="mb-6 bg-green-100 text-green-700 p-4 rounded-lg shadow-md flex justify-between items-center">
          <span>{successMessage}</span>
          <button
            onClick={() => setSuccessMessage(null)}
            className="text-green-700 hover:text-green-900"
          >
            ✕
          </button>
        </div>
      )}

      {error && (
        <div className="bg-red-100 border border-red-400 text-red-700 px-4 py-3 rounded mb-4">
          {error}
          <button
            onClick={() => fetchNotifications(1, showUnreadOnly)}
            className="ml-4 bg-blue-500 text-white px-4 py-1 rounded-md text-sm"
          >
            Thử lại
          </button>
        </div>
      )}

      {loading ? (
        <div className="flex justify-center items-center h-64">
          <div className="animate-spin rounded-full h-12 w-12 border-t-2 border-b-2 border-emerald-500"></div>
        </div>
      ) : notifications.length === 0 ? (
        <div className="bg-gray-50 rounded-lg p-8 text-center">
          <Bell size={48} className="mx-auto text-gray-400 mb-4" />
          <h3 className="text-lg font-medium text-gray-700 mb-2">Không có thông báo</h3>
          <p className="text-gray-500">
            {showUnreadOnly ? "Bạn không có thông báo chưa đọc." : "Bạn chưa có thông báo nào."}
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
                          title="Đánh dấu đã đọc"
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
                        Xem chi tiết
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
              Trước
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
              Tiếp
            </button>
          </nav>
        </div>
      )}
    </div>
  )
}

export default NotificationPage