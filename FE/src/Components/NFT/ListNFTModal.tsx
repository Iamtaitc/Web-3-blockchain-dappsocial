import React, { useState } from "react";
import { toast } from "react-hot-toast";
import { X, Info } from "lucide-react";
import IPFSImage from "../UI/IPFSImage";
import nftApi from "../../services/nft.api";

interface ListNFTModalProps {
  isOpen: boolean;
  onClose: () => void;
  postId: string;
  tokenId: string;
  nftName: string;
  imageUri: string;
  onNFTListed?: () => void;
}

const ListNFTModal: React.FC<ListNFTModalProps> = ({
  isOpen,
  onClose,
  postId,
  tokenId,
  nftName,
  imageUri,
  onNFTListed,
}) => {
  const [price, setPrice] = useState("");
  const [isLoading, setIsLoading] = useState(false);

  if (!isOpen) return null;

  const handleListNFT = async (e: React.FormEvent) => {
    e.preventDefault();
    
    const priceValue = parseFloat(price);
    
    if (isNaN(priceValue) || priceValue <= 0) {
      toast.error("Vui lòng nhập giá hợp lệ");
      return;
    }

    try {
      setIsLoading(true);
      
      const result = await nftApi.listNFTForSale(postId, tokenId, priceValue);

      if (result.success) {
        toast.success("Đăng bán NFT thành công!");
        if (onNFTListed) {
          onNFTListed();
        }
        onClose();
      } else {
        toast.error(result.message || "Đăng bán NFT thất bại");
      }
    } catch (error: any) {
      toast.error(error.message || "Có lỗi xảy ra khi đăng bán NFT");
    } finally {
      setIsLoading(false);
    }
  };

  return (
    <div className="fixed inset-0 bg-black bg-opacity-50 flex items-center justify-center p-4 z-50">
      <div className="bg-white rounded-xl max-w-lg w-full max-h-[90vh] overflow-hidden">
        <div className="flex items-center justify-between p-4 border-b">
          <h2 className="text-xl font-semibold text-gray-900">Đăng bán NFT</h2>
          <button
            onClick={onClose}
            className="p-2 hover:bg-gray-100 rounded-full transition-colors"
          >
            <X size={20} className="text-gray-500" />
          </button>
        </div>
        
        <div className="p-6">
          <div className="mb-6">
            <IPFSImage 
              hash={imageUri} 
              alt="NFT Preview" 
              className="w-full h-64 object-contain rounded-lg bg-gray-50"
            />
            <div className="mt-4 text-center">
              <h3 className="text-lg font-semibold text-gray-900">{nftName}</h3>
              <p className="text-sm text-gray-500">Token ID: {tokenId}</p>
            </div>
          </div>
          
          <form onSubmit={handleListNFT} className="space-y-6">
            <div>
              <label htmlFor="nft-price" className="block text-sm font-medium text-gray-700 mb-1">
                Giá NFT (DX) <span className="text-red-500">*</span>
              </label>
              <input
                id="nft-price"
                type="number"
                value={price}
                onChange={(e) => setPrice(e.target.value)}
                placeholder="Nhập giá cho NFT của bạn"
                min="0.000001"
                step="0.000001"
                required
                className="w-full px-4 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-indigo-500 focus:border-indigo-500"
              />
            </div>
            
            <div className="flex items-start gap-3 p-4 bg-blue-50 rounded-lg">
              <Info size={16} className="text-blue-600 mt-1 flex-shrink-0" />
              <p className="text-sm text-blue-900">
                Khi đăng bán NFT, nó sẽ được niêm yết trên marketplace và có thể được mua bởi bất kỳ ai.
                Bạn sẽ nhận được số DX tương ứng với giá bán sau khi trừ phí giao dịch.
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
                {isLoading ? "Đang đăng bán..." : "Đăng bán"}
              </button>
            </div>
          </form>
        </div>
      </div>
    </div>
  );
};

export default ListNFTModal;