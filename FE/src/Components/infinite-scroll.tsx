"use client"

import type React from "react"

import { useEffect, useState, useRef } from "react"
import { Loader2, RefreshCw } from "lucide-react"

interface InfiniteScrollProps {
  onLoadMore: () => Promise<boolean>
  hasMoreData: boolean
  loadingDelay?: number
  className?: string
}

const InfiniteScroll: React.FC<InfiniteScrollProps> = ({
  onLoadMore,
  hasMoreData,
  loadingDelay = 1500,
  className = "",
}) => {
  const [isLoading, setIsLoading] = useState(false)
  const [isVisible, setIsVisible] = useState(false)
  const loaderRef = useRef<HTMLDivElement>(null)
  const [loadingMessages] = useState([
    "Đang tìm kiếm nội dung hay...",
    "Đang kết nối với blockchain...",
    "Đang tải NFT mới nhất...",
    "Đang cập nhật feed của bạn...",
    "Đang tìm những bài viết phù hợp...",
  ])
  const [currentMessage, setCurrentMessage] = useState(loadingMessages[0])

  // Thay đổi thông báo loading mỗi 2 giây
  useEffect(() => {
    if (isLoading) {
      const interval = setInterval(() => {
        setCurrentMessage(loadingMessages[Math.floor(Math.random() * loadingMessages.length)])
      }, 2000)
      return () => clearInterval(interval)
    }
  }, [isLoading, loadingMessages])

  // Thiết lập Intersection Observer để phát hiện khi người dùng cuộn đến cuối
  useEffect(() => {
    const observer = new IntersectionObserver(
      (entries) => {
        if (entries[0].isIntersecting) {
          setIsVisible(true)
        } else {
          setIsVisible(false)
        }
      },
      { threshold: 0.1 },
    )

    if (loaderRef.current) {
      observer.observe(loaderRef.current)
    }

    return () => {
      if (loaderRef.current) {
        observer.unobserve(loaderRef.current)
      }
    }
  }, [])

  // Xử lý tải thêm dữ liệu khi người dùng cuộn đến cuối
  useEffect(() => {
    const handleLoadMore = async () => {
      if (isVisible && hasMoreData && !isLoading) {
        setIsLoading(true)

        try {
          // Đợi ít nhất loadingDelay ms để hiển thị animation loading
          const loadMorePromise = onLoadMore()
          const delayPromise = new Promise((resolve) => setTimeout(resolve, loadingDelay))

          await Promise.all([loadMorePromise, delayPromise])
        } catch (error) {
          console.error("Error loading more content:", error)
        } finally {
          setIsLoading(false)
        }
      }
    }

    handleLoadMore()
  }, [isVisible, hasMoreData, isLoading, onLoadMore, loadingDelay])

  // Xử lý khi người dùng nhấn nút "Tải thêm"
  const handleManualLoadMore = async () => {
    if (!isLoading && hasMoreData) {
      setIsLoading(true)
      try {
        await onLoadMore()
        // Thêm độ trễ nhỏ để hiển thị animation
        await new Promise((resolve) => setTimeout(resolve, 1000))
      } catch (error) {
        console.error("Error loading more content:", error)
      } finally {
        setIsLoading(false)
      }
    }
  }

  return (
    <div ref={loaderRef} className={`py-8 ${className}`}>
      {hasMoreData ? (
        <div className="flex flex-col items-center">
          {isLoading ? (
            <div className="flex flex-col items-center space-y-4">
              <div className="relative">
                <div className="w-16 h-16 rounded-full bg-gradient-to-r from-emerald-400 to-blue-500 animate-pulse opacity-70"></div>
                <Loader2 className="w-8 h-8 text-white absolute top-1/2 left-1/2 transform -translate-x-1/2 -translate-y-1/2 animate-spin" />
              </div>
              <p className="text-gray-600 animate-pulse">{currentMessage}</p>
            </div>
          ) : (
            <button
              onClick={handleManualLoadMore}
              className="flex items-center space-x-2 px-6 py-3 bg-gradient-to-r from-emerald-500 to-blue-500 text-white rounded-full hover:from-emerald-600 hover:to-blue-600 transition-all shadow-md hover:shadow-lg"
            >
              <RefreshCw className="w-4 h-4 mr-2" />
              <span>Tải thêm bài viết</span>
            </button>
          )}
        </div>
      ) : (
        <div className="text-center py-8">
          <div className="w-20 h-20 mx-auto mb-4 rounded-full bg-gray-100 flex items-center justify-center">
            <svg
              xmlns="http://www.w3.org/2000/svg"
              width="32"
              height="32"
              viewBox="0 0 24 24"
              fill="none"
              stroke="currentColor"
              strokeWidth="2"
              strokeLinecap="round"
              strokeLinejoin="round"
              className="text-gray-400"
            >
              <path d="M12 22c5.523 0 10-4.477 10-10S17.523 2 12 2 2 6.477 2 12s4.477 10 10 10z" />
              <path d="M8 14s1.5 2 4 2 4-2 4-2" />
              <line x1="9" y1="9" x2="9.01" y2="9" />
              <line x1="15" y1="9" x2="15.01" y2="9" />
            </svg>
          </div>
          <h3 className="text-lg font-medium text-gray-800">Bạn đã xem hết bài viết</h3>
          <p className="text-gray-500 mt-2">Hãy quay lại sau để xem những nội dung mới nhất</p>
          <div className="mt-6 flex justify-center space-x-4">
            <button className="px-4 py-2 bg-gray-100 hover:bg-gray-200 text-gray-800 rounded-lg transition-colors">
              Khám phá nft  mới
            </button>
            <button className="px-4 py-2 bg-emerald-500 hover:bg-emerald-600 text-white rounded-lg transition-colors">
              Tạo NFT
            </button>
          </div>
        </div>
      )}
    </div>
  )
}

export default InfiniteScroll
