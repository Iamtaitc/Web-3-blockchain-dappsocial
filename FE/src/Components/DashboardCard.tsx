import React, { ReactNode } from 'react';

type DashboardCardProps = {
  title: string;
  children: ReactNode;
  actionText?: string;
  onActionClick?: () => void;
  height?: string;
};

const DashboardCard: React.FC<DashboardCardProps> = ({ 
  title, 
  children, 
  actionText, 
  onActionClick,
  height = 'auto'
}) => {
  return (
    <div className={`bg-white rounded-xl shadow-sm p-6 border border-gray-100`} style={{ height }}>
      <div className="flex flex-col sm:flex-row justify-between items-start sm:items-center mb-6">
        <h2 className="text-xl font-bold text-gray-800 mb-4 sm:mb-0">{title}</h2>
        {actionText && onActionClick && (
          <button 
            onClick={onActionClick}
            className="text-blue-500 hover:text-blue-700 font-medium"
          >
            {actionText}
          </button>
        )}
      </div>
      {children}
    </div>
  );
};

export default DashboardCard;
