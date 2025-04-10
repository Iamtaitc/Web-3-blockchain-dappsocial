// 1. StatCard.tsx - Component thẻ thống kê có thể tái sử dụng
import React from 'react';

type StatCardProps = {
  title: string;
  value: number | string;
  badgeText: string;
  badgeColor: 'green' | 'yellow' | 'blue' | 'red';
  onClick?: () => void;
};

const StatCard: React.FC<StatCardProps> = ({ 
  title, 
  value, 
  badgeText, 
  badgeColor, 
  onClick 
}) => {
  // Map màu sắc của badge
  const getBadgeColors = (color: string) => {
    switch (color) {
      case 'green': return 'text-green-500 bg-green-50';
      case 'yellow': return 'text-yellow-500 bg-yellow-50';
      case 'blue': return 'text-blue-500 bg-blue-50';
      case 'red': return 'text-red-500 bg-red-50';
      default: return 'text-gray-500 bg-gray-50';
    }
  };

  return (
    <div 
      onClick={onClick}
      className={`bg-white rounded-xl shadow-sm p-6 cursor-pointer hover:shadow-lg 
                  transition-shadow border border-gray-100 h-40 flex flex-col justify-between
                  ${onClick ? 'cursor-pointer' : 'cursor-default'}`}
    >
      <h3 className="text-lg font-semibold text-gray-600">{title}</h3>
      <p className="text-3xl font-bold">{typeof value === 'number' ? value.toLocaleString() : value}</p>
      <div className="mt-2">
        <span className={`${getBadgeColors(badgeColor)} px-2 py-1 rounded-full text-sm`}>
          {badgeText}
        </span>
      </div>
    </div>
  );
};

export default StatCard;
