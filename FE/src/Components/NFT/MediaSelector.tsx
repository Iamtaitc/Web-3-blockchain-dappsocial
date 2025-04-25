import React, { useState } from "react";
import IPFSImage from "../UI/IPFSImage";
import CreateNFTModal from "./CreateNFTModal";

interface Media {
  type: string;
  uri: string;
  mimeType: string;
  _id?: string;
}

interface MediaSelectorProps {
  postId: string;
  media: Media[];
  onNFTCreated?: (tokenId: string) => void;
}

const MediaSelector: React.FC<MediaSelectorProps> = ({
  postId,
  media,
  onNFTCreated,
}) => {
  const [selectedMediaIndex, setSelectedMediaIndex] = useState<number | null>(null);
  const [showCreateNFTModal, setShowCreateNFTModal] = useState(false);

  const handleSelectMedia = (index: number) => {
    setSelectedMediaIndex(index);
    setShowCreateNFTModal(true);
  };

  const handleCloseModal = () => {
    setShowCreateNFTModal(false);
    setSelectedMediaIndex(null);
  };

  // Kiểm tra và lọc media hợp lệ
  const validMedia = media.filter(item => item.uri && item.type.startsWith('image'));

  if (!validMedia || validMedia.length === 0) {
    return (
      <div className="text-center p-8 bg-gray-50 rounded-lg border border-dashed border-gray-300">
        <p className="text-gray-500">Không có media hợp lệ trong bài viết này để tạo NFT</p>
      </div>
    );
  }

  return (
    <div className="mt-6 pt-6 border-t border-gray-200">
      <h3 className="text-lg font-semibold text-gray-900 mb-4">
        Chọn media để tạo NFT
      </h3>
      
      <div className={`
        grid gap-4
        ${validMedia.length === 1 ? 'grid-cols-1' : ''}
        ${validMedia.length === 2 ? 'grid-cols-2' : ''}
        ${validMedia.length === 3 ? 'grid-cols-3' : ''}
        ${validMedia.length >= 4 ? 'grid-cols-2 md:grid-cols-4' : ''}
      `}>
        {validMedia.map((item, index) => (
          <div 
            key={index} 
            className="relative aspect-square rounded-lg overflow-hidden cursor-pointer group"
            onClick={() => handleSelectMedia(index)}
          >
            <IPFSImage 
              hash={item.uri} 
              alt={`Media ${index + 1}`} 
              className="w-full h-full object-cover"
            />
            <div className="
              absolute inset-0 bg-black bg-opacity-50 flex items-center justify-center
              opacity-0 group-hover:opacity-100 transition-opacity duration-200
            ">
              <span className="px-4 py-2 bg-indigo-600 bg-opacity-90 text-white rounded-full text-sm font-medium">
                Tạo NFT
              </span>
            </div>
          </div>
        ))}
      </div>

      {selectedMediaIndex !== null && showCreateNFTModal && (
        <CreateNFTModal
          isOpen={showCreateNFTModal}
          onClose={handleCloseModal}
          postId={postId}
          mediaIndex={selectedMediaIndex}
          mediaUri={validMedia[selectedMediaIndex].uri}
          onNFTCreated={onNFTCreated}
        />
      )}
    </div>
  );
};

export default MediaSelector;