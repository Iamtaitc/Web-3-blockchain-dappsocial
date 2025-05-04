// components/NFT/UI/CreateNFTModal.tsx
import { useState } from "react";
import postApi from "../../services/post.api";
import { toast } from "react-hot-toast";

interface CreateNFTModalProps {
  isOpen: boolean;
  onClose: () => void;
  postId: string;
  mediaIndex: number;
  onNFTCreated?: () => void;
}

const CreateNFTModal = ({ isOpen, onClose, postId, mediaIndex, onNFTCreated }: CreateNFTModalProps) => {
  const [step, setStep] = useState<"create" | "list">("create");
  const [tokenId, setTokenId] = useState<string | null>(null);
  const [name, setName] = useState("");
  const [description, setDescription] = useState("");
  const [royaltyPercent, setRoyaltyPercent] = useState<number>(0);
  const [price, setPrice] = useState("");
  const [isLoading, setIsLoading] = useState(false);

  const handleCreateNFT = async () => {
    if (!name || !description) {
      toast.error("Vui lòng điền đầy đủ thông tin");
      return;
    }

    setIsLoading(true);
    try {
      const response = await postApi.createNFTFromPostMedia(postId, mediaIndex, { name, description, royaltyPercent });
      console.log("createNFTFromPostMedia response:", response);
      if (response.success && response.data?.tokenId) {
        setTokenId(response.data.tokenId);
        setStep("list");
        toast.success("NFT đã được tạo thành công!");
      } else {
        toast.error(response.message || "Không thể tạo NFT");
      }
    } catch (error) {
      console.error("Lỗi khi tạo NFT:", error);
      toast.error("Có lỗi xảy ra. Vui lòng thử lại.");
    } finally {
      setIsLoading(false);
    }
  };

  const handleListNFT = async () => {
    if (!price || isNaN(parseFloat(price)) || parseFloat(price) <= 0) {
      toast.error("Vui lòng nhập giá hợp lệ");
      return;
    }

    if (!tokenId) {
      toast.error("Không tìm thấy tokenId. Vui lòng thử lại.");
      return;
    }

    console.log("listNFTFromPost params:", { tokenId, price, postId });
    setIsLoading(true);
    try {
      const response = await postApi.listNFTFromPost(postId, tokenId, price );
      if (response.success) {
        toast.success("NFT đã được đăng bán thành công!");
        onNFTCreated?.();
        onClose();
      } else {
        toast.error(response.message || "Không thể đăng bán NFT");
      }
    } catch (error) {
      console.error("Lỗi khi đăng bán NFT:", error);
      toast.error("Có lỗi xảy ra. Vui lòng thử lại.");
    } finally {
      setIsLoading(false);
    }
  };

  const handleClose = () => {
    setStep("create");
    setTokenId(null);
    setName("");
    setDescription("");
    setRoyaltyPercent(0);
    setPrice("");
    onClose();
  };

  if (!isOpen) return null;

  return (
    <div className="fixed inset-0 bg-black bg-opacity-50 flex items-center justify-center z-50">
      <div className="bg-white rounded-lg w-full max-w-md max-h-[80vh] overflow-y-auto">
        {/* Header với nền xanh ngọc và chữ trắng */}
        <div className="bg-emerald-500 text-white rounded-t-lg p-4 flex justify-between items-center">
          <h2 className="text-lg font-semibold">
            {step === "create" ? "Tạo NFT từ bài đăng" : "Đăng bán NFT"}
          </h2>
          <button onClick={handleClose} className="text-white hover:text-gray-200">
            <svg className="w-6 h-6" fill="none" stroke="currentColor" viewBox="0 0 24 24">
              <path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M6 18L18 6M6 6l12 12" />
            </svg>
          </button>
        </div>

        {/* Nội dung modal */}
        <div className="p-6">
          {step === "create" ? (
            <>
              <div className="mb-4">
                <label className="block text-sm font-medium text-gray-700 mb-1">Tên NFT</label>
                <input
                  type="text"
                  value={name}
                  onChange={(e) => setName(e.target.value)}
                  placeholder="Nhập tên NFT"
                  className="w-full p-3 border bg-white border-gray-300 rounded-md focus:outline-none focus:ring-2 focus:ring-emerald-500 text-gray-700 placeholder-gray-400"
                />
              </div>
              <div className="mb-4">
                <label className="block text-sm font-medium text-gray-700 mb-1">Mô tả</label>
                <textarea
                  value={description}
                  onChange={(e) => setDescription(e.target.value)}
                  placeholder="Nhập mô tả cho NFT"
                  className="w-full p-3 border border-gray-300  bg-white rounded-md focus:outline-none focus:ring-2 focus:ring-emerald-500 text-gray-700 placeholder-gray-400"
                  rows={3}
                />
              </div>
              <div className="mb-4">
                <label className="block text-sm  font-medium text-gray-700 mb-1">Phần trăm tiền bản quyền (%)</label>
                <input
                  type="number"
                  value={royaltyPercent}
                  onChange={(e) => setRoyaltyPercent(Number(e.target.value))}
                  placeholder="Nhập phần trăm tiền bản quyền"
                  min="0"
                  max="100"
                  className="w-full p-3 border border-gray-300 bg-white rounded-md focus:outline-none focus:ring-2 focus:ring-emerald-500 text-gray-700 placeholder-gray-400"
                  style={{ caretColor: "#10b981" }}
               />
              </div>
              <div className="flex justify-end gap-3">
                <button
                  onClick={handleClose}
                  disabled={isLoading}
                  className="px-4 py-2 bg-white border border-gray-300 text-gray-700 rounded-md hover:bg-gray-100 disabled:opacity-50"
                >
                  Hủy
                </button>
                <button
                  onClick={handleCreateNFT}
                  disabled={isLoading}
                  className="px-4 py-2 bg-emerald-500 text-white rounded-md hover:bg-emerald-600 disabled:opacity-50"
                >
                  {isLoading ? "Đang tạo..." : "Tạo NFT"}
                </button>
              </div>
            </>
          ) : (
            <>
              <div className="mb-4">
                <label className="block text-sm font-medium text-gray-700 mb-1">Giá bán (DX)</label>
                <input
                  type="text"
                  value={price}
                  onChange={(e) => setPrice(e.target.value)}
                  placeholder="Nhập giá bán (DX)"
                  className="w-full bg-white p-3 border border-gray-300 rounded-md focus:outline-none focus:ring-2 focus:ring-emerald-500 text-gray-700 placeholder-gray-400"
                />
              </div>
              <div className="flex justify-end gap-3">
                <button
                  onClick={handleClose}
                  disabled={isLoading}
                  className="px-4 py-2 bg-white border border-gray-300 text-gray-700 rounded-md hover:bg-gray-100 disabled:opacity-50"
                >
                  Hủy
                </button>
                <button
                  onClick={handleListNFT}
                  disabled={isLoading}
                  className="px-4 py-2 bg-emerald-500 text-white rounded-md hover:bg-emerald-600 disabled:opacity-50"
                >
                  {isLoading ? "Đang đăng bán..." : "Đăng bán"}
                </button>
              </div>
            </>
          )}
        </div>
      </div>
    </div>
  );
};

export default CreateNFTModal;