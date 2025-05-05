"use client"

import type React from "react"

import { useState, useEffect, useRef } from "react"
import { Send, X, Heart, ImageIcon } from "lucide-react"
import commentApi, { type Comment, type CommentFetchOptions } from "../../services/commentApi"
import { useSelector } from "react-redux"
import type { RootState } from "../../store"
import { toast } from "react-hot-toast"
import { WalletLoginModal } from "../Login/wallet-login-modal"
import IPFSImage from "../UI/IPFSImage"

interface CommentSectionProps {
  postId: string
  isOpen: boolean
  onClose: () => void
}

const CommentSection: React.FC<CommentSectionProps> = ({ postId, isOpen, onClose }) => {
  const [comments, setComments] = useState<Comment[]>([])
  const [loading, setLoading] = useState(false)
  const [newComment, setNewComment] = useState("")
  const [mediaFiles, setMediaFiles] = useState<File[]>([])
  const [mediaPreview, setMediaPreview] = useState<string[]>([])
  const [page, setPage] = useState(1)
  const [hasMore, setHasMore] = useState(true)
  const [walletLoginModalOpen, setWalletLoginModalOpen] = useState(false)

  const fileInputRef = useRef<HTMLInputElement>(null)
  const commentContainerRef = useRef<HTMLDivElement>(null)

  const isAuthenticated = useSelector((state: RootState) => !!state.auth.token)
  const user = useSelector((state: RootState) => state.auth.user)

  // Tải comments khi component mount hoặc postId thay đổi
  useEffect(() => {
    if (isOpen && postId) {
      fetchComments()
    }
  }, [isOpen, postId])

  // Tải comments từ API
  const fetchComments = async (reset = true) => {
    if (!postId || loading) return

    try {
      setLoading(true)
      const pageToFetch = reset ? 1 : page

      const options: CommentFetchOptions = {
        page: pageToFetch,
        limit: 10,
        sort: "newest",
      }

      const response = await commentApi.getPostComments(postId, options)

      if (response.success) {
        if (reset) {
          setComments(response.data)
          setPage(1)
        } else {
          setComments((prev) => [...prev, ...response.data])
          setPage((prev) => prev + 1)
        }

        setHasMore(response.pagination?.hasNextPage || false)
      } else {
        toast.error("Không thể tải bình luận")
      }
    } catch (error) {
      console.error("Lỗi khi tải bình luận:", error)
      toast.error("Đã xảy ra lỗi khi tải bình luận")
    } finally {
      setLoading(false)
    }
  }

  // Tải thêm comments
  const loadMoreComments = () => {
    if (hasMore && !loading) {
      fetchComments(false)
    }
  }

  // Xử lý khi người dùng gửi comment mới
  const handleSubmitComment = async (e: React.FormEvent) => {
    e.preventDefault()

    if (!isAuthenticated) {
      setWalletLoginModalOpen(true)
      return
    }

    if (!newComment.trim()) {
      toast.error("Nội dung bình luận không được để trống")
      return
    }

    try {
      const result = await commentApi.createComment(postId, newComment, mediaFiles)

      // Thêm comment mới vào đầu danh sách
      setComments((prev) => [result, ...prev])

      // Reset form
      setNewComment("")
      setMediaFiles([])
      setMediaPreview([])

      toast.success("Đã thêm bình luận")
    } catch (error) {
      console.error("Lỗi khi thêm bình luận:", error)
      toast.error("Không thể thêm bình luận")
    }
  }

  // Xử lý khi người dùng chọn file
  const handleFileChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    const files = e.target.files
    if (!files) return

    // Giới hạn số lượng file (tối đa 2 file)
    if (mediaFiles.length + files.length > 2) {
      toast.error("Chỉ được đính kèm tối đa 2 file")
      return
    }

    // Xử lý từng file
    Array.from(files).forEach((file) => {
      // Kiểm tra loại file
      if (!file.type.startsWith("image/") && !file.type.startsWith("video/")) {
        toast.error("Chỉ hỗ trợ file hình ảnh và video")
        return
      }

      // Kiểm tra kích thước file (tối đa 10MB)
      if (file.size > 10 * 1024 * 1024) {
        toast.error("Kích thước file không được vượt quá 10MB")
        return
      }

      // Tạo URL preview
      const fileUrl = URL.createObjectURL(file)
      setMediaFiles((prev) => [...prev, file])
      setMediaPreview((prev) => [...prev, fileUrl])
    })

    // Reset input
    e.target.value = ""
  }

  // Xóa file đã chọn
  const removeFile = (index: number) => {
    setMediaFiles((prev) => prev.filter((_, i) => i !== index))
    setMediaPreview((prev) => {
      // Giải phóng URL object để tránh rò rỉ bộ nhớ
      URL.revokeObjectURL(prev[index])
      return prev.filter((_, i) => i !== index)
    })
  }

  // Xử lý khi người dùng thích comment
  const handleLikeComment = async (commentId: string, isLiked: boolean) => {
    if (!isAuthenticated) {
      setWalletLoginModalOpen(true)
      return
    }

    try {
      // Cập nhật UI ngay lập tức (optimistic update)
      setComments((prev) =>
        prev.map((comment) =>
          comment._id === commentId
            ? {
                ...comment,
                isLiked: !isLiked,
                stats: {
                  ...comment.stats,
                  likeCount: isLiked ? comment.stats.likeCount - 1 : comment.stats.likeCount + 1,
                },
              }
            : comment,
        ),
      )

      // Gọi API
      if (isLiked) {
        await commentApi.unlikeComment(commentId)
      } else {
        await commentApi.likeComment(commentId)
      }
    } catch (error) {
      console.error("Lỗi khi thích/bỏ thích bình luận:", error)
      toast.error("Có lỗi xảy ra khi thích/bỏ thích bình luận")

      // Khôi phục trạng thái nếu có lỗi
      fetchComments()
    }
  }

  // Format thời gian
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

  if (!isOpen) return null

  return (
    <div className="comment-section-wrapper">
      <div className="comment-section" ref={commentContainerRef}>
        <div className="comment-section-header">
          <h3>Bình luận ({comments.length})</h3>
          <button className="close-button" onClick={onClose}>
            <X size={20} />
          </button>
        </div>

        <div className="comment-form">
          <form onSubmit={handleSubmitComment}>
            <div className="input-container">
              <div className="avatar-container">
                <img
                  src={user?.avatarURI || "/placeholder.svg?height=40&width=40"}
                  alt="Avatar"
                  className="user-avatar"
                />
              </div>

              <div className="input-wrapper">
                <input
                  type="text"
                  placeholder="Viết bình luận..."
                  value={newComment}
                  onChange={(e) => setNewComment(e.target.value)}
                  className="comment-input"
                />

                <div className="input-actions">
                  <button type="button" className="attach-button" onClick={() => fileInputRef.current?.click()}>
                    <ImageIcon size={20} />
                  </button>

                  <button type="submit" className="send-button" disabled={!newComment.trim()}>
                    <Send size={20} />
                  </button>
                </div>
              </div>
            </div>

            {mediaPreview.length > 0 && (
              <div className="media-preview">
                {mediaPreview.map((url, index) => (
                  <div key={index} className="preview-item">
                    <button type="button" className="remove-preview" onClick={() => removeFile(index)}>
                      <X size={16} />
                    </button>
                    <img src={url || "/placeholder.svg?height=80&width=80"} alt={`Preview ${index + 1}`} />
                  </div>
                ))}
              </div>
            )}

            <input
              type="file"
              ref={fileInputRef}
              onChange={handleFileChange}
              accept="image/*,video/*"
              multiple
              className="hidden-input"
            />
          </form>
        </div>

        <div className="comments-list">
          {loading ? (
            <div className="loading">Đang tải bình luận...</div>
          ) : comments.length > 0 ? (
            <>
              {comments.map((comment) => (
                <div key={comment._id} className="comment">
                  <div className="comment-avatar">
                    <img
                      src={comment.authorDetails?.avatarURI || "/placeholder.svg?height=40&width=40"}
                      alt={comment.authorDetails?.username || "Avatar"}
                      className="avatar"
                    />
                  </div>

                  <div className="comment-content">
                    <div className="comment-header">
                      <span className="comment-username">
                        {comment.authorDetails?.username || "Người dùng"}
                        {comment.authorDetails?.isVerified && (
                          <span className="verified-badge" title="Đã xác thực">
                            ✓
                          </span>
                        )}
                      </span>
                      <span className="comment-time">{formatTime(comment.createdAt)}</span>
                    </div>

                    <div className="comment-text">{comment.content}</div>

                    {/* Hiển thị media */}
                    {comment.media && comment.media.length > 0 && (
                      <div className={`comment-media ${comment.media.length > 1 ? "multi" : ""}`}>
                        {comment.media.map((media, index) => (
                          <div key={index} className="media-item">
                            {media.type === "image" ? (
                              <IPFSImage hash={media.uri} alt={`Media ${index + 1}`} className="comment-image" />
                            ) : media.type === "video" ? (
                              <video src={media.uri} controls className="comment-video" />
                            ) : null}
                          </div>
                        ))}
                      </div>
                    )}

                    <div className="comment-actions">
                      <button
                        className={`like-button ${comment.isLiked ? "liked" : ""}`}
                        onClick={() => handleLikeComment(comment._id, comment.isLiked)}
                      >
                        <Heart size={16} className={comment.isLiked ? "text-red-500 fill-red-500" : ""} />
                        <span>{comment.stats.likeCount}</span>
                      </button>
                    </div>
                  </div>
                </div>
              ))}

              {hasMore && (
                <button className="load-more" onClick={loadMoreComments} disabled={loading}>
                  {loading ? "Đang tải..." : "Tải thêm bình luận"}
                </button>
              )}
            </>
          ) : (
            <div className="no-comments">Chưa có bình luận nào. Hãy là người đầu tiên bình luận!</div>
          )}
        </div>
      </div>

      {walletLoginModalOpen && (
        <WalletLoginModal isOpen={walletLoginModalOpen} onClose={() => setWalletLoginModalOpen(false)} />
      )}
    </div>
  )
}

export default CommentSection
