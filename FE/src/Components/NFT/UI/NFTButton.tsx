"use client"

import { useState, useEffect } from "react"
import CreateNFTModal from "../CreateNFTModal"
import { toast } from "react-hot-toast"
import { useSelector } from "react-redux"
import type { RootState } from "../../../store"
import { useNavigate } from "react-router-dom"

interface NFTButtonProps {
  postId: string
  hasMedia: boolean
  onNFTCreated?: () => void
  nfts?: any[] // Thêm prop nfts để kiểm tra trạng thái NFT
  authorId?: string // ID của người tạo bài đăng
}

const NFTButton = ({ postId, hasMedia, onNFTCreated, nfts = [], authorId }: NFTButtonProps) => {
  const [isModalOpen, setIsModalOpen] = useState(false)
  const [isLoading, setIsLoading] = useState(false)
  const [nftStatus, setNftStatus] = useState<"none" | "created" | "forSale" | "ownedByUser" | "otherUser">("none")

  const isAuthenticated = useSelector((state: RootState) => !!state.auth.token)
  const currentUser = useSelector((state: RootState) => state.auth.user)
  const navigate = useNavigate()

  // Kiểm tra trạng thái NFT khi component mount hoặc khi nfts thay đổi
  useEffect(() => {
    checkNftStatus()
  }, [nfts, currentUser])

  // Hàm kiểm tra trạng thái NFT
  const checkNftStatus = () => {
    if (!nfts || nfts.length === 0) {
      setNftStatus("none")
      return
    }

    // Kiểm tra xem có NFT nào đang được bán không
    const forSaleNft = nfts.find((nft) => nft.forSale)

    // Kiểm tra xem người dùng hiện tại có phải là chủ sở hữu của NFT không
    const isOwner = currentUser && nfts.some((nft) => nft.owner === currentUser.walletAddress)

    // Kiểm tra xem người dùng hiện tại có phải là người tạo bài đăng không
    const isAuthor = currentUser && authorId === currentUser.walletAddress

    if (isOwner) {
      setNftStatus("ownedByUser")
    } else if (forSaleNft) {
      setNftStatus("forSale")
    } else if (isAuthor) {
      setNftStatus("created")
    } else {
      setNftStatus("otherUser")
    }
  }

  const handleOpenModal = () => {
    if (!isAuthenticated) {
      toast.error("Vui lòng đăng nhập để tạo NFT")
      return
    }

    if (!hasMedia) {
      toast.error("Bài đăng cần có media để tạo NFT")
      return
    }

    setIsModalOpen(true)
  }

  const handleNFTCreated = () => {
    // Gọi callback từ props nếu có
    if (onNFTCreated) {
      onNFTCreated()
    }

    // Chuyển hướng đến trang marketplace khi đăng bán thành công
    navigate(`/marketplace?postId=${postId}`)
  }

  const handleBuyNFT = () => {
    if (!isAuthenticated) {
      toast.error("Vui lòng đăng nhập để mua NFT")
      return
    }

    // Chuyển hướng đến trang chi tiết NFT để mua
    navigate(`/nft-detail/${postId}`)
  }

  // Render button dựa trên trạng thái NFT
  const renderButton = () => {
    switch (nftStatus) {
      case "none":
        // Chưa có NFT nào được tạo
        return (
          <button
            onClick={handleOpenModal}
            className="px-3 py-1 bg-green-500 text-white rounded-md hover:bg-green-600 transition-colors"
            disabled={isLoading}
          >
            {isLoading ? "ĐANG XỬ LÝ..." : "TẠO NFT"}
          </button>
        )

      case "created":
        // NFT đã được tạo nhưng chưa đăng bán
        return (
          <button
            onClick={handleOpenModal}
            className="px-3 py-1 bg-amber-500 text-white rounded-md hover:bg-amber-600 transition-colors"
            disabled={isLoading}
          >
            {isLoading ? "ĐANG XỬ LÝ..." : "ĐĂNG BÁN NFT"}
          </button>
        )

      case "forSale":
        // NFT đang được đăng bán
        return (
          <button
            onClick={handleBuyNFT}
            className="px-3 py-1 bg-blue-500 text-white rounded-md hover:bg-blue-600 transition-colors"
            disabled={isLoading}
          >
            {isLoading ? "ĐANG XỬ LÝ..." : "MUA NFT"}
          </button>
        )

      case "ownedByUser":
        // NFT thuộc sở hữu của người dùng hiện tại
        return (
          <button className="px-3 py-1 bg-gray-500 text-white rounded-md cursor-not-allowed" disabled={true}>
            NFT CỦA BẠN
          </button>
        )

      case "otherUser":
        // NFT thuộc sở hữu của người khác và không được đăng bán
        return (
          <button className="px-3 py-1 bg-gray-500 text-white rounded-md cursor-not-allowed" disabled={true}>
            KHÔNG CÓ NFT BÁN
          </button>
        )

      default:
        return null
    }
  }

  return (
    <>
      {renderButton()}

      <CreateNFTModal
        isOpen={isModalOpen}
        onClose={() => setIsModalOpen(false)}
        postId={postId}
        mediaIndex={0}
        onNFTCreated={handleNFTCreated}
      />
    </>
  )
}

export default NFTButton
