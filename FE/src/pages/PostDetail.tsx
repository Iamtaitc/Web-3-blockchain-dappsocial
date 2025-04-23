import React, { useEffect, useState } from 'react'
import { useParams, useNavigate } from 'react-router-dom'
import { MessageCircle, Flag, Share2 } from 'lucide-react'
import HeartButton from '../components/UI/HeartButton'
import BookmarkButton from '../components/UI/BookmarkButton'
import IPFSImage from '../components/UI/IPFSImage'
import { formatDate } from '../lib/utils'
import postApi, { type Post, type PostMention } from '../services/post.api'
import { toast } from 'react-hot-toast'

export default function PostDetail() {
  const { postId } = useParams<{ postId: string }>()
  const navigate = useNavigate()
  const [post, setPost] = useState<Post | null>(null)
  const [isLoading, setIsLoading] = useState(true)
  const [error, setError] = useState<string | null>(null)

  useEffect(() => {
    const fetchPostDetail = async () => {
      if (!postId) return

      try {
        setIsLoading(true)
        const response = await postApi.getPostById(postId)
        setPost(response.data.data)
      } catch (err) {
        console.error('Lỗi khi tải bài viết:', err)
        setError('Không thể tải bài viết. Vui lòng thử lại sau.')
        toast.error('Không thể tải bài viết')
      } finally {
        setIsLoading(false)
      }
    }

    fetchPostDetail()
  }, [postId])

  // Xử lý khi click vào mention
  const handleMentionClick = (mention: PostMention) => {
    navigate(`/user/${mention.walletAddress}`)
  }

  if (isLoading) {
    return (
      <div className="flex items-center justify-center min-h-[400px]">
        <div className="animate-spin rounded-full h-12 w-12 border-b-2 border-blue-500"></div>
      </div>
    )
  }

  if (error || !post) {
    return (
      <div className="flex flex-col items-center justify-center min-h-[400px] text-center">
        <h2 className="text-xl font-semibold text-gray-800 mb-2">
          {error || 'Không tìm thấy bài viết'}
        </h2>
        <p className="text-gray-600">Vui lòng kiểm tra lại đường dẫn hoặc thử lại sau.</p>
      </div>
    )
  }

  return (
    <div className="max-w-4xl mx-auto bg-white rounded-xl shadow-lg overflow-hidden">
      {/* Header */}
      <div className="p-6">
        <div className="flex items-center justify-between mb-4">
          <div className="flex items-center space-x-4">
            <img
              src="/placeholder.svg"
              alt="Avatar"
              className="w-12 h-12 rounded-full"
            />
            <div>
              <h2 className="text-lg font-semibold">{post.author}</h2>
              <p className="text-gray-500 text-sm">
                {formatDate(post.createdAt)}
              </p>
            </div>
          </div>
          
          <div className="flex items-center space-x-2">
            <BookmarkButton
              initialSaved={false}
              saveCount={post.saveCount}
              postId={post._id}
              onToggle={() => {}}
            />
            <button
              className="p-2 hover:bg-gray-100 rounded-full transition-colors"
              title="Chia sẻ bài viết"
            >
              <Share2 size={20} className="text-gray-600" />
            </button>
            <button
              className="p-2 hover:bg-gray-100 rounded-full transition-colors"
              title="Báo cáo bài viết"
            >
              <Flag size={20} className="text-gray-600" />
            </button>
          </div>
        </div>

        {/* Content */}
        <div className="space-y-4">
          {post.content && (
            <p className="text-gray-800 text-lg">{post.content}</p>
          )}

          {/* Tags và Mentions */}
          {(post.tags?.length > 0 || post.mentions?.length > 0) && (
            <div className="flex flex-wrap gap-2">
              {/* Tags */}
              {post.tags?.map((tag, index) => (
                <span
                  key={`tag-${index}`}
                  className="px-3 py-1 bg-blue-100 text-blue-800 rounded-full text-sm"
                >
                  #{tag}
                </span>
              ))}

              {/* Mentions */}
              {post.mentions?.map((mention, index) => (
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

          {/* Media */}
          {post.media && post.media.length > 0 && (
            <div className="grid gap-4 mt-4">
              {post.media.map((item, index) => (
                <div key={index} className="rounded-lg overflow-hidden">
                  <IPFSImage
                    hash={item.uri}
                    alt={`Hình ảnh ${index + 1}`}
                    className="w-full h-auto"
                  />
                </div>
              ))}
            </div>
          )}

          {/* Actions */}
          <div className="flex items-center justify-between pt-4 border-t mt-6">
            <div className="flex items-center space-x-6">
              <HeartButton
                initialLiked={false}
                likeCount={post.likeCount}
                postId={post._id}
                onToggle={() => {}}
              />
              <button className="flex items-center space-x-2 text-gray-600 hover:text-gray-800">
                <MessageCircle size={20} />
                <span>{post.commentCount}</span>
              </button>
            </div>
            <div className="text-gray-500 text-sm">
              {post.viewCount} lượt xem
            </div>
          </div>
        </div>
      </div>
    </div>
  )
}