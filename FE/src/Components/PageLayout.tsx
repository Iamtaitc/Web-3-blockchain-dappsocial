import React, { ReactNode } from 'react';

type PageLayoutProps = {
  title: string;
  subtitle?: string;
  children: ReactNode;
};

const PageLayout: React.FC<PageLayoutProps> = ({ 
  title, 
  subtitle, 
  children 
}) => {
  return (
    <div className="w-full min-h-screen bg-gray-50">
      {/* Header Section */}
      <div className="w-full bg-white shadow-sm py-8 px-8">
        <div className="max-w-7xl mx-auto">
          <h1 className="text-3xl font-bold text-gray-800">{title}</h1>
          {subtitle && <p className="mt-2 text-gray-600">{subtitle}</p>}
        </div>
      </div>

      {/* Main Content */}
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-8">
        {children}
      </div>
    </div>
  );
};

export default PageLayout;
