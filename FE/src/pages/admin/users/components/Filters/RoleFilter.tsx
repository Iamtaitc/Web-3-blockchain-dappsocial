import React from 'react';

interface RoleFilterProps {
  roleFilter: string;
  setRoleFilter: (value: string) => void;
}

const RoleFilter: React.FC<RoleFilterProps> = ({ roleFilter, setRoleFilter }) => {
  return (
    <div className="col-span-12 md:col-span-6 lg:col-span-3">
      <label className="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-2 font-inter">
        Role
      </label>
      <select
        value={roleFilter}
        onChange={(e) => setRoleFilter(e.target.value)}
        className="w-full px-4 py-2 border border-gray-200 dark:border-gray-600 rounded-lg focus:outline-none focus:ring-2 focus:ring-blue-500 focus:border-transparent bg-white dark:bg-gray-700 text-gray-900 dark:text-white font-inter"
      >
        <option value="all">All Roles</option>
        <option value="user">User</option>
        <option value="moderator">Moderator</option>
        <option value="admin">Admin</option>
      </select>
    </div>
  );
};

export default RoleFilter; 