import { useState } from "react";
import CreateNFTModal from "../CreateNFTModal";
import { toast } from "react-hot-toast";
import { useSelector } from "react-redux";
import type { RootState } from "../../../store";
import { useNavigate } from "react-router-dom";

interface NFTButtonProps {
  postId: string;
  hasMedia: boolean;
  onNFTCreated?: () => void; // Thêm prop để làm mới bài viết
}

const NFTButton = ({ postId, hasMedia, onNFTCreated }: NFTButtonProps) => {
  const [isModalOpen, setIsModalOpen] = useState(false);
  const isAuthenticated = useSelector((state: RootState) => !!state.auth.token);
  const navigate = useNavigate();

  const handleOpenModal = () => {
    if (!isAuthenticated) {
      toast.error("Vui lòng đăng nhập để tạo NFT");
      return;
    }

    if (!hasMedia) {
      toast.error("Bài đăng cần có media để tạo NFT");
      return;
    }

    setIsModalOpen(true);
  };
  const handleNFTCreated = () => {
    // Gọi callback từ props nếu có
    if (onNFTCreated) {
      onNFTCreated();
    }
    
    // Chuyển hướng đến trang marketplace khi đăng bán thành công
    navigate(`/marketplace?postId=${postId}`);
  };
  return (
    <>
      <button
        onClick={handleOpenModal}
        className="px-3 py-1 bg-green-500 text-white rounded-md hover:bg-green-600 transition-colors"
      >
        TẠO NFT
      </button>
      <CreateNFTModal
        isOpen={isModalOpen}
        onClose={() => setIsModalOpen(false)}
        postId={postId}
        mediaIndex={0}
        onNFTCreated={onNFTCreated}
      />
    </>
  );
};

export default NFTButton;