import type React from "react"
import NFTCard from "./NFTCard"
import EmptyState from "./EmptyState"

interface NFTGridProps {
  nfts: any[]
  emptyMessage: string
  isMarketplace: boolean
  isOwner: (nft: any) => boolean
  onListNFT: (tokenId: string, postId: string) => void
  onUnlistNFT: (tokenId: string) => void
  onNavigateToBuy: (tokenId: string) => void
}

const NFTGrid: React.FC<NFTGridProps> = ({
  nfts,
  emptyMessage,
  isMarketplace,
  isOwner,
  onListNFT,
  onUnlistNFT,
  onNavigateToBuy,
}) => {
  if (nfts.length === 0) {
    return <EmptyState message={emptyMessage} />
  }

  return (
    <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 xl:grid-cols-4 gap-6">
      {nfts.map((nft, index) => (
        <div key={nft.tokenId} className="nft-grid-item" style={{ animationDelay: `${index * 0.05}s` }}>
          <NFTCard
            nft={nft}
            isOwner={isOwner(nft)}
            isMarketplace={isMarketplace}
            onListNFT={onListNFT}
            onUnlistNFT={onUnlistNFT}
            onNavigateToBuy={onNavigateToBuy}
          />
        </div>
      ))}
    </div>
  )
}

export default NFTGrid
