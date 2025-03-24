"use client"

import type React from "react"

import { useState, useEffect } from "react"
import { useNavigate } from "react-router-dom"
import { FiHeart, FiShare2, FiEye, FiClock, FiTag, FiMoreHorizontal } from "react-icons/fi"
import { FaEthereum } from "react-icons/fa"

// Import các hình ảnh từ assets
// Lưu ý: Đường dẫn có thể cần điều chỉnh tùy vào cấu trúc thư mục của bạn
import boyImage from "../../assets/boy.jpg"
import cafeImage from "../../assets/cafe.webp"
import foodImage from "../../assets/food.jpg"
import dogImage from "../../assets/dog.jpg"

interface NFTHistory {
  event: string
  by: string
  date: string
  price: number
}

interface NFTCreator {
  name: string
  avatar: string
  verified: boolean
}

interface NFTOwner {
  name: string
  avatar: string
}

interface NFTData {
  id: string
  title: string
  description: string
  creator: NFTCreator
  owner: NFTOwner
  image: string
  price: number
  currency: string
  highestBid: number
  endTime: string
  views: number
  likes: number
  history: NFTHistory[]
  tags: string[]
  collection: string
}

interface RelatedNFT {
  id: string
  title: string
  image: string
  price: number
  creator: string
}

const NFTDetail = () => {
  const navigate = useNavigate()
  const [isLiked, setIsLiked] = useState(false)
  const [showBidModal, setShowBidModal] = useState(false)
  const [nft, setNFT] = useState<NFTData | null>(null)
  const [loading, setLoading] = useState(true)

  // Sample related NFTs
  const relatedNFTs: RelatedNFT[] = [
    {
      id: "nft-123457",
      title: "Celestial Harmony #18",
      image: boyImage,
      price: 1.8,
      creator: "Alex Nguyen",
    },
    {
      id: "nft-123458",
      title: "Digital Nebula #7",
      image: dogImage,
      price: 3.2,
      creator: "Cosmic Artist",
    },
    {
      id: "nft-123459",
      title: "Quantum Dreams",
      image: foodImage,
      price: 1.5,
      creator: "Future Visionary",
    },
    {
      id: "nft-123460",
      title: "Astral Projection",
      image: cafeImage,
      price: 2.7,
      creator: "Digital Shaman",
    },
  ]

  useEffect(() => {
    const fetchNFT = async () => {
      setLoading(true)

      try {
        // Get the NFT ID from sessionStorage (set when clicking "View NFT" in CreateNFT)
        const nftId = sessionStorage.getItem("currentNFTId")

        if (nftId) {
          // Try to get the NFT data from localStorage
          const storedNFT = localStorage.getItem(`nft_${nftId}`)

          if (storedNFT) {
            // Parse the stored NFT data
            const parsedNFT = JSON.parse(storedNFT)
            setNFT(parsedNFT)
          } else {
            // If not found in localStorage, use a fallback NFT
            setDefaultNFT()
          }
        } else {
          // If no NFT ID in sessionStorage, use a fallback NFT
          setDefaultNFT()
        }
      } catch (error) {
        console.error("Error fetching NFT:", error)
        setDefaultNFT()
      } finally {
        setLoading(false)
      }
    }

    fetchNFT()
  }, [])

  const setDefaultNFT = () => {
    setNFT({
      id: "nft-default",
      title: "Coong bao",
      description:
        "A surreal journey through the cosmos, where dreams and reality merge into a vibrant tapestry of color and emotion. This unique piece captures the essence of our connection to the universe.",
      creator: {
        name: "Your Name",
        avatar: boyImage,
        verified: true,
      },
      owner: {
        name: "Your Name",
        avatar: boyImage,
      },
      image: foodImage,
      price: 0.5,
      currency: "ETH",
      highestBid: 0.5,
      endTime: new Date(Date.now() + 2 * 24 * 60 * 60 * 1000).toISOString(),
      views: 0,
      likes: 0,
      history: [{ event: "Minted", by: "Your Name", date: "Just now", price: 0.5 }],
      tags: ["Abstract", "Cosmic", "Surreal", "Digital Art"],
      collection: "Cosmic Collection",
    })
  }

  // Format time remaining
  const formatTimeRemaining = (endTimeStr: string) => {
    const endTime = new Date(endTimeStr)
    const now = new Date()
    const diff = endTime.getTime() - now.getTime()

    if (diff <= 0) return "Ended"

    const days = Math.floor(diff / (1000 * 60 * 60 * 24))
    const hours = Math.floor((diff % (1000 * 60 * 60 * 24)) / (1000 * 60 * 60))
    const minutes = Math.floor((diff % (1000 * 60 * 60)) / (1000 * 60))

    return `${days}d ${hours}h ${minutes}m`
  }

  const handleBidSubmit = (e: React.FormEvent) => {
    e.preventDefault()
    // Handle bid submission logic here
    setShowBidModal(false)
  }

  if (loading || !nft) {
    return (
      <div className="min-h-screen flex items-center justify-center">
        <div className="w-16 h-16 border-4 border-blue-500 border-t-transparent rounded-full animate-spin"></div>
      </div>
    )
  }

  return (
    <div className="min-h-screen">
      {/* Header */}
      <div className="flex justify-between items-center mb-6">
        <button onClick={() => navigate(-1)} className="flex items-center text-white hover:text-gray-300">
          <svg
            xmlns="http://www.w3.org/2000/svg"
            fill="none"
            viewBox="0 0 24 24"
            strokeWidth={1.5}
            stroke="currentColor"
            className="w-6 h-6 mr-2"
          >
            <path strokeLinecap="round" strokeLinejoin="round" d="M15.75 19.5 8.25 12l7.5-7.5" />
          </svg>
          Quay lại
        </button>

        <div className="flex items-center space-x-4">
          <button className="p-2 rounded-full hover:bg-zinc-800 transition-colors">
            <FiShare2 className="w-5 h-5" />
          </button>
          <button className="p-2 rounded-full hover:bg-zinc-800 transition-colors" onClick={() => setIsLiked(!isLiked)}>
            <FiHeart className={`w-5 h-5 ${isLiked ? "fill-red-500 text-red-500" : ""}`} />
          </button>
          <button className="p-2 rounded-full hover:bg-zinc-800 transition-colors">
            <FiMoreHorizontal className="w-5 h-5" />
          </button>
        </div>
      </div>

      {/* Main Content */}
      <div>
        <div className="mb-8">
          <div className="rounded-xl overflow-hidden bg-zinc-900 border border-zinc-800 mb-6">
            <img src={foodImage || "/placeholder.svg"} alt={nft.title} className="w-full object-cover max-h-[400px]" />
          </div>

          <h1 className="text-3xl font-bold mb-4">{nft.title}</h1>

          {/* Creator & Owner */}
          <div className="flex mb-6">
            <div className="mr-8">
              <span className="text-gray-400 text-sm mb-2">Người tạo</span>
              <div className="flex items-center mt-2">
                <img
                  src={boyImage || "/placeholder.svg"}
                  alt={nft.creator.name}
                  className="w-10 h-10 rounded-full mr-2"
                />
                <div className="flex items-center">
                  <span className="font-medium">Your Name</span>
                  {nft.creator.verified && (
                    <svg className="w-4 h-4 ml-1 text-blue-500 fill-current" viewBox="0 0 24 24">
                      <path d="M12 2C6.48 2 2 6.48 2 12s4.48 10 10 10 10-4.48 10-10S17.52 2 12 2zm-2 15l-5-5 1.41-1.41L10 14.17l7.59-7.59L19 8l-9 9z" />
                    </svg>
                  )}
                </div>
              </div>
            </div>

            <div>
              <span className="text-gray-400 text-sm mb-2">Chủ sở hữu hiện tại</span>
              <div className="flex items-center mt-2">
                <img
                  src={boyImage || "/placeholder.svg"}
                  alt={nft.owner.name}
                  className="w-10 h-10 rounded-full mr-2"
                />
                <span className="font-medium">Your Name</span>
              </div>
            </div>
          </div>

          {/* Stats */}
          <div className="flex justify-between items-center p-4 bg-zinc-900 rounded-xl border border-zinc-800 mb-6">
            <div className="flex items-center">
              <FiEye className="w-5 h-5 mr-2 text-gray-400" />
              <span className="text-gray-400">{nft.views} lượt xem</span>
            </div>
            <div className="flex items-center">
              <FiHeart className="w-5 h-5 mr-2 text-gray-400" />
              <span className="text-gray-400">{nft.likes} lượt thích</span>
            </div>
            <div className="flex items-center">
              <FiTag className="w-5 h-5 mr-2 text-gray-400" />
              <span className="text-gray-400">{nft.tags.length} thẻ</span>
            </div>
          </div>

          {/* Current Bid */}
          <div className="grid grid-cols-1 md:grid-cols-3 gap-4 mb-8">
            <div className="bg-zinc-900 rounded-xl border border-zinc-800 p-6 col-span-2">
              <div className="flex justify-between items-center mb-4">
                <div>
                  <p className="text-gray-400 text-sm">Giá hiện tại</p>
                  <div className="flex items-center mt-1">
                    <FaEthereum className="w-5 h-5 mr-2" />
                    <span className="text-2xl font-bold">
                      {nft.price} {nft.currency}
                    </span>
                    <span className="ml-2 text-gray-400">(~$4,250.50)</span>
                  </div>
                </div>

                <div>
                  <p className="text-gray-400 text-sm">Kết thúc sau</p>
                  <div className="flex items-center mt-1">
                    <FiClock className="w-5 h-5 mr-2" />
                    <span className="text-xl font-medium">{formatTimeRemaining(nft.endTime)}</span>
                  </div>
                </div>
              </div>
            </div>

            <div className="flex flex-col gap-4">
              <button
                onClick={() => setShowBidModal(true)}
                className="py-3 bg-blue-600 hover:bg-blue-700 text-white font-medium rounded-xl transition-colors"
              >
                Đặt giá
              </button>
              <button className="py-3 bg-zinc-800 hover:bg-zinc-700 text-white font-medium rounded-xl transition-colors">
                Mua ngay với 0.55 ETH
              </button>
            </div>
          </div>

          {/* Description */}
          <div className="mb-8">
            <h2 className="text-xl font-semibold mb-4">Mô tả</h2>
            <p className="text-gray-300 leading-relaxed">{nft.description}</p>
          </div>

          {/* Tags */}
          <div className="mb-8">
            <h2 className="text-xl font-semibold mb-4">Thẻ</h2>
            <div className="flex flex-wrap gap-2">
              {nft.tags.map((tag, index) => (
                <span key={index} className="px-3 py-1 bg-zinc-800 text-gray-300 rounded-full text-sm">
                  {tag}
                </span>
              ))}
            </div>
          </div>

          {/* History */}
          <div className="mb-12">
            <h2 className="text-xl font-semibold mb-4">Lịch sử giao dịch</h2>
            <div className="bg-zinc-900 rounded-xl border border-zinc-800 overflow-hidden">
              <table className="w-full">
                <thead className="border-b border-zinc-800">
                  <tr>
                    <th className="text-left p-4 text-gray-400">Sự kiện</th>
                    <th className="text-left p-4 text-gray-400">Giá</th>
                    <th className="text-left p-4 text-gray-400">Từ</th>
                    <th className="text-left p-4 text-gray-400">Thời gian</th>
                  </tr>
                </thead>
                <tbody>
                  {nft.history.map((item, index) => (
                    <tr key={index} className="border-b border-zinc-800 last:border-0">
                      <td className="p-4">{item.event}</td>
                      <td className="p-4">
                        <div className="flex items-center">
                          <FaEthereum className="w-4 h-4 mr-1" />
                          <span>{item.price}</span>
                        </div>
                      </td>
                      <td className="p-4 text-blue-400">{item.by}</td>
                      <td className="p-4 text-gray-400">{item.date}</td>
                    </tr>
                  ))}
                </tbody>
              </table>
            </div>
          </div>
        </div>

        {/* Related NFTs */}
        <div>
          <h2 className="text-2xl font-bold mb-6">NFT tương tự</h2>
          <div className="grid grid-cols-1 sm:grid-cols-2 md:grid-cols-4 gap-6">
            {relatedNFTs.map((item) => (
              <div
                key={item.id}
                className="bg-zinc-900 rounded-xl border border-zinc-800 overflow-hidden hover:border-zinc-700 transition-colors"
              >
                <div className="aspect-square overflow-hidden">
                  <img
                    src={item.image || "/placeholder.svg"}
                    alt={item.title}
                    className="w-full h-full object-cover hover:scale-110 transition-transform duration-300"
                  />
                </div>
                <div className="p-4">
                  <h3 className="font-medium mb-2 truncate">{item.title}</h3>
                  <div className="flex justify-between items-center">
                    <span className="text-gray-400 text-sm">{item.creator}</span>
                    <div className="flex items-center">
                      <FaEthereum className="w-3 h-3 mr-1" />
                      <span className="font-medium">{item.price}</span>
                    </div>
                  </div>
                </div>
              </div>
            ))}
          </div>
        </div>
      </div>

      {/* Bid Modal */}
      {showBidModal && (
        <div className="fixed inset-0 bg-black bg-opacity-70 flex items-center justify-center z-50">
          <div className="bg-zinc-900 rounded-xl border border-zinc-800 p-6 max-w-md w-full">
            <h3 className="text-xl font-bold mb-6">Đặt giá cho {nft.title}</h3>

            <div className="mb-6">
              <p className="text-gray-400 mb-2">Giá hiện tại</p>
              <div className="flex items-center">
                <FaEthereum className="w-5 h-5 mr-2" />
                <span className="text-xl font-bold">
                  {nft.highestBid} {nft.currency}
                </span>
              </div>
            </div>

            <form onSubmit={handleBidSubmit}>
              <div className="mb-6">
                <label className="block text-gray-400 mb-2">Giá đặt của bạn</label>
                <div className="relative">
                  <div className="absolute inset-y-0 left-0 pl-3 flex items-center pointer-events-none">
                    <FaEthereum className="w-5 h-5 text-gray-400" />
                  </div>
                  <input
                    type="number"
                    min={nft.highestBid + 0.1}
                    step="0.1"
                    defaultValue={(nft.highestBid + 0.1).toFixed(1)}
                    className="w-full pl-10 pr-3 py-3 bg-zinc-800 border border-zinc-700 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-transparent text-white"
                    placeholder="Nhập số lượng ETH"
                  />
                </div>
                <p className="text-gray-400 text-sm mt-2">Bạn phải đặt giá cao hơn giá hiện tại ít nhất 0.1 ETH</p>
              </div>

              <div className="flex gap-4">
                <button
                  type="button"
                  onClick={() => setShowBidModal(false)}
                  className="flex-1 py-3 bg-zinc-800 hover:bg-zinc-700 text-white font-medium rounded-xl transition-colors"
                >
                  Hủy
                </button>
                <button
                  type="submit"
                  className="flex-1 py-3 bg-blue-600 hover:bg-blue-700 text-white font-medium rounded-xl transition-colors"
                >
                  Xác nhận
                </button>
              </div>
            </form>
          </div>
        </div>
      )}
    </div>
  )
}

export default NFTDetail

