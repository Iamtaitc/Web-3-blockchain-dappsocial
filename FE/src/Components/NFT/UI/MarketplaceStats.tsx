import type React from "react"
import { TrendingUp, Users, BarChart3, Wallet } from "lucide-react"

const MarketplaceStats: React.FC = () => {
  return (
    <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-4 mb-8">
      <div className="nft-stats-card bg-white rounded-xl shadow-sm p-4 nft-border-gradient nft-border-emerald">
        <div className="flex items-start justify-between">
          <div>
            <p className="text-sm text-gray-500 mb-1">Tổng giao dịch</p>
            <h3 className="text-2xl font-bold text-gray-800">1,234</h3>
            <p className="text-xs text-emerald-600 flex items-center mt-1">
              <TrendingUp className="w-3 h-3 mr-1" />
              +12.5% so với tuần trước
            </p>
          </div>
          <div className="bg-emerald-100 p-3 rounded-lg">
            <BarChart3 className="w-6 h-6 text-emerald-600" />
          </div>
        </div>
      </div>

      <div className="nft-stats-card bg-white rounded-xl shadow-sm p-4 nft-border-gradient nft-border-purple">
        <div className="flex items-start justify-between">
          <div>
            <p className="text-sm text-gray-500 mb-1">Người dùng hoạt động</p>
            <h3 className="text-2xl font-bold text-gray-800">856</h3>
            <p className="text-xs text-purple-600 flex items-center mt-1">
              <TrendingUp className="w-3 h-3 mr-1" />
              +8.3% so với tuần trước
            </p>
          </div>
          <div className="bg-purple-100 p-3 rounded-lg">
            <Users className="w-6 h-6 text-purple-600" />
          </div>
        </div>
      </div>

      <div className="nft-stats-card bg-white rounded-xl shadow-sm p-4 nft-border-gradient nft-border-amber">
        <div className="flex items-start justify-between">
          <div>
            <p className="text-sm text-gray-500 mb-1">Tổng giá trị</p>
            <h3 className="text-2xl font-bold text-gray-800">45,678 DX</h3>
            <p className="text-xs text-amber-600 flex items-center mt-1">
              <TrendingUp className="w-3 h-3 mr-1" />
              +15.2% so với tuần trước
            </p>
          </div>
          <div className="bg-amber-100 p-3 rounded-lg">
            <Wallet className="w-6 h-6 text-amber-600" />
          </div>
        </div>
      </div>

      <div className="nft-stats-card bg-white rounded-xl shadow-sm p-4 nft-border-gradient nft-border-blue">
        <div className="flex items-start justify-between">
          <div>
            <p className="text-sm text-gray-500 mb-1">NFT đang bán</p>
            <h3 className="text-2xl font-bold text-gray-800">567</h3>
            <p className="text-xs text-blue-600 flex items-center mt-1">
              <TrendingUp className="w-3 h-3 mr-1" />
              +5.7% so với tuần trước
            </p>
          </div>
          <div className="bg-blue-100 p-3 rounded-lg">
            <TrendingUp className="w-6 h-6 text-blue-600" />
          </div>
        </div>
      </div>
    </div>
  )
}

export default MarketplaceStats
