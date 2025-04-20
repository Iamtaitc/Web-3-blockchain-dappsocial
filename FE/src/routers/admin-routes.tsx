// src/routes/AdminRoutes.tsx
import { Routes, Route, Navigate } from "react-router-dom";
import { useEffect, useState } from "react";
import AdminLayout from "../Components/admin/AdminLayout";
import Dashboard from "../pages/admin/Dashboard";
import UserManagement from "../pages/admin/UserManagement";
import ContentModeration from "../pages/admin/ContentModeration";
import TaskManagement from "../pages/admin/TaskManagement";
import TokenManagement from "../pages/admin/TokenManagement";
import SystemNotifications from "../pages/admin/SystemNotifications";
import SystemConfiguration from "../pages/admin/SystemConfiguration";
import LogManagement from "../pages/admin/LogManagement";
import BlockchainSync from "../pages/admin/BlockchainSync";
import CheckAdmin from "../pages/admin/CheckAdmin";
import AdminApi from "../services/AdminApi";

const useAdminAuth = () => {
  const [isAuthenticated, setIsAuthenticated] = useState(false);
  const [isLoading, setIsLoading] = useState(true);



  useEffect(() => {
    const checkAdminAuth = async () => {
      try {
        const result = await AdminApi.checkAdminAccess();
        if (result.success) {
          localStorage.setItem("adminAuth", "true");
          setIsAuthenticated(true);
        } else {
          localStorage.removeItem("adminAuth");
          setIsAuthenticated(false);
        }
      } catch (error) {
        localStorage.removeItem("adminAuth");
        setIsAuthenticated(false);
      } finally {
        setIsLoading(false);
      }
    };

    const adminAuth = localStorage.getItem("adminAuth");
    if (adminAuth === "true") {
      checkAdminAuth();
    } else {
      setIsLoading(false);
      setIsAuthenticated(false);
    }
  }, []);

  return { isAuthenticated, isLoading };
};

const ProtectedAdminRoute = ({ children }: { children: React.ReactNode }) => {
  const { isAuthenticated, isLoading } = useAdminAuth();



  if (isLoading) {
    return <div>Loading...</div>;
  }

  if (!isAuthenticated) {
    return <Navigate to="/check-admin" replace />;
  }

  return <>{children}</>;
};

const AdminRoutes = () => {
  return (
    <Routes>
      <Route path="/check-admin" element={<CheckAdmin />} />
      <Route
        element={
          <ProtectedAdminRoute>
            <AdminLayout />
          </ProtectedAdminRoute>
        }
      >
        <Route path="/admin" element={<Dashboard />} />
        <Route path="/admin/users" element={<UserManagement />} />
        <Route path="/admin/content" element={<ContentModeration />} />
        <Route path="/admin/tasks" element={<TaskManagement />} />
        <Route path="/admin/tokens" element={<TokenManagement />} />
        <Route path="/admin/notifications" element={<SystemNotifications />} />
        <Route path="/admin/config" element={<SystemConfiguration />} />
        <Route path="/admin/logs" element={<LogManagement />} />
        <Route path="/admin/blockchain" element={<BlockchainSync />} />
        
      </Route>
    </Routes>
  );
};

export default AdminRoutes;