"use client"

import "../../styles/home.css"
import newImage from "../../assets/pngtree-background-beautiful-wallpaper-image-picture-image_15491298.jpg"
import avtImage from "../../assets/default-avatar-profile-image-vector-social-media-user-icon-potrait-182347582.webp"
import boyImage from "../../assets/boy.jpg"
import sunsetImage from "../../assets/sun.jpg"
import seaImage from "../../assets/sea.jpeg"
import mountainImage from "../../assets/Mountain.jpg"
import cafeImage from "../../assets/cafe.webp"
import foodImage from "../../assets/food.jpg"
import dogImage from "../../assets/dog.jpg"
import Nfttuimu from "../../assets/NFTtuimu.avif"
import { useEffect, useState } from "react"
// import Lightbox from "yet-another-react-lightbox"
import "yet-another-react-lightbox/styles.css"
// import NFTModal from "../../components/NFT/ModalNFT"
import HeartButton from "../../components/UI/HeartButton"
import CommentModal, { type Comment } from "../../components/UI/CommentModal"
import { MessageCircle } from "lucide-react"
import { useNavigate } from "react-router-dom"

// interface NFT {
//   title: string
//   price: string
//   image: string
//   likes: string
//   comments: Array<{ user: string; text: string }>
//   user: string
// }

interface PostImage {
  src: string
  title: string
  likes: string
  comments: Array<{ user: string; text: string }>
}

interface Post {
  id: number
  user: {
    username: string
    avatar: string
  }
  time: string
  title: string
  images: PostImage[]
  likes: string
  comments: string
  commentsList: Comment[]
}

