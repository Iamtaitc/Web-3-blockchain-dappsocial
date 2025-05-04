"use client"

import type React from "react"
import { Sparkles, Tag, ArrowRight } from "lucide-react"

interface FeaturedNFTProps {
  onNavigateToBuy: (tokenId: string) => void
}

const FeaturedNFT: React.FC<FeaturedNFTProps> = ({ onNavigateToBuy }) => {
  // Giả sử đây là NFT nổi bật
  const featuredNFT = {
    tokenId: "featured-123",
    name: "Siêu phẩm NFT Việt Nam",
    description: "Một trong những NFT độc đáo và giá trị nhất trên thị trường, được tạo bởi nghệ sĩ nổi tiếng.",
    price: "12500",
    imageUrl: "/placeholder.svg?height=400&width=600",
  }

  return (
    <div className="nft-gradient-featured rounded-xl shadow-lg overflow-hidden mb-8">
      <div className="flex flex-col md:flex-row">
        <div className="md:w-1/2 p-6 md:p-8 flex flex-col justify-center">
          <div className="inline-flex items-center bg-white/20 backdrop-blur-sm px-3 py-1 rounded-full text-white text-sm font-medium mb-4 w-fit">
            <Sparkles className="w-4 h-4 mr-1.5" />
            NFT Nổi bật
          </div>
          <h2 className="text-2xl md:text-3xl font-bold text-white mb-3">{featuredNFT.name}</h2>
          <p className="text-emerald-100 mb-6">{featuredNFT.description}</p>
          <div className="flex items-center gap-3 mb-6">
            <div className="nft-featured-countdown px-4 py-2 rounded-lg">
              <p className="text-xs text-emerald-100">Giá hiện tại</p>
              <p className="text-xl font-bold text-white flex items-center">
                <Tag className="w-4 h-4 mr-1.5" />
                {new Intl.NumberFormat("vi-VN").format(Number.parseInt(featuredNFT.price))} DX
              </p>
            </div>
            <div className="nft-featured-countdown px-4 py-2 rounded-lg">
              <p className="text-xs text-emerald-100">Thời gian còn lại</p>
              <p className="text-xl font-bold text-white">23:45:12</p>
            </div>
          </div>
          <button
            onClick={() => onNavigateToBuy(featuredNFT.tokenId)}
            className="inline-flex items-center px-6 py-3 bg-white text-emerald-700 rounded-full font-medium hover:bg-emerald-50 transition-colors duration-300 shadow-md hover:shadow-lg w-fit"
          >
            Xem chi tiết
            <ArrowRight className="ml-2 w-4 h-4" />
          </button>
        </div>
        <div className="md:w-1/2 relative">
          <div className="absolute inset-0 bg-gradient-to-t from-black/60 to-transparent z-10"></div>
          <img
            src={featuredNFT.imageUrl || "/placeholder.svg"}
            alt={featuredNFT.name}
            className="w-full h-full object-cover"
          />
          <div className="absolute bottom-4 left-4 right-4 z-20 flex justify-between items-center">
            <div className="flex -space-x-2">
              {[1, 2, 3, 4].map((i) => (
                <div key={i} className="w-8 h-8 rounded-full border-2 border-white bg-gray-200"></div>
              ))}
              <div className="w-8 h-8 rounded-full border-2 border-white bg-emerald-600 flex items-center justify-center text-white text-xs">
                +8
              </div>
            </div>
            <div className="bg-white/20 backdrop-blur-sm px-3 py-1 rounded-full text-white text-sm">
              12 người đang theo dõi
            </div>
          </div>
        </div>
      </div>
    </div>
  )
}

export default FeaturedNFT
