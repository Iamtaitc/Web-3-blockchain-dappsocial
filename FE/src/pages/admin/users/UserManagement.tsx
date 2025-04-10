import React, { useState, useEffect } from 'react';
import { FiSearch, FiFilter, FiEdit2, FiTrash2, FiUserPlus, FiDownload } from 'react-icons/fi';

import PageLayout from '../../../Components/PageLayout';
import DashboardCard from '../../../Components/DashboardCard';
import ActionButton from '../../../Components/ActionButton';
import StatusBadge from '../../../Components/StatusBadge';
import DataTable from '../../../Components/DataTable';
import Modal from '../../../Components/Modal';

type User = {
  id: string;
  avatar: string;
  username: string;
  email: string;
  walletAddress: string;
  role: 'user' | 'moderator' | 'admin';
  status: 'active' | 'suspended' | 'pending';
  joinDate: string;
  lastActive: string;
};

const UserManagement: React.FC = () => {
  const [users, setUsers] = useState<User[]>([]);
  const [loading, setLoading] = useState(true);
  const [searchTerm, setSearchTerm] = useState('');
  const [roleFilter, setRoleFilter] = useState('all');
  const [statusFilter, setStatusFilter] = useState('all');
  const [selectedUser, setSelectedUser] = useState<User | null>(null);
  const [isEditModalOpen, setIsEditModalOpen] = useState(false);
  const [isDeleteModalOpen, setIsDeleteModalOpen] = useState(false);

  useEffect(() => {
    fetchUsers();
  }, []);

  const fetchUsers = async () => {
    try {
      setLoading(true);
      // In a real app, this would be an API call
      const mockUsers: User[] = [
        {
          id: '1',
          avatar: 'https://ui-avatars.com/api/?name=John+Doe&background=0D8ABC&color=fff',
          username: 'johndoe',
          email: 'john@example.com',
          walletAddress: '0x1234...5678',
          role: 'user',
          status: 'active',
          joinDate: '2024-01-15',
          lastActive: '2024-03-14'
        },
        {
          id: '2',
          avatar: 'https://ui-avatars.com/api/?name=Alice+Smith&background=2E8B57&color=fff',
          username: 'alicesmith',
          email: 'alice@example.com',
          walletAddress: '0x8765...4321',
          role: 'moderator',
          status: 'active',
          joinDate: '2024-02-01',
          lastActive: '2024-03-15'
        },
        {
          id: '3',
          avatar: 'https://ui-avatars.com/api/?name=Bob+Wilson&background=CD853F&color=fff',
          username: 'bobwilson',
          email: 'bob@example.com',
          walletAddress: '0x9876...5432',
          role: 'user',
          status: 'suspended',
          joinDate: '2024-02-15',
          lastActive: '2024-03-10'
        },
        {
          id: '4',
          avatar: 'https://ui-avatars.com/api/?name=Emma+Davis&background=8B008B&color=fff',
          username: 'emmadavis',
          email: 'emma@example.com',
          walletAddress: '0x3456...7890',
          role: 'admin',
          status: 'active',
          joinDate: '2024-01-01',
          lastActive: '2024-03-15'
        },
        {
          id: '5',
          avatar: 'https://ui-avatars.com/api/?name=Mike+Brown&background=556B2F&color=fff',
          username: 'mikebrown',
          email: 'mike@example.com',
          walletAddress: '0x2345...6789',
          role: 'user',
          status: 'pending',
          joinDate: '2024-03-01',
          lastActive: '2024-03-01'
        }
      ];
      setUsers(mockUsers);
    } catch (error) {
      console.error('Error fetching users:', error);
    } finally {
      setLoading(false);
    }
  };

  const filteredUsers = users.filter(user => {
    const matchesSearch = 
      user.username.toLowerCase().includes(searchTerm.toLowerCase()) ||
      user.email.toLowerCase().includes(searchTerm.toLowerCase()) ||
      user.walletAddress.toLowerCase().includes(searchTerm.toLowerCase());
    
    const matchesRole = roleFilter === 'all' || user.role === roleFilter;
    const matchesStatus = statusFilter === 'all' || user.status === statusFilter;
    
    return matchesSearch && matchesRole && matchesStatus;
  });

  const handleEditUser = (user: User) => {
    setSelectedUser(user);
    setIsEditModalOpen(true);
  };

  const handleDeleteUser = (user: User) => {
    setSelectedUser(user);
    setIsDeleteModalOpen(true);
  };

  // Cấu hình cột cho DataTable
  const columns = [
    { 
      header: 'User', 
      accessor: 'user',
      cell: (value: any, user: User) => (
        <div className="flex items-center">
          <div className="h-10 w-10 flex-shrink-0">
            <img className="h-10 w-10 rounded-full" src={user.avatar} alt="" />
          </div>
          <div className="ml-4">
            <div className="text-sm font-medium text-gray-900">{user.username}</div>
            <div className="text-sm text-gray-500">{user.email}</div>
          </div>
        </div>
      )
    },
    { 
      header: 'Wallet Address', 
      accessor: 'walletAddress',
      cell: (value: string) => (
        <div className="text-sm text-gray-900">{value}</div>
      )
    },
    { 
      header: 'Role', 
      accessor: 'role',
      cell: (value: string) => {
        const type = value === 'admin' ? 'info' : 
                     value === 'moderator' ? 'success' : 'default';
        
        return (
          <StatusBadge 
            text={value.charAt(0).toUpperCase() + value.slice(1)} 
            type={type as any} 
          />
        );
      }
    },
    { 
      header: 'Status', 
      accessor: 'status',
      cell: (value: string) => {
        const type = value === 'active' ? 'success' : 
                     value === 'suspended' ? 'error' : 
                     value === 'pending' ? 'warning' : 'default';
        
        return (
          <StatusBadge 
            text={value.charAt(0).toUpperCase() + value.slice(1)} 
            type={type as any} 
          />
        );
      }
    },
    { 
      header: 'Join Date', 
      accessor: 'joinDate',
      cell: (value: string) => (
        <div className="text-sm text-gray-500">
          {new Date(value).toLocaleDateString()}
        </div>
      )
    },
    { 
      header: 'Last Active', 
      accessor: 'lastActive',
      cell: (value: string) => (
        <div className="text-sm text-gray-500">
          {new Date(value).toLocaleDateString()}
        </div>
      )
    },
    { 
      header: 'Actions', 
      accessor: 'actions',
      cell: (value: any, user: User) => (
        <div className="flex justify-end space-x-3">
          <button
            onClick={() => handleEditUser(user)}
            className="text-indigo-600 hover:text-white hover:bg-indigo-500 bg-white transition-colors"
          >
            <FiEdit2 className="h-5 w-5" />
          </button>
          <button
            onClick={() => handleDeleteUser(user)}
            className="text-red-600 hover:text-white hover:bg-red-500 bg-white transition-colors"
          >
            <FiTrash2 className="h-5 w-5" />
          </button>
        </div>
      )
    }
  ];

  // Xử lý loading state
  if (loading) {
    return (
      <div className="flex justify-center items-center h-screen">
        <div className="animate-spin rounded-full h-12 w-12 border-t-2 border-b-2 border-blue-500"></div>
      </div>
    );
  }

  return (
    <PageLayout 
      title="User Management" 
      subtitle="Manage and monitor user accounts"
    >
      {/* Actions and Filters Card */}
      <div className="mb-8">
        <DashboardCard title="">
          <div className="grid grid-cols-1 md:grid-cols-12 gap-6">
            {/* Search Input */}
            <div className="md:col-span-6">
            <label className="block text-sm font-medium text-gray-700 mb-2">
                Search
              </label>
              <div className="relative">
                
                <div className="absolute inset-y-0 left-0 pl-3 flex items-center pointer-events-none">
                  <FiSearch className="h-5 w-5 text-gray-400" />
                </div>
                <input
                  type="text"
                  placeholder="Search users..."
                  value={searchTerm}
                  onChange={(e) => setSearchTerm(e.target.value)}
                  className="pl-10 w-full px-4 py-2 border bg-[#f8fafc] border-gray-200 rounded-lg focus:outline-none focus:ring-2 focus:ring-blue-500 focus:border-transparent"
                />
              </div>
            </div>

            {/* Filters */}
            <div className="md:col-span-3">
              <label className="block text-sm font-medium text-gray-700 mb-2">
                Role
              </label>
              <select
                value={roleFilter}
                onChange={(e) => setRoleFilter(e.target.value)}
                className="w-full px-4 py-2 border border-gray-200 rounded-lg focus:outline-none focus:ring-2 focus:ring-blue-500 focus:border-transparent"
              >
                <option value="all">All Roles</option>
                <option value="user">User</option>
                <option value="moderator">Moderator</option>
                <option value="admin">Admin</option>
              </select>
            </div>

            <div className="md:col-span-3">
              <label className="block text-sm font-medium text-gray-700 mb-2">
                Status
              </label>
              <select
                value={statusFilter}
                onChange={(e) => setStatusFilter(e.target.value)}
                className="w-full px-4 py-2 border border-gray-200 rounded-lg focus:outline-none focus:ring-2 focus:ring-blue-500 focus:border-transparent"
              >
                <option value="all">All Status</option>
                <option value="active">Active</option>
                <option value="suspended">Suspended</option>
                <option value="pending">Pending</option>
              </select>
            </div>

            {/* Action Buttons */}
            <div className="md:col-span-12 flex flex-col md:flex-row md:justify-end space-y-3 md:space-y-0 md:space-x-4">
              <ActionButton 
                text="Add User" 
                color="blue"
                fullWidth={false}
                onClick={() => window.alert('Add user feature would be implemented in production')}
                icon={<FiUserPlus className="w-5 h-5 mr-2 " />}
              />
              <ActionButton 
                text="Export" 
                color="gray"
                fullWidth={false}
                onClick={() => window.alert('Export feature would be implemented in production')}
                icon={<FiDownload className="w-5 h-5 mr-2   " />}
              />
            </div>
          </div>
        </DashboardCard>
      </div>

      {/* Users Table */}
      <DashboardCard title="Users">
        <DataTable 
          columns={columns}
          data={filteredUsers}
        />
      </DashboardCard>

      {/* Edit User Modal */}
      {isEditModalOpen && selectedUser && (
        <Modal
          title="Edit User"
          onClose={() => setIsEditModalOpen(false)}
          footer={
            <div className="flex flex-col-reverse md:flex-row justify-end space-y-3 space-y-reverse md:space-y-0 md:space-x-4">
              <button 
                onClick={() => setIsEditModalOpen(false)}
                className="px-4 py-2 bg-gray-100 text-gray-800 rounded-lg hover:bg-gray-200 transition-colors"
              >
                Cancel
              </button>
              <ActionButton 
                text="Save Changes" 
                color="blue"
                fullWidth={false}
                onClick={() => {
                  window.alert('Save changes would be implemented in production');
                  setIsEditModalOpen(false);
                }}
              />
            </div>
          }
        >
          <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
            <div className="md:col-span-2">
              <label className="block text-sm font-medium text-gray-700">Username</label>
              <input
                type="text"
                defaultValue={selectedUser.username}
                className="mt-1 w-full px-4 py-2 border border-gray-200 rounded-lg focus:outline-none focus:ring-2 focus:ring-blue-500 focus:border-transparent"
              />
            </div>
            <div className="md:col-span-2">
              <label className="block text-sm font-medium text-gray-700">Email</label>
              <input
                type="email"
                defaultValue={selectedUser.email}
                className="mt-1 w-full px-4 py-2 border border-gray-200 rounded-lg focus:outline-none focus:ring-2 focus:ring-blue-500 focus:border-transparent"
              />
            </div>
            <div>
              <label className="block text-sm font-medium text-gray-700">Role</label>
              <select
                defaultValue={selectedUser.role}
                className="mt-1 w-full px-4 py-2 border border-gray-200 rounded-lg focus:outline-none focus:ring-2 focus:ring-blue-500 focus:border-transparent"
              >
                <option value="user">User</option>
                <option value="moderator">Moderator</option>
                <option value="admin">Admin</option>
              </select>
            </div>
            <div>
              <label className="block text-sm font-medium text-gray-700">Status</label>
              <select
                defaultValue={selectedUser.status}
                className="mt-1 w-full px-4 py-2 border border-gray-200 rounded-lg focus:outline-none focus:ring-2 focus:ring-blue-500 focus:border-transparent"
              >
                <option value="active">Active</option>
                <option value="suspended">Suspended</option>
                <option value="pending">Pending</option>
              </select>
            </div>
          </div>
        </Modal>
      )}

      {/* Delete User Modal */}
      {isDeleteModalOpen && selectedUser && (
        <Modal
          title="Delete User"
          onClose={() => setIsDeleteModalOpen(false)}
          footer={
            <div className="flex flex-col-reverse md:flex-row justify-end space-y-3 space-y-reverse md:space-y-0 md:space-x-4">
              <button 
                onClick={() => setIsDeleteModalOpen(false)}
                className="px-4 py-2 bg-gray-100 text-gray-800 rounded-lg hover:bg-gray-200 transition-colors"
              >
                Cancel
              </button>
              <ActionButton 
                text="Delete User" 
                color="red"
                fullWidth={false}
                onClick={() => {
                  window.alert('Delete user would be implemented in production');
                  setIsDeleteModalOpen(false);
                }}
              />
            </div>
          }
        >
          <p className="text-base text-gray-700">
            Are you sure you want to delete the user <span className="font-semibold">{selectedUser.username}</span>? 
            This action cannot be undone.
          </p>
        </Modal>
      )}
    </PageLayout>
  );
};
export default UserManagement;