import React, { useEffect, useState } from 'react';
import { useParams, useNavigate, useLocation } from 'react-router-dom';
import { useDispatch, useSelector } from 'react-redux';
import { ArrowLeft, ShieldCheck, AlertTriangle, Loader2, CheckCircle2, Copy, ExternalLink } from 'lucide-react';
import { purchaseComplete, fetchNFTById } from '../../store/slices/nftSlice';
import { AppDispatch, RootState } from '../../store';
import { toast } from 'react-hot-toast';

const PurchaseCompletionPage: React.FC = () => {
  const { tokenId } = useParams<{ tokenId: string }>();
  const location = useLocation();
  const dispatch = useDispatch<AppDispatch>();
  const navigate = useNavigate();

  // Extract txHash from query params
  const queryParams = new URLSearchParams(location.search);
  const txHash = queryParams.get('txHash') || '';

  const { selectedNFT, loading } = useSelector((state: RootState) => state.nft);
  const { walletAddress } = useSelector((state: RootState) => state.auth);
  
  const [confirmationState, setConfirmationState] = useState<'initial' | 'processing' | 'success' | 'failed'>('initial');
  const [transactionData, setTransactionData] = useState<any>(null);

  useEffect(() => {
    if (tokenId) {
      dispatch(fetchNFTById(tokenId));
    }
  }, [dispatch, tokenId]);

  const formatPrice = (price: string | number | undefined) => {
    if (!price) return '0';
    const numericPrice = typeof price === 'string' ? Number.parseFloat(price) : price;
    return new Intl.NumberFormat('vi-VN').format(numericPrice);
  };

  const handleConfirmPurchase = async () => {
    if (!tokenId || !txHash || !walletAddress) {
      toast.error('Thiếu thông tin để xác nhận giao dịch');
      return;
    }
    
    try {
      setConfirmationState('processing');
      
      const result = await dispatch(purchaseComplete({
        tokenId,
        txHash,
        buyer: walletAddress
      })).unwrap();
      
      setTransactionData(result); // Lưu dữ liệu NFT (result đã là response.data)
      setConfirmationState('success');
      
      toast.success('Đã xác nhận giao dịch thành công!');
      
      setTimeout(() => {
        navigate('/marketplace');
      }, 5000);
    } catch (error: any) {
      console.error('Lỗi khi xác nhận giao dịch:', error);
      setConfirmationState('failed');
      toast.error(error.message || 'Có lỗi xảy ra khi xác nhận giao dịch');
    }
  };

  const handleCopyTxHash = () => {
    if (txHash) {
      navigator.clipboard.writeText(txHash);
      toast.success('Đã sao chép mã giao dịch!');
    }
  };

  const handleGoBack = () => {
    navigate(-1);
  };

  if (loading) {
    return (
      <div className="flex flex-col items-center justify-center min-h-[70vh]">
        <Loader2 className="w-12 h-12 text-emerald-500 animate-spin mb-4" />
        <p className="text-gray-600">Đang tải thông tin giao dịch...</p>
      </div>
    );
  }

  if (!selectedNFT) {
    return (
      <div className="flex flex-col items-center justify-center min-h-[70vh]">
        <AlertTriangle className="w-12 h-12 text-amber-500 mb-4" />
        <h2 className="text-xl font-bold text-gray-800 mb-2">Không tìm thấy thông tin NFT</h2>
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

  if (!txHash) {
    return (
      <div className="flex flex-col items-center justify-center min-h-[70vh]">
        <AlertTriangle className="w-12 h-12 text-amber-500 mb-4" />
        <h2 className="text-xl font-bold text-gray-800 mb-2">Thiếu thông tin giao dịch</h2>
        <p className="text-gray-600 mb-4">Không tìm thấy mã giao dịch (txHash) để xác nhận.</p>
        <button 
          onClick={() => navigate(`/nft/${tokenId}/buy`)}
          className="flex items-center gap-2 px-4 py-2 bg-gray-100 text-gray-700 rounded-lg hover:bg-gray-200 transition-colors"
        >
          <ArrowLeft size={18} />
          Quay lại trang mua NFT
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
          <h1 className="text-2xl font-bold text-gray-800">Xác nhận giao dịch</h1>
          <p className="text-gray-600">Xác nhận hoàn tất giao dịch mua NFT</p>
        </div>

        <div className="p-6">
          {confirmationState === 'initial' && (
            <div className="grid grid-cols-1 md:grid-cols-2 gap-8">
              {/* Transaction Confirmation */}
              <div className="space-y-6">
                <div className="bg-emerald-50 rounded-lg p-4 border border-emerald-100 flex items-start gap-3">
                  <CheckCircle2 className="w-5 h-5 text-emerald-500 flex-shrink-0 mt-0.5" />
                  <div>
                    <h3 className="font-medium text-emerald-800">Giao dịch đã được xử lý</h3>
                    <p className="text-emerald-700 text-sm">Blockchain đã ghi nhận giao dịch của bạn. Xác nhận để hoàn tất quá trình.</p>
                  </div>
                </div>
                
                <div className="bg-gray-50 rounded-lg p-4 border border-gray-100">
                  <h3 className="font-medium text-gray-800 mb-3">Chi tiết giao dịch</h3>
                  
                  <div className="space-y-3">
                    <div className="flex justify-between items-center">
                      <span className="text-gray-600">NFT ID</span>
                      <span className="font-medium text-gray-900">{tokenId}</span>
                    </div>
                    <div className="flex justify-between items-center">
                      <span className="text-gray-600">Giá mua</span>
                      <span className="font-medium text-gray-900">{formatPrice(selectedNFT?.price ?? '0')} DX</span>
                    </div>
                    <div className="flex justify-between items-center">
                      <span className="text-gray-600">Người mua</span>
                      <span className="font-medium text-gray-900">
                        {walletAddress ? `${walletAddress.slice(0, 6)}...${walletAddress.slice(-4)}` : 'Không xác định'}
                      </span>
                    </div>
                    <div className="flex justify-between items-center">
                      <span className="text-gray-600">Mã giao dịch</span>
                      <div className="flex items-center gap-1">
                        <span className="font-medium text-gray-900 text-sm">
                          {txHash ? `${txHash.slice(0, 6)}...${txHash.slice(-4)}` : 'N/A'}
                        </span>
                        <button 
                          onClick={handleCopyTxHash}
                          className="text-gray-500 hover:text-gray-700"
                          title="Sao chép"
                        >
                          <Copy size={14} />
                        </button>
                        <a 
                          href={`https://etherscan.io/tx/${txHash}`}
                          target="_blank"
                          rel="noopener noreferrer"
                          className="text-gray-500 hover:text-gray-700"
                          title="Xem trên Etherscan"
                        >
                          <ExternalLink size={14} />
                        </a>
                      </div>
                    </div>
                  </div>
                </div>

                <button
                  onClick={handleConfirmPurchase}
                  className="w-full py-3 nft-gradient-primary text-white rounded-lg transition-all duration-300 font-medium flex items-center justify-center gap-2 hover:shadow-md"
                >
                  <ShieldCheck size={18} />
                  Xác nhận hoàn tất giao dịch
                </button>
              </div>
            </div>
          )}

          {confirmationState === 'processing' && (
            <div className="flex flex-col items-center justify-center py-12">
              <Loader2 className="w-12 h-12 text-emerald-500 animate-spin mb-4" />
              <h3 className="text-xl font-bold text-gray-800 mb-2">Đang xác nhận giao dịch</h3>
              <p className="text-gray-600 text-center">
                Vui lòng đợi trong khi chúng tôi xác nhận giao dịch trên blockchain.
              </p>
            </div>
          )}

          {confirmationState === 'success' && transactionData && (
            <div className="flex flex-col items-center justify-center py-12">
              <div className="w-16 h-16 bg-emerald-100 rounded-full flex items-center justify-center mb-4">
                <ShieldCheck className="w-8 h-8 text-emerald-500" />
              </div>
              <h3 className="text-xl font-bold text-gray-800 mb-2">Xác nhận thành công!</h3>
              <p className="text-gray-600 text-center mb-6">
                Giao dịch mua NFT "{transactionData.name}" đã được xác nhận và hoàn tất.
              </p>
              
              <div className="w-full bg-gray-50 rounded-lg p-4 border border-gray-100 mb-4">
                <h4 className="font-medium text-gray-800 mb-3">Chi tiết giao dịch</h4>
                <div className="space-y-2 text-sm">
                  <div className="flex justify-between">
                    <span className="text-gray-600">Token ID</span>
                    <span className="font-medium text-gray-900">{transactionData.tokenId}</span>
                  </div>
                  <div className="flex justify-between">
                    <span className="text-gray-600">Người bán</span>
                    <span className="font-medium text-gray-900">
                      {`${transactionData.previousOwner.slice(0, 6)}...${transactionData.previousOwner.slice(-4)}`}
                    </span>
                  </div>
                  <div className="flex justify-between">
                    <span className="text-gray-600">Người mua</span>
                    <span className="font-medium text-gray-900">
                      {`${transactionData.newOwner.slice(0, 6)}...${transactionData.newOwner.slice(-4)}`}
                    </span>
                  </div>
                  <div className="flex justify-between">
                    <span className="text-gray-600">Giá</span>
                    <span className="font-medium text-gray-900">{formatPrice(transactionData.price)} DX</span>
                  </div>
                  <div className="flex justify-between">
                    <span className="text-gray-600">Transaction Hash</span>
                    <div className="flex items-center gap-1">
                      <span className="font-medium text-gray-900">
                        {`${transactionData.txHash.slice(0, 6)}...${transactionData.txHash.slice(-4)}`}
                      </span>
                      <button 
                        onClick={() => {
                          navigator.clipboard.writeText(transactionData.txHash);
                          toast.success('Đã sao chép mã giao dịch!');
                        }}
                        className="text-gray-500 hover:text-gray-700"
                        title="Sao chép"
                      >
                        <Copy size={14} />
                      </button>
                      <a 
                        href={`https://etherscan.io/tx/${transactionData.txHash}`}
                        target="_blank"
                        rel="noopener noreferrer"
                        className="text-gray-500 hover:text-gray-700"
                        title="Xem trên Etherscan"
                      >
                        <ExternalLink size={14} />
                      </a>
                    </div>
                  </div>
                </div>
              </div>
              
              <p className="text-sm text-gray-500 mb-4 text-center">
                Bạn sẽ được chuyển hướng về trang Marketplace sau 5 giây...
              </p>
              
              <button
                onClick={() => navigate('/nft/marketplace')}
                className="px-6 py-2 bg-gray-100 text-gray-700 rounded-lg hover:bg-gray-200 transition-colors"
              >
                Quay lại Marketplace
              </button>
            </div>
          )}

          {confirmationState === 'failed' && (
            <div className="flex flex-col items-center justify-center py-12">
              <div className="w-16 h-16 bg-rose-100 rounded-full flex items-center justify-center mb-4">
                <AlertTriangle className="w-8 h-8 text-rose-500" />
              </div>
              <h3 className="text-xl font-bold text-gray-800 mb-2">Xác nhận thất bại</h3>
              <p className="text-gray-600 text-center mb-6">
                Đã xảy ra lỗi khi xác nhận giao dịch. Vui lòng thử lại sau.
              </p>
              
              <div className="flex gap-3">
                <button
                  onClick={() => setConfirmationState('initial')}
                  className="px-6 py-2 bg-gray-100 text-gray-700 rounded-lg hover:bg-gray-200 transition-colors"
                >
                  Thử lại
                </button>
                <button
                  onClick={() => navigate('/nft/marketplace')}
                  className="px-6 py-2 bg-gray-100 text-gray-700 rounded-lg hover:bg-gray-200 transition-colors"
                >
                  Quay lại Marketplace
                </button>
              </div>
            </div>
          )}
        </div>
      </div>
    </div>
  );
};

export default PurchaseCompletionPage;