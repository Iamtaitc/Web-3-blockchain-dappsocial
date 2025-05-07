"use client"

import { useState, useEffect } from "react"

interface IPFSImageProps {
  hash: string
  alt?: string
  className?: string
  fallbackSrc?: string
  onClick?: () => void
}

const IPFSImage = ({
  hash,
  alt = "IPFS Image",
  className = "",
  fallbackSrc = "/placeholder.svg",
  onClick,
}: IPFSImageProps) => {
  const [src, setSrc] = useState<string>("")
  const [loading, setLoading] = useState<boolean>(true)
  const [error, setError] = useState<boolean>(false)

  useEffect(() => {
    const loadImage = async () => {
      if (!hash) {
        setError(true)
        setLoading(false)
        return
      }

      try {
        setLoading(true)
        setError(false)

        // Xử lý hash IPFS
        let ipfsUrl = ""

        // Sử dụng local gateway vì bạn đang chạy IPFS daemon trên PowerShell
        const localGateway = "http://127.0.0.1:8080/ipfs/"

        // Nếu hash bắt đầu bằng "ipfs://"
        if (hash.startsWith("ipfs://")) {
          // Chuyển đổi từ ipfs:// sang gateway URL
          const cid = hash.replace("ipfs://", "")
          ipfsUrl = `${localGateway}${cid}`
        } else if (hash.startsWith("Qm") || hash.startsWith("ba")) {
          // Nếu hash là CID trực tiếp
          ipfsUrl = `${localGateway}${hash}`
        } else if (hash.startsWith("http")) {
          // Nếu hash là URL HTTP/HTTPS
          ipfsUrl = hash
        } else {
          // Thử xử lý như URL trực tiếp
          ipfsUrl = hash
        }

        // Kiểm tra xem URL có hợp lệ không bằng cách tạo một Image object
        const img = new Image()
        img.crossOrigin = "anonymous" // Thêm crossOrigin để tránh lỗi CORS
        img.onload = () => {
          setSrc(ipfsUrl)
          setLoading(false)
        }
        img.onerror = () => {
          console.error("Không thể tải ảnh từ URL:", ipfsUrl)

          // Thử gateway khác nếu gateway đầu tiên thất bại
          if (ipfsUrl.includes("127.0.0.1")) {
            // Thử gateway công cộng nếu local gateway thất bại
            const cid = hash.startsWith("ipfs://") ? hash.replace("ipfs://", "") : hash
            const fallbackUrl = `https://ipfs.io/ipfs/${cid}`

            const fallbackImg = new Image()
            fallbackImg.crossOrigin = "anonymous"
            fallbackImg.onload = () => {
              setSrc(fallbackUrl)
              setLoading(false)
            }
            fallbackImg.onerror = () => {
              // Thử gateway thứ ba nếu cần
              const dweb = `https://dweb.link/ipfs/${cid}`
              const thirdAttemptImg = new Image()
              thirdAttemptImg.crossOrigin = "anonymous"
              thirdAttemptImg.onload = () => {
                setSrc(dweb)
                setLoading(false)
              }
              thirdAttemptImg.onerror = () => {
                setError(true)
                setLoading(false)
              }
              thirdAttemptImg.src = dweb
            }
            fallbackImg.src = fallbackUrl
          } else {
            setError(true)
            setLoading(false)
          }
        }
        img.src = ipfsUrl
      } catch (err) {
        console.error("Lỗi khi tải ảnh IPFS:", err)
        setError(true)
        setLoading(false)
      }
    }

    loadImage()

    // Cleanup function to prevent memory leaks
    return () => {
      // Cancel any pending operations if component unmounts
    }
  }, [hash])

  if (loading) {
    return (
      <div className={`flex items-center justify-center bg-gray-100 animate-pulse ${className}`}>
        <svg
          className="w-10 h-10 text-gray-400"
          fill="none"
          stroke="currentColor"
          viewBox="0 0 24 24"
          xmlns="http://www.w3.org/2000/svg"
        >
          <path
            strokeLinecap="round"
            strokeLinejoin="round"
            strokeWidth="2"
            d="M4 16l4.586-4.586a2 2 0 012.828 0L16 16m-2-2l1.586-1.586a2 2 0 012.828 0L20 14m-6-6h.01M6 20h12a2 2 0 002-2V6a2 2 0 00-2-2H6a2 2 0 00-2 2v12a2 2 0 002 2z"
          ></path>
        </svg>
      </div>
    )
  }

  if (error) {
    return <img src={fallbackSrc || "/placeholder.svg"} alt={alt} className={className} onClick={onClick} />
  }

  return (
    <img
      src={src || "/placeholder.svg"}
      alt={alt}
      className={className}
      onError={() => setError(true)}
      onClick={onClick}
      crossOrigin="anonymous"
    />
  )
}

export default IPFSImage
  