import React from 'react';

interface StatusFilterProps {
  statusFilter: string;
  setStatusFilter: (value: string) => void;
}

const StatusFilter: React.FC<StatusFilterProps> = ({ statusFilter, setStatusFilter }) => {
  return (
    <div className="col-span-12 md:col-span-6 lg:col-span-3">
      <label className="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-2 font-inter">
        Status
      </label>
      <select
        value={statusFilter}
        onChange={(e) => setStatusFilter(e.target.value)}
        className="w-full px-4 py-2 border border-gray-200 dark:border-gray-600 rounded-lg focus:outline-none focus:ring-2 focus:ring-blue-500 focus:border-transparent bg-white dark:bg-gray-700 text-gray-900 dark:text-white font-inter"
      >
        <option value="all">All Status</option>
        <option value="active">Active</option>
        <option value="suspended">Suspended</option>
        <option value="pending">Pending</option>
      </select>
    </div>
  );
};

export default StatusFilter; 