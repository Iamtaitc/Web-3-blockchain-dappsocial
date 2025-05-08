"use client"

import type React from "react"
import { useState } from "react"
import { Tag, Wallet, Award, Sparkles, TrendingUp, Eye } from "lucide-react"
import IPFSImage from "../../UI/IPFSImage"

interface NFTCardProps {
  nft: any
  isOwner: boolean
  isMarketplace: boolean
  onListNFT: (tokenId: string, postId: string) => void
  onUnlistNFT: (tokenId: string) => void
  onNavigateToBuy: (tokenId: string) => void
}

const NFTCard: React.FC<NFTCardProps> = ({ nft, isOwner, isMarketplace, onListNFT, onUnlistNFT, onNavigateToBuy }) => {
  const [isHovered, setIsHovered] = useState(false)

  // Hàm format giá tiền
  const formatPrice = (price: string | number) => {
    const numericPrice = typeof price === "string" ? Number.parseFloat(price) : price
    if (isNaN(numericPrice)) {
      console.log("Giá không hợp lệ:", price)
      return "0"
    }
    return new Intl.NumberFormat("vi-VN").format(numericPrice)
  }

  // Kiểm tra xem NFT có đang được bán không và có giá hợp lệ không
  const isNFTForSale = isMarketplace
    ? nft.price && Number.parseFloat(nft.price) > 0
    : nft.forSale === true && nft.price && Number.parseFloat(nft.price) > 0

  // Tạo random trending value cho hiệu ứng
  const trendingValue = Math.floor(Math.random() * 30) + 5
  const isRare = nft.metadata?.rare || Math.random() > 0.7

  return (
    <div
      className="nft-card bg-white rounded-xl shadow-sm overflow-hidden border border-gray-100"
      onMouseEnter={() => setIsHovered(true)}
      onMouseLeave={() => setIsHovered(false)}
    >
      <div className="relative h-52 overflow-hidden">
        <IPFSImage
          hash={nft.metadata?.image || nft.imageUrl || ""}
          alt={nft.name || "Untitled"}
          className="w-full h-full object-cover nft-card-image"
        />

        {/* Overlay gradient on hover */}
        <div className="absolute inset-0 bg-gradient-to-t from-black/60 to-transparent nft-card-overlay"></div>

        {/* Quick view button on hover */}
        <button
          className="absolute top-1/2 left-1/2 transform -translate-x-1/2 -translate-y-1/2 bg-white/90 text-emerald-600 rounded-full p-2 shadow-md nft-quick-view"
          onClick={() => onNavigateToBuy(nft.tokenId)}
        >
          <Eye size={20} />
          <span className="sr-only">Xem chi tiết</span>
        </button>

        {/* Status badge */}
        {!isMarketplace && (
          <div
            className={`absolute top-3 right-3 px-3 py-1 rounded-full text-xs font-medium shadow-sm ${
              isNFTForSale ? "nft-gradient-primary text-white" : "bg-gray-700 text-white"
            }`}
          >
            {isNFTForSale ? "Đang bán" : "Chưa đăng bán"}
          </div>
        )}

        {/* Rare badge */}
        {isRare && (
          <div className="absolute top-3 left-3 px-3 py-1 rounded-full text-xs font-medium shadow-sm bg-amber-500 text-white flex items-center gap-1">
            <Sparkles size={12} />
            Hiếm
          </div>
        )}

        {/* Hiển thị giá */}
        {isNFTForSale && (
          <div className="absolute bottom-3 left-3 bg-black/70 backdrop-blur-sm text-white px-3 py-1.5 rounded-lg flex items-center gap-1.5 transition-all duration-300 group-hover:bg-emerald-600/90">
            <Tag size={14} className="text-emerald-300" />
            <span className="font-medium">{formatPrice(nft.price)} DX</span>
          </div>
        )}
      </div>

      <div className="p-4">
        <div className="flex items-start justify-between mb-1">
          <h3 className="font-bold text-gray-800 group-hover:text-emerald-600 transition-colors duration-300 truncate max-w-[80%]">
            {nft.metadata?.name || nft.name || "Untitled"}
          </h3>
          {isRare && <Award size={18} className="text-amber-500" title="Rare NFT" />}
        </div>

        <p className="text-gray-600 text-sm mb-4 line-clamp-2 h-10 group-hover:text-gray-700 transition-colors duration-300">
          {nft.metadata?.description || nft.description || "No description"}
        </p>

        <div className="flex justify-between items-center mb-4">
          {isNFTForSale && (
            <div className="flex items-center gap-2 text-sm">
              <span className="font-semibold text-emerald-600">{formatPrice(nft.price)} DX</span>
              {nft.originalPrice && nft.price !== nft.originalPrice && (
                <span className="text-gray-400 line-through text-xs">{formatPrice(nft.originalPrice)} DX</span>
              )}
            </div>
          )}

          {/* Trending indicator */}
          <div className="flex items-center gap-1 text-xs text-emerald-600">
            <TrendingUp size={14} />
            <span>+{trendingValue}%</span>
          </div>
        </div>

        {/* Hiển thị chủ sở hữu */}
        <div className="flex items-center gap-2 text-xs text-gray-500 mb-4">
          <Wallet size={14} className="text-gray-400" />
          <span className="font-medium">
            {nft.owner ? `${nft.owner.slice(0, 6)}...${nft.owner.slice(-4)}` : "Unknown"}
          </span>
        </div>

        {/* Action buttons with hover effects */}
        {isMarketplace ? (
          <button
            onClick={() => onNavigateToBuy(nft.tokenId)}
            className="w-full py-2.5 nft-gradient-primary text-white rounded-lg transition-all duration-300 font-medium flex items-center justify-center gap-2 hover:shadow-md"
          >
            <Tag size={16} />
            Mua ngay
          </button>
        ) : isOwner ? (
          isNFTForSale ? (
            <button
              onClick={() => onUnlistNFT(nft.tokenId)}
              className="w-full py-2.5 bg-rose-500 text-white rounded-lg hover:bg-rose-600 transition-all duration-300 font-medium hover:shadow-md"
            >
              Hủy đăng bán
            </button>
          ) : (
            <button
              onClick={() => onListNFT(nft.tokenId, nft.postId)}
              className="w-full py-2.5 nft-gradient-primary text-white rounded-lg transition-all duration-300 font-medium hover:shadow-md"
            >
              Đăng bán
            </button>
          )
        ) : (
          isNFTForSale && (
            <button
              onClick={() => onNavigateToBuy(nft.tokenId)}
              className="w-full py-2.5 nft-gradient-primary text-white rounded-lg transition-all duration-300 font-medium flex items-center justify-center gap-2 hover:shadow-md"
            >
              <Tag size={16} />
              Mua ngay
            </button>
          )
        )}
      </div>
    </div>
  )
}

export default NFTCard
