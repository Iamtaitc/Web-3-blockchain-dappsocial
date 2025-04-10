import React from 'react';
import { FiEdit2, FiTrash2 } from 'react-icons/fi';
import { User } from '../../types';

interface UserRowProps {
  user: User;
  onEdit: (user: User) => void;
  onDelete: (user: User) => void;
}

const UserRow: React.FC<UserRowProps> = ({ user, onEdit, onDelete }) => {
  const getRoleColor = (role: string) => {
    switch (role) {
      case 'admin': return 'bg-purple-100 text-purple-800 dark:bg-purple-900 dark:text-purple-200';
      case 'moderator': return 'bg-blue-100 text-blue-800 dark:bg-blue-900 dark:text-blue-200';
      case 'user': return 'bg-gray-100 text-gray-800 dark:bg-gray-700 dark:text-gray-200';
      default: return 'bg-gray-100 text-gray-800 dark:bg-gray-700 dark:text-gray-200';
    }
  };

  const getStatusColor = (status: string) => {
    switch (status) {
      case 'active': return 'bg-green-100 text-green-800 dark:bg-green-900 dark:text-green-200';
      case 'suspended': return 'bg-red-100 text-red-800 dark:bg-red-900 dark:text-red-200';
      case 'pending': return 'bg-yellow-100 text-yellow-800 dark:bg-yellow-900 dark:text-yellow-200';
      default: return 'bg-gray-100 text-gray-800 dark:bg-gray-700 dark:text-gray-200';
    }
  };

  return (
    <tr className="hover:bg-gray-50 dark:hover:bg-gray-700 transition-colors">
      <td className="px-4 md:px-6 py-4 whitespace-nowrap">
        <div className="flex items-center">
          <div className="h-8 w-8 md:h-10 md:w-10 flex-shrink-0">
            <img className="h-8 w-8 md:h-10 md:w-10 rounded-full" src={user.avatar} alt="" />
          </div>
          <div className="ml-3 md:ml-4">
            <div className="text-sm font-medium text-gray-900 dark:text-white">{user.username}</div>
            <div className="text-xs md:text-sm text-gray-500 dark:text-gray-400">{user.email}</div>
          </div>
        </div>
      </td>
      <td className="px-4 md:px-6 py-4 whitespace-nowrap">
        <div className="text-xs md:text-sm text-gray-900 dark:text-white font-mono">{user.walletAddress}</div>
      </td>
      <td className="px-4 md:px-6 py-4 whitespace-nowrap">
        <span className={`px-2 py-1 inline-flex text-xs leading-5 font-semibold rounded-full ${getRoleColor(user.role)}`}>
          {user.role.charAt(0).toUpperCase() + user.role.slice(1)}
        </span>
      </td>
      <td className="px-4 md:px-6 py-4 whitespace-nowrap">
        <span className={`px-2 py-1 inline-flex text-xs leading-5 font-semibold rounded-full ${getStatusColor(user.status)}`}>
          {user.status.charAt(0).toUpperCase() + user.status.slice(1)}
        </span>
      </td>
      <td className="px-4 md:px-6 py-4 whitespace-nowrap text-xs md:text-sm text-gray-500 dark:text-gray-400">
        {new Date(user.joinDate).toLocaleDateString()}
      </td>
      <td className="px-4 md:px-6 py-4 whitespace-nowrap text-xs md:text-sm text-gray-500 dark:text-gray-400">
        {new Date(user.lastActive).toLocaleDateString()}
      </td>
      <td className="px-4 md:px-6 py-4 whitespace-nowrap text-right text-sm font-medium">
        <div className="flex justify-end space-x-3">
          <button
            onClick={() => onEdit(user)}
            className="text-indigo-600 dark:text-indigo-400 hover:text-indigo-900 dark:hover:text-indigo-300 transition-colors"
          >
            <FiEdit2 className="h-4 w-4 md:h-5 md:w-5" />
          </button>
          <button
            onClick={() => onDelete(user)}
            className="text-red-600 dark:text-red-400 hover:text-red-900 dark:hover:text-red-300 transition-colors"
          >
            <FiTrash2 className="h-4 w-4 md:h-5 md:w-5" />
          </button>
        </div>
      </td>
    </tr>
  );
};

export default UserRow; 