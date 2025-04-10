import React from 'react';
import { FiSearch } from 'react-icons/fi';

interface SearchFilterProps {
  searchTerm: string;
  setSearchTerm: (value: string) => void;
}

const SearchFilter: React.FC<SearchFilterProps> = ({ searchTerm, setSearchTerm }) => {
  return (
    <div className="col-span-12 lg:col-span-6">
      <div className="relative">
        <div className="absolute inset-y-0 left-0 pl-3 flex items-center pointer-events-none">
          <FiSearch className="h-5 w-5 text-gray-400 dark:text-gray-500" />
        </div>
        <input
          type="text"
          placeholder="Search users..."
          value={searchTerm}
          onChange={(e) => setSearchTerm(e.target.value)}
          className="pl-10 w-full px-4 py-2 border border-gray-200 dark:border-gray-600 rounded-lg focus:outline-none focus:ring-2 focus:ring-blue-500 focus:border-transparent bg-white dark:bg-gray-700 text-gray-900 dark:text-white font-inter"
        />
      </div>
    </div>
  );
};

export default SearchFilter; 