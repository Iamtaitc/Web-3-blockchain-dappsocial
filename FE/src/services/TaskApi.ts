import axios from 'axios';

// Create an axios instance with default config
const api = axios.create({
  baseURL: "http://localhost:3001/v1",
  headers: {
    "Content-Type": "application/json",
  },
});

// Add a request interceptor to include auth token
api.interceptors.request.use(
  (config) => {
    const token = localStorage.getItem('authToken');
    if (token) {
      config.headers.Authorization = `Bearer ${token}`;
    }
    return config;
  },
  (error) => Promise.reject(error)
);

// Task API service
export const TaskService = {
  // Get all tasks
  getAllTasks: async () => {
    try { 
      const response = await api.get('/tasks');
      return response.data;
    } catch (error) {
      console.error('Error fetching tasks:', error);
      throw error;
    }
  },

  // Get user tasks
  getUserTasks: async () => {
    try {
      const response = await api.get('/tasks/user');
      return response.data;
    } catch (error) {
      console.error('Error fetching user tasks:', error);
      throw error;
    }
  },

  // Complete a task
  completeTask: async (taskId: string) => {
    try {
      const response = await api.post(`/tasks/complete/${taskId}`);
      return response.data;
    } catch (error) {
      console.error('Error completing task:', error);
      throw error;
    }
  },

  // Daily check-in
  checkIn: async () => {
    try {
      const response = await api.post('/tasks/checkin');
      return response.data;
    } catch (error) {
      console.error('Error checking in:', error);
      throw error;
    }
  },

  // Get user subscription info
  getUserSubscription: async () => {
    try {
      const response = await api.get('/tasks/subscription');
      return response.data;
    } catch (error) {
      console.error('Error fetching subscription:', error);
      throw error;
    }
  },

  // Get user points
  getUserPoints: async () => {
    try {
      const response = await api.get('/tasks/points');
      return response.data;
    } catch (error) {
      console.error('Error fetching points:', error);
      throw error;
    }
  },

  // Claim tokens
  claimTokens: async () => {
    try {
      const response = await api.post('/tasks/claim');
      return response.data;
    } catch (error) {
      console.error('Error claiming tokens:', error);
      throw error;
    }
  }
};

export default api;