const Home = () => {
  const navigate = useNavigate()
  // const [isNFTModalOpen, setIsNFTModalOpen] = useState(false)
  // const [selectedNFT, setSelectedNFT] = useState<NFT | null>(null)
  // const [isOpen, setIsOpen] = useState(false)
  // const [photoIndex, setPhotoIndex] = useState(0)
  const [commentModalOpen, setCommentModalOpen] = useState(false)
  const [selectedPostComments, setSelectedPostComments] = useState<Comment[]>([])
  const [selectedPostId, setSelectedPostId] = useState<number | null>(null)

  // Xử lý scroll khi modal mở/đóng
  // useEffect(() => {
  //   if (isNFTModalOpen || commentModalOpen) {
  //     // Khi modal mở, vô hiệu hóa scroll của body
  //     document.body.style.overflow = "hidden"
  //   } else {
  //     // Khi modal đóng, khôi phục scroll
  //     document.body.style.overflow = "auto"
  //   }

  //   // Cleanup khi component unmount
  //   return () => {
  //     document.body.style.overflow = "auto"
  //   }
  // }, [isNFTModalOpen, commentModalOpen])

  const posts: Post[] = [
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
            { user: "lily", text: "Cho mình xin địa điểm với" },
          ],
        },
        {
          src: newImage,
          title: "Phong cảnh tuyệt đẹp",
          likes: "4k",
          comments: [
            { user: "mike", text: "Cảnh đẹp như tranh" },
            { user: "sara", text: "Thích quá đi" },
          ],
        },
      ],
      likes: "10k",
      comments: "15",
      commentsList: [
        {
          id: "c1",
          user: "anna",
          text: "Nhìn vui quá!",
          likes: 5,
          replies: [{ user: "john_doe", text: "Cảm ơn bạn! Chuyến đi rất vui" }],
        },
        { id: "c2", user: "peter", text: "Đẹp lắm bạn ơi", likes: 3 },
        { id: "c3", user: "lily", text: "Cho mình xin địa điểm với", likes: 2 },
        { id: "c4", user: "mike", text: "Cảnh đẹp như tranh", likes: 7 },
        { id: "c5", user: "sara", text: "Thích quá đi", likes: 1 },
      ],
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
            { user: "jane", text: "Thích kiểu cổ kính thế này" },
          ],
        },
        {
          src: newImage,
          title: "Nhà cổ trăm năm",
          likes: "1.5k",
          comments: [{ user: "kate", text: "Cổ kính quá" }],
        },
        {
          src: newImage,
          title: "Chợ đêm phố cổ",
          likes: "1.5k",
          comments: [
            { user: "bob", text: "Đêm đẹp quá" },
            { user: "lucy", text: "Nhiều đồ ăn ngon không?" },
          ],
        },
      ],
      likes: "5k",
      comments: "8",
      commentsList: [
        {
          id: "c6",
          user: "tom",
          text: "Nhìn yên bình ghê",
          likes: 4,
          replies: [{ user: "mary_jane", text: "Đúng vậy, rất yên bình" }],
        },
        { id: "c7", user: "jane", text: "Thích kiểu cổ kính thế này", likes: 2 },
        { id: "c8", user: "kate", text: "Cổ kính quá", likes: 1 },
        { id: "c9", user: "bob", text: "Đêm đẹp quá", likes: 3 },
        { id: "c10", user: "lucy", text: "Nhiều đồ ăn ngon không?", likes: 0 },
      ],
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
            { user: "oliver", text: "Đỉnh cao nhiếp ảnh" },
          ],
        },
        {
          src: seaImage,
          title: "Biển chiều tà",
          likes: "8k",
          comments: [
            { user: "mia", text: "Thích biển quá" },
            { user: "jack", text: "Nhìn muốn đi biển liền" },
          ],
        },
      ],
      likes: "18k",
      comments: "32",
      commentsList: [
        {
          id: "c11",
          user: "emma",
          text: "Hoàng hôn đẹp quá!",
          likes: 12,
          replies: [
            { user: "alex_99", text: "Cảm ơn bạn!" },
            { user: "visitor", text: "Đồng ý, đẹp tuyệt vời" },
          ],
        },
        { id: "c12", user: "david", text: "Màu sắc tuyệt vời", likes: 8 },
        { id: "c13", user: "oliver", text: "Đỉnh cao nhiếp ảnh", likes: 6 },
        { id: "c14", user: "mia", text: "Thích biển quá", likes: 5 },
        { id: "c15", user: "jack", text: "Nhìn muốn đi biển liền", likes: 4 },
      ],
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
            { user: "chloe", text: "Mình cũng muốn leo núi" },
          ],
        },
      ],
      likes: "12k",
      comments: "20",
      commentsList: [
        { id: "c16", user: "sophia", text: "Chinh phục đỉnh núi luôn hả?", likes: 7 },
        { id: "c17", user: "ethan", text: "View đẹp quá", likes: 9 },
        {
          id: "c18",
          user: "chloe",
          text: "Mình cũng muốn leo núi",
          likes: 5,
          replies: [{ user: "lisa_wanderlust", text: "Đi cùng mình lần sau nhé!" }],
        },
      ],
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
            { user: "liam", text: "Chỗ này ở đâu vậy?" },
          ],
        },
        {
          src: cafeImage,
          title: "Ly cà phê sáng",
          likes: "4k",
          comments: [
            { user: "noah", text: "Cà phê ngon không?" },
            { user: "ava", text: "Nhìn chill thật" },
          ],
        },
      ],
      likes: "8k",
      comments: "12",
      commentsList: [
        { id: "c19", user: "zoe", text: "Quán đẹp quá", likes: 3 },
        {
          id: "c20",
          user: "liam",
          text: "Chỗ này ở đâu vậy?",
          likes: 2,
          replies: [{ user: "travel_with_me", text: "Ở phố Nguyễn Huệ bạn nhé" }],
        },
        { id: "c21", user: "noah", text: "Cà phê ngon không?", likes: 1 },
        { id: "c22", user: "ava", text: "Nhìn chill thật", likes: 4 },
      ],
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
            { user: "mason", text: "Cho mình xin công thức" },
          ],
        },
        {
          src: foodImage,
          title: "Món tráng miệng",
          likes: "7k",
          comments: [
            { user: "harper", text: "Ngọt ngào quá" },
            { user: "logan", text: "Trông hấp dẫn thật" },
          ],
        },
      ],
      likes: "15k",
      comments: "22",
      commentsList: [
        { id: "c23", user: "isabella", text: "Ngon quá bạn ơi", likes: 6 },
        {
          id: "c24",
          user: "mason",
          text: "Cho mình xin công thức",
          likes: 8,
          replies: [{ user: "foodie_lover", text: "Mình sẽ gửi cho bạn sau nhé" }],
        },
        { id: "c25", user: "harper", text: "Ngọt ngào quá", likes: 3 },
        { id: "c26", user: "logan", text: "Trông hấp dẫn thật", likes: 5 },
      ],
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
            { user: "evelyn", text: "Muốn ôm nó quá" },
          ],
        },
      ],
      likes: "25k",
      comments: "40",
      commentsList: [
        { id: "c27", user: "amelia", text: "Dễ thương quá đi!", likes: 15 },
        {
          id: "c28",
          user: "james",
          text: "Cún cưng của bạn à?",
          likes: 7,
          replies: [{ user: "pet_world", text: "Đúng rồi, mình nuôi được 2 năm rồi" }],
        },
        { id: "c29", user: "evelyn", text: "Muốn ôm nó quá", likes: 9 },
      ],
    },
  ]

  const allImages = posts.flatMap((post) => post.images.map((img) => img.src))

  const handleOpenCommentModal = (postId: number) => {
    const post = posts.find((p) => p.id === postId)
    if (post) {
      setSelectedPostComments(post.commentsList || [])
      setSelectedPostId(postId)
      setCommentModalOpen(true)
    }
  }

  const handleAddComment = (postId: number, comment: { user: string; text: string; replyTo?: string }) => {
    // In a real app, you would update your state or make an API call here
    console.log(`Adding comment to post ${postId}:`, comment)

    // For demo purposes, we'll just add it to the local state
    if (comment.replyTo) {
      // This is a reply to an existing comment
      const updatedComments = selectedPostComments.map((existingComment) => {
        if (existingComment.id === comment.replyTo) {
          return {
            ...existingComment,
            replies: [
              ...(existingComment.replies || []),
              {
                user: comment.user,
                text: comment.text,
              },
            ],
          }
        }
        return existingComment
      })
      setSelectedPostComments(updatedComments)
    } else {
      // This is a new top-level comment
      const newComment: Comment = {
        id: `new-${Date.now()}`,
        user: comment.user,
        text: comment.text,
        likes: 0,
        replies: [],
      }
      setSelectedPostComments([...selectedPostComments, newComment])
    }
  }

  return (
    <div className="container">
      <div className="left-panel">
        <div className="discover">
          <span>Khám phá</span>
          <span>Theo dõi</span>
        </div>
        <div className="Status">
          <div className="tl">
            <img src={avtImage || "/placeholder.svg"} alt="avatar" className="avatar" />
            <p>Có gì mới ?</p>
          </div>
          <div className="bt">
            <button>Đăng</button>
          </div>
        </div>
        {posts.map((post) => (
          <div key={post.id} className="post">
            <div className="user-info">
              <img src={post.user.avatar || "/placeholder.svg"} alt="avatar" className="avatar" />
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
                    src={img.src || "/placeholder.svg"}
                    alt="background"
                    className="post-image"
                    onClick={() => navigate("/add-nft/nft-view")}
                  />
                )
              })}
            </div>

            <div className="actions">
              <div className="icon-page">
                <span className="like">
                  <HeartButton />
                  {post.likes}
                </span>
                <span className="comment" onClick={() => handleOpenCommentModal(post.id)} style={{ cursor: "pointer" }}>
                  <MessageCircle
                    className="comment-icon"
                    style={{
                      color: "#6b7280",
                      width: "20px",
                      height: "20px",
                      transition: "transform 0.2s, color 0.2s",
                    }}
                    onMouseOver={(e) => {
                      e.currentTarget.style.transform = "scale(1.1)"
                      e.currentTarget.style.color = "#4b5563"
                    }}
                    onMouseOut={(e) => {
                      e.currentTarget.style.transform = "scale(1)"
                      e.currentTarget.style.color = "#6b7280"
                    }}
                  />
                  {post.comments}
                </span>
              </div>
              <div className="nft-bt">
                <button className="buy-nft">Buy NFT</button>
              </div>
            </div>
          </div>
        ))}
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
        <div className="nft-ad-card">
          <h3>🎁 Bốc Túi Mù NFT</h3>
          <p>Mở túi và nhận NFT hiếm! Sưu tầm & giao dịch ngay.</p>
          <img src={Nfttuimu || "/placeholder.svg"} alt="NFT Mystery Box" />
          <button className="explore-btn">Khám phá ngay</button>
        </div>
      </div>

      {/* NFT Modal */}
      {/* <NFTModal isOpen={isNFTModalOpen} onClose={() => setIsNFTModalOpen(false)} nft={selectedNFT} /> */}

      {/* Comment Modal */}
      <CommentModal
        isOpen={commentModalOpen}
        onClose={() => setCommentModalOpen(false)}
        comments={selectedPostComments}
        postId={selectedPostId || 0}
        onAddComment={handleAddComment}
      />

      {/* Lightbox - Hiển thị ảnh khi bấm vào */}
      {/* <Lightbox
        open={isOpen}
        close={() => setIsOpen(false)}
        slides={allImages.map((src) => ({ src }))}
        index={photoIndex}
      /> */}
    </div>
  )
}

export default Home

