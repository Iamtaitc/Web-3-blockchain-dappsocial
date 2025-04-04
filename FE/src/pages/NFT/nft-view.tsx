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
      currency: "DX",
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
      <div className="min-h-screen flex items-center justify-center bg-white">
        <div className="w-16 h-16 border-4 border-blue-500 border-t-transparent rounded-full animate-spin"></div>
      </div>
    )
  }

  return (
    <div className="min-h-screen bg-white text-gray-800 px-4 md:px-8 py-6 max-w-7xl mx-auto">
      {/* Header */}
      <div className="flex justify-between items-center mb-8">
        <button
          onClick={() => navigate(-1)}
          className="flex items-center text-gray-700 hover:text-blue-600 transition-colors font-medium"
        >
          <svg
            xmlns="http://www.w3.org/2000/svg"
            fill="none"
            viewBox="0 0 24 24"
            strokeWidth={1.5}
            stroke="currentColor"
            className="w-5 h-5 mr-2"
          >
            <path strokeLinecap="round" strokeLinejoin="round" d="M15.75 19.5 8.25 12l7.5-7.5" />
          </svg>
          Quay lại
        </button>

        <div className="flex items-center space-x-3">
          <button className="p-2 rounded-full bg-gray-100 text-gray-700 hover:bg-gray-200 transition-colors">
            <FiShare2 className="w-5 h-5" />
          </button>
          <button
            className="p-2 rounded-full bg-gray-100 text-gray-700 hover:bg-gray-200 transition-colors"
            onClick={() => setIsLiked(!isLiked)}
          >
            <FiHeart className={`w-5 h-5 ${isLiked ? "fill-red-500 text-red-500" : ""}`} />
          </button>
          <button className="p-2 rounded-full bg-gray-100 text-gray-700 hover:bg-gray-200 transition-colors">
            <FiMoreHorizontal className="w-5 h-5" />
          </button>
        </div>
      </div>

      {/* Main Content */}
      <div className="grid grid-cols-1 lg:grid-cols-3 gap-8">
        {/* Left Column - NFT Image */}
        <div className="lg:col-span-1">
          <div className="sticky top-8">
            <div className="rounded-2xl overflow-hidden bg-white border border-gray-200 shadow-lg mb-6">
              <img
                src={foodImage || "/placeholder.svg"}
                alt={nft.title}
                className="w-full object-cover aspect-square"
              />
            </div>

            {/* Stats */}
            <div className="flex justify-between items-center p-4 bg-gray-50 rounded-xl border border-gray-200 mb-6">
              <div className="flex items-center">
                <FiEye className="w-5 h-5 mr-2 text-gray-500" />
                <span className="text-gray-600">{nft.views} lượt xem</span>
              </div>
              <div className="flex items-center">
                <FiHeart className="w-5 h-5 mr-2 text-gray-500" />
                <span className="text-gray-600">{nft.likes} lượt thích</span>
              </div>
              <div className="flex items-center">
                <FiTag className="w-5 h-5 mr-2 text-gray-500" />
                <span className="text-gray-600">{nft.tags.length} thẻ</span>
              </div>
            </div>
          </div>
        </div>

        {/* Right Column - NFT Details */}
        <div className="lg:col-span-2">
          <h1 className="text-3xl font-bold mb-4 text-gray-900">{nft.title}</h1>

          {/* Creator & Owner */}
          <div className="flex flex-wrap mb-8">
            <div className="mr-8 mb-4">
              <span className="text-gray-500 text-sm block mb-2">Người tạo</span>
              <div className="flex items-center">
                <div className="relative">
                  <img
                    src={boyImage || "/placeholder.svg"}
                    alt={nft.creator.name}
                    className="w-10 h-10 rounded-full mr-3 border-2 border-white shadow-sm"
                  />
                  {nft.creator.verified && (
                    <div className="absolute -bottom-1 -right-1 bg-blue-500 text-white rounded-full p-0.5">
                      <svg className="w-3 h-3 fill-current" viewBox="0 0 24 24">
                        <path d="M9 16.17L4.83 12l-1.42 1.41L9 19 21 7l-1.41-1.41L9 16.17z" />
                      </svg>
                    </div>
                  )}
                </div>
                <div>
                  <span className="font-medium text-gray-900">Your Name</span>
                  <span className="block text-xs text-gray-500">Người sáng tạo</span>
                </div>
              </div>
            </div>

            <div>
              <span className="text-gray-500 text-sm block mb-2">Chủ sở hữu hiện tại</span>
              <div className="flex items-center">
                <img
                  src={boyImage || "/placeholder.svg"}
                  alt={nft.owner.name}
                  className="w-10 h-10 rounded-full mr-3 border-2 border-white shadow-sm"
                />
                <div>
                  <span className="font-medium text-gray-900">Your Name</span>
                  <span className="block text-xs text-gray-500">Chủ sở hữu</span>
                </div>
              </div>
            </div>
          </div>

          {/* Current Bid */}
          <div className="bg-gradient-to-r from-blue-50 to-indigo-50 rounded-xl border border-blue-100 p-6 mb-8">
            <div className="flex flex-wrap justify-between items-center mb-6">
              <div>
                <p className="text-gray-600 text-sm mb-1">Giá hiện tại</p>
                <div className="flex items-center">
                  <FaEthereum className="w-6 h-6 mr-2 text-blue-600" />
                  <span className="text-3xl font-bold text-gray-900">
                    {nft.price} {nft.currency}
                  </span>
                  <span className="ml-2 text-gray-500">(~$4,250.50)</span>
                </div>
              </div>

              <div className="mt-4 sm:mt-0">
                <p className="text-gray-600 text-sm mb-1">Kết thúc sau</p>
                <div className="flex items-center bg-white px-4 py-2 rounded-lg shadow-sm">
                  <FiClock className="w-5 h-5 mr-2 text-orange-500" />
                  <span className="text-xl font-medium text-gray-900">{formatTimeRemaining(nft.endTime)}</span>
                </div>
              </div>
            </div>

            <div className="flex flex-col sm:flex-row gap-4">
              <button
                onClick={() => setShowBidModal(true)}
                className="py-3 px-6 bg-emerald-500 hover:bg-emerald-700 text-white font-medium rounded-xl transition-colors flex-1 shadow-md hover:shadow-lg"
              >
                Đặt giá
              </button>
              <button className="py-3 px-6 bg-white border border-gray-300 hover:bg-gray-50 text-gray-800 font-medium rounded-xl transition-colors flex-1 shadow-sm hover:shadow-md">
                Mua ngay với 0.55 DX
              </button>
            </div>
          </div>

          {/* Description */}
          <div className="mb-8">
            <h2 className="text-xl font-semibold mb-4 text-gray-900">Mô tả</h2>
            <p className="text-gray-700 leading-relaxed">{nft.description}</p>
          </div>

          {/* Tags */}
          <div className="mb-8">
            <h2 className="text-xl font-semibold mb-4 text-gray-900">Thẻ</h2>
            <div className="flex flex-wrap gap-2">
              {nft.tags.map((tag, index) => (
                <span
                  key={index}
                  className="px-4 py-1.5 bg-gray-100 text-gray-700 rounded-full text-sm hover:bg-gray-200 transition-colors cursor-pointer"
                >
                  {tag}
                </span>
              ))}
            </div>
          </div>

          {/* History */}
          <div className="mb-12">
            <h2 className="text-xl font-semibold mb-4 text-gray-900">Lịch sử giao dịch</h2>
            <div className="bg-white rounded-xl border border-gray-200 overflow-hidden shadow-sm">
              <table className="w-full">
                <thead className="bg-gray-50 border-b border-gray-200">
                  <tr>
                    <th className="text-left p-4 text-gray-600 font-medium">Sự kiện</th>
                    <th className="text-left p-4 text-gray-600 font-medium">Giá</th>
                    <th className="text-left p-4 text-gray-600 font-medium">Từ</th>
                    <th className="text-left p-4 text-gray-600 font-medium">Thời gian</th>
                  </tr>
                </thead>
                <tbody>
                  {nft.history.map((item, index) => (
                    <tr
                      key={index}
                      className="border-b border-gray-100 last:border-0 hover:bg-gray-50 transition-colors"
                    >
                      <td className="p-4 font-medium text-gray-800">{item.event}</td>
                      <td className="p-4">
                        <div className="flex items-center">
                          <FaEthereum className="w-4 h-4 mr-1 text-blue-600" />
                          <span className="text-gray-800">{item.price}</span>
                        </div>
                      </td>
                      <td className="p-4 text-blue-600 hover:text-blue-800 cursor-pointer">{item.by}</td>
                      <td className="p-4 text-gray-500">{item.date}</td>
                    </tr>
                  ))}
                </tbody>
              </table>
            </div>
          </div>
        </div>
      </div>

      {/* Related NFTs */}
      <div className="mt-16">
        <h2 className="text-2xl font-bold mb-6 text-gray-900">NFT tương tự</h2>
        <div className="grid grid-cols-1 sm:grid-cols-2 md:grid-cols-4 gap-6">
          {relatedNFTs.map((item) => (
            <div
              key={item.id}
              className="bg-white rounded-xl border border-gray-200 overflow-hidden hover:shadow-lg transition-all duration-300 group"
            >
              <div className="aspect-square overflow-hidden relative">
                <img
                  src={item.image || "/placeholder.svg"}
                  alt={item.title}
                  className="w-full h-full object-cover group-hover:scale-110 transition-transform duration-500"
                />
                <div className="absolute inset-0 bg-gradient-to-t from-black/50 to-transparent opacity-0 group-hover:opacity-100 transition-opacity duration-300 flex items-end">
                  <div className="p-4 w-full">
                    <button className="w-full py-2 bg-white text-gray-800 rounded-lg font-medium text-sm hover:bg-blue-600 hover:text-white transition-colors">
                      Xem chi tiết
                    </button>
                  </div>
                </div>
              </div>
              <div className="p-4">
                <h3 className="font-medium mb-2 truncate text-gray-900">{item.title}</h3>
                <div className="flex justify-between items-center">
                  <span className="text-gray-600 text-sm">{item.creator}</span>
                  <div className="flex items-center bg-blue-50 px-2 py-1 rounded-md">
                    <FaEthereum className="w-3 h-3 mr-1 text-blue-600" />
                    <span className="font-medium text-gray-900">{item.price}</span>
                  </div>
                </div>
              </div>
            </div>
          ))}
        </div>
      </div>

      {/* Bid Modal */}
      {showBidModal && (
        <div className="fixed inset-0 bg-black bg-opacity-50 flex items-center justify-center z-50">
          <div className="bg-white rounded-xl border border-gray-200 p-6 max-w-md w-full shadow-2xl">
            <h3 className="text-xl font-bold mb-6 text-gray-900">Đặt giá cho {nft.title}</h3>

            <div className="mb-6">
              <p className="text-gray-600 mb-2">Giá hiện tại</p>
              <div className="flex items-center">
                <FaEthereum className="w-5 h-5 mr-2 text-blue-600" />
                <span className="text-xl font-bold text-gray-900">
                  {nft.highestBid} {nft.currency}
                </span>
              </div>
            </div>

            <form onSubmit={handleBidSubmit}>
              <div className="mb-6">
                <label className="block text-gray-700 mb-2 font-medium">Giá đặt của bạn</label>
                <div className="relative">
                  <div className="absolute inset-y-0 left-0 pl-3 flex items-center pointer-events-none">
                    <FaEthereum className="w-5 h-5 text-gray-500" />
                  </div>
                  <input
                    type="number"
                    min={nft.highestBid + 0.1}
                    step="0.1"
                    defaultValue={(nft.highestBid + 0.1).toFixed(1)}
                    className="w-full pl-10 pr-3 py-3 bg-white border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-blue-500 text-gray-800 shadow-sm"
                    placeholder="Nhập số lượng DX"
                  />
                </div>
                <p className="text-gray-500 text-sm mt-2">Bạn phải đặt giá cao hơn giá hiện tại ít nhất 0.1 DX</p>
              </div>

              <div className="flex gap-4">
                <button
                  type="button"
                  onClick={() => setShowBidModal(false)}
                  className="flex-1 py-3 bg-gray-100 hover:bg-gray-200 text-gray-800 font-medium rounded-xl transition-colors"
                >
                  Hủy
                </button>
                <button
                  type="submit"
                  className="flex-1 py-3 bg-emerald-500 hover:bg-emerald-700 text-white font-medium rounded-xl transition-colors shadow-md hover:shadow-lg"
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

