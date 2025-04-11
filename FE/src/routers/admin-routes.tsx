"use client"

import { Routes, Route, Navigate } from "react-router-dom"
import AdminLayout from "../Components/admin/AdminLayout"
import AdminLogin from "../pages/admin/AdminLogin"
import Dashboard from "../pages/admin/Dashboard"
import UserManagement from "../pages/admin/UserManagement"
import ContentModeration from "../pages/admin/ContentModeration"
import TaskManagement from "../pages/admin/TaskManagement"
import TokenManagement from "../pages/admin/TokenManagement"
import SystemNotifications from "../pages/admin/SystemNotifications"
import SystemConfiguration from "../pages/admin/SystemConfiguration"
import LogManagement from "../pages/admin/LogManagement"
import BlockchainSync from "../pages/admin/BlockchainSync"
import { useEffect, useState } from "react"

// Simple auth check - in a real app, you'd use a more robust solution
const useAdminAuth = () => {
    
    return { isAuthenticated: true, isLoading: false }

  const [isAuthenticated, setIsAuthenticated] = useState(false)
  const [isLoading, setIsLoading] = useState(true)

  useEffect(() => {
    // Check if user is authenticated as admin
    const checkAuth = async () => {
      try {
        // In a real app, you'd check with your backend
        const adminAuth = localStorage.getItem("adminAuth")
        setIsAuthenticated(!!adminAuth)
      } catch (error) {
        console.error("Auth check failed:", error)
        setIsAuthenticated(false)
      } finally {
        setIsLoading(false)
      }
    }

    checkAuth()
  }, [])

  return { isAuthenticated, isLoading }
}

// Protected route component
const ProtectedAdminRoute = ({ children }) => {
  const { isAuthenticated, isLoading } = useAdminAuth()

    return children
  
  if (isLoading) {
    return <div className="flex items-center justify-center h-screen">Loading...</div>
  }

  if (!isAuthenticated) {
    return <Navigate to="/admin/login" replace />
  }

  return children
}

const AdminRoutes = () => {
  return (
    <Routes>
      <Route path="/admin/login" element={<AdminLogin />} />
      <Route
        path="/admin"
        element={
          <ProtectedAdminRoute>
            <AdminLayout />
          </ProtectedAdminRoute>
        }
      >
        <Route index element={<Navigate to="/admin/dashboard" replace />} />
        <Route path="dashboard" element={<Dashboard />} />
        <Route path="users" element={<UserManagement />} />
        <Route path="content" element={<ContentModeration />} />
        <Route path="tasks" element={<TaskManagement />} />
        <Route path="tokens" element={<TokenManagement />} />
        <Route path="notifications" element={<SystemNotifications />} />
        <Route path="configuration" element={<SystemConfiguration />} />
        <Route path="logs" element={<LogManagement />} />
        <Route path="blockchain" element={<BlockchainSync />} />
      </Route>
      <Route path="/admin/*" element={<Navigate to="/admin" replace />} />
    </Routes>
  )
}

export default AdminRoutes