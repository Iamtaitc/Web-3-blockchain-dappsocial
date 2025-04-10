"use client"

import { useState } from "react"
import type React from "react"
import { FaRegComment, FaEllipsisH, FaTimes } from "react-icons/fa"
import "../../styles/NFTModal.css"
import HeartButton from "../UI/HeartButton"

interface Comment {
  user: string
  text: string
  date?: string
}

interface NFT {
  image: string
  title: string
  price: number
  likes: string
  comments: Comment[]
  user: string
}

interface NFTModalProps {
  isOpen: boolean
  onClose: () => void
  nft: NFT | null
}

const NFTModal: React.FC<NFTModalProps> = ({ isOpen, onClose, nft }) => {
  // Initialize state outside the conditional
  const [showEnlargedImage, setShowEnlargedImage] = useState(false)

  if (!isOpen || !nft) return null
  // Toggle the enlarged image view
  const toggleEnlargedImage = (e: React.MouseEvent) => {
    e.stopPropagation()
    setShowEnlargedImage(!showEnlargedImage)
  }

  return (
    <div className="nft-modal-overlay" onClick={onClose}>
      <div className="nft-modal-content" onClick={(e) => e.stopPropagation()}>
        <h2>PROFILE NFT</h2>
        <div className="nft-details">
          <img
            src={nft.image || "/placeholder.svg"}
            alt={nft.title}
            className="nft-image"
            onClick={toggleEnlargedImage}
            style={{ cursor: "pointer" }}
          />
          <div className="nft-info">
            <p className="nft-time">Any Minute Now</p>
            <p className="nft-price">Price: {nft.price} ETH</p>
            <button className="buy-now">Buy now</button>
          </div>
        </div>
        <div className="nft-actions">
          <span>
          <HeartButton /> {nft.likes}
          </span>
          <span>
            <FaRegComment /> {nft.comments.length}
          </span>
          <span className="more-icon">
            <FaEllipsisH />
          </span>
        </div>
        <div className="nft-comments">
          <p>
            <strong>{nft.user}</strong> - NFT Referer users with your referral code to earn points. Describe Refer users
            with your referral code to earn points
          </p>
          <div className="comment-section">
            <div className="comment-input-wrapper">
              <img src={nft.image} alt="avatar" className="comment-avatar" />
              <input type="text" placeholder="Add a new comment..." className="comment-input" />
            </div>
            <div className="comments-list">
              {nft.comments.map((comment, index) => (
                <div key={index} className="comment-item">
                  <img src={nft.image} alt="avatar" className="comment-avatar" />
                  <div className="comment-content">
                    <p className="comment-user">
                      <strong>{comment.user}</strong>{" "}
                      <span className="comment-date">{comment.date || "Jan 28, 2025"}</span>
                    </p>
                    <p className="comment-text">{comment.text}</p>
                  </div>
                </div>
              ))}
            </div>
          </div>
        </div>
      </div>

      {/* Enlarged Image View */}
      {showEnlargedImage && (
        <div className="enlarged-image-overlay" onClick={toggleEnlargedImage}>
          <div className="enlarged-image-container">
            <button className="close-enlarged-image" onClick={toggleEnlargedImage}>
              <FaTimes />
            </button>
            <img src={nft.image} alt={nft.title} className="enlarged-image" />
          </div>
        </div>
      )}
    </div>
  )
}

export default NFTModal

