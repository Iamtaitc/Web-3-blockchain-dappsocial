// components/NFT/UI/ListNFTModal.tsx
import React, { useState } from "react";
import { useDispatch } from "react-redux";
import { AppDispatch } from "../../../store";
import { listNFTForSale } from "../../../store/slices/nftSlice";
import { toast } from "react-hot-toast";

interface ListNFTModalProps {
  isOpen: boolean;
  onClose: () => void;
  tokenId: string;
  postId: string;
}

const ListNFTModal: React.FC<ListNFTModalProps> = ({ isOpen, onClose, tokenId, postId }) => {
  const [price, setPrice] = useState("");
  const [isLoading, setIsLoading] = useState(false);
  const dispatch = useDispatch<AppDispatch>();

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();

    if (!price || isNaN(parseFloat(price)) || parseFloat(price) <= 0) {
      toast.error("Vui lòng nhập giá hợp lệ");
      return;
    }

    setIsLoading(true);
    try {
      await dispatch(
        listNFTForSale({
          postId,
          tokenId,
          price: parseFloat(price),
        })
      ).unwrap();
      toast.success("Đăng bán NFT thành công!");
      onClose();
    } catch (error) {
      console.error("Lỗi khi đăng bán NFT:", error);
      toast.error("Có lỗi xảy ra khi đăng bán NFT");
    } finally {
      setIsLoading(false);
    }
  };

  if (!isOpen) return null;

  return (
    <div className="fixed inset-0 bg-black bg-opacity-50 flex items-center justify-center z-50">
      <div className="bg-white rounded-lg w-full max-w-md">
        <div className="bg-emerald-500 text-white rounded-t-lg p-4 flex justify-between items-center">
          <h2 className="text-lg font-semibold">Đăng bán NFT</h2>
          <button
            onClick={onClose}
            className="text-white hover:text-gray-200"
            disabled={isLoading}
          >
            <svg className="w-6 h-6" fill="none" stroke="currentColor" viewBox="0 0 24 24">
              <path
                strokeLinecap="round"
                strokeLinejoin="round"
                strokeWidth="2"
                d="M6 18L18 6M6 6l12 12"
              />
            </svg>
          </button>
        </div>

        <form onSubmit={handleSubmit} className="p-6">
          <div className="mb-4">
            <label className="block text-sm font-medium text-gray-700 mb-1">
              Giá bán (DX)
            </label>
            <input
              type="number"
              value={price}
              onChange={(e) => setPrice(e.target.value)}
              placeholder="Nhập giá bán (DX)"
              className="w-full p-3 border border-gray-300 rounded-md focus:outline-none focus:ring-2 focus:ring-emerald-500 text-gray-700 placeholder-gray-400"
              min="0"
              step="0.01"
              required
            />
          </div>

          <div className="flex justify-end gap-3">
            <button
              type="button"
              onClick={onClose}
              className="px-4 py-2 bg-white border border-gray-300 text-gray-700 rounded-md hover:bg-gray-100 disabled:opacity-50"
              disabled={isLoading}
            >
              Hủy
            </button>
            <button
              type="submit"
              className="px-4 py-2 bg-emerald-500 text-white rounded-md hover:bg-emerald-600 disabled:opacity-50"
              disabled={isLoading}
            >
              {isLoading ? "Đang xử lý..." : "Đăng bán"}
            </button>
          </div>
        </form>
      </div>
    </div>
  );
};

export default ListNFTModal;