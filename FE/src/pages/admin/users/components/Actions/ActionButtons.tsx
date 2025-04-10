import React from 'react';
import { FiUserPlus, FiDownload } from 'react-icons/fi';

const ActionButtons: React.FC = () => {
  return (
    <div className="col-span-12 mt-4 md:mt-0 md:col-span-12 lg:col-span-12 flex flex-col md:flex-row md:justify-end space-y-3 md:space-y-0 md:space-x-4">
      <button 
        onClick={() => window.alert('Add user feature would be implemented in production')}
        className="px-4 py-2 md:px-6 bg-blue-500 hover:bg-blue-600 text-white rounded-lg transition-colors flex items-center justify-center dark:bg-blue-600 dark:hover:bg-blue-700 font-inter font-medium"
      >
        <FiUserPlus className="w-5 h-5 mr-2" />
        Add User
      </button>
      <button 
        onClick={() => window.alert('Export feature would be implemented in production')}
        className="px-4 py-2 md:px-6 bg-gray-500 hover:bg-gray-600 text-white rounded-lg transition-colors flex items-center justify-center dark:bg-gray-600 dark:hover:bg-gray-700 font-inter font-medium"
      >
        <FiDownload className="w-5 h-5 mr-2" />
        Export
      </button>
    </div>
  );
};

export default ActionButtons; 