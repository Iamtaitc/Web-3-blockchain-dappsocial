import "../../styles/home.css";
import newImage from "../../assets/pngtree-background-beautiful-wallpaper-image-picture-image_15491298.jpg";
import avtImage from "../../assets/default-avatar-profile-image-vector-social-media-user-icon-potrait-182347582.webp";
import boyImage from "../../assets/boy.jpg";
import sunsetImage from "../../assets/sun.jpg";
import seaImage from "../../assets/sea.jpeg";
import mountainImage from "../../assets/Mountain.jpg";
import cafeImage from "../../assets/cafe.webp";
import foodImage from "../../assets/food.jpg";
import dogImage from "../../assets/dog.jpg";
import { FaRegHeart, FaRegComment, FaHeart } from "react-icons/fa";
import { useEffect, useState } from "react";
import Lightbox from "yet-another-react-lightbox";
import "yet-another-react-lightbox/styles.css";
import NFTModal from "../../components/ModalNFT";

const Home = () => {
  const [isNFTModalOpen, setIsNFTModalOpen] = useState(false);
  const [selectedNFT, setSelectedNFT] = useState(null);
  const [isOpen, setIsOpen] = useState(false);
  const [photoIndex, setPhotoIndex] = useState(0);
  const [likedPosts, setLikedPosts] = useState<number[]>([]);
  const toggleLike = (postId: number) => {
    setLikedPosts((prev: number[]) =>
      prev.includes(postId) ? prev.filter((id) => id !== postId) : [...prev, postId]
    );
  };
   // Xử lý scroll khi modal mở/đóng
   useEffect(() => {
    if (isNFTModalOpen) {
      // Khi modal mở, vô hiệu hóa scroll của body
      document.body.style.overflow = "hidden";
    } else {
      // Khi modal đóng, khôi phục scroll
      document.body.style.overflow = "auto";
    }

    // Cleanup khi component unmount
    return () => {
      document.body.style.overflow = "auto";
    };
  }, [isNFTModalOpen]);
  const posts = [
    {
      id: 2,
      user: {
        username: "john_doe",
        avatar: boyImage,
      },
      time: "15 giờ",
      title: "Chuyến đi đáng nhớ!",
      images: [
        {
          src: boyImage,
          title: "Ngày đầu chuyến đi",
          likes: "6k",
          comments: [
            { user: "anna", text: "Nhìn vui quá!" },
            { user: "peter", text: "Đẹp lắm bạn ơi" },
            { user: "lily", text: "Cho mình xin địa điểm với" },
            { user: "anna", text: "Nhìn vui quá!" },
            { user: "peter", text: "Đẹp lắm bạn ơi" },
            { user: "lily", text: "Cho mình xin địa điểm với" }
          ]
        },
        {
          src: newImage,
          title: "Phong cảnh tuyệt đẹp",
          likes: "4k",
          comments: [
            { user: "mike", text: "Cảnh đẹp như tranh" },
            { user: "sara", text: "Thích quá đi" }
          ]
        }
      ],
      likes: "10k",
      comments: "15",
    },
    {
      id: 3,
      user: {
        username: "mary_jane",
        avatar: newImage,
      },
      time: "8 giờ",
      title: "Một góc phố cổ",
      images: [
        {
          src: newImage,
          title: "Góc phố yên bình",
          likes: "2k",
          comments: [
            { user: "tom", text: "Nhìn yên bình ghê" },
            { user: "jane", text: "Thích kiểu cổ kính thế này" }
          ]
        },
        {
          src: newImage,
          title: "Nhà cổ trăm năm",
          likes: "1.5k",
          comments: [
            { user: "kate", text: "Cổ kính quá" }
          ]
        },
        {
          src: newImage,
          title: "Chợ đêm phố cổ",
          likes: "1.5k",
          comments: [
            { user: "bob", text: "Đêm đẹp quá" },
            { user: "lucy", text: "Nhiều đồ ăn ngon không?" }
          ]
        }
      ],
      likes: "5k",
      comments: "8",
    },
    {
      id: 4,
      user: {
        username: "alex_99",
        avatar: sunsetImage,
      },
      time: "3 giờ",
      title: "Hoàng hôn trên biển",
      images: [
        {
          src: sunsetImage,
          title: "Mặt trời lặn",
          likes: "10k",
          comments: [
            { user: "emma", text: "Hoàng hôn đẹp quá!" },
            { user: "david", text: "Màu sắc tuyệt vời" },
            { user: "oliver", text: "Đỉnh cao nhiếp ảnh" }
          ]
        },
        {
          src: seaImage,
          title: "Biển chiều tà",
          likes: "8k",
          comments: [
            { user: "mia", text: "Thích biển quá" },
            { user: "jack", text: "Nhìn muốn đi biển liền" }
          ]
        }
      ],
      likes: "18k",
      comments: "32",
    },
    {
      id: 5,
      user: {
        username: "lisa_wanderlust",
        avatar: mountainImage,
      },
      time: "1 ngày",
      title: "Hành trình đến núi cao",
      images: [
        {
          src: mountainImage,
          title: "Đỉnh núi hùng vĩ",
          likes: "12k",
          comments: [
            { user: " sophia", text: "Chinh phục đỉnh núi luôn hả?" },
            { user: "ethan", text: "View đẹp quá" },
            { user: "chloe", text: "Mình cũng muốn leo núi" }
          ]
        }
      ],
      likes: "12k",
      comments: "20",
    },
    {
      id: 6,
      user: {
        username: "travel_with_me",
        avatar: cafeImage,
      },
      time: "5 giờ",
      title: "Check-in quán cà phê chill",
      images: [
        {
          src: cafeImage,
          title: "Góc quán yêu thích",
          likes: "4k",
          comments: [
            { user: "zoe", text: "Quán đẹp quá" },
            { user: "liam", text: "Chỗ này ở đâu vậy?" }
          ]
        },
        {
          src: cafeImage,
          title: "Ly cà phê sáng",
          likes: "4k",
          comments: [
            { user: "noah", text: "Cà phê ngon không?" },
            { user: "ava", text: "Nhìn chill thật" }
          ]
        }
      ],
      likes: "8k",
      comments: "12",
    },
    {
      id: 7,
      user: {
        username: "foodie_lover",
        avatar: foodImage,
      },
      time: "10 giờ",
      title: "Món ngon ngày cuối tuần",
      images: [
        {
          src: foodImage,
          title: "Bữa sáng thịnh soạn",
          likes: "8k",
          comments: [
            { user: "isabella", text: "Ngon quá bạn ơi" },
            { user: "mason", text: "Cho mình xin công thức" }
          ]
        },
        {
          src: foodImage,
          title: "Món tráng miệng",
          likes: "7k",
          comments: [
            { user: "harper", text: "Ngọt ngào quá" },
            { user: "logan", text: "Trông hấp dẫn thật" }
          ]
        }
      ],
      likes: "15k",
      comments: "22",
    },  
    {
      id: 8,
      user: {
        username: "pet_world",
        avatar: avtImage,
      },
      time: "12 giờ",
      title: "Bé cún đáng yêu của tôi",
      images: [
        {
          src: dogImage,
          title: "Chú cún nghịch ngợm",
          likes: "25k",
          comments: [
            { user: "amelia", text: "Dễ thương quá đi!" },
            { user: "james", text: "Cún cưng của bạn à?" },
            { user: "evelyn", text: "Muốn ôm nó quá" }
          ]
        }
      ],
      likes: "25k",
      comments: "40",
    },
];
  
  const allImages = posts.flatMap((post) => post.images.map((img) => img.src));

  return (
    <div className="container">
      <div className="left-panel">
        <div className="discover">
          <span>Khám phá</span>
          <span>Theo dõi</span>
        </div>
        <div className="Status">
            <div className="tl">
              <img src={avtImage} alt="avatar" className="avatar" />
              <p>Có gì mới ?</p>
            </div>
            <div className="bt">
              <button>Đăng</button>
            </div>
          </div>
        {posts.map((post) => (
        <div key={post.id} className="post">
          <div className="user-info">
            <img src={post.user.avatar} alt="avatar" className="avatar" />
            <div>
              <p className="username">{post.user.username}</p>
              <p className="time">{post.time}</p>
            </div>
          </div>
          <p className="post-title">{post.title}</p>

          {/* Hình ảnh bài đăng */}
          <div
              className={`image-container ${
                post.images.length === 2
                  ? "two"
                  : post.images.length === 3
                  ? "three"
                  : post.images.length === 4
                  ? "four"
                  : ""
              }`}
            >
             {post.images.map((img, index) => {
              return (
                <img
                key={index}
                src={img.src}
                alt="background"
                className="post-image"
                onClick={() => {
                  setSelectedNFT({
                    title: img.title,
                    price: Math.random().toFixed(5),
                    image: img.src,
                    likes: img.likes, // "6k", "4k",...
                    comments: img.comments, // [{ user, text }, ...]
                    user: post.user.username
                  });
                  setIsNFTModalOpen(true);
                }}
              />
              );
            })}
            </div>
         
          <div className="actions">
            <div className="icon-page">
            <span onClick={() => toggleLike(post.id)} style={{ cursor: "pointer" }}>
               {likedPosts.includes(post.id) ? (
                 <FaHeart style={{ color: "red", fontSize: "15px", transition: "color 0.3s ease-in-out" }} />
               ) : (
                 <FaRegHeart style={{ color: "gray", fontSize: "15px", transition: "color 0.3s ease-in-out" }} />
               )}{" "}
               {post.likes}
               </span>
            <span>
              <FaRegComment style={{ color: "gray", fontSize: "15px" }} /> {post.comments}
            </span>
            </div>
            <div className="nft-bt">
            <button className="buy-nft">Buy NFT</button>
            </div>
          </div>
        </div>))}
      </div>

      {/* Bảng bên phải */}
      <div className="right-panel ">
        <div className="balance">
          <p className="balance-amount">189.331.433 Dx</p>
          <div className="balance-checkin">
          <p className="checkin">Check In</p>
          <p className="day14">Day 14</p>
          <button className="claim-checkin">Claim</button>
          </div>
          <p className="farming">Farming 400 Dx/h</p>
          <button className="claim-farming">Claim</button>
        </div>
        <div className="referrals">
          <p>Referrals</p>
          <p>Refer users with your referral code to earn points.</p>
          <p>Total Referrals: 3</p>
          <button className="invite">Invite Friends now</button>
        </div>
      </div>
      <NFTModal
        isOpen={isNFTModalOpen}
        onClose={() => setIsNFTModalOpen(false)}
        nft={selectedNFT}
      />

      {/* Lightbox - Hiển thị ảnh khi bấm vào */}
      <Lightbox
        open={isOpen}
        close={() => setIsOpen(false)}
        slides={allImages.map((src) => ({ src }))} 
        index={photoIndex} 
      />
    </div>
  );
};

export default Home;
