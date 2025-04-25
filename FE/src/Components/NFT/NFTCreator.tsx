import React, { useState, useEffect } from "react";
import { toast } from "react-hot-toast";
import { useParams, useNavigate } from "react-router-dom";
import { ArrowLeft, Loader2 } from "lucide-react";
import postApi from "../../services/post.api";
import MediaSelector from "./MediaSelector";
import ListNFTModal from "./ListNFTModal";

interface NFTCreatorProps {
  onBack?: () => void;
}

const NFTCreator: React.FC<NFTCreatorProps> = ({ onBack }) => {
  const { postId } = useParams<{ postId: string }>();
  const navigate = useNavigate();
  
  const [isLoading, setIsLoading] = useState(true);
  const [post, setPost] = useState<any>(null);
  const [error, setError] = useState<string | null>(null);
  const [createdNFT, setCreatedNFT] = useState<any>(null);
  const [showListNFTModal, setShowListNFTModal] = useState(false);

  useEffect(() => {
    const fetchPostDetails = async () => {
      try {
        setIsLoading(true);
        
        if (!postId) {
          setError("Không tìm thấy ID bài viết");
          setIsLoading(false);
          return;
        }

        const response = await postApi.getPostById(postId);
        
        if (response.success && response.data) {
          // Đảm bảo media được định dạng đúng
          const formattedPost = {
            ...response.data,
            media: response.data.media || []
          };
          setPost(formattedPost);
        } else {
          setError("Không thể tải thông tin bài viết");
        }
      } catch (error) {
        console.error("Lỗi khi tải thông tin bài viết:", error);
        setError("Đã xảy ra lỗi khi tải thông tin bài viết");
      } finally {
        setIsLoading(false);
      }
    };

    fetchPostDetails();
  }, [postId]);

  const handleNFTCreated = (tokenId: string) => {
    toast.success(`Đã tạo NFT với Token ID: ${tokenId}`);
    
    setCreatedNFT({
      tokenId,
      nftName: post?.content?.substring(0, 30) || "NFT từ bài viết",
      imageUri: post?.media?.[0]?.uri || post?.contentURI
    });
    
    setShowListNFTModal(true);
  };

  const handleNFTListed = () => {
    toast.success("NFT đã được đăng bán thành công!");
    navigate("/marketplace");
  };

  const handleBack = () => {
    if (onBack) {
      onBack();
    } else {
      navigate(-1);
    }
  };

  if (isLoading) {
    return (
      <div className="flex flex-col items-center justify-center min-h-[50vh] p-8">
        <Loader2 className="w-8 h-8 animate-spin text-gray-600" />
        <p className="mt-4 text-gray-600">Đang tải thông tin bài viết...</p>
      </div>
    );
  }

  if (error || !post) {
    return (
      <div className="flex flex-col items-center justify-center min-h-[50vh] p-8">
        <h2 className="text-xl font-semibold text-red-600 mb-2">Đã xảy ra lỗi</h2>
        <p className="text-gray-600 mb-6">{error || "Không thể tải thông tin bài viết"}</p>
        <button 
          onClick={handleBack}
          className="flex items-center gap-2 px-4 py-2 bg-gray-100 rounded-lg hover:bg-gray-200 transition-colors"
        >
          <ArrowLeft className="w-4 h-4" />
          Quay lại
        </button>
      </div>
    );
  }

  return (
    <div className="max-w-4xl mx-auto px-4 py-6">
      <div className="flex items-center mb-8">
        <button 
          onClick={handleBack}
          className="p-2 hover:bg-gray-100 rounded-full transition-colors"
        >
          <ArrowLeft className="w-5 h-5 text-gray-600" />
        </button>
        <h1 className="text-2xl font-bold text-gray-900 ml-4">Tạo NFT từ bài viết</h1>
      </div>

      <div className="space-y-8">
        <div className="bg-white rounded-xl shadow-sm p-6">
          <h2 className="text-lg font-semibold text-gray-900 mb-4">Nội dung bài viết</h2>
          <div className="space-y-4">
            <p className="text-gray-700">{post.content}</p>
            {post.tags && post.tags.length > 0 && (
              <div className="flex flex-wrap gap-2">
                {post.tags.map((tag: string, index: number) => (
                  <span 
                    key={index}
                    className="px-3 py-1 bg-gray-100 text-gray-700 rounded-full text-sm"
                  >
                    #{tag}
                  </span>
                ))}
              </div>
            )}
          </div>
        </div>

        <MediaSelector 
          postId={postId || ""} 
          media={post.media || []} 
          onNFTCreated={handleNFTCreated}
        />
      </div>

      {createdNFT && showListNFTModal && (
        <ListNFTModal
          isOpen={showListNFTModal}
          onClose={() => setShowListNFTModal(false)}
          postId={postId || ""}
          tokenId={createdNFT.tokenId}
          nftName={createdNFT.nftName}
          imageUri={createdNFT.imageUri}
          onNFTListed={handleNFTListed}
        />
      )}
    </div>
  );
};

export default NFTCreator;