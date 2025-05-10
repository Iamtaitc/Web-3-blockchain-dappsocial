"use client"

import type React from "react"
import { useEffect, useState } from "react"
import { useDispatch, useSelector } from "react-redux"
import type { AppDispatch, RootState } from "../../store"
import { fetchMyNFTs, fetchMarketplaceNFTs, unlistNFT } from "../../store/slices/nftSlice"
import { useNavigate } from "react-router-dom"
import { toast } from "react-hot-toast"
import MarketplaceHeader from "../../components/NFT/UI/MarketplaceHeader"
import TabButton from "../../components/NFT/UI/TabButton"
import NFTGrid from "../../components/NFT/UI/NFTGrid"
import ListNFTModal from "../../components/NFT/UI/ListNFTModal"
import LoadingState from "../../components/NFT/UI/LoadingState"
import MarketplaceFilters from "../../components/NFT/UI/MarketplaceFilters"
import MarketplaceStats from "../../components/NFT/UI/MarketplaceStats"
import FeaturedNFT from "../../components/NFT/UI/FeaturedNFT"

// Import CSS riêng cho NFT Marketplace
import "../../styles/nft-marketplace.css"

const NFTMarketplace: React.FC = () => {
  const dispatch = useDispatch<AppDispatch>()
  const navigate = useNavigate()

  const { myNFTs, marketplaceNFTs, loading } = useSelector((state: RootState) => state.nft)
  const { walletAddress } = useSelector((state: RootState) => state.auth)

  const [activeTab, setActiveTab] = useState<"created" | "listed" | "marketplace">("marketplace")
  const [listModalOpen, setListModalOpen] = useState(false)
  const [selectedNFT, setSelectedNFT] = useState<string | null>(null)
  const [activeFilter, setActiveFilter] = useState<string>("all")
  const [searchTerm, setSearchTerm] = useState<string>("")

  useEffect(() => {
    if (walletAddress) {
      dispatch(fetchMyNFTs(walletAddress))
      dispatch(fetchMarketplaceNFTs())
    }
  }, [dispatch, walletAddress])

  const handleRefresh = () => {
    if (walletAddress) {
      dispatch(fetchMyNFTs(walletAddress))
      dispatch(fetchMarketplaceNFTs())
      toast.success("Đã làm mới danh sách NFT")
    }
  }

  const handleListNFT = (tokenId: string, postId: string) => {
    setSelectedNFT(tokenId)
    setListModalOpen(true)
  }

  const handleUnlistNFT = async (tokenId: string) => {
    try {
      await dispatch(unlistNFT(tokenId)).unwrap()
      toast.success("Hủy đăng bán NFT thành công!")
      handleRefresh()
    } catch (error) {
      console.error("Lỗi khi hủy đăng bán NFT:", error)
      toast.error("Có lỗi xảy ra khi hủy đăng bán NFT")
    }
  }

  const handleNavigateToBuy = (tokenId: string) => {
    navigate(`/nft/${tokenId}/buy`)
  }

  const handleFilterChange = (filter: string) => {
    setActiveFilter(filter)
  }

  const handleSearch = (term: string) => {
    setSearchTerm(term)
  }

  // Lọc NFT theo trạng thái
  const createdNFTs = myNFTs.filter((nft) => !nft.forSale)
  const listedNFTs = myNFTs.filter((nft) => nft.forSale)

  // Lọc NFT theo filter và search
  let marketNFTs = marketplaceNFTs.filter(
    (nft) =>
      nft.owner &&
      walletAddress &&
      nft.owner.toLowerCase() !== walletAddress.toLowerCase() &&
      nft.price &&
      Number.parseFloat(nft.price) > 0,
  )

  // Áp dụng tìm kiếm
  if (searchTerm) {
    marketNFTs = marketNFTs.filter(
      (nft) =>
        (nft.metadata?.name || nft.name || "").toLowerCase().includes(searchTerm.toLowerCase()) ||
        (nft.metadata?.description || nft.description || "").toLowerCase().includes(searchTerm.toLowerCase()),
    )
  }

  // Áp dụng filter
  if (activeFilter !== "all") {
    if (activeFilter === "trending") {
      // Giả lập filter theo xu hướng
      marketNFTs = [...marketNFTs].sort(() => Math.random() - 0.5)
    } else if (activeFilter === "newest") {
      // Giả lập filter theo mới nhất
      marketNFTs = [...marketNFTs].sort(() => Math.random() - 0.5)
    } else if (activeFilter === "rare") {
      // Giả lập filter theo hiếm
      marketNFTs = marketNFTs.filter((nft) => nft.metadata?.rare || Math.random() > 0.7)
    } else if (activeFilter === "price") {
      // Sắp xếp theo giá từ thấp đến cao
      marketNFTs = [...marketNFTs].sort((a, b) => Number.parseFloat(a.price) - Number.parseFloat(b.price))
    }
  }

  // Kiểm tra xem NFT có thuộc về người dùng hiện tại không
  const isOwner = (nft: any) => {
    return nft.owner && walletAddress && nft.owner.toLowerCase() === walletAddress.toLowerCase()
  }

  return (
    <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-8">
      <MarketplaceHeader onRefresh={handleRefresh} />

      {activeTab === "marketplace" && (
        <>
          <MarketplaceStats />
          <FeaturedNFT onNavigateToBuy={handleNavigateToBuy} />
          <MarketplaceFilters onFilterChange={handleFilterChange} activeFilter={activeFilter} onSearch={handleSearch} />
        </>
      )}

      <div className="bg-white rounded-xl shadow-sm mt-8 overflow-hidden">
        <div className="flex border-b border-gray-100">
          <TabButton
            active={activeTab === "marketplace"}
            onClick={() => setActiveTab("marketplace")}
            label="Thị trường"
          />
          <TabButton active={activeTab === "created"} onClick={() => setActiveTab("created")} label="NFT của tôi" />
          <TabButton active={activeTab === "listed"} onClick={() => setActiveTab("listed")} label="Đang bán" />
        </div>
      </div>

      <div className="mt-8">
        {loading ? (
          <LoadingState />
        ) : (
          <>
            {/* Marketplace NFTs */}
            {activeTab === "marketplace" && (
              <NFTGrid
                nfts={marketNFTs}
                emptyMessage="Không có NFT nào trên thị trường."
                isMarketplace={true}
                isOwner={isOwner}
                onListNFT={handleListNFT}
                onUnlistNFT={handleUnlistNFT}
                onNavigateToBuy={handleNavigateToBuy}
              />
            )}

            {/* Created NFTs */}
            {activeTab === "created" && (
              <NFTGrid
                nfts={createdNFTs}
                emptyMessage="Bạn chưa có NFT nào chưa đăng bán."
                isMarketplace={false}
                isOwner={isOwner}
                onListNFT={handleListNFT}
                onUnlistNFT={handleUnlistNFT}
                onNavigateToBuy={handleNavigateToBuy}
              />
            )}

            {/* Listed NFTs */}
            {activeTab === "listed" && (
              <NFTGrid
                nfts={listedNFTs}
                emptyMessage="Bạn chưa có NFT nào đang bán."
                isMarketplace={false}
                isOwner={isOwner}
                onListNFT={handleListNFT}
                onUnlistNFT={handleUnlistNFT}
                onNavigateToBuy={handleNavigateToBuy}
              />
            )}
          </>
        )}
      </div>

      {/* List NFT Modal */}
      {listModalOpen && selectedNFT && (
        <ListNFTModal
          isOpen={listModalOpen}
          onClose={() => {
            setListModalOpen(false)
            setSelectedNFT(null)
            handleRefresh()
          }}
          tokenId={selectedNFT}
          postId={myNFTs.find((nft) => nft.tokenId === selectedNFT)?.postId || ""}
        />
      )}
    </div>
  )
}

export default NFTMarketplace
