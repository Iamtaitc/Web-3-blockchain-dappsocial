import React, { useEffect, useState } from 'react';
import { useParams, useNavigate } from 'react-router-dom';
import { useDispatch, useSelector } from 'react-redux';
import { ArrowLeft, ShieldCheck, AlertTriangle, Loader2, Tag, Info } from 'lucide-react';
import { buyNFT, fetchNFTById } from '../../store/slices/nftSlice';
import { AppDispatch, RootState } from '../../store';
import { toast } from 'react-hot-toast';
import IPFSImage from '../../components/UI/IPFSImage';

interface AuthState {
  walletAddress: string;
  balance: {
    dx: string;
  };
}

const NFTBuyPage: React.FC = () => {
  const { tokenId } = useParams<{ tokenId: string }>();
  const dispatch = useDispatch<AppDispatch>();
  const navigate = useNavigate();

  const { selectedNFT, loading, error } = useSelector((state: RootState) => state.nft);
  const { walletAddress, balance } = useSelector((state: RootState) => state.auth as AuthState);
  
  const [purchaseState, setPurchaseState] = useState<'initial' | 'processing' | 'success' | 'failed'>('initial');
  const [transactionData, setTransactionData] = useState<any>(null);
  const [hasSufficientBalance, setHasSufficientBalance] = useState<boolean>(true);

  useEffect(() => {
    if (tokenId) {
      dispatch(fetchNFTById(tokenId));
    }
  }, [dispatch, tokenId]);

  useEffect(() => {
    console.log("nftshowredux", selectedNFT); // Log khi selectedNFT thay đổi
    if (selectedNFT && balance?.dx) {
      const price = selectedNFT.price ?? 0;
      setHasSufficientBalance(Number(balance.dx) >= Number(price));
    }
  }, [selectedNFT, balance]);

  const formatPrice = (price: string | number | undefined) => {
    if (!price) return '0';
    const numericPrice = typeof price === 'string' ? Number.parseFloat(price) : price;
    return new Intl.NumberFormat('vi-VN').format(numericPrice);
  };

  const handlePurchase = async () => {
    if (!tokenId || !selectedNFT) return;
    
    try {
      setPurchaseState('processing');
      
      const result = await dispatch(buyNFT(tokenId)).unwrap();
      setTransactionData(result);
      setPurchaseState('success');
      
      toast.success('Đã mua NFT thành công!');
      
      setTimeout(() => {
        navigate('/marketplace');
      }, 3000);
    } catch (error: any) {
      console.error('Lỗi khi mua NFT:', error);
      setPurchaseState('failed');
      toast.error(error.message || 'Có lỗi xảy ra khi mua NFT');
    }
  };

  const handleGoBack = () => {
    navigate(-1);
  };

  if (loading) {
    return (
      <div className="flex flex-col items-center justify-center min-h-[70vh]">
        <Loader2 className="w-12 h-12 text-emerald-500 animate-spin mb-4" />
        <p className="text-gray-600">Đang tải thông tin NFT...</p>
      </div>
    );
  }

  if (error) {
    return (
      <div className="flex flex-col items-center justify-center min-h-[70vh]">
        <AlertTriangle className="w-12 h-12 text-amber-500 mb-4" />
        <h2 className="text-xl font-bold text-gray-800 mb-2">Lỗi</h2>
        <p className="text-gray-600 mb-4">{error}</p>
        <button 
          onClick={handleGoBack}
          className="flex items-center gap-2 px-4 py-2 bg-gray-100 text-gray-700 rounded-lg hover:bg-gray-200 transition-colors"
        >
          <ArrowLeft size={18} />
          Quay lại
        </button>
      </div>
    );
  }

  if (!selectedNFT) {
    return (
      <div className="flex flex-col items-center justify-center min-h-[70vh]">
        <AlertTriangle className="w-12 h-12 text-amber-500 mb-4" />
        <h2 className="text-xl font-bold text-gray-800 mb-2">Không tìm thấy NFT</h2>
        <p className="text-gray-600 mb-4">NFT bạn đang tìm kiếm không tồn tại hoặc đã bị xóa.</p>
        <button 
          onClick={handleGoBack}
          className="flex items-center gap-2 px-4 py-2 bg-gray-100 text-gray-700 rounded-lg hover:bg-gray-200 transition-colors"
        >
          <ArrowLeft size={18} />
          Quay lại
        </button>
      </div>
    );
  }

  return (
    <div className="max-w-4xl mx-auto px-4 py-8">
      <button 
        onClick={handleGoBack}
        className="flex items-center gap-2 px-4 py-2 bg-gray-100 text-gray-700 rounded-lg hover:bg-gray-200 transition-colors mb-6"
      >
        <ArrowLeft size={18} />
        Quay lại
      </button>

      <div className="bg-white rounded-xl shadow-sm overflow-hidden">
        <div className="p-6 border-b border-gray-100">
          <h1 className="text-2xl font-bold text-gray-800">Mua NFT</h1>
          <p className="text-gray-600">Xem lại thông tin và xác nhận giao dịch</p>
        </div>

        <div className="p-6">
          <div className="grid grid-cols-1 md:grid-cols-2 gap-8">
            {/* NFT Preview */}
            <div className="space-y-4">
              <div className="rounded-xl overflow-hidden border border-gray-100 shadow-sm bg-gray-50 aspect-square">
                <IPFSImage 
                  hash={selectedNFT.metadata?.image || selectedNFT.imageUrl || selectedNFT.tokenId || ''}
                  alt={selectedNFT.name}
                  className="w-full h-full object-cover" 
                />
              </div>

              <div>
                <h2 className="text-xl font-bold text-gray-800">
                  {selectedNFT.metadata?.name || selectedNFT.name || 'Untitled'}
                </h2>
                <p className="text-gray-600 mt-1 text-sm">
                  {selectedNFT.metadata?.description || selectedNFT.description || 'No description'}
                </p>
              </div>
            </div>

            {/* Transaction Details */}
            <div className="space-y-6">
              <div className="bg-gray-50 rounded-lg p-4 border border-gray-100">
                <h3 className="font-medium text-gray-800 mb-3">Chi tiết giao dịch</h3>
                
                <div className="space-y-3">
                  <div className="flex justify-between">
                    <span className="text-gray-600">Giá NFT</span>
                    <span className="font-medium text-gray-900">{formatPrice(selectedNFT.price)} DX</span>
                  </div>
                  <div className="flex justify-between">
                    <span className="text-gray-600">Phí giao dịch</span>
                    <span className="font-medium text-gray-900">0 DX</span>
                  </div>
                  <div className="border-t border-gray-200 my-2"></div>
                  <div className="flex justify-between">
                    <span className="text-gray-800 font-medium">Tổng cộng</span>
                    <span className="font-bold text-gray-900">{formatPrice(selectedNFT.price)} DX</span>
                  </div>
                </div>
              </div>
              
              <div className="bg-gray-50 rounded-lg p-4 border border-gray-100">
                <h3 className="font-medium text-gray-800 mb-3">Thông tin ví</h3>
                
                <div className="space-y-3">
                  <div className="flex justify-between">
                    <span className="text-gray-600">Địa chỉ ví</span>
                    <span className="font-medium text-gray-900">
                      {walletAddress 
                        ? `${walletAddress.slice(0, 6)}...${walletAddress.slice(-4)}`
                        : 'Chưa kết nối'
                      }
                    </span>
                  </div>
                  <div className="flex justify-between">
                    <span className="text-gray-600">Số dư DX</span>
                    <span className={`font-medium ${hasSufficientBalance ? 'text-gray-900' : 'text-rose-600'}`}>
                      {formatPrice(balance?.dx || 0)} DX
                    </span>
                  </div>
                </div>
              </div>

              {!hasSufficientBalance && (
                <div className="bg-rose-50 text-rose-800 p-3 rounded-lg border border-rose-200 flex items-start gap-2">
                  <AlertTriangle size={20} className="flex-shrink-0 mt-0.5" />
                  <div>
                    <p className="font-medium">Số dư không đủ</p>
                    <p className="text-sm">Bạn cần ít nhất {formatPrice(selectedNFT.price)} DX để mua NFT này.</p>
                  </div>
                </div>
              )}

              <div className="bg-amber-50 text-amber-800 p-3 rounded-lg border border-amber-200 flex items-start gap-2">
                <Info size={20} className="flex-shrink-0 mt-0.5" />
                <div>
                  <p className="font-medium">Lưu ý quan trọng</p>
                  <p className="text-sm">Giao dịch mua NFT không thể hoàn tác. Vui lòng kiểm tra kỹ thông tin trước khi xác nhận.</p>
                </div>
              </div>

              <button
                onClick={handlePurchase}
                disabled={!hasSufficientBalance || !(selectedNFT?.forSale ?? false)}
                className="w-full py-3 nft-gradient-primary text-white rounded-lg transition-all duration-300 font-medium flex items-center justify-center gap-2 hover:shadow-md disabled:opacity-50 disabled:cursor-not-allowed"
              >
                <Tag size={18} />
                {hasSufficientBalance 
                  ? ((selectedNFT?.forSale ?? false) ? 'Xác nhận mua NFT' : 'NFT không được đăng bán')
                  : 'Số dư không đủ'
                }
              </button>
            </div>
          </div>
        </div>
      </div>
    </div>
  );
};

export default NFTBuyPage;