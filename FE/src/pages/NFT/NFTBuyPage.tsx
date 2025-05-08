"use client";

import type React from "react";
import { useEffect, useState } from "react";
import { useParams, useNavigate } from "react-router-dom";
import { useDispatch, useSelector } from "react-redux";
import type { AppDispatch, RootState } from "../../store";
import { fetchNFTById } from "../../store/slices/nftSlice";
import { toast } from "react-hot-toast";
import {
  ArrowLeft,
  Tag,
  Wallet,
  Award,
  Clock,
  User,
  Shield,
  AlertTriangle,
  CheckCircle,
  Loader2,
} from "lucide-react";
import IPFSImage from "../../components/UI/IPFSImage";
import useWalletTransaction from "../../services/useWalletTransaction"; // Import hook xử lý giao dịch

const NFTBuyPage: React.FC = () => {
  const { tokenId } = useParams<{ tokenId: string }>();
  const navigate = useNavigate();
  const dispatch = useDispatch<AppDispatch>();

  const { selectedNFT, loading } = useSelector((state: RootState) => state.nft);
  const { walletAddress } = useSelector((state: RootState) => state.auth);

  const [transactionStatus, setTransactionStatus] = useState<
    "idle" | "preparing" | "confirming" | "processing" | "success" | "error"
  >("idle");
  const [errorMessage, setErrorMessage] = useState<string>("");
  const [txHash, setTxHash] = useState<string>("");

  const { executePurchase } = useWalletTransaction();

  useEffect(() => {
    if (tokenId) {
      dispatch(fetchNFTById(tokenId));
    }
  }, [dispatch, tokenId]);

  const handleBuyNFT = async () => {
    if (!tokenId || !walletAddress || !selectedNFT || !selectedNFT.forSale) {
      toast.error(
        !selectedNFT?.forSale ? "NFT không được đăng bán" : "Thiếu thông tin cần thiết để mua NFT"
      );
      return;
    }

    setTransactionStatus("confirming");

    const token = localStorage.getItem('token') || '';
    const result = await executePurchase(tokenId, walletAddress, token);

    if (result.success) {
      setTxHash(result.txHash!);
      setTransactionStatus("success");
      toast.success("Mua NFT thành công!");
      navigate(`/nft/${tokenId}/complete?txHash=${result.txHash}`);
    } else {
      setTransactionStatus("error");
      setErrorMessage(result.error || "Đã xảy ra lỗi khi thực hiện giao dịch");
    }
  };

  const formatPrice = (price: string | number | undefined) => {
    if (!price) return "0";
    const numericPrice = typeof price === "string" ? Number.parseFloat(price) : price;
    return new Intl.NumberFormat("vi-VN").format(numericPrice);
  };

  if (loading || !selectedNFT) {
    return (
      <div className="max-w-4xl mx-auto px-4 py-12 flex flex-col items-center justify-center min-h-[60vh]">
        <Loader2 size={48} className="text-emerald-500 animate-spin mb-4" />
        <h2 className="text-xl font-semibold text-gray-700">Đang tải thông tin NFT...</h2>
      </div>
    );
  }

  if (transactionStatus === "error") {
    return (
      <div className="max-w-4xl mx-auto px-4 py-12">
        <div className="bg-rose-50 border border-rose-200 rounded-xl p-8 text-center">
          <AlertTriangle size={48} className="text-rose-500 mx-auto mb-4" />
          <h2 className="text-2xl font-bold text-gray-800 mb-2">Đã xảy ra lỗi</h2>
          <p className="text-gray-600 mb-6">{errorMessage || "Không thể hoàn tất giao dịch mua NFT"}</p>
          <div className="flex justify-center gap-4">
            <button
              onClick={() => navigate(-1)}
              className="px-6 py-2 bg-gray-200 text-gray-800 rounded-lg hover:bg-gray-300 transition-colors"
            >
              Quay lại
            </button>
            <button
              onClick={() => window.location.reload()}
              className="px-6 py-2 bg-emerald-600 text-white rounded-lg hover:bg-emerald-700 transition-colors"
            >
              Thử lại
            </button>
          </div>
        </div>
      </div>
    );
  }

  return (
    <div className="max-w-6xl mx-auto px-4 py-12">
      {/* Header */}
      <div className="mb-8">
        <button
          onClick={() => navigate(-1)}
          className="flex items-center text-gray-600 hover:text-emerald-600 transition-colors mb-4"
        >
          <ArrowLeft size={20} className="mr-2" />
          Quay lại
        </button>
        <h1 className="text-3xl font-bold text-gray-800">Mua NFT</h1>
      </div>

      <div className="grid grid-cols-1 lg:grid-cols-2 gap-8">
        {/* NFT Preview */}
        <div className="bg-white rounded-xl shadow-sm overflow-hidden border border-gray-100">
          <div className="relative aspect-square overflow-hidden">
            <IPFSImage
              hash={selectedNFT.metadata?.image || selectedNFT.imageUrl || ""}
              alt={selectedNFT.name}
              className="w-full h-full object-cover"
            />
          </div>
          <div className="p-6">
            <div className="flex items-start justify-between mb-2">
              <h2 className="text-2xl font-bold text-gray-800">{selectedNFT.name}</h2>
              {selectedNFT.metadata?.rare && <Award size={24} className="text-amber-500" title="Rare NFT" />}
            </div>
            <p className="text-gray-600 mb-6">{selectedNFT.description}</p>

            <div className="grid grid-cols-2 gap-4 mb-6">
              <div className="bg-gray-50 p-3 rounded-lg">
                <p className="text-xs text-gray-500 mb-1">Người tạo</p>
                <div className="flex items-center">
                  <User size={16} className="text-gray-400 mr-2" />
                  <p className="text-sm font-medium text-gray-700">
                    {selectedNFT.creator
                      ? `${selectedNFT.creator.slice(0, 6)}...${selectedNFT.creator.slice(-4)}`
                      : "Unknown"}
                  </p>
                </div>
              </div>
              <div className="bg-gray-50 p-3 rounded-lg">
                <p className="text-xs text-gray-500 mb-1">Chủ sở hữu</p>
                <div className="flex items-center">
                  <Wallet size={16} className="text-gray-400 mr-2" />
                  <p className="text-sm font-medium text-gray-700">
                    {selectedNFT.owner
                      ? `${selectedNFT.owner.slice(0, 6)}...${selectedNFT.owner.slice(-4)}`
                      : "Unknown"}
                  </p>
                </div>
              </div>
              <div className="bg-gray-50 p-3 rounded-lg">
                <p className="text-xs text-gray-500 mb-1">Phí royalty</p>
                <p className="text-sm font-medium text-gray-700">{selectedNFT.royaltyPercent || 0}%</p>
              </div>
              <div className="bg-gray-50 p-3 rounded-lg">
                <p className="text-xs text-gray-500 mb-1">Ngày tạo</p>
                <div className="flex items-center">
                  <Clock size={16} className="text-gray-400 mr-2" />
                  <p className="text-sm font-medium text-gray-700">
                    {new Date(selectedNFT.mintedAt).toLocaleDateString("vi-VN")}
                  </p>
                </div>
              </div>
            </div>
          </div>
        </div>

        {/* Purchase Form */}
        <div className="bg-white rounded-xl shadow-sm border border-gray-100 p-6">
          <h2 className="text-2xl font-bold text-gray-800 mb-6">Xác nhận mua NFT</h2>

          <div className="mb-8">
            <div className="flex justify-between items-center p-4 bg-emerald-50 rounded-lg border border-emerald-100 mb-4">
              <span className="text-gray-700">Giá</span>
              <span className="text-xl font-bold text-emerald-600 flex items-center">
                <Tag size={18} className="mr-2" />
                {formatPrice(selectedNFT.price)} DX
              </span>
            </div>

            <div className="flex justify-between items-center p-4 bg-gray-50 rounded-lg border border-gray-100 mb-4">
              <span className="text-gray-700">Phí giao dịch</span>
              <span className="font-medium text-gray-700">
                {formatPrice(selectedNFT.price ? selectedNFT.price * 0.025 : 0)} DX
              </span>
            </div>

            <div className="flex justify-between items-center p-4 bg-gray-50 rounded-lg border border-gray-100 mb-4">
              <span className="text-gray-700">Phí royalty ({selectedNFT.royaltyPercent || 0}%)</span>
              <span className="font-medium text-gray-700">
                {formatPrice(selectedNFT.price ? (selectedNFT.price * (selectedNFT.royaltyPercent || 0)) / 100 : 0)} DX
              </span>
            </div>

            <div className="h-px bg-gray-200 my-4"></div>

            <div className="flex justify-between items-center p-4 bg-gray-800 text-white rounded-lg">
              <span className="font-medium">Tổng thanh toán</span>
              <span className="text-xl font-bold">
                {formatPrice(
                  selectedNFT.price
                    ? selectedNFT.price +
                        selectedNFT.price * 0.025 +
                        (selectedNFT.price * (selectedNFT.royaltyPercent || 0)) / 100
                    : 0
                )}{" "}
                DX
              </span>
            </div>
          </div>

          <div className="mb-8">
            <div className="flex items-start mb-4">
              <Shield className="text-emerald-500 mr-3 mt-0.5 flex-shrink-0" size={20} />
              <p className="text-sm text-gray-600">
                Giao dịch này được bảo vệ bởi smart contract. Sau khi xác nhận, NFT sẽ được chuyển trực tiếp vào ví của bạn.
              </p>
            </div>

            <div className="flex items-start">
              <AlertTriangle className="text-amber-500 mr-3 mt-0.5 flex-shrink-0" size={20} />
              <p className="text-sm text-gray-600">
                Vui lòng kiểm tra kỹ thông tin trước khi xác nhận. Giao dịch blockchain không thể hoàn tác sau khi đã được xác nhận.
              </p>
            </div>
          </div>

          <button
            onClick={handleBuyNFT}
            disabled={transactionStatus !== "idle"}
            className={`w-full py-4 rounded-xl font-bold text-white flex items-center justify-center ${
              transactionStatus !== "idle"
                ? "bg-gray-400 cursor-not-allowed"
                : "bg-emerald-600 hover:bg-emerald-700"
            } transition-colors`}
          >
            {transactionStatus === "idle" && (
              <>
                <Tag size={20} className="mr-2" />
                Xác nhận mua NFT
              </>
            )}
            {transactionStatus === "confirming" && (
              <>
                <Loader2 size={20} className="mr-2 animate-spin" />
                Đang chờ xác nhận...
              </>
            )}
            {transactionStatus === "processing" && (
              <>
                <Loader2 size={20} className="mr-2 animate-spin" />
                Đang xử lý giao dịch...
              </>
            )}
            {transactionStatus === "success" && (
              <>
                <CheckCircle size={20} className="mr-2" />
                Giao dịch thành công!
              </>
            )}
          </button>

          {transactionStatus === "processing" && txHash && (
            <div className="mt-4 p-4 bg-blue-50 rounded-lg border border-blue-100">
              <p className="text-sm text-blue-800 mb-1 font-medium">Giao dịch đang được xử lý</p>
              <p className="text-xs text-blue-600 break-all">Transaction Hash: {txHash}</p>
            </div>
          )}
        </div>
      </div>
    </div>
  );
};

export default NFTBuyPage;