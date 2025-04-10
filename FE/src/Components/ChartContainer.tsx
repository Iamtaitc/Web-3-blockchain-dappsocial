import React, { ReactNode } from 'react';

type ChartContainerProps = {
  children: ReactNode;
  height?: string;
  title: string;
  actions?: ReactNode;
};

const ChartContainer: React.FC<ChartContainerProps> = ({ 
  children, 
  height = '100%', 
  title,
  actions
}) => {
  return (
    <div className="bg-white rounded-xl shadow-sm p-6 border border-gray-100">
      <div className="flex flex-col sm:flex-row justify-between items-start sm:items-center mb-6">
        <h2 className="text-xl font-bold text-gray-800 mb-4 sm:mb-0">{title}</h2>
        {actions && <div>{actions}</div>}
      </div>
      <div style={{ height }}>
        {children}
      </div>
    </div>
  );
};

export default ChartContainer;