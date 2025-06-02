// components/LikeButton.tsx
"use client"

import React, { useState, useEffect } from "react"
import { Heart } from "lucide-react"
import commentApi from "../../services/commentApi"
import { useSelector } from "react-redux"
import type { RootState } from "../../store"
import { toast } from "react-hot-toast"

interface LikecommentProps {
  commentId: string
  initialIsLiked: boolean
  initialLikeCount: number
  onLikeToggle: (isLiked: boolean, likeCount: number) => void
}

const Likecomment: React.FC<LikecommentProps> = ({ commentId, initialIsLiked, initialLikeCount, onLikeToggle }) => {
  const [isLiked, setIsLiked] = useState(initialIsLiked)
  const [likeCount, setLikeCount] = useState(initialLikeCount)
  const isAuthenticated = useSelector((state: RootState) => !!state.auth.token)

  useEffect(() => {
    setIsLiked(initialIsLiked)
    setLikeCount(initialLikeCount)
  }, [initialIsLiked, initialLikeCount])

  const handleLike = async () => {
    if (!isAuthenticated) {
      toast.error("Vui lòng đăng nhập để thích bình luận")
      return
    }

    try {
      const newIsLiked = !isLiked
      setIsLiked(newIsLiked)
      setLikeCount((prev) => (newIsLiked ? prev + 1 : prev - 1))

      if (newIsLiked) {
        await commentApi.likeComment(commentId)
      } else {
        await commentApi.unlikeComment(commentId)
      }
      onLikeToggle(newIsLiked, likeCount)
    } catch (error) {
      console.error("Lỗi khi thích/bỏ thích:", error)
      setIsLiked(initialIsLiked)
      setLikeCount(initialLikeCount)
      toast.error("Có lỗi xảy ra khi thích/bỏ thích bình luận")
    }
  }

  return (
    <button
      className={`like-button ${isLiked ? "liked" : ""}`}
      onClick={handleLike}
      aria-label={isLiked ? "Bỏ thích" : "Thích"}
    >
      <Heart size={16} className={isLiked ? "text-red-500 fill-red-500" : ""} />
      <span>{likeCount}</span>
    </button>
  )
}

export default Likecomment