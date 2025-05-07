"use client"

import { useState, useEffect } from "react"
import { FaHeart, FaRegHeart } from "react-icons/fa"

interface HeartButtonProps {
  initialLiked?: boolean
  postId?: string
  likeCount?: number
  onToggle?: (liked: boolean, newCount: number) => void
}

const HeartButton = ({ initialLiked = false, postId, likeCount = 0, onToggle }: HeartButtonProps) => {
  const [liked, setLiked] = useState(initialLiked)
  const [count, setCount] = useState(likeCount)
  const [isAnimating, setIsAnimating] = useState(false)

  // Cập nhật trạng thái khi prop thay đổi
  useEffect(() => {
    setLiked(initialLiked)
    setCount(likeCount)
  }, [initialLiked, likeCount])

  const handleClick = () => {
    const newLikedState = !liked
    const newCount = newLikedState ? count + 1 : count - 1

    // Cập nhật UI ngay lập tức
    setLiked(newLikedState)
    setCount(newCount)

    // Thêm hiệu ứng animation
    setIsAnimating(true)
    setTimeout(() => setIsAnimating(false), 500)

    // Gọi callback nếu có
    if (onToggle) {
      onToggle(newLikedState, newCount)
    }
  }

  return (
    <div className="flex items-center gap-1">
      <button onClick={handleClick} className="heart-button relative" aria-label={liked ? "Unlike" : "Like"}>
        {liked ? (
          <FaHeart
            className={`heart-icon filled ${isAnimating ? "animate-heartbeat" : ""}`}
            style={{ color: "#e11d48" }}
            size={20}
          />
        ) : (
          <FaRegHeart className="heart-icon" style={{ color: "#6b7280", transition: "color 0.2s" }} size={20} />
        )}
      </button>
      <span className={`text-sm font-medium transition-all ${liked ? "text-red-600" : "text-gray-600"}`}>
        {count > 0 ? count : ""}
      </span>
    </div>
  )
}

export default HeartButton
