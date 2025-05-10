"use client"

import type React from "react"

import { useState } from "react"
import { MessageCircle } from "lucide-react"
import CommentSection from "./CommentSection"

interface PostWithCommentsProps {
  postId: string
  commentCount: number
  children: React.ReactNode
}

const PostWithComments: React.FC<PostWithCommentsProps> = ({ postId, commentCount, children }) => {
  const [showComments, setShowComments] = useState(false)

  const toggleComments = () => {
    setShowComments(!showComments)
  }

  return (
    <div className="post-with-comments">
      {children}

      <div className="post-actions">
        <span className="comment" onClick={toggleComments}>
          <MessageCircle className="comment-icon" />
          <span className="count">{commentCount}</span>
        </span>
      </div>

      {showComments && <CommentSection postId={postId} isOpen={showComments} onClose={() => setShowComments(false)} />}
    </div>
  )
}

export default PostWithComments
