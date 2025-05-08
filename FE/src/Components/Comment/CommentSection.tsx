"use client"

import type React from "react"

import { useState, useEffect, useRef } from "react"
import { Send, X, Heart, ImageIcon, ArrowLeft } from "lucide-react"
import commentApi, { type Comment, type CommentFetchOptions } from "../../services/commentApi"
import { useSelector } from "react-redux"
import type { RootState } from "../../store"
import { toast } from "react-hot-toast"
import { WalletLoginModal } from "../Login/wallet-login-modal"
import IPFSImage from "../UI/IPFSImage"
import CommentSkeleton from "./comment-skeleton"

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
  const [submitting, setSubmitting] = useState(false)
  const [replyingTo, setReplyingTo] = useState<Comment | null>(null)

  const fileInputRef = useRef<HTMLInputElement>(null)
  const commentContainerRef = useRef<HTMLDivElement>(null)
  const commentInputRef = useRef<HTMLInputElement>(null)

  const isAuthenticated = useSelector((state: RootState) => !!state.auth.token)
  const user = useSelector((state: RootState) => state.auth.user)

  // Tải comments khi component mount hoặc postId thay đổi
  useEffect(() => {
    if (isOpen && postId) {
      fetchComments()
    }
  }, [isOpen, postId])

  // Focus vào input khi mở comment section
  useEffect(() => {
    if (isOpen && commentInputRef.current) {
      setTimeout(() => {
        commentInputRef.current?.focus()
      }, 300)
    }
  }, [isOpen])

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

    if (!newComment.trim() && mediaFiles.length === 0) {
      toast.error("Vui lòng nhập nội dung hoặc đính kèm hình ảnh")
      return
    }

    try {
      setSubmitting(true)
      let result

      if (replyingTo) {
        // Trả lời comment
        result = await commentApi.replyToComment(replyingTo._id, newComment, mediaFiles)
        toast.success("Đã trả lời bình luận")

        // Cập nhật UI để hiển thị reply mới
        setComments((prev) =>
          prev.map((comment) =>
            comment._id === replyingTo._id
              ? { ...comment, stats: { ...comment.stats, replyCount: comment.stats.replyCount + 1 }, hasReplies: true }
              : comment,
          ),
        )

        setReplyingTo(null)
      } else {
        // Tạo comment mới
        result = await commentApi.createComment(postId, newComment, mediaFiles)

        // Thêm comment mới vào đầu danh sách
        setComments((prev) => [result, ...prev])
        toast.success("Đã thêm bình luận")
      }

      // Reset form
      setNewComment("")
      setMediaFiles([])
      setMediaPreview([])
    } catch (error) {
      console.error("Lỗi khi thêm bình luận:", error)
      toast.error("Không thể thêm bình luận")
    } finally {
      setSubmitting(false)
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

  // Xử lý khi người dùng muốn trả lời comment
  const handleReplyClick = (comment: Comment) => {
    if (!isAuthenticated) {
      setWalletLoginModalOpen(true)
      return
    }

    setReplyingTo(comment)
    setNewComment(`@${comment.authorDetails?.username || "user"} `)

    // Focus vào input
    setTimeout(() => {
      if (commentInputRef.current) {
        commentInputRef.current.focus()
      }
    }, 100)
  }

  // Hủy trả lời
  const cancelReply = () => {
    setReplyingTo(null)
    setNewComment("")
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
          <button className="close-button" onClick={onClose} aria-label="Đóng">
            <X size={20} />
          </button>
        </div>

        <div className="comment-form">
          <form onSubmit={handleSubmitComment}>
            {replyingTo && (
              <div className="replying-to">
                <div className="flex items-center gap-2">
                  <button type="button" onClick={cancelReply} className="cancel-reply">
                    <ArrowLeft size={16} />
                  </button>
                  <span>
                    Đang trả lời <strong>{replyingTo.authorDetails?.username || "người dùng"}</strong>
                  </span>
                </div>
              </div>
            )}

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
                  ref={commentInputRef}
                />

                <div className="input-actions">
                  <button
                    type="button"
                    className="attach-button"
                    onClick={() => fileInputRef.current?.click()}
                    aria-label="Đính kèm hình ảnh"
                  >
                    <ImageIcon size={20} />
                  </button>

                  <button
                    type="submit"
                    className="send-button"
                    disabled={(!newComment.trim() && mediaFiles.length === 0) || submitting}
                    aria-label="Gửi bình luận"
                  >
                    <Send size={20} />
                  </button>
                </div>
              </div>
            </div>

            {mediaPreview.length > 0 && (
              <div className="media-preview">
                {mediaPreview.map((url, index) => (
                  <div key={index} className="preview-item">
                    <button
                      type="button"
                      className="remove-preview"
                      onClick={() => removeFile(index)}
                      aria-label="Xóa hình ảnh"
                    >
                      <X size={16} />
                    </button>
                    <img src={url || "/placeholder.svg"} alt={`Preview ${index + 1}`} />
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
          {loading && page === 1 ? (
            <>
              <CommentSkeleton />
              <CommentSkeleton />
              <CommentSkeleton />
            </>
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
                        aria-label={comment.isLiked ? "Bỏ thích" : "Thích"}
                      >
                        <Heart size={16} className={comment.isLiked ? "text-red-500 fill-red-500" : ""} />
                        <span>{comment.stats.likeCount}</span>
                      </button>

                      <button className="reply-button" onClick={() => handleReplyClick(comment)} aria-label="Trả lời">
                        Trả lời
                      </button>

                      {comment.hasReplies && (
                        <button className="view-replies-button" aria-label="Xem trả lời">
                          Xem {comment.stats.replyCount} trả lời
                        </button>
                      )}
                    </div>
                  </div>
                </div>
              ))}

              {hasMore && (
                <button
                  className="load-more"
                  onClick={loadMoreComments}
                  disabled={loading}
                  aria-label="Tải thêm bình luận"
                >
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
