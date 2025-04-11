"use client"

import "../../styles/home.css"
import avtImage from "../../assets/default-avatar-profile-image-vector-social-media-user-icon-potrait-182347582.webp"
import Nfttuimu from "../../assets/NFTtuimu.avif"
import { useState, useEffect } from "react"
import "yet-another-react-lightbox/styles.css"
import HeartButton from "../../components/UI/HeartButton"
import CommentModal, { type Comment } from "../../components/UI/CommentModal"
import { MessageCircle } from "lucide-react"
import { useNavigate } from "react-router-dom"
import { posts } from "../../data/posts"
import InfiniteScroll from "../../components/infinite-scroll"
import PostSkeleton from "../../components/post-skeleton"

const Home = () => {
  const navigate = useNavigate()
  const [commentModalOpen, setCommentModalOpen] = useState(false)
  const [selectedPostComments, setSelectedPostComments] = useState<Comment[]>([])
  const [selectedPostId, setSelectedPostId] = useState<number | null>(null)
  const [selectedPostTitle, setSelectedPostTitle] = useState<string>("")
  const [selectedPostImage, setSelectedPostImage] = useState<string>("")
  const [selectedPostContent, setSelectedPostContent] = useState<string>("")
  const [activeTab, setActiveTab] = useState<"discover" | "follow">("discover")
  const [displayedPosts, setDisplayedPosts] = useState<typeof posts>([])
  const [hasMorePosts, setHasMorePosts] = useState(true)
  const [isInitialLoading, setIsInitialLoading] = useState(true)
  const [page, setPage] = useState(1)
  const postsPerPage = 3
  const [selectedPostAuthorAvatar, setSelectedPostAuthorAvatar] = useState<string>("")
  const [selectedPostTime, setSelectedPostTime] = useState<string>("")

  // Lọc bài viết theo tab đang active
  const allFilteredPosts = activeTab === "discover" ? posts : posts.filter((post) => post.isFollowed)

  // Tải bài viết ban đầu
  useEffect(() => {
    // Giả lập việc tải dữ liệu ban đầu
    const timer = setTimeout(() => {
      const initialPosts = allFilteredPosts.slice(0, postsPerPage)
      setDisplayedPosts(initialPosts)
      setIsInitialLoading(false)
      setHasMorePosts(allFilteredPosts.length > postsPerPage)
    }, 1500)

    return () => clearTimeout(timer)
  }, [activeTab, allFilteredPosts])

  // Xử lý khi chuyển tab
  const handleTabChange = (tab: "discover" | "follow") => {
    setActiveTab(tab)
    setIsInitialLoading(true)
    setPage(1)
    setDisplayedPosts([])
    setHasMorePosts(true)
  }

  // Hàm tải thêm bài viết
  const loadMorePosts = async (): Promise<boolean> => {
    // Giả lập API call
    return new Promise((resolve) => {
      setTimeout(() => {
        const nextPage = page + 1
        const startIndex = page * postsPerPage
        const endIndex = nextPage * postsPerPage
        const newPosts = allFilteredPosts.slice(startIndex, endIndex)

        if (newPosts.length > 0) {
          setDisplayedPosts((prev) => [...prev, ...newPosts])
          setPage(nextPage)
          setHasMorePosts(endIndex < allFilteredPosts.length)
          resolve(true)
        } else {
          setHasMorePosts(false)
          resolve(false)
        }
      }, 1000)
    })
  }

  const handleOpenCommentModal = (postId: number) => {
    const post = posts.find((p) => p.id === postId)
    if (post) {
      setSelectedPostComments(post.commentsList || [])
      setSelectedPostId(postId)
      setSelectedPostTitle(`Bài viết của ${post.user.username}`)
      // Lấy hình ảnh đầu tiên của bài viết (nếu có)
      setSelectedPostImage(post.images && post.images.length > 0 ? post.images[0].src : "")
      // Lấy nội dung bài viết
      setSelectedPostContent(post.title || "")
      // Lấy avatar của người đăng bài
      setSelectedPostAuthorAvatar(post.user.avatar || "")
      // Lấy thời gian đăng bài
      setSelectedPostTime(post.time || "")
      setCommentModalOpen(true)
    }
  }

  // Update the handleAddComment function to support images in comments
  const handleAddComment = (
    postId: number,
    comment: { user: string; text: string; replyTo?: string; image?: string },
  ) => {
    // In a real application, you would update your state or make an API call here
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
                id: `reply-${Date.now()}`,
                user: comment.user,
                text: comment.text,
                time: "Vừa xong",
                likes: 0,
                image: comment.image, // Add the image to the reply
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
        time: "Vừa xong",
        replies: [],
        image: comment.image, // Add the image to the comment
      }
      setSelectedPostComments([...selectedPostComments, newComment])
    }
  }

  return (
    <div className="container">
      <div className="left-panel">
        <div className="tabs-container">
          <div className="discover">
            <span className={activeTab === "discover" ? "active" : ""} onClick={() => handleTabChange("discover")}>
              Khám phá
            </span>
            <span className={activeTab === "follow" ? "active" : ""} onClick={() => handleTabChange("follow")}>
              Theo dõi
            </span>
          </div>
        </div>

        <div className="status-container">
          <div className="Status">
            <div className="tl">
              <img src={avtImage || "/placeholder.svg"} alt="avatar" className="avatar" />
              <p>Có gì mới ?</p>
            </div>
            <div className="bt">
              <button>Đăng NFT</button>
            </div>
          </div>
        </div>

        <div className="posts-container">
          {isInitialLoading ? (
            // Hiển thị skeleton loading khi đang tải ban đầu
            <>
              <PostSkeleton />
              <PostSkeleton />
              <PostSkeleton />
            </>
          ) : displayedPosts.length > 0 ? (
            // Hiển thị các bài viết đã tải
            <>
              {displayedPosts.map((post) => (
                <div key={post.id} className="post">
                  <div className="user-info">
                    <img src={post.user.avatar || "/placeholder.svg"} alt="avatar" className="avatar" />
                    <div className="user-details">
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
                          alt="post image"
                          className="post-image"
                          onClick={() => handleOpenCommentModal(post.id)}
                        />
                      )
                    })}
                  </div>

                  <div className="actions">
                    <div className="icon-page">
                      <span className="like">
                        <HeartButton />
                        <span className="count">{post.likes}</span>
                      </span>
                      <span className="comment" onClick={() => handleOpenCommentModal(post.id)}>
                        <MessageCircle className="comment-icon" />
                        <span className="count">{post.comments}</span>
                      </span>
                    </div>
                    <div className="nft-bt">
                      <button onClick={() => navigate("/add-nft/nft-view")}
                      className="buy-nft">Buy NFT</button>
                    </div>
                  </div>
                </div>
              ))}

              {/* Component InfiniteScroll để tải thêm bài viết */}
              <InfiniteScroll onLoadMore={loadMorePosts} hasMoreData={hasMorePosts} />
            </>
          ) : (
            // Hiển thị trạng thái trống nếu không có bài viết
            <div className="empty-follow-state">
              <div className="empty-follow-content">
                <img src={avtImage || "/placeholder.svg"} alt="Empty state" className="empty-follow-image" />
                <h3>Chưa có bài viết nào</h3>
                <p>Hãy theo dõi những người dùng khác để xem bài viết của họ ở đây</p>
                <button className="discover-more-btn" onClick={() => handleTabChange("discover")}>
                  Khám phá thêm
                </button>
              </div>
            </div>
          )}
        </div>
      </div>

      {/* Bảng bên phải */}
      <div className="right-panel">
        <div className="balance">
          <p className="balance-amount">189.331.433 Dx</p>
          <div className="balance-checkin">
            <p className="checkin">Check In</p>
            <p className="day14">Day 14</p>
            <button className="claim-checkin">Claim</button>
          </div>
          <p className="farming">🌱 Farming 400 Dx/h</p>
          <button className="claim-farming">Claim</button>
        </div>

        <div className="referrals">
          <h3>Referrals</h3>
          <p>Refer users with your referral code to earn points.</p>
          <p className="total-referrals">
            Total: <span>3</span>
          </p>
          <button className="invite">Invite Friends</button>
        </div>

        <div className="nft-ad-card">
          <h3>🎁 Bốc Túi Mù NFT</h3>
          <p>Mở túi và nhận NFT hiếm!</p>
          <img src={Nfttuimu || "/placeholder.svg"} alt="NFT Mystery Box" />
          <button className="explore-btn">Khám phá ngay</button>
        </div>
      </div>

      {/* Comment Modal */}
      <CommentModal
        isOpen={commentModalOpen}
        onClose={() => setCommentModalOpen(false)}
        comments={selectedPostComments}
        postId={selectedPostId || 0}
        postTitle={selectedPostTitle}
        postImage={selectedPostImage}
        postContent={selectedPostContent}
        postAuthorAvatar={selectedPostAuthorAvatar}
        postTime={selectedPostTime}
        onAddComment={handleAddComment}
      />
    </div>
  )
}

export default Home
