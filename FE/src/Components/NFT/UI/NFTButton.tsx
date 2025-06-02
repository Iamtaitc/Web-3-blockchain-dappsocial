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
  nfts?: any[] // Mảng NFT của bài viết
  authorId?: string // ID của người tạo bài đăng (địa chỉ ví)
}

const NFTButton = ({ postId, hasMedia, onNFTCreated, nfts = [], authorId }: NFTButtonProps) => {
  const [isModalOpen, setIsModalOpen] = useState(false)
  const [isLoading, setIsLoading] = useState(false)
  const [nftStatus, setNftStatus] = useState<"none" | "created" | "forSale" | "ownedByUser" | "otherUser" | "noButton">("none")

  const isAuthenticated = useSelector((state: RootState) => !!state.auth.token)
  const currentUser = useSelector((state: RootState) => state.auth.user)
  const navigate = useNavigate()

  // Kiểm tra trạng thái NFT khi component mount hoặc khi nfts, currentUser thay đổi
  useEffect(() => {
    // Kiểm tra xem người dùng hiện tại có phải là tác giả của bài viết không
    const isAuthor = currentUser?.walletAddress === authorId
    
    // Nếu không có NFT nào
    if (!nfts || nfts.length === 0) {
      // Nếu là tác giả của bài viết, hiển thị nút "TẠO NFT"
      if (isAuthor) {
        setNftStatus("none")
      } else {
        // Nếu không phải tác giả và chưa có NFT, không hiển thị nút
        setNftStatus("noButton")
      }
      return
    }

    // Kiểm tra xem có NFT nào đang được bán không
    const forSaleNft = nfts.find((nft) => nft.forSale)
    
    // Kiểm tra xem người dùng hiện tại có phải là chủ sở hữu của NFT không
    const isOwner = currentUser && nfts.some((nft) => nft.owner === currentUser.walletAddress)

    if (isOwner) {
      // Nếu người dùng hiện tại là chủ sở hữu của NFT
      setNftStatus("ownedByUser")
    } else if (forSaleNft) {
      // Nếu có NFT đang được bán và người dùng không phải là chủ sở hữu
      setNftStatus("forSale")
    } else if (isAuthor) {
      // Nếu người dùng là tác giả nhưng NFT chưa đăng bán
      setNftStatus("created")
    } else {
      // Trường hợp khác (NFT thuộc về người khác, không bán)
      setNftStatus("otherUser")
    }
  }, [nfts, currentUser?.walletAddress, authorId]) // Chỉ theo dõi các giá trị cần thiết

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
    // Đặt lại trạng thái loading
    setIsLoading(false)
    
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

    // Đặt trạng thái loading và chuyển hướng đến trang chi tiết NFT để mua
    setIsLoading(true)
    navigate(`/nft-detail/${postId}`)
  }

  // Render button dựa trên trạng thái NFT
  const renderButton = () => {
    switch (nftStatus) {
      case "none":
        // Chưa có NFT nào được tạo và người dùng là tác giả
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
        // NFT đang được đăng bán và người dùng không phải chủ sở hữu
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
      
      case "noButton":
        // Không hiển thị nút gì cả khi không phải tác giả và chưa có NFT
        return null

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