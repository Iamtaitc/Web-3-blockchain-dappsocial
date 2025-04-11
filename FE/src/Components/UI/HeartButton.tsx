"use client"

import { useState } from "react"
import { FaHeart, FaRegHeart } from "react-icons/fa"

interface HeartButtonProps {
  initialLiked?: boolean
  onToggle?: (liked: boolean) => void
}

const HeartButton = ({ initialLiked = false, onToggle }: HeartButtonProps) => {
  const [liked, setLiked] = useState(initialLiked)

  const handleClick = () => {
    const newLikedState = !liked
    setLiked(newLikedState)
    if (onToggle) {
      onToggle(newLikedState)
    }
  }

  return (
    <button onClick={handleClick} className="heart-button" aria-label={liked ? "Unlike" : "Like"}>
      {liked ? (
        <FaHeart className="heart-icon filled" style={{ color: "#e11d48" }} />
      ) : (
        <FaRegHeart className="heart-icon" style={{ color: "#6b7280", transition: "color 0.2s" }} />
      )}
    </button>
  )
}

export default HeartButton

