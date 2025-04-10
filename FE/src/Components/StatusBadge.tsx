import React from 'react';

type StatusBadgeProps = {
  text: string;
  type: 'info' | 'success' | 'warning' | 'error' | 'default';
};

const StatusBadge: React.FC<StatusBadgeProps> = ({ text, type }) => {
  const getBadgeStyles = () => {
    switch (type) {
      case 'info':
        return 'bg-blue-100 text-blue-800';
      case 'success':
        return 'bg-green-100 text-green-800';
      case 'warning':
        return 'bg-yellow-100 text-yellow-800';
      case 'error':
        return 'bg-red-100 text-red-800';
      default:
        return 'bg-gray-100 text-gray-800';
    }
  };

  return (
    <span className={`px-2 py-1 text-xs font-semibold rounded-full ${getBadgeStyles()}`}>
      {text}
    </span>
  );
};

export default StatusBadge;
