import type React from "react"
import { FileQuestion, Sparkles } from "lucide-react"

interface EmptyStateProps {
  message: string
}

const EmptyState: React.FC<EmptyStateProps> = ({ message }) => {
  return (
    <div className="flex flex-col items-center justify-center bg-white rounded-xl shadow-sm py-16 px-4 text-center border border-emerald-100 nft-gradient-card">
      <div className="relative mb-6">
        <div className="absolute inset-0 bg-emerald-100 rounded-full nft-animate-pulse"></div>
        <div className="absolute inset-0 bg-emerald-200 rounded-full nft-animate-ping"></div>
        <FileQuestion size={72} className="relative z-10 text-emerald-500" />
        <Sparkles className="absolute -right-4 -top-2 text-amber-400 animate-pulse" size={24} />
      </div>
      <h3 className="text-xl font-semibold text-gray-900 mb-3">Không tìm thấy NFT nào</h3>
      <p className="text-gray-600 max-w-md mb-6">{message}</p>
      <div className="mt-2">
        <a
          href="/user/"
          className="inline-flex items-center px-6 py-3 border border-transparent text-sm font-medium rounded-full shadow-md text-white nft-gradient-primary hover:shadow-lg focus:outline-none focus:ring-2 focus:ring-offset-2 focus:ring-emerald-500"
        >
          <Sparkles className="mr-2" size={16} />
          Tạo NFT mới
        </a>
      </div>
    </div>
  )
}

export default EmptyState
