import instance from "./instance"

// Interface cho dữ liệu tạo bài viết
interface CreatePostPayload {
  content: string
  author?: string
  tags?: string[]
  mentions?: MentionedUser[] // Thay đổi kiểu dữ liệu
  media?: File[]
}

// Interface cho người dùng được mention
interface MentionedUser {
  username: string
  walletAddress: string
}

// Interface cho phản hồi từ API
interface PostResponse {
  success: boolean
  status: number
  message: string
  data: any
}

// Interface cho bài viết
export interface Post {
  _id: string
  author: string
  username?: string
  authorDetails: {
    username: string
    walletAddress?: string
    avatarURI?: string
  }
  content: string
  contentURI?: string
  media: {
    type: "image" | "video" | "audio"
    uri: string
    mimeType: string
    _id?: string
  }[]
  tags: string[]
  mentions: string[] | MentionedUser[]  // Hỗ trợ cả hai định dạng
  likeCount: number
  commentCount: number
  saveCount: number
  viewCount: number
  status: string
  createdAt: string
  updatedAt: string
  isLiked?: boolean
  isSaved?: boolean
}

// Service API bài viết
const postApi = {
  // Tạo bài viết mới với FormData
  createPost: async (postData: FormData | CreatePostPayload): Promise<PostResponse> => {
    try {
      let formData: FormData

      // Kiểm tra xem postData đã là FormData chưa
      if (postData instanceof FormData) {
        formData = postData
      } else {
        // Nếu không phải FormData, tạo mới FormData
        formData = new FormData()

        // Thêm content
        formData.append("content", postData.content)

        // Thêm author nếu có
        if (postData.author) {
          formData.append("author", postData.author)
        }

        // Thêm tags nếu có
        if (postData.tags && postData.tags.length > 0) {
          formData.append("tags", JSON.stringify(postData.tags))
        }

        // Thêm mentions nếu có
        if (postData.mentions && postData.mentions.length > 0) {
          formData.append("mentions", JSON.stringify(postData.mentions))
        }

        // Thêm media files nếu có
        if (postData.media && postData.media.length > 0) {
          postData.media.forEach((file) => {
            formData.append("media", file)
          })
        }
      }

      // Gửi FormData
      const response = await instance.post("/post/create", formData, {
        headers: {
          "Content-Type": "multipart/form-data",
        },
        // Tăng timeout để xử lý payload lớn
        timeout: 60000, // 60 giây
      })

      return response.data
    } catch (error: any) {
      console.error("Lỗi khi tạo bài viết:", error)
      throw error.response?.data || { success: false, message: "Lỗi khi tạo bài viết" }
    }
  },

  // Lấy tất cả bài viết với phân trang
  getAllPosts: async (page = 1, limit = 20): Promise<PostResponse> => {
    try {
      const response = await instance.get(`/post/all?page=${page}&limit=${limit}`)

      // Thêm trạng thái từ localStorage cho mỗi bài viết
      if (response.data.success && response.data.data) {
        let posts = []

        if (Array.isArray(response.data.data)) {
          posts = response.data.data
        } else if (response.data.data.posts && Array.isArray(response.data.data.posts)) {
          posts = response.data.data.posts
        }

        // Cập nhật trạng thái từ localStorage
        posts = posts.map((post: Post) => {
          const savedLiked = localStorage.getItem(`post_liked_${post._id}`)
          const savedSaved = localStorage.getItem(`post_saved_${post._id}`)

          return {
            ...post,
            isLiked: savedLiked !== null ? savedLiked === "true" : post.isLiked,
            isSaved: savedSaved !== null ? savedSaved === "true" : post.isSaved,
          }
        })

        if (Array.isArray(response.data.data)) {
          response.data.data = posts
        } else if (response.data.data.posts) {
          response.data.data.posts = posts
        }
      }

      return response.data
    } catch (error: any) {
      throw error.response?.data || { success: false, message: "Lỗi khi tải bài viết" }
    }
  },

  // Lấy bài viết thịnh hành
  getTrendingPosts: async (page = 1, limit = 20): Promise<PostResponse> => {
    try {
      const response = await instance.get(`/post/trending?page=${page}&limit=${limit}`)
      return response.data
    } catch (error: any) {
      throw error.response?.data || { success: false, message: "Lỗi khi tải bài viết thịnh hành" }
    }
  },

  // Lấy bài viết theo người dùng
  getPostsByUser: async (username: string): Promise<PostResponse> => {
    try {
      const response = await instance.get(`/post/user/${username}`)
      return response.data
    } catch (error: any) {
      throw error.response?.data || { success: false, message: "Lỗi khi tải bài viết của người dùng" }
    }
  },

  // Lấy bài viết theo ID
  getPostById: async (postId: string): Promise<PostResponse> => {
    try {
      const response = await instance.get(`/post/${postId}/id`)
      return response.data
    } catch (error: any) {
      throw error.response?.data || { success: false, message: "Lỗi khi tải bài viết" }
    }
  },

  // Thích bài viết
  likePost: async (postId: string): Promise<PostResponse> => {
    try {
      const response = await instance.patch(`/post/${postId}/like`)
      // Lưu trạng thái vào localStorage
      localStorage.setItem(`post_liked_${postId}`, "true")
      return response.data
    } catch (error: any) {
      throw error.response?.data || { success: false, message: "Lỗi khi thích bài viết" }
    }
  },

  // Bỏ thích bài viết
  unlikePost: async (postId: string): Promise<PostResponse> => {
    try {
      const response = await instance.patch(`/post/${postId}/unlike`)
      // Lưu trạng thái vào localStorage
      localStorage.setItem(`post_liked_${postId}`, "false")
      return response.data
    } catch (error: any) {
      throw error.response?.data || { success: false, message: "Lỗi khi bỏ thích bài viết" }
    }
  },

  // Lưu bài viết
  savePost: async (postId: string): Promise<PostResponse> => {
    try {
      const response = await instance.patch(`/post/${postId}/save`)
      // Lưu trạng thái vào localStorage
      localStorage.setItem(`post_saved_${postId}`, "true")
      return response.data
    } catch (error: any) {
      throw error.response?.data || { success: false, message: "Lỗi khi lưu bài viết" }
    }
  },

  // Bỏ lưu bài viết
  unsavePost: async (postId: string): Promise<PostResponse> => {
    try {
      const response = await instance.patch(`/post/${postId}/unsave`)
      // Lưu trạng thái vào localStorage
      localStorage.setItem(`post_saved_${postId}`, "false")
      return response.data
    } catch (error: any) {
      throw error.response?.data || { success: false, message: "Lỗi khi bỏ lưu bài viết" }
    }
  },

  // Lấy bài viết đã lưu
  getSavedPosts: async (page = 1, limit = 20): Promise<PostResponse> => {
    try {
      const response = await instance.get(`/post/save/posts?page=${page}&limit=${limit}`)
      return response.data
    } catch (error: any) {
      throw error.response?.data || { success: false, message: "Lỗi khi tải bài viết đã lưu" }
    }
  },

  // Báo cáo bài viết
  reportPost: async (postId: string, reason: string): Promise<PostResponse> => {
    try {
      const response = await instance.post(`/post/${postId}/report`, { reason })
      return response.data
    } catch (error: any) {
      throw error.response?.data || { success: false, message: "Lỗi khi báo cáo bài viết" }
    }
  },
}

export default postApi
