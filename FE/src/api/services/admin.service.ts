import axios from 'axios';

const API_URL = import.meta.env.VITE_API_URL || 'http://localhost:3000/api';

/**
 * Admin API service for interacting with the admin endpoints
 */
class AdminService {
  private token: string | null = null;
  
  constructor() {
    this.token = localStorage.getItem('token');
  }

  /**
   * Set the authentication token
   */
  setToken(token: string) {
    this.token = token;
    localStorage.setItem('token', token);
  }

  /**
   * Get default headers with authentication
   */
  private getHeaders() {
    return {
      'Content-Type': 'application/json',
      'Authorization': `Bearer ${this.token}`
    };
  }

  /**
   * Get dashboard statistics
   */
  async getDashboardStats() {
    try {
      const response = await axios.get(`${API_URL}/admin/dashboard/stats`, { 
        headers: this.getHeaders() 
      });
      return response.data;
    } catch (error) {
      throw this.handleError(error);
    }
  }

  /**
   * Get users over time statistics
   */
  async getUsersOverTime(period = 'month') {
    try {
      const response = await axios.get(`${API_URL}/admin/users/overtime?period=${period}`, { 
        headers: this.getHeaders() 
      });
      return response.data;
    } catch (error) {
      throw this.handleError(error);
    }
  }

  /**
   * Get list of users
   */
  async getUsers(page = 1, limit = 20, search = '', status = '') {
    try {
      const response = await axios.get(`${API_URL}/admin/users`, { 
        headers: this.getHeaders(),
        params: { page, limit, search, status }
      });
      return response.data;
    } catch (error) {
      throw this.handleError(error);
    }
  }

  /**
   * Update user status
   */
  async updateUserStatus(walletAddress: string, status: 'active' | 'suspended' | 'inactive') {
    try {
      const response = await axios.patch(
        `${API_URL}/admin/user/status/${walletAddress}`, 
        { status },
        { headers: this.getHeaders() }
      );
      return response.data;
    } catch (error) {
      throw this.handleError(error);
    }
  }

  /**
   * Verify/unverify user
   */
  async verifyUser(walletAddress: string, verified: boolean) {
    try {
      const response = await axios.patch(
        `${API_URL}/admin/user/verify/${walletAddress}`,
        { verified },
        { headers: this.getHeaders() }
      );
      return response.data;
    } catch (error) {
      throw this.handleError(error);
    }
  }

  /**
   * Get moderation posts
   */
  async getModerationPosts(page = 1, limit = 20, status = '') {
    try {
      const response = await axios.get(`${API_URL}/admin/posts/moderation`, {
        headers: this.getHeaders(),
        params: { page, limit, status }
      });
      return response.data;
    } catch (error) {
      throw this.handleError(error);
    }
  }

  /**
   * Update post status
   */
  async updatePostStatus(postId: string, status: 'active' | 'hidden' | 'deleted') {
    try {
      const response = await axios.patch(
        `${API_URL}/admin/post/status/${postId}`,
        { status },
        { headers: this.getHeaders() }
      );
      return response.data;
    } catch (error) {
      throw this.handleError(error);
    }
  }

  /**
   * Get all tasks
   */
  async getAllTasks() {
    try {
      const response = await axios.get(`${API_URL}/admin/tasks`, {
        headers: this.getHeaders()
      });
      return response.data;
    } catch (error) {
      throw this.handleError(error);
    }
  }

  /**
   * Create a new task
   */
  async createTask(taskData: {
    name: string,
    description: string,
    type: string,
    rewardPoints: number,
    rewardTokens: number,
    requirements: any
  }) {
    try {
      const response = await axios.post(
        `${API_URL}/admin/task`,
        taskData,
        { headers: this.getHeaders() }
      );
      return response.data;
    } catch (error) {
      throw this.handleError(error);
    }
  }

  /**
   * Update a task
   */
  async updateTask(taskId: string, taskData: {
    name?: string,
    description?: string,
    type?: string,
    rewardPoints?: number,
    rewardTokens?: number,
    requirements?: any,
    isActive?: boolean
  }) {
    try {
      const response = await axios.patch(
        `${API_URL}/admin/task/${taskId}`,
        taskData,
        { headers: this.getHeaders() }
      );
      return response.data;
    } catch (error) {
      throw this.handleError(error);
    }
  }

  /**
   * Delete a task
   */
  async deleteTask(taskId: string) {
    try {
      const response = await axios.delete(`${API_URL}/admin/task/${taskId}`, {
        headers: this.getHeaders()
      });
      return response.data;
    } catch (error) {
      throw this.handleError(error);
    }
  }

  /**
   * Reset daily tasks
   */
  async resetDailyTasks() {
    try {
      const response = await axios.post(
        `${API_URL}/admin/tasks/reset-daily`,
        {},
        { headers: this.getHeaders() }
      );
      return response.data;
    } catch (error) {
      throw this.handleError(error);
    }
  }

  /**
   * Mint DX tokens
   */
  async mintDXTokens(walletAddress: string, amount: number) {
    try {
      const response = await axios.post(
        `${API_URL}/admin/mint/token`,
        { walletAddress, amount },
        { headers: this.getHeaders() }
      );
      return response.data;
    } catch (error) {
      throw this.handleError(error);
    }
  }

  /**
   * Create system announcement
   */
  async createSystemAnnouncement(title: string, content: string) {
    try {
      const response = await axios.post(
        `${API_URL}/admin/announcement`,
        { title, content },
        { headers: this.getHeaders() }
      );
      return response.data;
    } catch (error) {
      throw this.handleError(error);
    }
  }

  /**
   * Get system logs
   */
  async getSystemLogs(type = 'all', limit = 100) {
    try {
      const response = await axios.get(`${API_URL}/admin/logs`, {
        headers: this.getHeaders(),
        params: { type, limit }
      });
      return response.data;
    } catch (error) {
      throw this.handleError(error);
    }
  }

  /**
   * Force blockchain sync
   */
  async forceBlockchainSync() {
    try {
      const response = await axios.post(
        `${API_URL}/admin/blockchain/sync`,
        {},
        { headers: this.getHeaders() }
      );
      return response.data;
    } catch (error) {
      throw this.handleError(error);
    }
  }

  /**
   * Update system config
   */
  async updateSystemConfig(configData: any) {
    try {
      const response = await axios.patch(
        `${API_URL}/admin/system/config`,
        configData,
        { headers: this.getHeaders() }
      );
      return response.data;
    } catch (error) {
      throw this.handleError(error);
    }
  }

  /**
   * Handle error responses
   */
  private handleError(error: any) {
    if (error.response) {
      return {
        status: error.response.status,
        message: error.response.data?.message || 'Server error',
        error: error.response.data?.error
      };
    }
    
    return {
      status: 500,
      message: error.message || 'Unknown error',
      error: error
    };
  }
}

export default new AdminService(); 