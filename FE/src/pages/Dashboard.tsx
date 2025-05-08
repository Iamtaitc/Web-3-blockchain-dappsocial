
"use client"


import { useState, useEffect } from "react";
import { Wallet } from "lucide-react";
import TestReduxData from "../components/TestReduxData";
import LeaderboardAPI from "../services/LeaderboardAPI";
import userApi, { UserProfile } from "../services/user.api";


// Interface cho NFT Leaderboard Item
interface NFTLeaderboardItem {
  tokenId: string;
  name: string;
  image: string;
  creator: {
    address: string;
    username: string;
    avatarURI: string | null;
    isVerified: boolean;
  };
  owner: {
    address: string;
    username: string;
    avatarURI: string | null;
    isVerified: boolean;
  };
  forSale: boolean;
  price: string;
  likeCount: number;
  viewCount: number;
  mintedAt: string;
}

// Interface cho Post Leaderboard Item (dùng chung với NFT vì response giống nhau)
type PostLeaderboardItem = NFTLeaderboardItem;

// Interface cho Tag Leaderboard Item
interface TagLeaderboardItem {
  tag: string;
  postCount: number;
  likes: number;
  comments: number;
  saves: number;
  score: number;
}

// Interface cho User Rank
interface UserRank {
  rank: number;
  points: number;
  topUsers: Array<{
    walletAddress: string;
    username: string;
    points: number;
  }>;
  pointsToNextRank: number | null;
}

