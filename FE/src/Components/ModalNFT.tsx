import { FaRegComment, FaRegHeart, FaEllipsisH } from "react-icons/fa"; // Thêm FaEllipsisH cho icon "More"
import "../styles/NFTModal.css";
import defaultAvatar from "../assets/default-avatar-profile-image-vector-social-media-user-icon-potrait-182347582.webp";

interface Comment {
  user: string;
  text: string;
  date?: string;
}

interface NFT {
  image: string;
  title: string;
  price: number;
  likes: string;
  comments: Comment[];
  user: string;
}

interface NFTModalProps {
  isOpen: boolean;
  onClose: () => void;
  nft: NFT | null;
}

const NFTModal: React.FC<NFTModalProps> = ({ isOpen, onClose, nft }) => {
  if (!isOpen || !nft) return null;

  return (
    <div className="nft-modal-overlay" onClick={onClose}>
      <div className="nft-modal-content" onClick={(e) => e.stopPropagation()}>
        <h2>proFile NFT</h2>
        <div className="nft-details">
          <img src={nft.image} alt={nft.title} className="nft-image" />
          <div className="nft-info">
            <p className="nft-time">Any Minute Now</p>
            <p className="nft-price">Price: {nft.price} ETH</p>
            <button className="buy-now">Buy now</button>
          </div>
        </div>
        <div className="nft-actions">
          <span>
            <FaRegHeart /> {nft.likes}
          </span>
          <span>
            <FaRegComment /> {nft.comments.length}
          </span>
          <span className="more-icon">
            <FaEllipsisH />
          </span>
        </div>
        <div className="nft-comments">
          <p>
            <strong>{nft.user}</strong> - NFT Referer users with your referral code to earn points. Describe Refer users with your referral code to earn points
          </p>
          <div className="comment-section">
            <div className="comment-input-wrapper">
              <img src={defaultAvatar} alt="avatar" className="comment-avatar" />
              <input
                type="text"
                placeholder="Add a new comment..."
                className="comment-input"
              />
            </div>
            <div className="comments-list">
              {nft.comments.map((comment, index) => (
                <div key={index} className="comment-item">
                  <img src={defaultAvatar} alt="avatar" className="comment-avatar" />
                  <div className="comment-content">
                    <p className="comment-user">
                      <strong>{comment.user}</strong>{" "}
                      <span className="comment-date">
                        {comment.date || "Jan 28, 2025"}
                      </span>
                    </p>
                    <p className="comment-text">{comment.text}</p>
                  </div>
                </div>
              ))}
            </div>
          </div>
        </div>
      </div>
    </div>
  );
};

export default NFTModal;