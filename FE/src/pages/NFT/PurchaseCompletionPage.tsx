"use client"

import type React from "react"
import { useEffect, useState } from "react"
import { useParams, useSearchParams, useNavigate } from "react-router-dom"
import { useDispatch, useSelector } from "react-redux"
import type { AppDispatch, RootState } from "../../store"
import { fetchNFTById, purchaseComplete } from "../../store/slices/nftSlice"
import { toast } from "react-hot-toast"
import { CheckCircle, ArrowLeft, Loader2, AlertTriangle, ExternalLink, Copy, Check } from "lucide-react"
import IPFSImage from "../../components/UI/IPFSImage"

const PurchaseCompletionPage: React.FC = () => {
  const { tokenId } = useParams<{ tokenId: string }>()
  const [searchParams] = useSearchParams()
  const txHash = searchParams.get("txHash")
  const navigate = useNavigate()
  const dispatch = useDispatch<AppDispatch>()

  const { selectedNFT, loading } = useSelector((state: RootState) => state.nft)
  const { walletAddress } = useSelector((state: RootState) => state.auth)

  const [processingStatus, setProcessingStatus] = useState<"idle" | "processing" | "success" | "error">("idle")
  const [errorMessage, setErrorMessage] = useState<string>("")
  const [copied, setCopied] = useState(false)

  useEffect(() => {
    if (tokenId) {
      dispatch(fetchNFTById(tokenId))
    }
  }, [dispatch, tokenId])

  useEffect(() => {
    const completeTransaction = async () => {
      if (tokenId && txHash && walletAddress) {
        setProcessingStatus("processing")
        try {
          await dispatch(
            purchaseComplete({
              tokenId,
              txHash,
              buyer: walletAddress,
            }),
          ).unwrap()
          setProcessingStatus("success")
          toast.success("Giao dịch đã được xác nhận thành công!")
        } catch (error: any) {
          console.error("Lỗi khi xác nhận giao dịch:", error)
          setErrorMessage(error.message || "Không thể xác nhận giao dịch")
          setProcessingStatus("error")
          toast.error("Không thể xác nhận giao dịch")
        }
      }
    }

    if (selectedNFT && txHash && walletAddress && processingStatus === "idle") {
      completeTransaction()
    }
  }, [dispatch, tokenId, txHash, walletAddress, selectedNFT, processingStatus])

  const copyToClipboard = (text: string) => {
    navigator.clipboard.writeText(text)
    setCopied(true)
    setTimeout(() => setCopied(false), 2000)
  }

  const getBlockExplorerUrl = () => {
    // Thay đổi URL này tùy thuộc vào mạng blockchain bạn đang sử dụng
    return `https://etherscan.io/tx/${txHash}`
  }

  if (loading || !selectedNFT) {
    return (
      <div className="max-w-4xl mx-auto px-4 py-12 flex flex-col items-center justify-center min-h-[60vh]">
        <Loader2 size={48} className="text-emerald-500 animate-spin mb-4" />
        <h2 className="text-xl font-semibold text-gray-700">Đang tải thông tin giao dịch...</h2>
      </div>
    )
  }

  if (processingStatus === "error") {
    return (
      <div className="max-w-4xl mx-auto px-4 py-12">
        <div className="bg-rose-50 border border-rose-200 rounded-xl p-8 text-center">
          <AlertTriangle size={48} className="text-rose-500 mx-auto mb-4" />
          <h2 className="text-2xl font-bold text-gray-800 mb-2">Đã xảy ra lỗi</h2>
          <p className="text-gray-600 mb-6">{errorMessage || "Không thể xác nhận giao dịch mua NFT"}</p>
          <div className="flex justify-center gap-4">
            <button
              onClick={() => navigate("/marketplace")}
              className="px-6 py-2 bg-gray-200 text-gray-800 rounded-lg hover:bg-gray-300 transition-colors"
            >
              Quay lại Marketplace
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
    )
  }

  return (
    <div className="max-w-4xl mx-auto px-4 py-12">
      {/* Header */}
      <div className="mb-8">
        <button
          onClick={() => navigate("/marketplace")}
          className="flex items-center text-gray-600 hover:text-emerald-600 transition-colors mb-4"
        >
          <ArrowLeft size={20} className="mr-2" />
          Quay lại Marketplace
        </button>
      </div>

      <div className="bg-white rounded-xl shadow-sm overflow-hidden border border-gray-100 mb-8">
        <div className="p-8 text-center">
          {processingStatus === "processing" ? (
            <>
              <div className="relative w-24 h-24 mx-auto mb-6">
                <div className="absolute inset-0 rounded-full border-4 border-emerald-200 border-t-emerald-500 animate-spin"></div>
                <div className="absolute inset-0 flex items-center justify-center">
                  <Loader2 size={36} className="text-emerald-500 animate-spin" />
                </div>
              </div>
              <h2 className="text-2xl font-bold text-gray-800 mb-2">Đang xác nhận giao dịch</h2>
              <p className="text-gray-600 mb-6">Giao dịch của bạn đang được xử lý. Vui lòng không đóng trang này.</p>
            </>
          ) : (
            <>
              <div className="w-24 h-24 bg-emerald-100 rounded-full flex items-center justify-center mx-auto mb-6">
                <CheckCircle size={48} className="text-emerald-500" />
              </div>
              <h2 className="text-2xl font-bold text-gray-800 mb-2">Giao dịch thành công!</h2>
              <p className="text-gray-600 mb-6">Bạn đã mua NFT thành công. NFT đã được chuyển vào ví của bạn.</p>
            </>
          )}

          <div className="grid grid-cols-1 md:grid-cols-2 gap-6 mt-8">
            <div className="bg-gray-50 p-6 rounded-xl">
              <h3 className="text-lg font-semibold text-gray-800 mb-4">Thông tin NFT</h3>
              <div className="flex items-center mb-4">
                <div className="w-16 h-16 rounded-lg overflow-hidden mr-4">
                  <IPFSImage
                    hash={selectedNFT.metadata?.image || selectedNFT.imageUrl || ""}
                    alt={selectedNFT.name}
                    className="w-full h-full object-cover"
                  />
                </div>
                <div className="flex-1">
                  <h4 className="font-medium text-gray-800">{selectedNFT.name}</h4>
                  <p className="text-sm text-gray-500 truncate">{selectedNFT.description}</p>
                </div>
              </div>
              <div className="text-left">
                <div className="flex justify-between py-2 border-b border-gray-200">
                  <span className="text-sm text-gray-500">Token ID</span>
                  <span className="text-sm font-medium text-gray-800">{tokenId}</span>
                </div>
                <div className="flex justify-between py-2 border-b border-gray-200">
                  <span className="text-sm text-gray-500">Giá</span>
                  <span className="text-sm font-medium text-gray-800">
                    {new Intl.NumberFormat("vi-VN").format(selectedNFT.price || 0)} DX
                  </span>
                </div>
                <div className="flex justify-between py-2">
                  <span className="text-sm text-gray-500">Chủ sở hữu mới</span>
                  <span className="text-sm font-medium text-gray-800">
                    {walletAddress ? `${walletAddress.slice(0, 6)}...${walletAddress.slice(-4)}` : "Unknown"}
                  </span>
                </div>
              </div>
            </div>

            <div className="bg-gray-50 p-6 rounded-xl">
              <h3 className="text-lg font-semibold text-gray-800 mb-4">Thông tin giao dịch</h3>
              <div className="text-left">
                <div className="flex justify-between py-2 border-b border-gray-200">
                  <span className="text-sm text-gray-500">Trạng thái</span>
                  <span className="text-sm font-medium text-emerald-600 flex items-center">
                    {processingStatus === "processing" ? (
                      <>
                        <Loader2 size={14} className="mr-1 animate-spin" />
                        Đang xử lý
                      </>
                    ) : (
                      <>
                        <CheckCircle size={14} className="mr-1" />
                        Hoàn thành
                      </>
                    )}
                  </span>
                </div>
                <div className="flex justify-between py-2 border-b border-gray-200">
                  <span className="text-sm text-gray-500">Thời gian</span>
                  <span className="text-sm font-medium text-gray-800">{new Date().toLocaleString("vi-VN")}</span>
                </div>
                <div className="py-2 border-b border-gray-200">
                  <div className="flex justify-between mb-1">
                    <span className="text-sm text-gray-500">Transaction Hash</span>
                    <button
                      onClick={() => copyToClipboard(txHash || "")}
                      className="text-emerald-600 hover:text-emerald-700"
                    >
                      {copied ? <Check size={14} /> : <Copy size={14} />}
                    </button>
                  </div>
                  <p className="text-xs font-mono text-gray-600 break-all">{txHash}</p>
                </div>
                <div className="pt-4">
                  <a
                    href={getBlockExplorerUrl()}
                    target="_blank"
                    rel="noopener noreferrer"
                    className="flex items-center justify-center w-full py-2 bg-gray-200 hover:bg-gray-300 text-gray-800 rounded-lg transition-colors"
                  >
                    <ExternalLink size={14} className="mr-2" />
                    Xem trên Blockchain Explorer
                  </a>
                </div>
              </div>
            </div>
          </div>
        </div>
      </div>

      <div className="flex justify-center gap-4">
        <button
          onClick={() => navigate("/marketplace")}
          className="px-6 py-3 bg-gray-200 text-gray-800 rounded-lg hover:bg-gray-300 transition-colors"
        >
          Quay lại Marketplace
        </button>
        <button
          onClick={() => navigate("/profile")}
          className="px-6 py-3 bg-emerald-600 text-white rounded-lg hover:bg-emerald-700 transition-colors"
        >
          Xem NFT của tôi
        </button>
      </div>
    </div>
  )
}

export default PurchaseCompletionPage
