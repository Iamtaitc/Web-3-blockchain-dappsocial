"use client"

import type React from "react"
import { Search, Filter, SlidersHorizontal, Sparkles, Tag, TrendingUp, Clock } from "lucide-react"

interface MarketplaceFiltersProps {
  onFilterChange: (filter: string) => void
  activeFilter: string
  onSearch: (term: string) => void
}

const MarketplaceFilters: React.FC<MarketplaceFiltersProps> = ({ onFilterChange, activeFilter, onSearch }) => {
  return (
    <div className="bg-white rounded-xl shadow-sm p-4 mb-6">
      <div className="flex flex-col md:flex-row md:items-center justify-between gap-4">
        {/* Search bar */}
        <div className="relative flex-grow max-w-md">
          <div className="absolute inset-y-0 left-0 pl-3 flex items-center pointer-events-none">
            <Search className="h-5 w-5 text-gray-400" />
          </div>
          <input
            type="text"
            className="block w-full pl-10 pr-3 py-2 bg-white border border-gray-200 rounded-lg focus:ring-2 focus:ring-emerald-500 focus:border-emerald-500 focus:outline-none text-sm transition-colors duration-200"
            placeholder="Tìm kiếm NFT..."
            onChange={(e) => onSearch(e.target.value)}
          />
        </div>

        {/* Filter buttons */}
        <div className="flex items-center space-x-2 overflow-x-auto pb-1 md:pb-0 nft-scrollbar-hide">
          <button
            onClick={() => onFilterChange("all")}
            className={`nft-filter-button inline-flex items-center px-3 py-1.5 rounded-full text-sm font-medium transition-colors ${
              activeFilter === "all" ? "nft-filter-button-active" : "bg-gray-100 text-gray-700 hover:bg-gray-200"
            }`}
          >
            <Filter className="w-4 h-4 mr-1.5" />
            Tất cả
          </button>
          <button
            onClick={() => onFilterChange("trending")}
            className={`nft-filter-button inline-flex items-center px-3 py-1.5 rounded-full text-sm font-medium transition-colors ${
              activeFilter === "trending" ? "nft-filter-button-active" : "bg-gray-100 text-gray-700 hover:bg-gray-200"
            }`}
          >
            <TrendingUp className="w-4 h-4 mr-1.5" />
            Xu hướng
          </button>
          <button
            onClick={() => onFilterChange("newest")}
            className={`nft-filter-button inline-flex items-center px-3 py-1.5 rounded-full text-sm font-medium transition-colors ${
              activeFilter === "newest" ? "nft-filter-button-active" : "bg-gray-100 text-gray-700 hover:bg-gray-200"
            }`}
          >
            <Clock className="w-4 h-4 mr-1.5" />
            Mới nhất
          </button>
          <button
            onClick={() => onFilterChange("rare")}
            className={`nft-filter-button inline-flex items-center px-3 py-1.5 rounded-full text-sm font-medium transition-colors ${
              activeFilter === "rare" ? "nft-filter-button-active" : "bg-gray-100 text-gray-700 hover:bg-gray-200"
            }`}
          >
            <Sparkles className="w-4 h-4 mr-1.5" />
            Hiếm
          </button>
          <button
            onClick={() => onFilterChange("price")}
            className={`nft-filter-button inline-flex items-center px-3 py-1.5 rounded-full text-sm font-medium transition-colors ${
              activeFilter === "price" ? "nft-filter-button-active" : "bg-gray-100 text-gray-700 hover:bg-gray-200"
            }`}
          >
            <Tag className="w-4 h-4 mr-1.5" />
            Giá
          </button>
          <button className="nft-filter-button inline-flex items-center px-3 py-1.5 rounded-full text-sm font-medium bg-gray-100 text-gray-700 hover:bg-gray-200 transition-colors">
            <SlidersHorizontal className="w-4 h-4 mr-1.5" />
            Lọc
          </button>
        </div>
      </div>
    </div>
  )
}

export default MarketplaceFilters
