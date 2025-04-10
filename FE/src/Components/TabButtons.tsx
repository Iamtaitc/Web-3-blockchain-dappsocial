import React from 'react';

type TabOption = {
  value: string;
  label: string;
};

type TabButtonsProps = {
  options: TabOption[];
  currentValue: string;
  onChange: (value: string) => void;
};

const TabButtons: React.FC<TabButtonsProps> = ({ 
  options, 
  currentValue, 
  onChange 
}) => {
  return (
    <div className="flex space-x-2">
      {options.map((option) => (
        <button
          key={option.value}
          onClick={() => onChange(option.value)}
          className={`px-3 py-1 rounded-lg transition-colors ${
            currentValue === option.value
              ? 'bg-blue-500 text-white'
              : 'bg-gray-100 text-gray-600 hover:bg-gray-200'
          }`}
        >
          {option.label}
        </button>
      ))}
    </div>
  );
};

export default TabButtons;
