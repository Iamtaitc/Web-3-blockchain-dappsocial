import React from "react";
import { Sparkles } from "lucide-react";
import { useNavigate } from "react-router-dom";
import { useSelector } from "react-redux";
import { toast } from "react-hot-toast";
import type { RootState } from "../../../store";
import { WalletLoginModal } from "../../Login/wallet-login-modal";

interface NFTButtonProps {
  postId: string;
  hasMedia: boolean;
}

const NFTButton: React.FC<NFTButtonProps> = ({ postId, hasMedia }) => {
  const navigate = useNavigate();
  const [showLoginModal, setShowLoginModal] = React.useState(false);
  const isAuthenticated = useSelector((state: RootState) => !!state.auth.token);

  const handleNFTClick = () => {
    if (!isAuthenticated) {
      toast.error("Vui lòng đăng nhập để tạo NFT");
      setShowLoginModal(true);
      return;
    }

    if (!hasMedia) {
      toast.error("Bài viết này không có media để tạo NFT");
      return;
    }

    navigate(`/post/${postId}/create-nft`);
  };

  return (
    <>
      <button 
        onClick={handleNFTClick}
        disabled={!hasMedia}
        className={`
          flex items-center gap-2 px-4 py-2 rounded-lg font-medium text-sm
          transition-colors duration-200
          ${hasMedia 
            ? 'bg-indigo-600 text-white hover:bg-indigo-700' 
            : 'bg-gray-100 text-gray-400 cursor-not-allowed'
          }
        `}
        title={hasMedia ? "Tạo NFT từ media" : "Bài viết không có media để tạo NFT"}
      >
        <Sparkles size={16} className="animate-pulse" />
        <span>Tạo NFT</span>
      </button>

      {showLoginModal && (
        <WalletLoginModal 
          isOpen={showLoginModal} 
          onClose={() => setShowLoginModal(false)} 
        />
      )}
    </>
  );
};

export default NFTButton;