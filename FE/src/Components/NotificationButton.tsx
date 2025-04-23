"use client"

import type React from "react"
import { useState, useEffect, useRef } from "react"
import { Bell } from "lucide-react"
import { Link, useNavigate } from "react-router-dom"
import axios from "axios"

interface Notification {
  _id: string
  type: string
  content: string
  read: boolean
  createdAt: string
}

const NotificationButton: React.FC = () => {
  const [unreadCount, setUnreadCount] = useState<number>(0)
  const [notifications, setNotifications] = useState<Notification[]>([])
  const [isOpen, setIsOpen] = useState<boolean>(false)
  const [loading, setLoading] = useState<boolean>(false)
  const dropdownRef = useRef<HTMLDivElement>(null)
  const navigate = useNavigate()

  // Fetch notifications
  const fetchNotifications = async () => {
    setLoading(true)
    try {
      const response = await axios.get(`${process.env.REACT_APP_API_URL}/api/notifications`, {
        params: {
          limit: 5,
        },
        headers: {
          Authorization: `Bearer ${localStorage.getItem("token")}`,
        },
      })

      setNotifications(response.data.notifications)
      setUnreadCount(response.data.unreadCount)
    } catch (err) {
      console.error("Error fetching notifications:", err)
    } finally {
      setLoading(false)
    }
  }

  // Mark notification as read
  const markAsRead = async (notificationId: string, e: React.MouseEvent) => {
    e.stopPropagation()
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

  // Format date
  const formatDate = (dateString: string) => {
    const date = new Date(dateString)
    const now = new Date()
    const diffMs = now.getTime() - date.getTime()
    const diffMins = Math.floor(diffMs / (1000 * 60))
    const diffHours = Math.floor(diffMs / (1000 * 60 * 60))
    const diffDays = Math.floor(diffMs / (1000 * 60 * 60 * 24))

    if (diffMins < 60) {
      return `${diffMins}m ago`
    } else if (diffHours < 24) {
      return `${diffHours}h ago`
    } else if (diffDays < 7) {
      return `${diffDays}d ago`
    } else {
      return date.toLocaleDateString()
    }
  }

  // Toggle dropdown
  const toggleDropdown = (e: React.MouseEvent) => {
    e.stopPropagation() // Stop event propagation
    setIsOpen(!isOpen)
    if (!isOpen) {
      fetchNotifications()
    }
  }

  // Handle Bell icon click
  const handleBellClick = (e: React.MouseEvent) => {
    if (e.target === e.currentTarget || (e.target as HTMLElement).tagName === "BUTTON" || (e.target as HTMLElement).tagName === "svg") {
      if (isOpen) {
        // If dropdown is open, just close it
        setIsOpen(false)
      } else {
        // If dropdown is closed, navigate to notifications page
        navigate("/notifications")
      }
    }
  }

  // Close dropdown when clicking outside
  useEffect(() => {
    const handleClickOutside = (event: MouseEvent) => {
      if (dropdownRef.current && !dropdownRef.current.contains(event.target as Node)) {
        setIsOpen(false)
      }
    }

    document.addEventListener("mousedown", handleClickOutside)
    return () => {
      document.removeEventListener("mousedown", handleClickOutside)
    }
  }, [])

  // Fetch unread count on mount and periodically
  useEffect(() => {
    fetchNotifications()

    // Refresh notifications every 2 minutes
    const interval = setInterval(
      () => {
        if (!isOpen) {
          fetchNotifications()
        }
      },
      2 * 60 * 1000,
    )

    return () => clearInterval(interval)
  }, [])

  return (
    <div className="relative" ref={dropdownRef} onClick={handleBellClick}>
      <button
        onClick={toggleDropdown}
        className="relative p-2 rounded-full hover:bg-gray-100 focus:outline-none focus:ring-2 focus:ring-emerald-500"
      >
        <Bell size={20} className="text-gray-600" />
        {unreadCount > 0 && (
          <span className="absolute top-0 right-0 inline-flex items-center justify-center px-2 py-1 text-xs font-bold leading-none text-white transform translate-x-1/2 -translate-y-1/2 bg-red-500 rounded-full">
            {unreadCount > 99 ? "99+" : unreadCount}
          </span>
        )}
      </button>

      {isOpen && (
        <div className="absolute right-0 mt-2 w-80 bg-white rounded-lg shadow-lg overflow-hidden z-50 border border-gray-200" onClick={(e) => e.stopPropagation()}>
          <div className="px-4 py-3 border-b border-gray-200 flex justify-between items-center">
            <h3 className="text-sm font-semibold text-gray-700">Notifications</h3>
            <Link
              to="/notifications"
              className="text-xs text-emerald-500 hover:text-emerald-600"
              onClick={() => setIsOpen(false)}
            >
              View All
            </Link>
          </div>

          {loading ? (
            <div className="flex justify-center items-center h-32">
              <div className="animate-spin rounded-full h-6 w-6 border-t-2 border-b-2 border-emerald-500"></div>
            </div>
          ) : notifications.length === 0 ? (
            <div className="p-4 text-center text-gray-500 text-sm">No notifications yet</div>
          ) : (
            <div className="max-h-96 overflow-y-auto">
              {notifications.map((notification) => (
                <div
                  key={notification._id}
                  className={`p-3 border-b border-gray-100 hover:bg-gray-50 cursor-pointer ${
                    !notification.read ? "bg-emerald-50" : ""
                  }`}
                  onClick={(e) => {
                    if (!notification.read) {
                      markAsRead(notification._id, e)
                    }
                  }}
                >
                  <div className="flex justify-between items-start">
                    <p className={`text-xs ${!notification.read ? "font-medium text-gray-900" : "text-gray-700"}`}>
                      {notification.content}
                    </p>
                    <span className="text-xs text-gray-500 ml-2 whitespace-nowrap">
                      {formatDate(notification.createdAt)}
                    </span>
                  </div>
                </div>
              ))}
            </div>
          )}

          <div className="p-2 border-t border-gray-200 bg-gray-50">
            <Link
              to="/notifications"
              className="block w-full py-2 text-center text-xs font-medium text-emerald-500 hover:text-emerald-600 rounded hover:bg-gray-100"
              onClick={() => setIsOpen(false)}
            >
              See all notifications
            </Link>
          </div>
        </div>
      )}
    </div>
  )
}

export default NotificationButton