import type React from "react"
import { FaEthereum, FaHeart, FaEye, FaEllipsisH } from "react-icons/fa"

const NFTDetail: React.FC = () => {
  const comments = [
    {
      id: 1,
      user: "ning.0308",
      date: "Jan 28, 2025",
      content: "This is amazing. Thanks for sharing!",
      avatar: "https://a.deviantart.net/avatars-big/a/r/arcanefantasy.jpg?8",
    },
    {
      id: 2,
      user: "ning.0308",
      date: "Jan 28, 2025",
      content: "This is amazing. Thanks for sharing!",
      avatar: "https://a.deviantart.net/avatars-big/a/r/arcanefantasy.jpg?8",
    },
  ]

  return (
    <div className="max-w-5xl mx-auto p-6">
      <h1 className="text-4xl font-bold text-center mb-8">profile NFT</h1>

      <div className="space-y-6">
        {/* NFT Image and Details */}
        <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
          {/* NFT Image */}
          <div className="lg:col-span-2">
            <div className="rounded-xl overflow-hidden">
              <img
                src="https://images-wixmp-ed30a86b8c4ca887773594c2.wixmp.com/f/e490e0c5-c850-433d-9611-2cf650e54e44/djc6yt8-f5fde82d-8641-4931-ba39-42d49093b675.png/v1/fill/w_1194,h_669,q_70,strp/genji_overwatch__by_arcanefantasy_djc6yt8-pre.jpg?token=eyJ0eXAiOiJKV1QiLCJhbGciOiJIUzI1NiJ9.eyJzdWIiOiJ1cm46YXBwOjdlMGQxODg5ODIyNjQzNzNhNWYwZDQxNWVhMGQyNmUwIiwiaXNzIjoidXJuOmFwcDo3ZTBkMTg4OTgyMjY0MzczYTVmMGQ0MTVlYTBkMjZlMCIsIm9iaiI6W1t7InBhdGgiOiJcL2ZcL2U0OTBlMGM1LWM4NTAtNDMzZC05NjExLTJjZjY1MGU1NGU0NFwvZGpjNnl0OC1mNWZkZTgyZC04NjQxLTQ5MzEtYmEzOS00MmQ0OTA5M2I2NzUucG5nIiwiaGVpZ2h0IjoiPD03MTgiLCJ3aWR0aCI6Ijw9MTI4MCJ9XV0sImF1ZCI6WyJ1cm46c2VydmljZTppbWFnZS53YXRlcm1hcmsiXSwid21rIjp7InBhdGgiOiJcL3dtXC9lNDkwZTBjNS1jODUwLTQzM2QtOTYxMS0yY2Y2NTBlNTRlNDRcL2FyY2FuZWZhbnRhc3ktNC5wbmciLCJvcGFjaXR5Ijo5NSwicHJvcG9ydGlvbnMiOjAuNDUsImdyYXZpdHkiOiJjZW50ZXIifX0.22oeftdKbRadsUDtFrGbv0OTQMXO4QsWdRmiw-3LNNA"
                alt="Any Minute Now"
                className="w-full h-auto"
              />
            </div>
          </div>

          {/* NFT Info */}
          <div className="lg:col-span-1">
            <div className="bg-[#0F1729] rounded-xl p-6">
              <h2 className="text-2xl font-bold mb-4">Any Minute Now</h2>

              <div className="flex items-center gap-2 mb-4">
                <span className="text-gray-400">Price:</span>
                <FaEthereum className="w-4 h-4" />
                <span className="font-bold">0.93347</span>
              </div>

              <button className="w-full py-3 bg-green-500 text-black rounded-lg hover:bg-green-400 transition-colors font-medium">
                Buy now
              </button>
            </div>
          </div>
        </div>

        {/* User Info and Stats */}
        <div className="flex items-start gap-4 border-b border-gray-800 pb-6">
          <img src="/placeholder.svg?height=48&width=48" alt="User avatar" className="w-12 h-12 rounded-full" />
          <div className="flex-1">
            <div className="flex items-center justify-between">
              <h3 className="text-lg font-bold">ning.0308</h3>
              <div className="flex items-center gap-6">
                <div className="flex items-center gap-2">
                  <FaHeart className="text-gray-400" />
                  <span>3k</span>
                </div>
                <div className="flex items-center gap-2">
                  <FaEye className="text-gray-400" />
                  <span>12k</span>
                </div>
                <button className="text-gray-400 hover:text-white">
                  <FaEllipsisH />
                </button>
              </div>
            </div>
            <p className="text-gray-400 mt-2">
              NFT Describe Refer users with your referral code to earn points Describe Refer users with your referral
              code to earn points Describe Refer users with your referral code to earn points.
            </p>
          </div>
        </div>

        {/* Comments Section */}
        <div className="space-y-6">
          <div className="flex items-center justify-between">
            <h3 className="text-lg font-bold">
              Comments <span className="text-gray-400">112</span>
            </h3>
            <button className="flex items-center gap-2 text-gray-400 hover:text-white">
              Newest <span className="text-xs">▼</span>
            </button>
          </div>

          {/* Comment Input */}
          <div className="flex gap-4">
            <img src="/placeholder.svg?height=40&width=40" alt="User avatar" className="w-10 h-10 rounded-full" />
            <div className="flex-1">
              <textarea
                placeholder="Add a new comments..."
                className="w-full bg-[#1E293B] rounded-lg p-4 resize-none focus:outline-none focus:ring-1 focus:ring-gray-500"
                rows={3}
              />
            </div>
          </div>

          {/* Comments List */}
          <div className="space-y-6">
            {comments.map((comment) => (
              <div key={comment.id} className="flex gap-4">
                <img
                  src={comment.avatar || "/placeholder.svg"}
                  alt={`${comment.user}'s avatar`}
                  className="w-10 h-10 rounded-full"
                />
                <div className="flex-1">
                  <div className="flex items-center gap-2 mb-1">
                    <span className="font-bold">{comment.user}</span>
                    <span className="text-gray-400 text-sm">{comment.date}</span>
                  </div>
                  <p className="text-gray-300">{comment.content}</p>
                </div>
              </div>
            ))}
          </div>
        </div>
      </div>
    </div>
  )
}

export default NFTDetail

