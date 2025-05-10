import React from "react";

interface TabButtonProps {
  active: boolean;
  onClick: () => void;
  label: string;
}

const TabButton: React.FC<TabButtonProps> = ({ active, onClick, label }) => {
  return (
    <button
      className={`px-6 py-4 font-medium text-sm transition-all duration-300 relative ${
        active
          ? "text-emerald-600 bg-emerald-50/30"
          : "text-gray-600 hover:text-emerald-600 hover:bg-emerald-50/10"
      }`}
      onClick={onClick}
    >
      {label}
      {active && (
        <span className="absolute bottom-0 left-0 w-full h-0.5 bg-emerald-500 transform transition-transform duration-300" />
      )}
    </button>
  );
};

export default TabButton;