"use client"

import type React from "react"

import { useState, useRef, useEffect } from "react"
import { X, Send, Smile, ImageIcon, Paperclip, ThumbsUp, MessageCircle, ZoomIn, ZoomOut } from "lucide-react"

export interface Comment {
  id: string | number
  user: string
  avatar?: string
  text: string
  likes: number
  isLiked?: boolean
  time?: string
  replies?: CommentReply[]
  replyTo?: string
  image?: string
}

export interface CommentReply {
  id?: string | number
  user: string
  avatar?: string
  text: string
  time?: string
  likes?: number
  image?: string
}

export interface CommentModalProps {
  isOpen: boolean
  onClose: () => void
  comments: Comment[]
  postId: number
  postTitle?: string
  postImage?: string
  postContent?: string
  postAuthorAvatar?: string
  postTime?: string
  onAddComment?: (postId: number, comment: { user: string; text: string; replyTo?: string; image?: string }) => void
}

export default function CommentModal({
  isOpen,
  onClose,
  comments,
  postId,
  postTitle = "Bài viết",
  postImage,
  postContent,
  postAuthorAvatar,
  postTime,
  onAddComment,
}: CommentModalProps) {
  const [newComment, setNewComment] = useState("")
  const [replyingTo, setReplyingTo] = useState<string | null>(null)
  const [likedComments, setLikedComments] = useState<Record<string, boolean>>({})
  const [sortBy, setSortBy] = useState<"newest" | "relevant">("relevant")
  const modalRef = useRef<HTMLDivElement>(null)
  const inputRef = useRef<HTMLInputElement>(null)
  const [selectedImage, setSelectedImage] = useState("")
  const [showImagePreview, setShowImagePreview] = useState(false)
  const fileInputRef = useRef<HTMLInputElement>(null)

  // Lightbox state
  const [lightboxOpen, setLightboxOpen] = useState(false)
  const [lightboxImage, setLightboxImage] = useState("")
  const [lightboxZoomed, setLightboxZoomed] = useState(false)

  useEffect(() => {
    if (isOpen) {
      document.body.style.overflow = "hidden"
    } else {
      document.body.style.overflow = "auto"
    }
    return () => {
      document.body.style.overflow = "auto"
    }
  }, [isOpen])

  // Additional effect for lightbox
  useEffect(() => {
    const handleEsc = (e: KeyboardEvent) => {
      if (e.key === "Escape") {
        closeLightbox()
      }
    }

    if (lightboxOpen) {
      window.addEventListener("keydown", handleEsc)
    }

    return () => {
      window.removeEventListener("keydown", handleEsc)
    }
  }, [lightboxOpen])

  if (!isOpen) return null

  const handleImageSelect = (e: React.ChangeEvent<HTMLInputElement>) => {
    const file = e.target.files?.[0]
    if (file) {
      const reader = new FileReader()
      reader.onload = (e) => {
        const result = e.target?.result as string
        setSelectedImage(result)
        setShowImagePreview(true)
      }
      reader.readAsDataURL(file)
    }
  }

  const removeSelectedImage = () => {
    setSelectedImage("")
    setShowImagePreview(false)
    if (fileInputRef.current) {
      fileInputRef.current.value = ""
    }
  }

  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault()
    if (newComment.trim() === "" && !selectedImage) return

    if (onAddComment) {
      if (replyingTo) {
        onAddComment(postId, {
          user: "current_user",
          text: newComment,
          replyTo: replyingTo,
          image: selectedImage,
        })
      } else {
        onAddComment(postId, {
          user: "current_user",
          text: newComment,
          image: selectedImage,
        })
      }
    }

    setNewComment("")
    setSelectedImage("")
    setReplyingTo(null)
  }

  const handleReply = (username: string, commentId: string | number) => {
    setReplyingTo(commentId.toString())
    setNewComment(`@${username} `)
    // Focus the input
    if (inputRef.current) {
      inputRef.current.focus()
    }
  }

  const handleLike = (commentId: string | number) => {
    setLikedComments((prev) => ({
      ...prev,
      [commentId.toString()]: !prev[commentId.toString()],
    }))
  }

  // Prevent clicks inside the modal from closing it
  const handleModalClick = (e: React.MouseEvent) => {
    e.stopPropagation()
  }

  // Lightbox functions
  const openLightbox = (imageUrl: string) => {
    setLightboxImage(imageUrl)
    setLightboxOpen(true)
    setLightboxZoomed(false)
  }

  const closeLightbox = () => {
    setLightboxOpen(false)
    setLightboxImage("")
  }

  const toggleZoom = () => {
    setLightboxZoomed(!lightboxZoomed)
  }

  const username = postTitle?.replace("Bài viết của ", "") || "user"

  return (
    <div className="fixed inset-0 bg-black/50 flex items-center justify-center z-50" onClick={onClose}>
      <div
        ref={modalRef}
        className="bg-white rounded-lg w-full max-w-2xl max-h-[90vh] flex flex-col shadow-xl overflow-hidden"
        onClick={handleModalClick}
      >
        {/* Header - Exactly like Facebook */}
        <div className="flex items-center justify-center p-3 border-b relative">
          <h3 className="font-medium text-base">{postTitle}</h3>
          <button
            onClick={onClose}
            className="absolute right-3 top-3 bg-gray-200 rounded-full p-1 text-gray-600 hover:bg-gray-300 transition-colors"
          >
            <X className="w-5 h-5" />
          </button>
        </div>

        <div className="flex-1 overflow-y-auto">
          {/* Post content preview with image and text */}
          <div className="border-b">
            {/* Post author info */}
            <div className="p-4">
              <div className="flex items-center gap-3 mb-3">
                <div className="w-10 h-10 rounded-full bg-gray-200 flex-shrink-0 overflow-hidden">
                  {postAuthorAvatar ? (
                    <img
                      src={postAuthorAvatar || "/placeholder.svg"}
                      alt="Post author"
                      className="w-full h-full object-cover"
                    />
                  ) : (
                    <div className="w-full h-full flex items-center justify-center bg-blue-500 text-white font-bold">
                      {username.charAt(0).toUpperCase()}
                    </div>
                  )}
                </div>
                <div>
                  <p className="font-medium text-sm">{username}</p>
                  <p className="text-xs text-gray-500">Đã đăng công khai · {postTime || "Vừa xong"}</p>
                </div>
              </div>

              {/* Post content text */}
              {postContent && <p className="text-sm text-gray-700 mb-3">{postContent}</p>}
            </div>

            {/* Post image - Full width with click to open lightbox */}
            {postImage && (
              <div className="w-full cursor-pointer" onClick={() => openLightbox(postImage)}>
                <img src={postImage || "/placeholder.svg"} alt={postTitle} className="w-full object-contain" />
              </div>
            )}

            <div className="px-4 py-3">
              <div className="flex items-center justify-between">
                <div className="text-sm text-gray-500">{comments.length} bình luận</div>
              </div>
              <div className="flex justify-between mt-2 border-t pt-2">
                <button className="flex items-center justify-center gap-2 py-1 px-2 rounded-md hover:bg-gray-100 text-gray-600 flex-1">
                  <ThumbsUp className="w-5 h-5" />
                  <span className="text-sm font-medium">Thích</span>
                </button>
                <button className="flex items-center justify-center gap-2 py-1 px-2 rounded-md hover:bg-gray-100 text-gray-600 flex-1">
                  <MessageCircle className="w-5 h-5" />
                  <span className="text-sm font-medium">Bình luận</span>
                </button>
                <button className="flex items-center justify-center gap-2 py-1 px-2 rounded-md hover:bg-gray-100 text-emerald-600 flex-1">
                  <span className="text-sm font-medium">Buy NFT</span>
                </button>
              </div>
            </div>
          </div>

          {/* Sort options - Facebook style */}
          <div className="border-b px-3 py-2 flex items-center">
            <div className="flex items-center text-xs text-gray-600">
              <button
                className={`flex items-center gap-1 px-2 py-1 rounded-md ${
                  sortBy === "relevant" ? "font-medium text-blue-600" : "hover:bg-gray-100"
                }`}
                onClick={() => setSortBy("relevant")}
              >
                <span className="text-xs">Phù hợp nhất</span>
                <svg viewBox="0 0 20 20" width="16" height="16" fill="currentColor">
                  <path d="M10 14a1 1 0 0 1-.755-.349L5.329 9.182a1.367 1.367 0 0 1-.205-1.46A1.184 1.184 0 0 1 6.2 7h7.6a1.18 1.18 0 0 1 1.074.721 1.357 1.357 0 0 1-.2 1.457l-3.918 4.473A1 1 0 0 1 10 14z"></path>
                </svg>
              </button>
            </div>
          </div>

          {/* Comments section - Exact Facebook styling */}
          <div className="px-3 py-2 space-y-3 bg-gray-100">
            {comments && comments.length > 0 ? (
              comments.map((comment) => (
                <div key={comment.id} className="space-y-1">
                  <div className="flex items-start gap-2">
                    <div className="w-8 h-8 rounded-full bg-gray-200 flex-shrink-0 overflow-hidden">
                      {comment.avatar ? (
                        <img
                          src={comment.avatar || "/placeholder.svg"}
                          alt={comment.user}
                          className="w-full h-full object-cover"
                        />
                      ) : (
                        <div className="w-full h-full flex items-center justify-center bg-blue-500 text-white font-bold">
                          {comment.user.charAt(0).toUpperCase()}
                        </div>
                      )}
                    </div>
                    <div className="flex-1">
                      <div className="bg-white rounded-2xl px-3 py-2 shadow-sm inline-block max-w-[85%]">
                        <p className="font-semibold text-sm">{comment.user}</p>
                        <p className="text-sm text-gray-700">{comment.text}</p>
                        {comment.image && (
                          <div className="mt-2">
                            <img
                              src={comment.image || "/placeholder.svg"}
                              alt="Comment image"
                              className="rounded-lg max-h-[200px] w-auto object-contain cursor-pointer"
                              onClick={(e) => {
                                e.stopPropagation()
                                openLightbox(comment.image || "")
                              }}
                            />
                          </div>
                        )}
                      </div>
                      <div className="flex items-center gap-2 mt-1 ml-2 text-xs">
                        <button
                          onClick={() => handleLike(comment.id)}
                          className={`font-semibold ${
                            likedComments[comment.id.toString()] ? "text-blue-600" : "text-gray-500 hover:text-gray-700"
                          }`}
                        >
                          Thích
                        </button>
                        <button
                          onClick={() => handleReply(comment.user, comment.id)}
                          className="font-semibold text-gray-500 hover:text-gray-700"
                        >
                          Phản hồi
                        </button>
                        <span className="text-gray-500">{comment.time || "Vừa xong"}</span>

                        {(comment.likes > 0 || likedComments[comment.id.toString()]) && (
                          <div className="flex items-center ml-1">
                            <div className="bg-blue-500 rounded-full p-[3px] flex items-center justify-center">
                              <ThumbsUp className="w-[10px] h-[10px] text-white" />
                            </div>
                            <span className="ml-1 text-xs text-gray-500">
                              {comment.likes + (likedComments[comment.id.toString()] ? 1 : 0)}
                            </span>
                          </div>
                        )}
                      </div>
                    </div>
                  </div>

                  {/* Replies - Facebook style */}
                  {comment.replies && comment.replies.length > 0 && (
                    <div className="ml-10 space-y-1">
                      {comment.replies.map((reply, replyIndex) => (
                        <div key={reply.id || `${comment.id}-reply-${replyIndex}`} className="flex items-start gap-2">
                          <div className="w-8 h-8 rounded-full bg-gray-200 flex-shrink-0 overflow-hidden">
                            {reply.avatar ? (
                              <img
                                src={reply.avatar || "/placeholder.svg"}
                                alt={reply.user}
                                className="w-full h-full object-cover"
                              />
                            ) : (
                              <div className="w-full h-full flex items-center justify-center bg-green-500 text-white font-bold text-xs">
                                {reply.user.charAt(0).toUpperCase()}
                              </div>
                            )}
                          </div>
                          <div className="flex-1">
                            <div className="bg-white rounded-2xl px-3 py-2 shadow-sm inline-block max-w-[85%]">
                              <p className="font-semibold text-sm">{reply.user}</p>
                              <p className="text-sm text-gray-700">{reply.text}</p>
                              {reply.image && (
                                <div className="mt-2">
                                  <img
                                    src={reply.image || "/placeholder.svg"}
                                    alt="Reply image"
                                    className="rounded-lg max-h-[200px] w-auto object-contain cursor-pointer"
                                    onClick={(e) => {
                                      e.stopPropagation()
                                      openLightbox(reply.image || "")
                                    }}
                                  />
                                </div>
                              )}
                            </div>
                            <div className="flex items-center gap-2 mt-1 ml-2 text-xs">
                              <button className="font-semibold text-gray-500 hover:text-gray-700">Thích</button>
                              <button
                                onClick={() => handleReply(reply.user, comment.id)}
                                className="font-semibold text-gray-500 hover:text-gray-700"
                              >
                                Phản hồi
                              </button>
                              <span className="text-gray-500">{reply.time || "Vừa xong"}</span>

                              {reply.likes && reply.likes > 0 && (
                                <div className="flex items-center ml-1">
                                  <div className="bg-blue-500 rounded-full p-[3px] flex items-center justify-center">
                                    <ThumbsUp className="w-[10px] h-[10px] text-white" />
                                  </div>
                                  <span className="ml-1 text-xs text-gray-500">{reply.likes}</span>
                                </div>
                              )}
                            </div>
                          </div>
                        </div>
                      ))}
                    </div>
                  )}
                </div>
              ))
            ) : (
              <div className="text-center text-gray-500 py-6">
                Chưa có bình luận nào. Hãy là người đầu tiên bình luận!
              </div>
            )}
          </div>
        </div>

        {/* Comment input - Exact Facebook style */}
        <div className="p-2 bg-gray-100 border-t border-gray-200">
          {replyingTo && (
            <div className="flex items-center justify-between px-3 py-1.5 mb-2 bg-gray-200 rounded-md">
              <span className="text-xs text-gray-600">Đang trả lời bình luận</span>
              <button
                type="button"
                onClick={() => {
                  setReplyingTo(null)
                  setNewComment("")
                }}
                className="text-gray-500 hover:text-gray-700"
              >
                <X className="w-4 h-4" />
              </button>
            </div>
          )}

          <form onSubmit={handleSubmit} className="flex flex-col gap-2">
            {showImagePreview && selectedImage && (
              <div className="relative bg-gray-100 p-2 rounded-lg">
                <div className="flex items-start">
                  <img
                    src={selectedImage || "/placeholder.svg"}
                    alt="Selected image"
                    className="h-20 object-contain rounded-lg"
                  />
                  <button
                    type="button"
                    onClick={removeSelectedImage}
                    className="absolute top-1 right-1 bg-gray-800 bg-opacity-70 text-white rounded-full p-1"
                  >
                    <X className="w-4 h-4" />
                  </button>
                </div>
              </div>
            )}

            <div className="flex items-center gap-2">
              <div className="w-8 h-8 rounded-full bg-gray-200 flex-shrink-0 overflow-hidden">
                <div className="w-full h-full flex items-center justify-center bg-blue-500 text-white font-bold">U</div>
              </div>
              <div className="flex-1 flex items-center bg-white rounded-full px-3 py-1 border border-gray-300">
                <input
                  ref={inputRef}
                  type="text"
                  value={newComment}
                  onChange={(e) => setNewComment(e.target.value)}
                  placeholder="Viết bình luận..."
                  className="flex-1 bg-transparent text-sm focus:outline-none"
                />
                <div className="flex items-center gap-2 text-gray-400">
                  <button type="button" className="hover:text-gray-600">
                    <Smile className="w-5 h-5" />
                  </button>
                  <label className="cursor-pointer hover:text-gray-600">
                    <ImageIcon className="w-5 h-5" />
                    <input
                      ref={fileInputRef}
                      type="file"
                      accept="image/*"
                      onChange={handleImageSelect}
                      className="hidden"
                    />
                  </label>
                  <button type="button" className="hover:text-gray-600">
                    <Paperclip className="w-5 h-5" />
                  </button>
                </div>
              </div>
              {(newComment.trim() || selectedImage) && (
                <button type="submit" className="text-blue-500 hover:text-blue-600 p-1">
                  <Send className="w-5 h-5" />
                </button>
              )}
            </div>
          </form>
        </div>
      </div>

      {/* Lightbox for full-screen image view */}
            />
          </div>
        </div>
      )}
    </div>
  )
}
