"use client"

import type React from "react"

import { useState } from "react"
import { X, Send, Smile, Heart, Reply, MoreHorizontal } from "lucide-react"

export interface Comment {
  id: string | number
  user: string
  text: string
  likes: number
  isLiked?: boolean
  replies?: CommentReply[]
  replyTo?: string
}

export interface CommentReply {
  user: string
  text: string
}

export interface CommentModalProps {
  isOpen: boolean
  onClose: () => void
  comments: Comment[]
  postId: number
  onAddComment?: (postId: number, comment: { user: string; text: string; replyTo?: string }) => void
}

export default function CommentModal({ isOpen, onClose, comments, postId, onAddComment }: CommentModalProps) {
  const [newComment, setNewComment] = useState("")
  const [replyingTo, setReplyingTo] = useState<string | null>(null)
  const [likedComments, setLikedComments] = useState<Record<string, boolean>>({})

  if (!isOpen) return null

  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault()
    if (newComment.trim() === "") return

    if (onAddComment) {
      if (replyingTo) {
        onAddComment(postId, {
          user: "current_user",
          text: newComment,
          replyTo: replyingTo,
        })
      } else {
        onAddComment(postId, {
          user: "current_user",
          text: newComment,
        })
      }
    }

    setNewComment("")
    setReplyingTo(null)
  }

  const handleReply = (username: string, commentId: string | number) => {
    setReplyingTo(commentId.toString())
    setNewComment(`@${username} `)
    // Focus the input
    const inputElement = document.getElementById("comment-input")
    if (inputElement) {
      inputElement.focus()
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

  return (
    <div className="fixed inset-0 bg-black/50 flex items-center justify-center z-50" onClick={onClose}>
      <div
        className="bg-white rounded-lg w-full max-w-md max-h-[80vh] flex flex-col shadow-xl"
        onClick={handleModalClick}
      >
        <div className="flex items-center justify-between p-4 border-b">
          <h3 className="font-semibold text-lg">Bình luận</h3>
          <button onClick={onClose} className="text-gray-500 hover:text-gray-700 transition-colors">
            <X className="w-5 h-5" />
          </button>
        </div>

        <div className="flex-1 overflow-y-auto p-4 space-y-4">
          {comments && comments.length > 0 ? (
            comments.map((comment) => (
              <div key={comment.id} className="space-y-3">
                <div className="flex gap-3">
                  <div className="w-8 h-8 rounded-full bg-gray-200 flex-shrink-0 overflow-hidden">
                    {/* Placeholder avatar */}
                  </div>
                  <div className="flex-1">
                    <div className="bg-gray-100 rounded-lg p-3">
                      <p className="font-medium text-sm">{comment.user}</p>
                      <p className="text-sm text-gray-700">{comment.text}</p>
                    </div>

                    <div className="flex items-center gap-4 mt-1 text-xs text-gray-500">
                      <button
                        onClick={() => handleLike(comment.id)}
                        className={`flex items-center gap-1 hover:text-gray-700 ${
                          likedComments[comment.id.toString()] ? "text-red-500 hover:text-red-600" : ""
                        }`}
                      >
                        <Heart
                          className={`w-3.5 h-3.5 ${likedComments[comment.id.toString()] ? "fill-red-500" : ""}`}
                        />
                        Thích
                      </button>
                      <button
                        onClick={() => handleReply(comment.user, comment.id)}
                        className="flex items-center gap-1 hover:text-gray-700"
                      >
                        <Reply className="w-3.5 h-3.5" />
                        Trả lời
                      </button>
                      <span className="text-xs">
                        {comment.likes + (likedComments[comment.id.toString()] ? 1 : 0)} thích
                      </span>
                    </div>
                  </div>

                  <button className="text-gray-400 hover:text-gray-600 self-start">
                    <MoreHorizontal className="w-4 h-4" />
                  </button>
                </div>

                {/* Replies */}
                {comment.replies && comment.replies.length > 0 && (
                  <div className="ml-11 space-y-3">
                    {comment.replies.map((reply, replyIndex) => (
                      <div key={`${comment.id}-reply-${replyIndex}`} className="flex gap-3">
                        <div className="w-7 h-7 rounded-full bg-gray-200 flex-shrink-0 overflow-hidden">
                          {/* Placeholder avatar */}
                        </div>
                        <div className="flex-1">
                          <div className="bg-gray-100 rounded-lg p-2">
                            <p className="font-medium text-sm">{reply.user}</p>
                            <p className="text-sm text-gray-700">{reply.text}</p>
                          </div>

                          <div className="flex items-center gap-4 mt-1 text-xs text-gray-500">
                            <button className="flex items-center gap-1 hover:text-gray-700">
                              <Heart className="w-3 h-3" />
                              Thích
                            </button>
                            <button
                              onClick={() => handleReply(reply.user, comment.id)}
                              className="flex items-center gap-1 hover:text-gray-700"
                            >
                              <Reply className="w-3 h-3" />
                              Trả lời
                            </button>
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

        <form onSubmit={handleSubmit} className="border-t p-3">
          {replyingTo && (
            <div className="flex items-center justify-between px-3 py-1.5 mb-2 bg-gray-100 rounded-md">
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

          <div className="flex items-center gap-2">
            <button type="button" className="text-gray-500 hover:text-gray-700">
              <Smile className="w-5 h-5" />
            </button>
            <input
              id="comment-input"
              type="text"
              value={newComment}
              onChange={(e) => setNewComment(e.target.value)}
              placeholder="Viết bình luận..."
              className="flex-1 border rounded-full text-white px-4 py-2 text-sm focus:outline-none focus:border-blue-400"
            />
            <button
              type="submit"
              disabled={!newComment.trim()}
              className={`text-blue-500 ${!newComment.trim() ? "opacity-50 cursor-not-allowed" : "hover:text-blue-700"}`}
            >
              <Send className="w-5 h-5" />
            </button>
          </div>
        </form>
      </div>
    </div>
  )
}

