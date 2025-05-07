"use client"

import { useState, useEffect } from "react"
import { Bookmark } from "lucide-react"

interface BookmarkButtonProps {
  initialSaved?: boolean
  postId?: string
  saveCount?: number
  onToggle?: (saved: boolean, newCount: number) => void
}

const BookmarkButton = ({ initialSaved = false, postId, saveCount = 0, onToggle }: BookmarkButtonProps) => {
  const [saved, setSaved] = useState(initialSaved)
  const [count, setCount] = useState(saveCount)
  const [isAnimating, setIsAnimating] = useState(false)

  // Cập nhật trạng thái khi prop thay đổi
  useEffect(() => {
    setSaved(initialSaved)
    setCount(saveCount)
  }, [initialSaved, saveCount])

  const handleClick = () => {
    const newSavedState = !saved
    const newCount = newSavedState ? count + 1 : count - 1

    // Cập nhật UI ngay lập tức
    setSaved(newSavedState)
    setCount(newCount)

    // Thêm hiệu ứng animation
    setIsAnimating(true)
    setTimeout(() => setIsAnimating(false), 500)

    // Gọi callback nếu có
    if (onToggle) {
      onToggle(newSavedState, newCount)
    }
  }

  return (
    <div className="flex items-center gap-1">
      <button
        onClick={handleClick}
        className="p-1.5 rounded-full hover:bg-gray-100 transition-colors"
        title={saved ? "Bỏ lưu" : "Lưu bài viết"}
      >
        <Bookmark
          size={20}
          className={`transition-all ${saved ? "text-blue-500 fill-blue-500" : "text-gray-500"} ${isAnimating ? "scale-125" : "scale-100"}`}
          style={{ transition: "transform 0.3s, color 0.3s, fill 0.3s" }}
        />
      </button>
      {count > 0 && (
        <span className={`text-sm font-medium transition-all ${saved ? "text-blue-600" : "text-gray-600"}`}>
          {count}
        </span>
      )}
    </div>
  )
}

export default BookmarkButton
