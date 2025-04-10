import React, { useEffect, useState } from 'react';
import { Routes, Route, Navigate, useNavigate } from 'react-router-dom';

// Admin Layout
import AdminLayout from '../pages/admin/AdminLayout';

// Admin Components
import AdminDashboard from '../pages/admin/AdminDashboard';
import UserManagement from '../pages/admin/users/UserManagement';
import ContentModeration from '../pages/admin/content/ContentModeration';
import TaskManagement from '../pages/admin/tasks/TaskManagement';
import TokenMint from '../pages/admin/blockchain/TokenMint';
import SystemSettings from '../pages/admin/settings/SystemSettings';
import SystemLogs from '../pages/admin/logs/SystemLogs';

// You would import from a proper authentication context in a real app
// import { useAuth } from '../contexts/AuthContext';

interface AdminRouterProps {
  isAdmin?: boolean; // For demo purposes
}

const AdminRouter: React.FC<AdminRouterProps> = ({ isAdmin = true }) => {
  const navigate = useNavigate();
  const [adminChecked, setAdminChecked] = useState(false);
  
  useEffect(() => {
    // In a real app, you would check if the user is logged in and has admin rights
    // For demo purposes, we'll use the isAdmin prop
    const checkAdminRights = async () => {
      // Simulate API call delay
      await new Promise(resolve => setTimeout(resolve, 500));
      
      if (!isAdmin) {
        alert('You do not have admin access');
        navigate('/');
      }
      
      setAdminChecked(true);
    };
    
    checkAdminRights();
  }, [isAdmin, navigate]);
  
  if (!adminChecked) {
    return (
      <div className="flex justify-center items-center h-screen">
        <div className="animate-spin rounded-full h-12 w-12 border-t-2 border-b-2 border-blue-500"></div>
      </div>
    );
  }
  
  return (
    <AdminLayout>
      <Routes>
        <Route path="/" element={<AdminDashboard />} />
        <Route path="/users" element={<UserManagement />} />
        <Route path="/posts/moderation" element={<ContentModeration />} />
        <Route path="/tasks" element={<TaskManagement />} />
        <Route path="/blockchain/mint" element={<TokenMint />} />
        <Route path="/settings" element={<SystemSettings />} />
        <Route path="/logs" element={<SystemLogs />} />
        
        {/* Fallback route */}
        <Route path="*" element={<Navigate to="/admin" replace />} />
      </Routes>
    </AdminLayout>
  );
};

export default AdminRouter; 