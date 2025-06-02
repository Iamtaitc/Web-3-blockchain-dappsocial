"use client"

import type React from "react"
import { useEffect, useState } from "react"
import { Sparkles, Tag, ArrowRight } from "lucide-react"

// Định nghĩa interface cho NFT
interface NFT {
  tokenId: string;
  name?: string;
  description?: string;
  price: string;
  imageUrl?: string; // Có thể chứa URL IPFS
  metadata?: {
    name?: string;
    description?: string;
    image?: string; // Thường chứa URL IPFS trong metadata
  };
}

// Cập nhật interface props để nhận marketplaceNFTs
interface FeaturedNFTProps {
  onNavigateToBuy: (tokenId: string) => void;
  marketplaceNFTs: NFT[];
}

const FeaturedNFT: React.FC<FeaturedNFTProps> = ({ onNavigateToBuy, marketplaceNFTs }) => {
  // State để lưu NFT ngẫu nhiên
  const [randomNFT, setRandomNFT] = useState<NFT | null>(null);

  // Hàm chọn ngẫu nhiên NFT từ danh sách
  const getRandomNFT = (nfts: NFT[]): NFT | null => {
    if (!nfts || nfts.length === 0) return null;
    const randomIndex = Math.floor(Math.random() * nfts.length);
    return nfts[randomIndex];
  };

  // Cập nhật randomNFT khi marketplaceNFTs thay đổi
  useEffect(() => {
    const selectedNFT = getRandomNFT(marketplaceNFTs);
    setRandomNFT(selectedNFT);
  }, [marketplaceNFTs]);

  // Nếu không có NFT nào, hiển thị placeholder
  if (!randomNFT) {
    return (
      <div className="nft-gradient-featured rounded-xl shadow-lg overflow-hidden mb-8 p-6 text-white">
        <p>Không có NFT nào để hiển thị.</p>
      </div>
    );
  }

  // Lấy thông tin từ randomNFT để hiển thị
  const displayName = randomNFT.metadata?.name || randomNFT.name || "NFT Không Tên";
  const displayDescription = randomNFT.metadata?.description || randomNFT.description || "Không có mô tả.";
  // Ưu tiên lấy image từ metadata.image (thường là URL IPFS), sau đó là imageUrl
  const displayImage = randomNFT.metadata?.image || randomNFT.imageUrl || "/placeholder.svg?height=400&width=600";

  return (
    <div className="nft-gradient-featured rounded-xl shadow-lg overflow-hidden mb-8 transition-all duration-300 hover:shadow-xl">
      <div className="flex flex-col md:flex-row">
        <div className="md:w-1/2 p-6 md:p-8 flex flex-col justify-center">
          <div className="inline-flex items-center bg-white/20 backdrop-blur-sm px-3 py-1 rounded-full text-white text-sm font-medium mb-4 w-fit">
            <Sparkles className="w-4 h-4 mr-1.5" />
            NFT Nổi bật
          </div>
          <h2 className="text-2xl md:text-3xl font-bold text-white mb-3 line-clamp-2">{displayName}</h2>
          <p className="text-emerald-100 mb-6 line-clamp-3">{displayDescription}</p>
          <div className="flex items-center gap-4 mb-6">
            <div className="nft-featured-countdown px-4 py-2 rounded-lg bg-white/10 backdrop-blur-sm">
              <p className="text-xs text-emerald-100">Giá hiện tại</p>
              <p className="text-xl font-bold text-white flex items-center">
                <Tag className="w-4 h-4 mr-1.5" />
                {new Intl.NumberFormat("vi-VN").format(Number.parseInt(randomNFT.price))} DX
              </p>
            </div>
            <div className="nft-featured-countdown px-4 py-2 rounded-lg bg-white/10 backdrop-blur-sm">
              <p className="text-xs text-emerald-100">Thời gian còn lại</p>
              <p className="text-xl font-bold text-white">23:45:12</p>
            </div>
          </div>
          <button
            onClick={() => onNavigateToBuy(randomNFT.tokenId)}
            className="inline-flex items-center px-6 py-3 bg-white text-emerald-700 rounded-full font-medium hover:bg-emerald-50 transition-colors duration-300 shadow-md hover:shadow-lg w-fit"
          >
            Xem chi tiết
            <ArrowRight className="ml-2 w-4 h-4" />
          </button>
        </div>
        <div className="md:w-1/2 relative">
          <div className="absolute inset-0 bg-gradient-to-t from-black/60 to-transparent z-10"></div>
          <img
            src={displayImage}
            alt={displayName}
            className="w-full h-64 object-cover rounded-r-xl transition-opacity duration-300 hover:opacity-90"
            onError={(e) => {
              (e.target as HTMLImageElement).src = "/placeholder.svg?height=256&width=384";
            }}
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
            <div className="bg-white/20 backdrop-blur-sm px-3 py-1 rounded-full text-white text-sm font-medium">
              12 người đang theo dõi
            </div>
          </div>
        </div>
      </div>
    </div>
  );
}

export default FeaturedNFT