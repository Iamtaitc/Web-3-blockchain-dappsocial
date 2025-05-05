import instance from "./api"

interface Task {
  _id: string
  name: string
  description: string
  type: "daily" | "weekly" | "special"
  rewardPoints: number
  rewardTokens: number
  requirements: { count: number }
  isCompleted: boolean
  completedAt?: string
}

interface TaskResponse {
  success: boolean
  message: string
  data: {
    tasks: {
      daily: Task[]
      weekly: Task[]
      special: Task[]
    }
    completedCount: number
    totalTasks: number
  }
  timestamp: string
}

interface CompleteTaskResponse {
  success: boolean
  message: string
  data: {
    taskId: string
    rewardPoints: number
    rewardTokens: number
    userPoints: number
    userTokens: number
  }
  timestamp: string
}

export const TaskService = {
  getAllTasks: async (): Promise<TaskResponse> => {
    try {
      const response = await instance.get("/tasks")
      console.log("getAllTasks response:", response.data)
      return response.data
    } catch (error: any) {
      console.error("getAllTasks error:", error.message)
      throw error
    }
  },

  getUserTasks: async (): Promise<TaskResponse> => {
    try {
      const response = await instance.get("/tasks/user")
      console.log("getUserTasks response:", response.data)
      return response.data
    } catch (error: any) {
      console.error("getUserTasks error:", error.message)
      throw error
    }
  },

  getUserSubscription: async () => {
    try {
      const response = await instance.get("/tasks/subscription")
      console.log("getUserSubscription response:", response.data)
      return response.data
    } catch (error: any) {
      console.error("getUserSubscription error:", error.message)
      throw error
    }
  },

  completeTask: async (taskId: string): Promise<CompleteTaskResponse> => {
    try {
      const response = await instance.post(`/reward/task/${taskId}`)
      console.log("completeTask response:", response.data)
      return response.data
    } catch (error: any) {
      console.error("completeTask error:", error.message)
      throw error
    }
  },

  checkIn: async () => {
    try {
      const response = await instance.post("/reward/check-in")
      console.log("checkIn response:", response.data)
      return response.data
    } catch (error: any) {
      console.error("checkIn error:", error.message)
      throw error
    }
  },
}