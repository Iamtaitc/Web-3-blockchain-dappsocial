"use client"

import { useState, useEffect, useCallback } from "react"
import "../../styles/home.css"
import "../../styles/comment-section.css"
import avtImage from "../../assets/default-avatar-profile-image-vector-social-media-user-icon-potrait-182347582.webp"
import Nfttuimu from "../../assets/NFTtuimu.avif"
import HeartButton from "../../components/UI/HeartButton"
import CreatePostModal from "../../components/UI/CreatePostModal"
import { Flag, PlusCircle, RefreshCw, MessageCircle } from "lucide-react"
import { useNavigate } from "react-router-dom"
import InfiniteScroll from "../../components/infinite-scroll"
import PostSkeleton from "../../components/post-skeleton"
import { useSelector } from "react-redux"
import type { RootState } from "../../store"
import postApi, { type Post, type PostMention } from "../../services/post.api"
import IPFSImage from "../../components/UI/IPFSImage"
import BookmarkButton from "../../components/UI/BookmarkButton"
import { toast } from "react-hot-toast"
import { WalletLoginModal } from "../../components/Login/wallet-login-modal"
import CommentSection from "../../components/Comment/CommentSection"
import NFTButton from "../../components/NFT/UI/NFTButton"



const Home = () => {
  const navigate = useNavigate()
  const [createPostModalOpen, setCreatePostModalOpen] = useState(false)
  const [activeTab, setActiveTab] = useState<"discover" | "follow">("discover")
  const [apiPosts, setApiPosts] = useState<Post[]>([])
  const [isLoading, setIsLoading] = useState(true)
  const [isRefreshing, setIsRefreshing] = useState(false)
  const [hasMorePosts, setHasMorePosts] = useState(true)
  const [page, setPage] = useState(1)
  const [walletLoginModalOpen, setWalletLoginModalOpen] = useState(false)
  const [activeCommentPostId, setActiveCommentPostId] = useState<string | null>(null)

  // Kiểm tra trạng thái đăng nhập từ Redux store
  const isAuthenticated = useSelector((state: RootState) => !!state.auth.token)
  const user = useSelector((state: RootState) => state.auth.user)

  // Tải bài viết từ API
  const fetchPosts = useCallback(async (pageNum = 1, replace = true) => {
    try {
      if (replace) {
        setIsLoading(true)
      }

      const response = await postApi.getAllPosts(pageNum, 10)

      if (response.success && response.data) {
        let newPosts: Post[] = []

        // Kiểm tra cấu trúc dữ liệu trả về
        if (Array.isArray(response.data)) {
          newPosts = response.data
        } else if (response.data.posts && Array.isArray(response.data.posts)) {
          newPosts = response.data.posts
        }

        if (replace) {
          setApiPosts(newPosts)
        } else {
          setApiPosts((prev) => [...prev, ...newPosts])
        }

        setHasMorePosts(newPosts.length === 10)

        if (!replace) {
          setPage(pageNum)
        }
      } else {
        if (replace) {
          setApiPosts([])
        }
        setHasMorePosts(false)
      }
    } catch (error) {
      console.error("Lỗi khi tải bài viết:", error)
      toast.error("Không thể tải bài viết. Vui lòng thử lại sau.")
    } finally {
      setIsLoading(false)
      setIsRefreshing(false)
    }
  }, [])

  // Tải bài viết khi component mount hoặc khi tab thay đổi
  useEffect(() => {
    setPage(1)
    fetchPosts(1, true)
  }, [activeTab, fetchPosts])

  // Tải thêm bài viết khi cuộn xuống
  const loadMorePosts = async (): Promise<boolean> => {
    if (!hasMorePosts || isLoading) return false

    try {
      const nextPage = page + 1
      await fetchPosts(nextPage, false)
      return true
    } catch (error) {
      console.error("Lỗi khi tải thêm bài viết:", error)
      return false
    }
  }

  // Làm mới danh sách bài viết
  const handleRefresh = () => {
    if (isRefreshing) return
    setIsRefreshing(true)
    setPage(1)
    fetchPosts(1, true)
  }

  // Xử lý khi chuyển tab
  const handleTabChange = (tab: "discover" | "follow") => {
    if (tab === activeTab) return
    setActiveTab(tab)
    setPage(1)
    setApiPosts([])
    setHasMorePosts(true)
    setIsLoading(true)
  }

  // Xử lý khi nhấn nút đăng bài
  const handlePostButtonClick = () => {
    if (!isAuthenticated) {
      toast.error("Vui lòng đăng nhập để đăng bài")
      setWalletLoginModalOpen(true)
    } else {
      setCreatePostModalOpen(true)
    }
  }

  // Xử lý khi bài viết được tạo thành công
  const handlePostCreated = () => {
    toast.success("Đăng bài thành công!")
    handleRefresh()
  }

  // Xử lý khi click vào mention
  const handleMentionClick = (mention: PostMention) => {
    navigate(`/user/${mention.walletAddress}`)
  }

  // Xử lý thích bài viết
  const handleLikePost = async (postId: string, isLiked: boolean) => {
    if (!isAuthenticated) {
      toast.error("Vui lòng đăng nhập để thích bài viết")
      setWalletLoginModalOpen(true)
      return
    }

    try {
      // Cập nhật UI ngay lập tức (optimistic update)
      setApiPosts((posts) =>
        posts.map((post) =>
          post._id === postId
            ? {
                ...post,
                isLiked: !post.isLiked,
                likeCount: post.isLiked ? post.likeCount - 1 : post.likeCount + 1,
              }
            : post,
        ),
      )

      // Gọi API
      if (!isLiked) {
        await postApi.likePost(postId)
      } else {
        await postApi.unlikePost(postId)
      }
    } catch (error) {
      console.error("Lỗi khi thích/bỏ thích bài viết:", error)
      toast.error("Có lỗi xảy ra. Vui lòng thử lại.")

      // Khôi phục trạng thái nếu có lỗi
      fetchPosts(page, true)
    }
  }

  // Xử lý lưu bài viết
  const handleSavePost = async (postId: string, isSaved: boolean) => {
    if (!isAuthenticated) {
      toast.error("Vui lòng đăng nhập để lưu bài viết")
      setWalletLoginModalOpen(true)
      return
    }

    try {
      // Cập nhật UI ngay lập tức (optimistic update)
      setApiPosts((posts) =>
        posts.map((post) =>
          post._id === postId
            ? {
                ...post,
                isSaved: !post.isSaved,
                saveCount: post.isSaved ? post.saveCount - 1 : post.saveCount + 1,
              }
            : post,
        ),
      )

      // Gọi API
      if (!isSaved) {
        await postApi.savePost(postId)
      } else {
        await postApi.unsavePost(postId)
      }
    } catch (error) {
      console.error("Lỗi khi lưu/bỏ lưu bài viết:", error)
      toast.error("Có lỗi xảy ra. Vui lòng thử lại.")

      // Khôi phục trạng thái nếu có lỗi
      fetchPosts(page, true)
    }
  }

  // Xử lý báo cáo bài viết
  const handleReportPost = (postId: string) => {
    if (!isAuthenticated) {
      toast.error("Vui lòng đăng nhập để báo cáo bài viết")
      setWalletLoginModalOpen(true)
      return
    }

    // Hiển thị xác nhận báo cáo
    if (confirm("Bạn có chắc chắn muốn báo cáo bài viết này không?")) {
      // Trong thực tế, bạn sẽ gọi API để báo cáo bài viết
      toast.success("Cảm ơn bạn đã báo cáo. Chúng tôi sẽ xem xét bài viết này.")
    }
  }

  // Định dạng thời gian
  const formatTime = (dateString: string) => {
    const date = new Date(dateString)
    const now = new Date()
    const diffMs = now.getTime() - date.getTime()
    const diffSecs = Math.floor(diffMs / 1000)
    const diffMins = Math.floor(diffSecs / 60)
    const diffHours = Math.floor(diffMins / 60)
    const diffDays = Math.floor(diffHours / 24)

    if (diffSecs < 60) return "Vừa xong"
    if (diffMins < 60) return `${diffMins} phút trước`
    if (diffHours < 24) return `${diffHours} giờ trước`
    if (diffDays < 7) return `${diffDays} ngày trước`

    return date.toLocaleDateString("vi-VN")
  }

  // Xử lý khi click vào icon comment
  const handleCommentClick = (postId: string) => {
    setActiveCommentPostId(activeCommentPostId === postId ? null : postId)
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

            {/* Nút làm mới */}
            <button onClick={handleRefresh} className="refresh-button" disabled={isRefreshing} title="Làm mới">
              <RefreshCw size={18} className={`${isRefreshing ? "animate-spin" : ""}`} />
            </button>
          </div>
        </div>

        <div className="status-container">
          <div className="Status">
            <div className="tl">
              <img
                src={user?.avatarURI || avtImage || "/placeholder.svg?height=42&width=42"}
                alt="avatar"
                className="avatar"
              />
              <p>Có gì mới?</p>
            </div>
            <div className="bt">
              <button onClick={handlePostButtonClick} className="flex items-center gap-2 justify-center">
                <PlusCircle size={18} />
                <span>{isAuthenticated ? "Đăng Bài" : "Đăng nhập để đăng bài"}</span>
              </button>
            </div>
          </div>
        </div>

        <div className="posts-container">
          {isLoading ? (
            // Hiển thị skeleton loading khi đang tải
            <>
              <PostSkeleton />
              <PostSkeleton />
              <PostSkeleton />
            </>
          ) : apiPosts.length > 0 ? (
            // Hiển thị các bài viết từ API
            <div>
              {apiPosts.map((post) => (
                <div key={post._id} className="post">
                  {/* Thay đổi hiển thị username thay vì địa chỉ ví trong phần user-info */}
                  <div className="user-info">
                    <img
                      src={post.authorDetails?.avatarURI || avtImage || "/placeholder.svg?height=42&width=42"}
                      alt="avatar"
                      className="avatar"
                    />
                    <div className="user-details">
                      <p className="username">{post.authorDetails.username}</p>
                      <p className="time">{formatTime(post.createdAt)}</p>
                    </div>

                    {/* Nút lưu và báo cáo */}
                    <div className="flex items-center ml-auto gap-3">
                      <BookmarkButton
                        initialSaved={post.isSaved || false}
                        saveCount={post.saveCount}
                        postId={post._id}
                        onToggle={() => handleSavePost(post._id, post.isSaved || false)}
                      />
                      <button
                        onClick={() => handleReportPost(post._id)}
                        className="p-1.5 rounded-full hover:bg-gray-100 transition-colors"
                        title="Báo cáo bài viết"
                      >
                        <Flag size={18} className="text-gray-500" />
                      </button>
                    </div>
                  </div>

                  {/* Nội dung bài viết */}
                  {post.content && <p className="post-title">{post.content}</p>}

                  {/* Hiển thị tags và mentions */}
                  {(post.tags?.length > 0 || post.mentions?.length > 0) && (
                    <div className="flex flex-wrap gap-2 my-2">
                      {/* Tags */}
                      {post.tags &&
                        post.tags.length > 0 &&
                        post.tags.map((tag, index) => (
                          <span
                            key={`tag-${index}`}
                            className="px-2 py-1 text-xs bg-blue-100 text-blue-800 rounded-full hover:bg-blue-200 cursor-pointer transition-colors"
                          >
                            #{tag}
                          </span>
                        ))}

                      {/* Mentions */}
                      {post.mentions &&
                        post.mentions.length > 0 &&
                        post.mentions.map((mention, index) => (
                          <button
                            key={`mention-${index}`}
                            onClick={() => handleMentionClick(mention)}
                            className="px-3 py-1 bg-green-100 text-green-800 rounded-full text-sm hover:bg-green-200 transition-colors"
                          >
                            @{mention.username}
                          </button>
                        ))}
                    </div>
                  )}

                  {/* Hiển thị hình ảnh từ IPFS */}
                  {post.media && post.media.length > 0 && (
                    <div
                      className={`image-container ${
                        post.media.length === 2
                          ? "two"
                          : post.media.length === 3
                            ? "three"
                            : post.media.length === 4
                              ? "four"
                              : ""
                      }`}
                    >
                      {post.media.map((media, index) => (
                        <IPFSImage
                          key={index}
                          hash={media.uri}
                          alt={`Hình ảnh bài viết ${index + 1}`}
                          className="post-image"
                        />
                      ))}
                    </div>
                  )}

                  {/* Hiển thị hình ảnh từ contentURI nếu không có media */}
                  {(!post.media || post.media.length === 0) && post.contentURI && (
                    <div className="image-container">
                      <IPFSImage hash={post.contentURI} alt="Hình ảnh bài viết" className="post-image" />
                    </div>
                  )}

                  {/* Nút tương tác */}
                  <div className="actions">
                    <div className="icon-page">
                      <span className="like">
                        <HeartButton
                          initialLiked={post.isLiked || false}
                          likeCount={post.likeCount}
                          postId={post._id}
                          onToggle={() => handleLikePost(post._id, post.isLiked || false)}
                        />
                      </span>
                      <span className="comment" onClick={() => handleCommentClick(post._id)}>
                        <MessageCircle className="comment-icon" />
                        <span className="count">{post.commentCount}</span>
                      </span>
                    </div>
                    <div className="nft-bt">
                      {/* Thêm nút tạo NFT */}
                      <NFTButton 
                        postId={post._id} 
                        hasMedia={!!(post.media && post.media.length > 0)}
                      />
                      
                      {/* Nút mua NFT chỉ hiển thị khi bài viết có NFT đang bán */}
                      {post.nfts && post.nfts.some(nft => nft.forSale) && (
                        <button onClick={() => navigate(`/marketplace?postId=${post._id}`)} className="buy-nft">
                          MUA NFT
                        </button>
                      )}
                    </div>
                  </div>

                  {/* Hiển thị phần comments khi người dùng click vào icon comment */}
                  {activeCommentPostId === post._id && (
                    <CommentSection postId={post._id} isOpen={true} onClose={() => setActiveCommentPostId(null)} />
                  )}
                </div>
              ))}

              {/* Component InfiniteScroll để tải thêm bài viết */}
              <InfiniteScroll onLoadMore={loadMorePosts} hasMoreData={hasMorePosts} />
            </div>
          ) : (
            // Hiển thị trạng thái trống nếu không có bài viết
            <div className="empty-follow-state">
              <div className="empty-follow-content">
                <img
                  src={avtImage || "/placeholder.svg?height=120&width=120"}
                  alt="Trạng thái trống"
                  className="empty-follow-image"
                />
                <h3>Chưa có bài viết nào</h3>
                <p>
                  {activeTab === "follow"
                    ? "Hãy theo dõi những người dùng khác để xem bài viết của họ ở đây"
                    : "Chưa có bài viết nào trong hệ thống"}
                </p>
                {activeTab === "follow" && (
                  <button className="discover-more-btn" onClick={() => handleTabChange("discover")}>
                    Khám phá thêm
                  </button>
                )}
                {activeTab === "discover" && isAuthenticated && (
                  <button className="discover-more-btn" onClick={() => setCreatePostModalOpen(true)}>
                    Tạo bài viết đầu tiên
                  </button>
                )}
              </div>
            </div>
          )}
        </div>
      </div>

      {/* Bảng bên phải - đã được cập nhật để sticky khi cuộn */}
      <div className="right-panel">
        <div className="balance">
          <p className="balance-amount">189.331.433 Dx</p>
          <div className="balance-checkin">
            <p className="checkin">Điểm danh</p>
            <p className="day14">Ngày 14</p>
            <button className="claim-checkin">Nhận</button>
          </div>
          <p className="farming">🌱 Farming 400 Dx/h</p>
          <button className="claim-farming">Nhận</button>
        </div>

        <div className="referrals">
          <h3>Giới thiệu</h3>
          <p>Giới thiệu người dùng với mã giới thiệu của bạn để kiếm điểm.</p>
          <p className="total-referrals">
            Tổng: <span>3</span>
          </p>
          <button className="invite">Mời bạn bè</button>
        </div>

        <div className="nft-ad-card">
          <h3>🎁 Bốc Túi Mù NFT</h3>
          <p>Mở túi và nhận NFT hiếm!</p>
          <img src={Nfttuimu || "/placeholder.svg?height=80&width=80"} alt="Túi mù NFT" />
          <button className="explore-btn">Khám phá ngay</button>
        </div>
      </div>

      {/* Modal đăng bài */}
      <CreatePostModal
        isOpen={createPostModalOpen}
        onClose={() => setCreatePostModalOpen(false)}
        onPostCreated={handlePostCreated}
      />

      {/* Modal đăng nhập */}
      {walletLoginModalOpen && (
        <WalletLoginModal isOpen={walletLoginModalOpen} onClose={() => setWalletLoginModalOpen(false)} />
      )}
    </div>
  )
}

export default Home

