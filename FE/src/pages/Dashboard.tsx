"use client"

import { useState, useEffect } from "react"
import { Wallet, Copy, ExternalLink, Eye, TrendingUp, Award, Users, Calendar, Activity } from "lucide-react"
import { Button } from "../components/profile/ui/button"
import { Card, CardContent, CardHeader, CardTitle } from "../components/profile/ui/card"
import { Badge } from "../components/profile/ui/badge"
import { Separator } from "../components/UI/separator"
// import TestReduxData from "../components/TestReduxData";
import LeaderboardAPI from "../services/LeaderboardAPI"
import userApi, { type UserProfile } from "../services/user.api"
import type { RootState } from "../store"
import { useSelector } from "react-redux"

// Interface cho NFT Leaderboard Item
interface NFTLeaderboardItem {
  tokenId: string
  name: string
  image: string
  creator: {
    address: string
    username: string
    avatarURI: string | null
    isVerified: boolean
  }
  owner: {
    address: string
    username: string
    avatarURI: string | null
    isVerified: boolean
  }
  forSale: boolean
  price: string
  likeCount: number
  viewCount: number
  mintedAt: string
}

// Interface cho Post Leaderboard Item (dùng chung với NFT vì response giống nhau)
type PostLeaderboardItem = NFTLeaderboardItem

// Interface cho Tag Leaderboard Item
interface TagLeaderboardItem {
  tag: string
  postCount: number
  likes: number
  comments: number
  saves: number
  score: number
}

// Interface cho User Rank
interface UserRank {
  rank: number
  points: number
  topUsers: Array<{
    walletAddress: string
    username: string
    points: number
  }>
  pointsToNextRank: number | null
}

