import React from "react";

type ActionButtonProps = {
  text: string;
  onClick: () => void;
  color: "indigo" | "green" | "yellow" | "gray" | "red" | "blue";
  fullWidth?: boolean;
  icon?: React.ReactNode;
};

const ActionButton: React.FC<ActionButtonProps> = ({
  text,
  onClick,
  color,
  fullWidth = true,
  icon,
}) => {
  const getButtonColor = (color: string) => {
    switch (color) {
      case "indigo":
        return "bg-indigo-500 hover:bg-indigo-600";
      case "green":
        return "bg-green-500 hover:bg-green-600";
      case "yellow":
        return "bg-yellow-500 hover:bg-yellow-600";
      case "gray":
        return "bg-gray-700 hover:bg-gray-800";
      case "red":
        return "bg-red-500 hover:bg-red-600";
      case "blue":
        return "bg-blue-500 hover:bg-blue-600";
      default:
        return "bg-gray-500 hover:bg-gray-600";
    }
  };

  return (
    <button
      onClick={onClick}
      className={`${getButtonColor(
        color
      )} text-white bg-[#f8fafc] hover:text-white py-2 px-4 rounded-lg flex items-center 
                    justify-center transition-colors ${
                      fullWidth ? "w-full" : ""
                    }`}
    >
      {icon}
      {text}
    </button>
  );
};

export default ActionButton;
