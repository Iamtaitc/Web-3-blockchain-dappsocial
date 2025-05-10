import instance from "./instance"

// Interface cho các tham số tùy chọn khi lấy bình luận
export interface CommentFetchOptions {
  page?: number
  limit?: number
  sort?: "newest" | "oldest" | "popular"
}

// Interface cho dữ liệu bình luận
export interface CommentUser {
  username: string
  avatarURI: string | null
  isVerified: boolean
}

export interface CommentMedia {
  type: string
  uri: string
  mimeType: string
}

export interface Comment {
  _id: string
  postId: string
  parentId: string | null
  depth: number
  author: string
  authorDetails: CommentUser
  content: string
  contentURI: string | null
  media: CommentMedia[]
  stats: {
    likeCount: number
    replyCount: number
  }
  isLiked: boolean
  hasReplies: boolean
  createdAt: string
  updatedAt: string
}

// Interface cho phản hồi API
export interface CommentApiResponse {
  success: boolean
  message: string
  data: Comment[]
  pagination?: {
    totalItems: number
    totalPages: number
    currentPage: number
    pageSize: number
    hasNextPage: boolean
    hasPrevPage: boolean
  }
  timestamp: string
}

const commentApi = {
  // Lấy danh sách bình luận của một bài đăng
  getPostComments: async (postId: string, options: CommentFetchOptions = {}): Promise<CommentApiResponse> => {
    try {
      const { page = 1, limit = 20, sort = "newest" } = options
      const response = await instance.get(`/post/${postId}/comments`, {
        params: { page, limit, sort },
      })
      return response.data
    } catch (error) {
      console.error("Lỗi khi lấy bình luận của bài đăng:", error)
      throw error
    }
  },

  // Lấy danh sách phản hồi của một bình luận
  getCommentReplies: async (commentId: string, options: CommentFetchOptions = {}): Promise<CommentApiResponse> => {
    try {
      const { page = 1, limit = 10 } = options
      const response = await instance.get(`/comments/${commentId}/replies`, {
        params: { page, limit },
      })
      return response.data
    } catch (error) {
      console.error("Lỗi khi lấy phản hồi của bình luận:", error)
      throw error
    }
  },

  // Tạo bình luận mới cho bài đăng
  createComment: async (postId: string, content: string, mediaFiles?: File[]): Promise<Comment> => {
    try {
      const formData = new FormData()
      formData.append("content", content)

      if (mediaFiles && mediaFiles.length > 0) {
        mediaFiles.forEach((file) => {
          formData.append("mediaFiles", file)
        })
      }

      const response = await instance.post(`/post/${postId}/comment`, formData, {
        headers: {
          "Content-Type": "multipart/form-data",
        },
      })

      return response.data.data
    } catch (error) {
      console.error("Lỗi khi tạo bình luận:", error)
      throw error
    }
  },

  // Trả lời một bình luận
  replyToComment: async (commentId: string, content: string, mediaFiles?: File[]): Promise<Comment> => {
    try {
      const formData = new FormData()
      formData.append("content", content)

      if (mediaFiles && mediaFiles.length > 0) {
        mediaFiles.forEach((file) => {
          formData.append("mediaFiles", file)
        })
      }

      const response = await instance.post(`/comments/${commentId}/reply`, formData, {
        headers: {
          "Content-Type": "multipart/form-data",
        },
      })

      return response.data.data
    } catch (error) {
      console.error("Lỗi khi trả lời bình luận:", error)
      throw error
    }
  },

  // Cập nhật nội dung bình luận
  updateComment: async (commentId: string, content: string): Promise<Comment> => {
    try {
      const response = await instance.patch(`/comments/${commentId}`, { content })
      return response.data.data
    } catch (error) {
      console.error("Lỗi khi cập nhật bình luận:", error)
      throw error
    }
  },

  // Xóa bình luận
  deleteComment: async (commentId: string): Promise<{ commentId: string }> => {
    try {
      const response = await instance.delete(`/comments/${commentId}`)
      return response.data.data
    } catch (error) {
      console.error("Lỗi khi xóa bình luận:", error)
      throw error
    }
  },

  // Thích bình luận
  likeComment: async (commentId: string): Promise<{ commentId: string }> => {
    try {
      const response = await instance.post(`/comments/${commentId}/like`)
      return response.data.data
    } catch (error) {
      console.error("Lỗi khi thích bình luận:", error)
      throw error
    }
  },

  // Bỏ thích bình luận
  unlikeComment: async (commentId: string): Promise<{ commentId: string }> => {
    try {
      const response = await instance.post(`/comments/${commentId}/unlike`)
      return response.data.data
    } catch (error) {
      console.error("Lỗi khi bỏ thích bình luận:", error)
      throw error
    }
  },
}

export default commentApi