export default function Dashboard() {
  const [userProfile, setUserProfile] = useState<UserProfile | null>(null);
  const [nftLeaderboard, setNFTLeaderboard] = useState<NFTLeaderboardItem[]>([]);
  const [postLeaderboard, setPostLeaderboard] = useState<PostLeaderboardItem[]>([]);
  const [tagLeaderboard, setTagLeaderboard] = useState<TagLeaderboardItem[]>([]);
  const [userRank, setUserRank] = useState<UserRank | null>(null);
  const [loading, setLoading] = useState<boolean>(true);
  const [error, setError] = useState<string | null>(null);

  // Lấy thông tin người dùng và các bảng xếp hạng khi component mount
  useEffect(() => {
    const fetchData = async () => {
      try {
        setLoading(true);
        setError(null);

        // Lấy thông tin người dùng
        const walletAddress = "0x3bab9682ed569c6e25e228efb7e61b100bdaf2d3"; // Thay bằng ví của người dùng hiện tại
        const profile = await userApi.getUserProfile(walletAddress);
        setUserProfile(profile);

        // Lấy bảng xếp hạng NFT
        const nftResponse = await LeaderboardAPI.getNFTLeaderboard();
        setNFTLeaderboard(nftResponse.data.leaderboard);

        // Lấy bảng xếp hạng bài đăng
        const postResponse = await LeaderboardAPI.getPostLeaderboard();
        setPostLeaderboard(postResponse.data.leaderboard);

        // Lấy bảng xếp hạng tags
        const tagResponse = await LeaderboardAPI.getTagLeaderboard();
        setTagLeaderboard(tagResponse.data.leaderboard);

        // Lấy thứ hạng người dùng hiện tại
        const rankResponse = await LeaderboardAPI.getCurrentUserRank();
        setUserRank(rankResponse.data);
      } catch (err: any) {
        setError(err.message || "Failed to load dashboard data");
      } finally {
        setLoading(false);
      }
    };

    fetchData();
  }, []);

  if (loading) {
    return (
      <div className="flex h-screen bg-gray-50 text-gray-800 font-mono items-center justify-center">
        <div className="text-xl font-bold">Loading...</div>
      </div>
    );
  }

  if (error) {
    return (
      <div className="flex h-screen bg-gray-50 text-gray-800 font-mono items-center justify-center">
        <div className="text-xl font-bold text-red-500">{error}</div>
      </div>
    );
  }

  return (
    <div className="flex h-screen bg-gray-50 text-gray-800 font-mono">
      {/* Main Content */}
      <div className="flex-1 p-6 overflow-auto">
        {/* Subtle Background Pattern */}
        <div className="absolute inset-0 bg-[url('data:image/svg+xml;base64,PHN2ZyB3aWR0aD0iNjAiIGhlaWdodD0iNjAiIHZpZXdCb3g9IjAgMCA2MCA2MCIgeG1sbnM9Imh0dHA6Ly93d3cudzMub3JnLzIwMDAvc3ZnIj48ZyBmaWxsPSJub25lIiBmaWxsLXJ1bGU9ImV2ZW5vZGQiPjxnIGZpbGw9IiMwMDAiIGZpbGwtb3BhY2l0eT0iLjAyIj48cGF0aCBkPSJNMzYgMzRjMC0yLjIxLTEuNzktNC00LTRzLTQgMS43OS00IDQgMS43OSA0IDQgNCA0LTEuNzkgNC00eiIvPjwvZz48L2c+PC9zdmc+')] opacity-30 pointer-events-none"></div>

        <h1 className="text-4xl font-bold mb-8 text-center tracking-widest text-gray-900 relative z-10">Dashboard</h1>

        <div className="grid grid-cols-1 md:grid-cols-2 gap-6 relative z-10">
          {/* Balance Card */}
          <div className="bg-white rounded-xl p-8 flex items-center justify-center shadow-md border border-gray-100 transition-all duration-300 hover:shadow-lg">
            <div className="text-center">
              <h2 className="text-4xl font-bold tracking-wider bg-clip-text text-transparent bg-gradient-to-r from-emerald-500 to-teal-600">
                {userProfile?.points || 0} <span>Points</span>
              </h2>
              <p className="text-gray-500 text-sm mt-2">
                Subscription Level: {userProfile?.subscription.level || 0}
              </p>
            </div>
          </div>

          {/* Wallet Card */}
          <div className="bg-white rounded-xl p-6 shadow-md border border-gray-100 transition-all duration-300 hover:shadow-lg">
            <div className="flex justify-between items-center mb-2">
              <h2 className="text-xl font-bold text-gray-800">Wallet</h2>
              <span className="text-emerald-500 font-medium">Connected</span>
            </div>
            <p className="text-gray-500 text-sm mb-6">Connect your wallet to start farming...</p>

            <div className="flex justify-between items-center">
              <div className="flex items-center space-x-2">
                <Wallet className="w-5 h-5 text-gray-600" />
                <span className="text-sm text-gray-700">
                  {userProfile?.walletAddress.slice(0, 8)}...{userProfile?.walletAddress.slice(-4)}
                </span>
              </div>
              <button className="bg-red-500 hover:bg-red-600 text-white px-4 py-2 rounded-lg text-sm shadow-sm transition-colors">
                Disconnect
              </button>
            </div>
          </div>
        </div>

        {/* User Rank Card */}
        {userRank && (
          <div className="bg-white rounded-xl p-6 mt-6 shadow-md border border-gray-100 transition-all duration-300 hover:shadow-lg relative z-10">
            <h2 className="text-xl font-bold mb-4 text-gray-800">Your Rank</h2>
            <div className="flex justify-between items-center mb-4">
              <div>
                <span className="text-3xl font-bold text-gray-800">#{userRank.rank}</span>
                <p className="text-gray-500 text-sm">Your Rank</p>
              </div>
              <div>
                <span className="text-3xl font-bold text-gray-800">{userRank.points}</span>
                <p className="text-gray-500 text-sm">Points</p>
              </div>
            </div>
            <h3 className="text-lg font-semibold mb-2">Top Users</h3>
            <div className="space-y-3">
              {userRank.topUsers.map((user, index) => (
                <div key={index} className="flex justify-between items-center border-b border-gray-200 pb-2">
                  <span className="text-gray-800">#{index + 1} {user.username}</span>
                  <span className="text-emerald-500 font-medium">{user.points} Points</span>
                </div>
              ))}
            </div>
          </div>
        )}

        <div className="grid grid-cols-1 md:grid-cols-3 gap-6 mt-6 relative z-10">
          {/* NFT Leaderboard Card */}
          <div className="bg-white rounded-xl p-6 shadow-md border border-gray-100 transition-all duration-300 hover:shadow-lg">
            <h2 className="text-xl font-bold mb-4 text-gray-800">NFT Leaderboard</h2>
            <div className="space-y-3">
              {nftLeaderboard.map((nft, index) => (
                <div key={index} className="flex justify-between items-center border-b border-gray-200 pb-2">
                  <div className="flex items-center space-x-2">
                    <img
                      src={nft.image}
                      alt={nft.name}
                      className="w-8 h-8 rounded-full object-cover"
                      onError={(e) => (e.currentTarget.src = "/placeholder.png")} // Thay bằng ảnh placeholder nếu lỗi
                    />
                    <span className="text-gray-800">{nft.name} #{nft.tokenId}</span>
                  </div>
                  <div className="text-right">
                    <span className="text-emerald-500 font-medium">{nft.price} ETH</span>
                    <p className="text-gray-500 text-sm">{nft.viewCount} Views</p>
                  </div>
                </div>
              ))}
            </div>
          </div>

          {/* Post Leaderboard Card */}
          <div className="bg-white rounded-xl p-6 shadow-md border border-gray-100 transition-all duration-300 hover:shadow-lg">
            <h2 className="text-xl font-bold mb-4 text-gray-800">Post Leaderboard</h2>
            <div className="space-y-3">
              {postLeaderboard.map((post, index) => (
                <div key={index} className="flex justify-between items-center border-b border-gray-200 pb-2">
                  <div className="flex items-center space-x-2">
                    <img
                      src={post.image}
                      alt={post.name}
                      className="w-8 h-8 rounded-full object-cover"
                      onError={(e) => (e.currentTarget.src = "/placeholder.png")} // Thay bằng ảnh placeholder nếu lỗi
                    />
                    <span className="text-gray-800">{post.name} #{post.tokenId}</span>
                  </div>
                  <div className="text-right">
                    <span className="text-emerald-500 font-medium">{post.likeCount} Likes</span>
                    <p className="text-gray-500 text-sm">{post.viewCount} Views</p>
                  </div>
                </div>
              ))}
            </div>
          </div>

          {/* Tag Leaderboard Card */}
          <div className="bg-white rounded-xl p-6 shadow-md border border-gray-100 transition-all duration-300 hover:shadow-lg">
            <h2 className="text-xl font-bold mb-4 text-gray-800">Tag Leaderboard</h2>
            <div className="space-y-3">
              {tagLeaderboard.map((tag, index) => (
                <div key={index} className="flex justify-between items-center border-b border-gray-200 pb-2">
                  <span className="text-gray-800">#{tag.tag}</span>
                  <div className="text-right">
                    <span className="text-emerald-500 font-medium">{tag.postCount} Posts</span>
                    <p className="text-gray-500 text-sm">{tag.score} Score</p>
                  </div>
                </div>
              ))}
            </div>
          </div>
        </div>
        <TestReduxData />
      </div>
    </div>
  );
}
