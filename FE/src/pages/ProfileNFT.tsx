import type React from "react"
import { FaEthereum } from "react-icons/fa"

const ProfileNFT: React.FC = () => {
  // Mock data for NFTs
  const nfts = Array(6).fill({
    image: "https://images-wixmp-ed30a86b8c4ca887773594c2.wixmp.com/f/f83eddc6-16c1-42eb-8127-ef89acc43803/dhitkf4-8003ae89-9923-469b-8bf4-c2844524a9ba.png/v1/fit/w_600,h_797/water__split__by_hotaru_yuki_dhitkf4-375w-2x.png?token=eyJ0eXAiOiJKV1QiLCJhbGciOiJIUzI1NiJ9.eyJzdWIiOiJ1cm46YXBwOjdlMGQxODg5ODIyNjQzNzNhNWYwZDQxNWVhMGQyNmUwIiwiaXNzIjoidXJuOmFwcDo3ZTBkMTg4OTgyMjY0MzczYTVmMGQ0MTVlYTBkMjZlMCIsIm9iaiI6W1t7ImhlaWdodCI6Ijw9Nzk3IiwicGF0aCI6IlwvZlwvZjgzZWRkYzYtMTZjMS00MmViLTgxMjctZWY4OWFjYzQzODAzXC9kaGl0a2Y0LTgwMDNhZTg5LTk5MjMtNDY5Yi04YmY0LWMyODQ0NTI0YTliYS5wbmciLCJ3aWR0aCI6Ijw9NjAwIn1dXSwiYXVkIjpbInVybjpzZXJ2aWNlOmltYWdlLm9wZXJhdGlvbnMiXX0.YXEZf3yoAuPUTqBD-PpfaL3Gf6WzxQL-bNlCzv14jFw",
    name: "NFT Name",
    description: "NFT Describe Refer users with your referral code to earn points.",
    price: "0.93347",
  })

  return (
    <div className="w-full font-mono">
      {/* Profile Header */}
      <div className="flex items-start gap-6 mb-8">
        {/* Profile Image */}
        <div className="w-48 h-48 bg-gray-900 rounded-lg overflow-hidden">
          <img src="/placeholder.svg?height=192&width=192" alt="Profile" className="w-full h-full object-cover" />
        </div>

        {/* Profile Info */}
        <div className="flex-1">
          <h1 className="text-4xl font-bold mb-4">Nin0912</h1>

          {/* Stats */}
          <div className="flex gap-6 mb-4">
            <div className="flex items-center gap-2">
              <span className="text-gray-400">Follower:</span>
              <span className="font-bold">14k</span>
            </div>
            <div className="flex items-center gap-2">
              <span className="text-gray-400">Favorites:</span>
              <span className="font-bold">988</span>
            </div>
            <div className="flex items-center gap-2">
              <span className="text-gray-400">Product:</span>
              <span className="font-bold">82</span>
            </div>
            <div className="flex items-center gap-2">
              <span className="text-gray-400">Sold:</span>
              <span className="font-bold">182</span>
            </div>
          </div>

          {/* Description */}
          <p className="text-gray-400 text-sm leading-relaxed max-w-3xl">
            Web-3-blockchain-dappsocial is an advanced decentralized application (DApp) platform that allows users to
            easily create, list, and trade NFTs (Non-Fungible Tokens) securely. Powered by Web 3.0 blockchain
            technology, our platform ensures transparency and security, providing a seamless space for users to explore,
            collect, and exchange NFTs efficiently.
          </p>
        </div>
      </div>

      {/* NFT Grid */}
      <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
        {nfts.map((nft, index) => (
          <div key={index} className="bg-gray-900 rounded-lg overflow-hidden">
            {/* NFT Image */}
            <div className="aspect-square relative">
              <img src={nft.image || "/placeholder.svg"} alt={nft.name} className="w-full h-full object-cover" />
            </div>

            {/* NFT Details */}
            <div className="p-4">
              <h3 className="text-lg font-bold mb-2">{nft.name}</h3>
              <p className="text-gray-400 text-sm mb-4">{nft.description}</p>

              {/* Price and Buy Button */}
              <div className="flex flex-col gap-2">
                <div className="flex items-center gap-2">
                  <FaEthereum className="text-blue-400" />
                  <span className="font-bold">{nft.price}</span>
                </div>
                <button className="w-full py-2 px-4 bg-green-500 hover:bg-green-600 text-black rounded-lg transition-colors">
                  Buy NFT
                </button>
              </div>
            </div>
          </div>
        ))}
      </div>
    </div>
  )
}

export default ProfileNFT

