"use client"

import type React from "react"
import { useState, useEffect, useRef } from "react"
import { Send, X, ImageIcon, ArrowLeft } from "lucide-react"
import commentApi, { type Comment, type CommentFetchOptions } from "../../services/commentApi"
import { useSelector } from "react-redux"
import type { RootState } from "../../store"
import { toast } from "react-hot-toast"
import { WalletLoginModal } from "../Login/wallet-login-modal"
import IPFSImage from "../UI/IPFSImage"
import CommentSkeleton from "./comment-skeleton"
import { Avatar, AvatarImage, AvatarFallback } from "../profile/ui/avatar"
import Likecomment from "./Likecomment"

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
  const [replyComments, setReplyComments] = useState<{ [key: string]: Comment[] }>({})

  const fileInputRef = useRef<HTMLInputElement>(null)
  const commentContainerRef = useRef<HTMLDivElement>(null)
  const commentInputRef = useRef<HTMLInputElement>(null)

  const isAuthenticated = useSelector((state: RootState) => !!state.auth.token)
  const user = useSelector((state: RootState) => state.auth.user)

  useEffect(() => {
    if (isOpen && postId) {
      fetchComments()
    }
  }, [isOpen, postId])

  useEffect(() => {
    if (isOpen && commentInputRef.current) {
      setTimeout(() => {
        commentInputRef.current?.focus()
      }, 300)
    }
  }, [isOpen])

  const fetchComments = async (reset = true) => {
    if (!postId || loading) return

    try {
      setLoading(true)
      const pageToFetch = reset ? 1 : page
      const options: CommentFetchOptions = { page: pageToFetch, limit: 10, sort: "newest" }
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
        toast.error("Không thể tải bình luận") // Fixed: Only message argument
      }
    } catch (error) {
      console.error("Lỗi khi tải bình luận:", error)
      toast.error("Đã xảy ra lỗi khi tải bình luận") // Fixed: Only message argument
    } finally {
      setLoading(false)
    }
  }

  const loadMoreComments = () => {
    if (hasMore && !loading) {
      fetchComments(false)
    }
  }

  const fetchReplies = async (commentId: string) => {
    try {
      const response = await commentApi.getCommentReplies(commentId)
      if (response.success) {
        setReplyComments((prev) => ({ ...prev, [commentId]: response.data }))
      }
    } catch (error) {
      console.error("Lỗi khi tải phản hồi:", error)
      toast.error("Không thể tải phản hồi")
    }
  }

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
        result = await commentApi.replyToComment(replyingTo._id, newComment, mediaFiles)
        toast.success("Đã trả lời bình luận")
        setComments((prev) =>
          prev.map((comment) =>
            comment._id === replyingTo._id
              ? { ...comment, stats: { ...comment.stats, replyCount: comment.stats.replyCount + 1 }, hasReplies: true }
              : comment
          )
        )
        fetchReplies(replyingTo._id)
        setReplyingTo(null)
      } else {
        result = await commentApi.createComment(postId, newComment, mediaFiles)
        const newCommentData: Comment = {
          ...result,
          stats: result.stats ?? { likeCount: 0, replyCount: 0 },
          isLiked: result.isLiked ?? false,
          hasReplies: result.hasReplies ?? false,
          media: result.media ?? [],
        }
        setComments((prev) => [newCommentData, ...prev])
        toast.success("Đã thêm bình luận")
      }
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

  const handleFileChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    const files = e.target.files
    if (!files) return
    if (mediaFiles.length + files.length > 2) {
      toast.error("Chỉ được đính kèm tối đa 2 file")
      return
    }
    Array.from(files).forEach((file) => {
      if (!file.type.startsWith("image/") && !file.type.startsWith("video/")) {
        toast.error("Chỉ hỗ trợ file hình ảnh và video")
        return
      }
      if (file.size > 10 * 1024 * 1024) {
        toast.error("Kích thước file không được vượt quá 10MB")
        return
      }
      const fileUrl = URL.createObjectURL(file)
      setMediaFiles((prev) => [...prev, file])
      setMediaPreview((prev) => [...prev, fileUrl])
    })
    e.target.value = ""
  }

  const removeFile = (index: number) => {
    setMediaFiles((prev) => prev.filter((_, i) => i !== index))
    setMediaPreview((prev) => {
      URL.revokeObjectURL(prev[index])
      return prev.filter((_, i) => i !== index)
    })
  }

  const handleReplyClick = (comment: Comment) => {
    if (!isAuthenticated) {
      setWalletLoginModalOpen(true)
      return
    }
    setReplyingTo(comment)
    setNewComment(`@${comment.authorDetails?.username || "user"} `)
    setTimeout(() => commentInputRef.current?.focus(), 100)
  }

  const cancelReply = () => {
    setReplyingTo(null)
    setNewComment("")
  }

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

  // Recursive component to render comments and their replies
  const RenderComment: React.FC<{ comment: Comment; level?: number }> = ({ comment, level = 0 }) => {
    const replies = replyComments[comment._id] || [];

    return (
      <div className={`comment level-${level}`} style={{ marginLeft: `${level * 20}px` }}>
        <div className="comment-avatar">
          <Avatar>
            <AvatarImage
              src={comment.authorDetails?.avatarURI || ""}
              alt={comment.authorDetails?.username || "Avatar"}
              className="avatar"
            />
            <AvatarFallback username={comment.authorDetails?.username || "Người dùng"} />
          </Avatar>
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
            <Likecomment
              commentId={comment._id}
              initialIsLiked={comment.isLiked}
              initialLikeCount={comment.stats.likeCount}
              onLikeToggle={(newIsLiked, newLikeCount) =>
                setComments((prev) =>
                  prev.map((c) =>
                    c._id === comment._id
                      ? { ...c, isLiked: newIsLiked, stats: { ...c.stats, likeCount: newLikeCount } }
                      : c
                  )
                )
              }
            />
            <button className="reply-button" onClick={() => handleReplyClick(comment)} aria-label="Trả lời">
              Trả lời
            </button>
            {comment.hasReplies && !replies.length && (
              <button
                className="view-replies-button"
                onClick={() => fetchReplies(comment._id)}
                aria-label="Xem trả lời"
              >
                Xem {comment.stats.replyCount} trả lời
              </button>
            )}
          </div>
          {replies.length > 0 && (
            <div className="replies">
              {replies.map((reply) => (
                <RenderComment key={reply._id} comment={reply} level={level + 1} />
              ))}
            </div>
          )}
        </div>
      </div>
    )
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
                <Avatar>
                  <AvatarImage
                    src={user?.avatarURI || ""}
                    alt="Avatar"
                    className="user-avatar"
                  />
                  <AvatarFallback username={user?.username || "User"} />
                </Avatar>
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
                <RenderComment key={comment._id} comment={comment} />
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