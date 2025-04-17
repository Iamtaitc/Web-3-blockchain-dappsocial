// src/routes/AdminRoutes.tsx
"use client"

import { Routes, Route, Navigate } from "react-router-dom"
import AdminLayout from "../Components/admin/AdminLayout"
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
import CheckAdmin from "../pages/admin/CheckAdmin"
import instance from "../services/instance"

const useAdminAuth = () => {
  const [isAuthenticated, setIsAuthenticated] = useState(false)
  const [isLoading, setIsLoading] = useState(true)

  useEffect(() => {
    const checkAdminAuth = async () => {
      try {
        const res = await instance.get("admin/tasks")
        if (res.status === 200 && res.data.success === true) {
          localStorage.setItem("adminAuth", "true")
          setIsAuthenticated(true)
        } else {
          localStorage.removeItem("adminAuth")
          setIsAuthenticated(false)
        }
      } catch (err) {
        localStorage.removeItem("adminAuth")
        setIsAuthenticated(false)
      } finally {
        setIsLoading(false)
      }
    }
    

    const adminAuth = localStorage.getItem("adminAuth")
    if (adminAuth) {
      checkAdminAuth()  // Kiểm tra quyền admin
    } else {
      setIsLoading(false)
    }
  }, [])

  return { isAuthenticated, isLoading }
}

const ProtectedAdminRoute = ({ children }: { children: React.ReactNode }) => {
  const { isAuthenticated, isLoading } = useAdminAuth()

  if (isLoading) {
    return <div className="flex items-center justify-center h-screen">Loading...</div>
  }

  if (!isAuthenticated) {
    return <Navigate to="/admin/check" replace />
  }

  return children
}

const AdminRoutes = () => {
  return (
    <Routes>
      <Route path="/admin/check" element={<CheckAdmin />} />
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
