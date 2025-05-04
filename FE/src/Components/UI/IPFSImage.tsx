import { useState, useEffect } from "react";

interface IPFSImageProps {
  hash: string;
  alt?: string;
  className?: string;
  fallbackSrc?: string;
  onClick?: () => void;
}

const IPFSImage = ({
  hash,
  alt = "IPFS Image",
  className = "",
  fallbackSrc = "/placeholder.svg",
  onClick,
}: IPFSImageProps) => {
  const [src, setSrc] = useState<string>("");
  const [loading, setLoading] = useState<boolean>(true);
  const [error, setError] = useState<boolean>(false);

  useEffect(() => {
    const loadImage = async () => {
      if (!hash) {
        setError(true);
        setLoading(false);
        return;
      }

      try {
        setLoading(true);
        setError(false);

        // Xử lý hash IPFS
        let ipfsUrl = "";
        
        // Sử dụng IPFS gateway công khai
        const gateway = "https://ipfs.io/ipfs/";

        // Xử lý các định dạng hash khác nhau
        if (hash.startsWith("ipfs://")) {
          ipfsUrl = gateway + hash.replace("ipfs://", "");
        } else if (hash.startsWith("Qm") || hash.startsWith("ba")) {
          ipfsUrl = gateway + hash;
        } else if (hash.startsWith("http")) {
          ipfsUrl = hash;
        } else {
          ipfsUrl = gateway + hash;
        }

        const img = new Image();
        img.crossOrigin = "anonymous";
        img.src = ipfsUrl;

        img.onload = () => {
          setSrc(ipfsUrl);
          setLoading(false);
        };

        img.onerror = () => {
          // Thử gateway khác nếu gateway đầu tiên thất bại
          const fallbackGateway = "https://dweb.link/ipfs/";
          const cid = hash.startsWith("ipfs://") ? hash.replace("ipfs://", "") : hash;
          const fallbackUrl = fallbackGateway + cid;

          const fallbackImg = new Image();
          fallbackImg.crossOrigin = "anonymous";
          fallbackImg.src = fallbackUrl;

          fallbackImg.onload = () => {
            setSrc(fallbackUrl);
            setLoading(false);
          };

          fallbackImg.onerror = () => {
            setError(true);
            setLoading(false);
          };
        };
      } catch (err) {
        console.error("Lỗi khi tải ảnh IPFS:", err);
        setError(true);
        setLoading(false);
      }
    };

    loadImage();
  }, [hash]);

  if (loading) {
    return (
      <div className={`flex items-center justify-center bg-gray-100 ${className}`}>
        <div className="animate-spin rounded-full h-8 w-8 border-b-2 border-emerald-500"></div>
      </div>
    );
  }

  if (error) {
    return <img src={fallbackSrc} alt={alt} className={className} onClick={onClick} />;
  }

  return (
    <img
      src={src}
      alt={alt}
      className={className}
      onError={() => setError(true)}
      onClick={onClick}
      crossOrigin="anonymous"
    />
  );
};

export default IPFSImage;