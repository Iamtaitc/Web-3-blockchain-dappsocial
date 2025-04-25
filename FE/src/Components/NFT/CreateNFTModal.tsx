import React, { useState } from "react";
import { toast } from "react-hot-toast";
import { X } from "lucide-react";
import IPFSImage from "../UI/IPFSImage";
import nftApi from "../../services/nft.api";

interface CreateNFTModalProps {
  isOpen: boolean;
  onClose: () => void;
  postId: string;
  mediaIndex: number;
  mediaUri: string;
  onNFTCreated?: (tokenId: string) => void;
}

const CreateNFTModal: React.FC<CreateNFTModalProps> = ({
  isOpen,
  onClose,
  postId,
  mediaIndex,
  mediaUri,
  onNFTCreated,
}) => {
  const [name, setName] = useState("");
  const [description, setDescription] = useState("");
  const [royaltyPercent, setRoyaltyPercent] = useState(10);
  const [isLoading, setIsLoading] = useState(false);

  if (!isOpen) return null;

  const handleCreateNFT = async (e: React.FormEvent) => {
    e.preventDefault();
    
    if (!name.trim()) {
      toast.error("Vui lòng nhập tên cho NFT");
      return;
    }

    if (royaltyPercent < 0 || royaltyPercent > 15) {
      toast.error("Phần trăm hoa hồng phải từ 0% đến 15%");
      return;
    }

    try {
      setIsLoading(true);
      
      const result = await nftApi.createNFTFromPostMedia(postId, mediaIndex, {
        name,
        description,
        royaltyPercent,
      });

      if (result.success) {
        toast.success("Tạo NFT thành công!");
        if (onNFTCreated && result.data && result.data.tokenId) {
          onNFTCreated(result.data.tokenId);
        }
        onClose();
      } else {
        toast.error(result.message || "Tạo NFT thất bại");
      }
    } catch (error: any) {
      toast.error(error.message || "Có lỗi xảy ra khi tạo NFT");
    } finally {
      setIsLoading(false);
    }
  };

  return (
    <div className="fixed inset-0 bg-black bg-opacity-50 flex items-center justify-center p-4 z-50">
      <div className="bg-white rounded-xl max-w-lg w-full max-h-[90vh] overflow-hidden">
        <div className="flex items-center justify-between p-4 border-b">
          <h2 className="text-xl font-semibold text-gray-900">Tạo NFT từ media</h2>
          <button
            onClick={onClose}
            className="p-2 hover:bg-gray-100 rounded-full transition-colors"
          >
            <X size={20} className="text-gray-500" />
          </button>
        </div>
        
        <div className="p-6 overflow-y-auto">
          <div className="mb-6">
            <IPFSImage 
              hash={mediaUri} 
              alt="Media Preview" 
              className="w-full h-64 object-contain rounded-lg bg-gray-50"
            />
          </div>
          
          <form onSubmit={handleCreateNFT} className="space-y-6">
            <div>
              <label htmlFor="nft-name" className="block text-sm font-medium text-gray-700 mb-1">
                Tên NFT <span className="text-red-500">*</span>
              </label>
              <input
                id="nft-name"
                type="text"
                value={name}
                onChange={(e) => setName(e.target.value)}
                placeholder="Nhập tên cho NFT của bạn"
                required
                className="w-full px-4 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-indigo-500 focus:border-indigo-500"
              />
            </div>
            
            <div>
              <label htmlFor="nft-description" className="block text-sm font-medium text-gray-700 mb-1">
                Mô tả
              </label>
              <textarea
                id="nft-description"
                value={description}
                onChange={(e) => setDescription(e.target.value)}
                placeholder="Mô tả về NFT của bạn"
                rows={4}
                className="w-full px-4 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-indigo-500 focus:border-indigo-500"
              />
            </div>
            
            <div>
              <label htmlFor="nft-royalty" className="block text-sm font-medium text-gray-700 mb-1">
                Phần trăm hoa hồng ({royaltyPercent}%)
              </label>
              <input
                id="nft-royalty"
                type="range"
                min="0"
                max="15"
                step="0.1"
                value={royaltyPercent}
                onChange={(e) => setRoyaltyPercent(parseFloat(e.target.value))}
                className="w-full h-2 bg-gray-200 rounded-lg appearance-none cursor-pointer"
              />
              <p className="mt-1 text-sm text-gray-500">
                Bạn sẽ nhận được {royaltyPercent}% giá trị mỗi khi NFT này được bán lại
              </p>
            </div>
            
            <div className="flex justify-end gap-3 pt-4">
              <button
                type="button"
                onClick={onClose}
                className="px-4 py-2 border border-gray-300 rounded-lg text-gray-700 hover:bg-gray-50 transition-colors"
                disabled={isLoading}
              >
                Hủy
              </button>
              <button
                type="submit"
                className="px-4 py-2 bg-indigo-600 text-white rounded-lg hover:bg-indigo-700 transition-colors disabled:opacity-50"
                disabled={isLoading}
              >
                {isLoading ? "Đang tạo..." : "Tạo NFT"}
              </button>
            </div>
          </form>
        </div>
      </div>
    </div>
  );
};

export default CreateNFTModal;