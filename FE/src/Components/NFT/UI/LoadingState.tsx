import React from "react";
import { Loader } from "lucide-react";

const LoadingState: React.FC = () => {
  return (
    <div className="flex justify-center items-center py-16">
      <div className="flex flex-col items-center gap-3">
        <div className="relative">
          <Loader className="animate-spin text-emerald-500" size={36} />
          <div className="absolute inset-0 flex items-center justify-center">
            <div className="h-3 w-3 rounded-full bg-emerald-500"></div>
          </div>
        </div>
        <span className="text-gray-600 font-medium">Đang tải NFTs...</span>
      </div>
    </div>
  );
};

export default LoadingState;