export default function Dashboard() {
  const [userProfile, setUserProfile] = useState<UserProfile | null>(null)
  const [nftLeaderboard, setNFTLeaderboard] = useState<NFTLeaderboardItem[]>([])
  const [postLeaderboard, setPostLeaderboard] = useState<PostLeaderboardItem[]>([])
  const [tagLeaderboard, setTagLeaderboard] = useState<TagLeaderboardItem[]>([])
  const [userRank, setUserRank] = useState<UserRank | null>(null)
  const [loading, setLoading] = useState<boolean>(true)
  const [error, setError] = useState<string | null>(null)
  const [copied, setCopied] = useState(false)

  const { walletAddress } = useSelector((state: RootState) => state.auth)

  // Hàm copy địa chỉ ví
  const copyAddress = async () => {
    if (userProfile?.walletAddress) {
      await navigator.clipboard.writeText(userProfile.walletAddress)
      setCopied(true)
      setTimeout(() => setCopied(false), 2000)
    }
  }

  // Hàm lấy thông tin subscription dựa trên level
  const getSubscriptionInfo = (level: number) => {
    switch (level) {
      case 1:
        return {
          name: "Standard",
          multiplier: "1.5x",
          color: "blue",
          bgColor: "from-blue-500 to-blue-600",
          description: "Gói cơ bản miễn phí",
        }
      case 2:
        return {
          name: "Plus",
          multiplier: "2x",
          color: "purple",
          bgColor: "from-purple-500 to-purple-600",
          description: "Gói nâng cao với nhiều tính năng",
        }
      case 5:
        return {
          name: "Pro",
          multiplier: "3x",
          color: "amber",
          bgColor: "from-amber-500 to-orange-500",
          description: "Gói chuyên nghiệp",
        }
      case 10:
        return {
          name: "Elite",
          multiplier: "5x",
          color: "rose",
          bgColor: "from-rose-500 to-pink-600",
          description: "Gói cao cấp nhất",
        }
      default:
        return {
          name: "Standard",
          multiplier: "1.5x",
          color: "blue",
          bgColor: "from-blue-500 to-blue-600",
          description: "Gói cơ bản miễn phí",
        }
    }
  }

  // Lấy thông tin người dùng và các bảng xếp hạng khi component mount
  useEffect(() => {
    const fetchData = async () => {
      try {
        setLoading(true)
        setError(null)

        // Lấy thông tin người dùng
        const profile = await userApi.getUserProfile(walletAddress)
        setUserProfile(profile)

        // Lấy bảng xếp hạng NFT
        const nftResponse = await LeaderboardAPI.getNFTLeaderboard()
        setNFTLeaderboard(nftResponse.data.leaderboard)

        // Lấy bảng xếp hạng bài đăng
        const postResponse = await LeaderboardAPI.getPostLeaderboard()
        setPostLeaderboard(postResponse.data.leaderboard)

        // Lấy bảng xếp hạng tags
        const tagResponse = await LeaderboardAPI.getTagLeaderboard()
        setTagLeaderboard(tagResponse.data.leaderboard)

        // Lấy thứ hạng người dùng hiện tại
        const rankResponse = await LeaderboardAPI.getCurrentUserRank()
        setUserRank(rankResponse.data)
      } catch (err: any) {
        setError(err.message || "Failed to load dashboard data")
      } finally {
        setLoading(false)
      }
    }

    fetchData()
  }, [walletAddress])

  if (loading) {
    return (
      <div className="flex h-screen bg-gray-50 text-gray-800 font-mono items-center justify-center">
        <div className="text-xl font-bold">Loading...</div>
      </div>
    )
  }

  if (error) {
    return (
      <div className="flex h-screen bg-gray-50 text-gray-800 font-mono items-center justify-center">
        <div className="text-xl font-bold text-red-500">{error}</div>
      </div>
    )
  }

  const subscriptionInfo = getSubscriptionInfo(userProfile?.subscription?.level || 1)

  return (
    <div className="flex bg-gray-50 text-gray-800 font-mono">
      {/* Main Content */}
      <div className="flex-1 p-6 overflow-auto">
        {/* Subtle Background Pattern */}
        <div className="absolute inset-0 bg-[url('data:image/svg+xml;base64,PHN2ZyB3aWR0aD0iNjAiIGhlaWdodD0iNjAiIHZpZXdCb3g9IjAgMCA2MCA2MCIgeG1sbnM9Imh0dHA6Ly93d3cudzMub3JnLzIwMDAvc3ZnIj48ZyBmaWxsPSJub25lIiBmaWxsLXJ1bGU9ImV2ZW5vZGQiPjxnIGZpbGw9IiMwMDAiIGZpbGwtb3BhY2l0eT0iLjAyIj48cGF0aCBkPSJNMzYgMzRjMC0yLjIxLTEuNzktNC00LTRzLTQgMS43OS00IDQgMS43OSA0IDQgNCA0LTEuNzkgNC00eiIvPjwvZz48L2c+PC9zdmc+')] opacity-30 pointer-events-none"></div>

        <h1 className="text-4xl font-bold mb-8 text-center tracking-widest text-gray-900 relative z-10">Dashboard</h1>

        <div className="grid grid-cols-1 md:grid-cols-2 gap-6 relative z-10">
          {/* Enhanced Subscription Card */}
          <Card className="relative overflow-hidden transition-all duration-300 hover:shadow-lg">
            <div className={`absolute inset-0 bg-gradient-to-br ${subscriptionInfo.bgColor} opacity-10`}></div>
            <CardContent className="p-8 text-center relative z-10">
              <div className="flex items-center justify-center mb-6">
                <div className="relative">
                  <div
                    className={`w-16 h-16 bg-gradient-to-br ${subscriptionInfo.bgColor} rounded-full flex items-center justify-center shadow-lg`}
                  >
                    <Award className="w-8 h-8 text-white" />
                  </div>
                  <div className="absolute -top-1 -right-1 w-6 h-6 bg-yellow-400 rounded-full flex items-center justify-center">
                    <span className="text-xs font-bold text-gray-800">{userProfile?.subscription?.level || 1}</span>
                  </div>
                </div>
              </div>

              <h2 className="text-xl font-semibold text-gray-700 mb-2">Gói Premium</h2>

              <div className="mb-4">
                <span
                  className={`text-3xl font-bold bg-gradient-to-r ${subscriptionInfo.bgColor} bg-clip-text text-transparent`}
                >
                  {subscriptionInfo.name}
                </span>
                <div className="mt-2">
                  <Badge
                    variant="outline"
                    className={`text-${subscriptionInfo.color}-600 border-${subscriptionInfo.color}-200 bg-${subscriptionInfo.color}-50`}
                  >
                    Reward {subscriptionInfo.multiplier}
                  </Badge>
                </div>
              </div>

              <p className="text-sm text-gray-600 mb-4">{subscriptionInfo.description}</p>

              <div className="flex justify-between items-center text-sm text-gray-600">
                <div className="text-center">
                  <span className="text-2xl font-bold text-gray-800">{userProfile?.points || 0}</span>
                  <p className="text-xs">Điểm tích lũy</p>
                </div>
                <div className="text-center">
                  <span className="text-lg font-bold text-emerald-600">
                    Level {userProfile?.subscription?.level || 1}
                  </span>
                  <p className="text-xs">Cấp độ hiện tại</p>
                </div>
              </div>
            </CardContent>
          </Card>

          {/* Enhanced Wallet Card */}
          <Card className="transition-all duration-300 hover:shadow-lg">
            <CardHeader className="pb-3">
              <div className="flex items-center justify-between">
                <CardTitle className="flex items-center gap-2">
                  <Wallet className="w-5 h-5 text-emerald-500" />
                  Ví của tôi
                </CardTitle>
                <Badge variant="outline" className="text-emerald-600 border-emerald-200 bg-emerald-50">
                  <div className="w-2 h-2 bg-emerald-500 rounded-full mr-2"></div>
                  Đã kết nối
                </Badge>
              </div>
            </CardHeader>
            <CardContent className="space-y-4">
              {/* Wallet Address */}
              <div className="flex items-center justify-between p-3 bg-gray-50 rounded-lg">
                <div className="flex items-center gap-3">
                  <div className="w-10 h-10 bg-gradient-to-r from-emerald-400 to-teal-500 rounded-full flex items-center justify-center">
                    <span className="text-white font-bold text-sm">
                      {userProfile?.username?.charAt(0).toUpperCase() || "U"}
                    </span>
                  </div>
                  <div>
                    <p className="text-sm font-medium text-gray-800">
                      {userProfile?.walletAddress.slice(0, 6)}...{userProfile?.walletAddress.slice(-4)}
                    </p>
                    <p className="text-xs text-gray-500">Địa chỉ ví chính</p>
                  </div>
                </div>
                <Button variant="ghost" size="sm" onClick={copyAddress} className="text-gray-600 hover:text-gray-800">
                  <Copy className="w-4 h-4" />
                  {copied ? "Đã sao chép!" : ""}
                </Button>
              </div>

              {/* Membership Status */}
              <div className="flex items-center justify-between p-3 bg-gradient-to-r from-indigo-50 to-purple-50 rounded-lg border border-indigo-100">
                <div>
                  <p className="text-sm text-gray-600">Trạng thái thành viên</p>
                  <p className="text-lg font-semibold text-gray-800">
                    {userProfile?.subscription?.expiration ? "Premium Active" : "Thành viên cơ bản"}
                  </p>
                </div>
                <div className="flex items-center space-x-1">
                  {userProfile?.subscription?.expiration ? (
                    <>
                      <Calendar className="w-4 h-4 text-indigo-500" />
                      <span className="text-xs text-indigo-600 font-medium">
                        Hết hạn: {new Date(userProfile.subscription.expiration).toLocaleDateString("vi-VN")}
                      </span>
                    </>
                  ) : (
                    <>
                      <Activity className="w-4 h-4 text-gray-500" />
                      <span className="text-xs text-gray-600 font-medium">Miễn phí</span>
                    </>
                  )}
                </div>
              </div>

              <Separator />

              {/* Action Buttons */}
              <div className="grid grid-cols-2 gap-3">
                <Button
                  variant="outline"
                  size="sm"
                  className="flex items-center gap-2 hover:bg-emerald-50 hover:border-emerald-200"
                >
                  <Eye className="w-4 h-4" />
                  Xem chi tiết
                </Button>
                <Button
                  variant="outline"
                  size="sm"
                  className="flex items-center gap-2 hover:bg-blue-50 hover:border-blue-200"
                >
                  <ExternalLink className="w-4 h-4" />
                  Etherscan
                </Button>
              </div>
            </CardContent>
          </Card>
        </div>

        {/* User Rank Card */}
        {userRank && (
          <Card className="mt-6 transition-all duration-300 hover:shadow-lg relative z-10">
            <CardHeader>
              <CardTitle className="flex items-center gap-2">
                <Users className="w-5 h-5 text-emerald-500" />
                Thứ hạng của bạn
              </CardTitle>
            </CardHeader>
            <CardContent>
              <div className="flex justify-between items-center mb-6">
                <div className="text-center">
                  <span className="text-3xl font-bold text-gray-800">#{userRank.rank}</span>
                  <p className="text-gray-500 text-sm">Thứ hạng</p>
                </div>
                <div className="text-center">
                  <span className="text-3xl font-bold text-emerald-600">{userRank.points}</span>
                  <p className="text-gray-500 text-sm">Điểm</p>
                </div>
                {userRank.pointsToNextRank && (
                  <div className="text-center">
                    <span className="text-2xl font-bold text-orange-500">{userRank.pointsToNextRank}</span>
                    <p className="text-gray-500 text-sm">Điểm để lên hạng</p>
                  </div>
                )}
              </div>

              <h3 className="text-lg font-semibold mb-4">Top người dùng</h3>
              <div className="space-y-3">
                {userRank.topUsers.map((user, index) => (
                  <div key={index} className="flex justify-between items-center p-3 bg-gray-50 rounded-lg">
                    <div className="flex items-center gap-3">
                      <div
                        className={`w-8 h-8 rounded-full flex items-center justify-center text-white font-bold text-sm ${
                          index === 0
                            ? "bg-yellow-500"
                            : index === 1
                              ? "bg-gray-400"
                              : index === 2
                                ? "bg-orange-500"
                                : "bg-gray-300"
                        }`}
                      >
                        {index + 1}
                      </div>
                      <span className="text-gray-800 font-medium">{user.username}</span>
                    </div>
                    <span className="text-emerald-500 font-bold">{user.points} điểm</span>
                  </div>
                ))}
              </div>
            </CardContent>
          </Card>
        )}

        <div className="grid grid-cols-1 md:grid-cols-3 gap-6 mt-6 relative z-10">
          {/* NFT Leaderboard Card */}
          <Card className="transition-all duration-300 hover:shadow-lg">
            <CardHeader>
              <CardTitle className="text-lg">Bảng xếp hạng NFT</CardTitle>
            </CardHeader>
            <CardContent>
              <div className="space-y-3">
                {nftLeaderboard.map((nft, index) => (
                  <div key={index} className="flex justify-between items-center border-b border-gray-200 pb-2">
                    <div className="flex items-center space-x-2">
                      <img
                        src={nft.image || "/placeholder.svg"}
                        alt={nft.name}
                        className="w-8 h-8 rounded-full object-cover"
                        onError={(e) => (e.currentTarget.src = "/placeholder.svg?height=32&width=32")}
                      />
                      <span className="text-gray-800 text-sm">
                        {nft.name} #{nft.tokenId}
                      </span>
                    </div>
                    <div className="text-right">
                      <span className="text-emerald-500 font-medium text-sm">{nft.price} ETH</span>
                      <p className="text-gray-500 text-xs">{nft.viewCount} lượt xem</p>
                    </div>
                  </div>
                ))}
              </div>
            </CardContent>
          </Card>

          {/* Post Leaderboard Card */}
          <Card className="transition-all duration-300 hover:shadow-lg">
            <CardHeader>
              <CardTitle className="text-lg">Bảng xếp hạng bài đăng</CardTitle>
            </CardHeader>
            <CardContent>
              <div className="space-y-3">
                {postLeaderboard.map((post, index) => (
                  <div key={index} className="flex justify-between items-center border-b border-gray-200 pb-2">
                    <div className="flex items-center space-x-2">
                      <img
                        src={post.image || "/placeholder.svg"}
                        alt={post.name}
                        className="w-8 h-8 rounded-full object-cover"
                        onError={(e) => (e.currentTarget.src = "/placeholder.svg?height=32&width=32")}
                      />
                      <span className="text-gray-800 text-sm">
                        {post.name} #{post.tokenId}
                      </span>
                    </div>
                    <div className="text-right">
                      <span className="text-emerald-500 font-medium text-sm">{post.likeCount} thích</span>
                      <p className="text-gray-500 text-xs">{post.viewCount} lượt xem</p>
                    </div>
                  </div>
                ))}
              </div>
            </CardContent>
          </Card>

          {/* Tag Leaderboard Card */}
          <Card className="transition-all duration-300 hover:shadow-lg">
            <CardHeader>
              <CardTitle className="text-lg">Bảng xếp hạng thẻ</CardTitle>
            </CardHeader>
            <CardContent>
              <div className="space-y-3">
                {tagLeaderboard.map((tag, index) => (
                  <div key={index} className="flex justify-between items-center border-b border-gray-200 pb-2">
                    <span className="text-gray-800 text-sm">#{tag.tag}</span>
                    <div className="text-right">
                      <span className="text-emerald-500 font-medium text-sm">{tag.postCount} bài đăng</span>
                      <p className="text-gray-500 text-xs">{tag.score} điểm</p>
                    </div>
                  </div>
                ))}
              </div>
            </CardContent>
          </Card>
        </div>
        {/* <TestReduxData /> */}
      </div>
    </div>
  )
}