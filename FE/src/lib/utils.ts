import { type ClassValue, clsx } from "clsx"
import { twMerge } from "tailwind-merge"
import React from "react"

export function cn(...inputs: ClassValue[]) {
  return twMerge(clsx(inputs))
}

export function formatDate(dateString: string): string {
  const date = new Date(dateString)
  return new Intl.DateTimeFormat("vi-VN", {
    day: "numeric",
    month: "numeric",
    year: "numeric",
  }).format(date)
}

export function formatNumber(num: number): string {
  if (num >= 1000000) {
    return (num / 1000000).toFixed(1) + "M"
  }
  if (num >= 1000) {
    return (num / 1000).toFixed(1) + "K"
  }
  return num.toString()
}

// Định nghĩa kiểu dữ liệu cho icon để TypeScript hiểu đây là React element
type IconType = React.ReactNode

// Định nghĩa kiểu dữ liệu cho thông tin gói đăng ký
interface SubscriptionDetails {
  name: string
  className: string
  icon: IconType
  borderColor: string
  headerBg: string
  buttonBg: string
  multiplier: number
  benefits: string[]
}

export function getSubscriptionDetails(level: number): SubscriptionDetails {
  switch (level) {
    case 1:
      return {
        name: "Standard",
        className: "standard",
        icon: React.createElement(
          "svg",
          {
            className: "h-5 w-5",
            fill: "currentColor",
            viewBox: "0 0 20 20",
            xmlns: "http://www.w3.org/2000/svg",
          },
          React.createElement("path", {
            d: "M9.049 2.927c.3-.921 1.603-.921 1.902 0l1.07 3.292a1 1 0 00.95.69h3.462c.969 0 1.371 1.24.588 1.81l-2.8 2.034a1 1 0 00-.364 1.118l1.07 3.292c.3.921-.755 1.688-1.54 1.118l-2.8-2.034a1 1 0 00-1.175 0l-2.8 2.034c-.784.57-1.838-.197-1.539-1.118l1.07-3.292a1 1 0 00-.364-1.118L2.98 8.72c-.783-.57-.38-1.81.588-1.81h3.461a1 1 0 00.951-.69l1.07-3.292z",
          }),
        ),
        borderColor: "border-blue-200",
        headerBg: "bg-gradient-to-r from-blue-500 to-blue-600",
        buttonBg: "bg-blue-500 hover:bg-blue-600",
        multiplier: 1.5,
        benefits: [
          "Hệ số nhân phần thưởng 1.5x",
          "Truy cập nội dung Standard",
          "Truy cập các tính năng cơ bản",
          "Huy hiệu Standard",
          "Giới hạn claim token hàng ngày: 12 token",
          "Tối đa 3 bài đăng mỗi ngày"
        ],
      }
    case 2:
      return {
        name: "Plus",
        className: "plus",
        icon: React.createElement(
          "svg",
          {
            className: "h-5 w-5",
            fill: "currentColor",
            viewBox: "0 0 20 20",
            xmlns: "http://www.w3.org/2000/svg",
          },
          React.createElement("path", {
            d: "M9.049 2.927c.3-.921 1.603-.921 1.902 0l1.07 3.292a1 1 0 00.95.69h3.462c.969 0 1.371 1.24.588 1.81l-2.8 2.034a1 1 0 00-.364 1.118l1.07 3.292c.3.921-.755 1.688-1.54 1.118l-2.8-2.034a1 1 0 00-1.175 0l-2.8 2.034c-.784.57-1.838-.197-1.539-1.118l1.07-3.292a1 1 0 00-.364-1.118L2.98 8.72c-.783-.57-.38-1.81.588-1.81h3.461a1 1 0 00.951-.69l1.07-3.292z",
          }),
        ),
        borderColor: "border-purple-200",
        headerBg: "bg-gradient-to-r from-purple-500 to-purple-600",
        buttonBg: "bg-purple-500 hover:bg-purple-600",
        multiplier: 2,
        benefits: [
          "Hệ số nhân phần thưởng 2x",
          "Truy cập nội dung Plus",
          "Hỗ trợ ưu tiên",
          "Huy hiệu Plus",
          "Giảm phí giao dịch",
          "Giới hạn claim token hàng ngày: 16 token",
          " Tối đa 10 bài đăng mỗi ngày"
        ],
      }
    case 5:
      return {
        name: "Pro",
        className: "pro",
        icon: React.createElement(
          "svg",
          {
            className: "h-5 w-5",
            fill: "currentColor",
            viewBox: "0 0 20 20",
            xmlns: "http://www.w3.org/2000/svg",
          },
          React.createElement("path", {
            d: "M9.049 2.927c.3-.921 1.603-.921 1.902 0l1.07 3.292a1 1 0 00.95.69h3.462c.969 0 1.371 1.24.588 1.81l-2.8 2.034a1 1 0 00-.364 1.118l1.07 3.292c.3.921-.755 1.688-1.54 1.118l-2.8-2.034a1 1 0 00-1.175 0l-2.8 2.034c-.784.57-1.838-.197-1.539-1.118l1.07-3.292a1 1 0 00-.364-1.118L2.98 8.72c-.783-.57-.38-1.81.588-1.81h3.461a1 1 0 00.951-.69l1.07-3.292z",
          }),
        ),
        borderColor: "border-amber-200",
        headerBg: "bg-gradient-to-r from-amber-500 to-amber-600",
        buttonBg: "bg-amber-500 hover:bg-amber-600",
        multiplier: 3,
        benefits: [
          "Hệ số nhân phần thưởng 3x",
          "Truy cập tất cả nội dung",
          "Hỗ trợ ưu tiên 24/7",
          "Huy hiệu Pro",
          "Miễn phí giao dịch",
          "Sự kiện độc quyền",
        ],
      }
    case 10:
      return {
        name: "Elite",
        className: "elite",
        icon: React.createElement(
          "svg",
          {
            className: "h-5 w-5",
            fill: "currentColor",
            viewBox: "0 0 20 20",
            xmlns: "http://www.w3.org/2000/svg",
          },
          React.createElement("path", {
            d: "M9.049 2.927c.3-.921 1.603-.921 1.902 0l1.07 3.292a1 1 0 00.95.69h3.462c.969 0 1.371 1.24.588 1.81l-2.8 2.034a1 1 0 00-.364 1.118l1.07 3.292c.3.921-.755 1.688-1.54 1.118l-2.8-2.034a1 1 0 00-1.175 0l-2.8 2.034c-.784.57-1.838-.197-1.539-1.118l1.07-3.292a1 1 0 00-.364-1.118L2.98 8.72c-.783-.57-.38-1.81.588-1.81h3.461a1 1 0 00.951-.69l1.07-3.292z",
          }),
        ),
        borderColor: "border-rose-200",
        headerBg: "bg-gradient-to-r from-rose-500 to-rose-600",
        buttonBg: "bg-rose-500 hover:bg-rose-600",
        multiplier: 5,
        benefits: [
          "Hệ số nhân phần thưởng 5x",
          "Truy cập tất cả nội dung",
          "Hỗ trợ VIP",
          "Huy hiệu Elite",
          "Miễn phí giao dịch",
          "Sự kiện độc quyền",
          "Truy cập sớm tính năng mới",
          "Giao diện profile tùy chỉnh",
        ],
      }
    default:
      return {
        name: "Free",
        className: "free",
        icon: React.createElement(
          "svg",
          {
            className: "h-5 w-5",
            fill: "currentColor",
            viewBox: "0 0 20 20",
            xmlns: "http://www.w3.org/2000/svg",
          },
          React.createElement("path", {
            fillRule: "evenodd",
            d: "M10 18a8 8 0 100-16 8 8 0 000 16zm1-11a1 1 0 10-2 0v2H7a1 1 0 100 2h2v2a1 1 0 102 0v-2h2a1 1 0 100-2h-2V7z",
            clipRule: "evenodd",
          }),
        ),
        borderColor: "border-gray-200",
        headerBg: "bg-gradient-to-r from-gray-500 to-gray-600",
        buttonBg: "bg-gray-500 hover:bg-gray-600",
        multiplier: 1,
        benefits: ["Hệ số nhân phần thưởng 1x", 
          "Chỉ truy cập các tính năng miễn phí", 
          "Hỗ trợ tiêu chuẩn",
          "Giới hạn claim token hàng ngày: 8 token",
          "Tối đa 1 bài đăng mỗi ngày"        
        ],
      }
  }
}
// Hàm xử lý đường dẫn IPFS
export function getIpfsUrl(ipfsUri: string | null) {
  if (!ipfsUri) return null
  
  // Nếu là đường dẫn IPFS, chuyển đổi thành URL HTTP
  if (ipfsUri.startsWith('ipfs://')) {
    return `https://ipfs.io/ipfs/${ipfsUri.replace('ipfs://', '')}`
  }
  
  return ipfsUri
}

// Hàm rút gọn địa chỉ ví
export function shortenAddress(address: string | null) {
  if (!address) return ''
  return `${address.slice(0, 6)}...${address.slice(-4)}`
}