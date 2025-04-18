import instance from "./instance"

// Interface cho dữ liệu tạo bài viết
interface CreatePostPayload {
  content: string
  author?: string
  tags?: string[]
  mentions?: string[]
  media?: File[] // Thay đổi thành mảng File thay vì object
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
  username?: string // Thêm trường username
  content: string
  contentURI?: string
  media: {
    type: "image" | "video" | "audio"
    uri: string
    mimeType: string
    _id?: string
  }[]
  tags: string[]
  mentions: string[]
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

      // Nếu người dùng đã đăng nhập, kiểm tra trạng thái like và save cho mỗi bài viết
      if (response.data.success && response.data.data) {
        const posts = Array.isArray(response.data.data) ? response.data.data : response.data.data.posts || []

        // Kiểm tra xem token có tồn tại không (người dùng đã đăng nhập)
        const token = localStorage.getItem("token")
        if (token) {
          // Lấy trạng thái like và save cho mỗi bài viết
          for (const post of posts) {
            try {
              const statusResponse = await instance.get(`/post/${post._id}/status`)
              if (statusResponse.data.success) {
                post.isLiked = statusResponse.data.data.isLiked
                post.isSaved = statusResponse.data.data.isSaved
              }
            } catch (err) {
              console.error(`Không thể lấy trạng thái cho bài viết ${post._id}:`, err)
              // Mặc định là false nếu có lỗi
              post.isLiked = false
              post.isSaved = false
            }
          }
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
      return response.data
    } catch (error: any) {
      throw error.response?.data || { success: false, message: "Lỗi khi thích bài viết" }
    }
  },

  // Bỏ thích bài viết
  unlikePost: async (postId: string): Promise<PostResponse> => {
    try {
      const response = await instance.patch(`/post/${postId}/unlike`)
      return response.data
    } catch (error: any) {
      throw error.response?.data || { success: false, message: "Lỗi khi bỏ thích bài viết" }
    }
  },

  // Lưu bài viết
  savePost: async (postId: string): Promise<PostResponse> => {
    try {
      const response = await instance.patch(`/post/${postId}/save`)
      return response.data
    } catch (error: any) {
      throw error.response?.data || { success: false, message: "Lỗi khi lưu bài viết" }
    }
  },

  // Bỏ lưu bài viết
  unsavePost: async (postId: string): Promise<PostResponse> => {
    try {
      const response = await instance.patch(`/post/${postId}/unsave`)
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

  // Kiểm tra trạng thái thích và lưu của bài viết
  getPostStatus: async (postId: string): Promise<{ isLiked: boolean; isSaved: boolean }> => {
    try {
      const response = await instance.get(`/post/${postId}/status`)
      return response.data.data || { isLiked: false, isSaved: false }
    } catch (error: any) {
      console.error("Lỗi khi kiểm tra trạng thái bài viết:", error)
      return { isLiked: false, isSaved: false }
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
