import React from 'react';

const Header: React.FC = () => {
  return (
    <div className="row mb-6">
      <div className="col-span-12">
        <h1 className="text-2xl md:text-3xl font-bold text-gray-800 dark:text-white font-inter tracking-tight">
          User Management
        </h1>
        <p className="mt-2 text-sm md:text-base text-gray-600 dark:text-gray-400 font-inter">
          Manage and monitor user accounts
        </p>
      </div>
    </div>
  );
};

export default Header; 