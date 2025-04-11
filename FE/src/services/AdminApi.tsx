import api from './api' // Assuming this is your base API configuration with interceptors

// Types
type PaginationParams = {
  page?: number
  limit?: number
}

type UserSearchParams = PaginationParams & {
  search?: string
  status?: string
}

type PostModerationParams = PaginationParams & {
  status?: string
}

type SystemLogParams = {
  type?: string
  limit?: number
}

type TaskData = {
  name: string
  description: string
  type?: string
  rewardPoints: number
  rewardTokens: number
  requirements?: any
  isActive?: boolean
}

// Admin API service
const AdminApi = {
  // Dashboard & Statistics
  getDashboardStats: async () => {
    try {
      const response = await api.get('/admin/dashboard/stats')
      return response.data
    } catch (error) {
      console.error('Error fetching dashboard stats:', error)
      throw error
    }
  },

  getUsersOverTime: async (period: string = 'month') => {
    try {
      const response = await api.get(`/admin/users/overtime?period=${period}`)
      return response.data
    } catch (error) {
      console.error('Error fetching users over time:', error)
      throw error
    }
  },

  // User Management
  getUsers: async (params: UserSearchParams = {}) => {
    try {
      const { page = 1, limit = 20, search, status } = params
      const queryParams = new URLSearchParams()
      
      queryParams.append('page', page.toString())
      queryParams.append('limit', limit.toString())
      
      if (search) queryParams.append('search', search)
      if (status) queryParams.append('status', status)
      
      const response = await api.get(`/admin/users?${queryParams.toString()}`)
      return response.data
    } catch (error) {
      console.error('Error fetching users:', error)
      throw error
    }
  },

  updateUserStatus: async (walletAddress: string, status: string) => {
    try {
      const response = await api.patch(`/admin/user/status/${walletAddress}`, { status })
      return response.data
    } catch (error) {
      console.error('Error updating user status:', error)
      throw error
    }
  },

  verifyUser: async (walletAddress: string, verified: boolean) => {
    try {
      const response = await api.patch(`/admin/user/verify/${walletAddress}`, { verified })
      return response.data
    } catch (error) {
      console.error('Error verifying user:', error)
      throw error
    }
  },

  // Content Moderation
  getModerationPosts: async (params: PostModerationParams = {}) => {
    try {
      const { page = 1, limit = 20, status } = params
      const queryParams = new URLSearchParams()
      
      queryParams.append('page', page.toString())
      queryParams.append('limit', limit.toString())
      
      if (status) queryParams.append('status', status)
      
      const response = await api.get(`/admin/posts/moderation?${queryParams.toString()}`)
      return response.data
    } catch (error) {
      console.error('Error fetching posts for moderation:', error)
      throw error
    }
  },

  updatePostStatus: async (postId: string, status: string) => {
    try {
      const response = await api.patch(`/admin/post/status/${postId}`, { status })
      return response.data
    } catch (error) {
      console.error('Error updating post status:', error)
      throw error
    }
  },

  // Task Management
  getAllTasks: async () => {
    try {
      const response = await api.get('/admin/tasks')
      return response.data
    } catch (error) {
      console.error('Error fetching tasks:', error)
      throw error
    }
  },

  createTask: async (taskData: TaskData) => {
    try {
      const response = await api.post('/admin/task', taskData)
      return response.data
    } catch (error) {
      console.error('Error creating task:', error)
      throw error
    }
  },

  updateTask: async (taskId: string, taskData: Partial<TaskData>) => {
    try {
      const response = await api.patch(`/admin/task/${taskId}`, taskData)
      return response.data
    } catch (error) {
      console.error('Error updating task:', error)
      throw error
    }
  },

  deleteTask: async (taskId: string) => {
    try {
      const response = await api.delete(`/admin/task/${taskId}`)
      return response.data
    } catch (error) {
      console.error('Error deleting task:', error)
      throw error
    }
  },

  resetDailyTasks: async () => {
    try {
      const response = await api.post('/admin/tasks/reset-daily')
      return response.data
    } catch (error) {
      console.error('Error resetting daily tasks:', error)
      throw error
    }
  },

  // System Operations
  mintDXTokens: async (walletAddress: string, amount: number) => {
    try {
      const response = await api.post('/admin/mint/token', { walletAddress, amount })
      return response.data
    } catch (error) {
      console.error('Error minting DX tokens:', error)
      throw error
    }
  },

  createSystemAnnouncement: async (title: string, content: string) => {
    try {
      const response = await api.post('/admin/announcement', { title, content })
      return response.data
    } catch (error) {
      console.error('Error creating system announcement:', error)
      throw error
    }
  },

  getSystemLogs: async (params: SystemLogParams = {}) => {
    try {
      const { type = 'all', limit = 100 } = params
      const queryParams = new URLSearchParams()
      
      queryParams.append('type', type)
      queryParams.append('limit', limit.toString())
      
      const response = await api.get(`/admin/logs?${queryParams.toString()}`)
      return response.data
    } catch (error) {
      console.error('Error fetching system logs:', error)
      throw error
    }
  },

  forceBlockchainSync: async () => {
    try {
      const response = await api.post('/admin/blockchain/sync')
      return response.data
    } catch (error) {
      console.error('Error syncing blockchain data:', error)
      throw error
    }
  },

  updateSystemConfig: async (configData: any) => {
    try {
      const response = await api.patch('/admin/system/config', configData)
      return response.data
    } catch (error) {
      console.error('Error updating system config:', error)
      throw error
    }
  }
}

export default AdminApi