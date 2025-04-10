import React, { useState } from 'react';
import { Link, useLocation, useNavigate } from 'react-router-dom';
import { FiUsers, FiActivity, FiCheckSquare, FiDollarSign, FiSettings, FiFileText, FiHome, FiMenu, FiX, FiLogOut } from 'react-icons/fi';

interface AdminLayoutProps {
  children: React.ReactNode;
}

const AdminLayout: React.FC<AdminLayoutProps> = ({ children }) => {
  const [sidebarOpen, setSidebarOpen] = useState(false);
  const location = useLocation();
  const navigate = useNavigate();

  const menuItems = [
    { name: 'Dashboard', path: '/admin', icon: <FiHome size={20} /> },
    { name: 'User Management', path: '/admin/users', icon: <FiUsers size={20} /> },
    { name: 'Content Moderation', path: '/admin/posts/moderation', icon: <FiActivity size={20} /> },
    { name: 'Task Management', path: '/admin/tasks', icon: <FiCheckSquare size={20} /> },
    { name: 'Mint Tokens', path: '/admin/blockchain/mint', icon: <FiDollarSign size={20} /> },
    { name: 'System Settings', path: '/admin/settings', icon: <FiSettings size={20} /> },
    { name: 'System Logs', path: '/admin/logs', icon: <FiFileText size={20} /> },
  ];

  const isActive = (path: string) => {
    if (path === '/admin') {
      return location.pathname === path;
    }
    return location.pathname.startsWith(path);
  };

  const toggleSidebar = () => {
    setSidebarOpen(!sidebarOpen);
  };

  const handleLogout = () => {
    // In a real app, handle logout logic
    if (window.confirm('Are you sure you want to log out?')) {
      // Placeholder for logout logic
      console.log('Logging out...');
      navigate('/');
    }
  };

  return (
    <div className="flex h-screen w-screen overflow-hidden bg-gray-100">
      {/* Mobile sidebar backdrop */}
      {sidebarOpen && (
        <div 
          className="fixed inset-0 z-20 bg-black bg-opacity-50 lg:hidden"
          onClick={toggleSidebar}
        />
      )}

      {/* Sidebar */}
      <div 
        className={`fixed inset-y-0 left-0 z-30 w-64 bg-gray-900 text-white transform transition-transform duration-300 ease-in-out lg:translate-x-0 lg:static lg:inset-0 ${
          sidebarOpen ? 'translate-x-0' : '-translate-x-full'
        }`}
      >
        <div className="flex items-center justify-between p-4">
          <div className="flex items-center">
            <div className="w-8 h-8 bg-blue-500 rounded-full mr-2 flex items-center justify-center">
              <span className="font-bold text-white">DX</span>
            </div>
            <h1 className="text-xl font-semibold">DappSocial Admin</h1>
          </div>
          <button onClick={toggleSidebar} className="lg:hidden">
            <FiX size={24} />
          </button>
        </div>
        
        <nav className="mt-4">
          <ul className="space-y-1">
            {menuItems.map((item) => (
              <li key={item.path}>
                <Link
                  to={item.path}
                  className={`flex items-center px-4 py-3 hover:bg-gray-800 ${
                    isActive(item.path) ? 'bg-gray-800 border-l-4 border-blue-500' : ''
                  }`}
                >
                  <span className="mr-3">{item.icon}</span>
                  {item.name}
                </Link>
              </li>
            ))}
          </ul>
        </nav>
        
        <div className="absolute bottom-0 w-full p-4">
          <button 
            onClick={handleLogout}
            className="flex items-center text-red-400 hover:text-red-300 w-full px-4 py-2"
          >
            <FiLogOut className="mr-2" size={20} />
            Logout
          </button>
        </div>
      </div>

      {/* Main content */}
      <div className="flex-1 flex flex-col overflow-hidden">
        {/* Top bar */}
        <header className="bg-white shadow-sm p-4 flex items-center justify-between">
          <button 
            onClick={toggleSidebar} 
            className="text-gray-500 lg:hidden"
          >
            <FiMenu size={24} />
          </button>
          
          <div className="flex items-center">
            <div className="ml-4 flex items-center">
              <img
                className="h-8 w-8 rounded-full"
                src="/admin-avatar.png"
                alt="Admin avatar"
                onError={(e) => {
                  // Fallback if image doesn't load
                  (e.target as HTMLImageElement).src = 'https://ui-avatars.com/api/?name=Admin&background=0D8ABC&color=fff';
                }}
              />
              <span className="ml-2 text-sm font-medium text-gray-700">Administrator</span>
            </div>
          </div>
        </header>

        {/* Content area */}
        <main className="flex-1 overflow-y-auto">
          {children}
        </main>
      </div>
    </div>
  );
};

export default AdminLayout; 