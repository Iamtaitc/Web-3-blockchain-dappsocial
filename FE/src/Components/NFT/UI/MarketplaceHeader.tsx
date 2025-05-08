import React from "react";
import { RefreshCw } from "lucide-react";

interface MarketplaceHeaderProps {
  onRefresh: () => void;
}

const MarketplaceHeader: React.FC<MarketplaceHeaderProps> = ({ onRefresh }) => {
  return (
    <div className="flex flex-col md:flex-row justify-between items-start md:items-center gap-4">
      <div className="space-y-2">
        <h1 className="text-3xl font-bold text-gray-900 tracking-tight flex items-center gap-2">
          NFT Marketplace
          <span className="inline-flex items-center px-2.5 py-0.5 rounded-full text-xs font-medium bg-emerald-100 text-emerald-800">
            Beta
          </span>
        </h1>
        <p className="text-gray-500 max-w-2xl">
          Khám phá, mua và bán NFT độc đáo trên nền tảng của chúng tôi
        </p>
      </div>

      <button
        onClick={onRefresh}
        className="flex items-center gap-2 px-4 py-2.5 bg-white border border-gray-200 text-gray-700 rounded-lg hover:bg-gray-50 transition-colors duration-300 shadow-sm group"
      >
        <RefreshCw size={18} className="group-hover:animate-spin text-emerald-500" />
        <span>Làm mới</span>
      </button>
    </div>
  );
};

export default MarketplaceHeader;