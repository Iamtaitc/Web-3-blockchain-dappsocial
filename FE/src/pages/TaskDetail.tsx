"use client"

import { useState, useEffect } from "react"
import { useParams, useNavigate } from "react-router-dom"
import { FaTwitter, FaYoutube, FaArrowLeft, FaCheckCircle } from "react-icons/fa"
import { TaskService } from "../services/TaskApi"

interface Task {
  _id: string
  name: string
  description: string
  type: string
  rewardPoints: number
  rewardTokens: number
  requirements?: string[]
}

const TaskDetail = () => {
  const { taskId } = useParams<{ taskId: string }>()
  const navigate = useNavigate()
  const [timeLeft, setTimeLeft] = useState(20)
  const [taskCompleted, setTaskCompleted] = useState(false)
  const [loading, setLoading] = useState(true)
  const [task, setTask] = useState<Task | null>(null)
  const [error, setError] = useState<string | null>(null)

  // Fetch task details
  useEffect(() => {
    const fetchTaskDetails = async () => {
      if (!taskId) return
      
      try {
        setLoading(true)
        const response = await TaskService.getAllTasks()
        if (response.success) {
          // Find the task by id among all tasks
          const allTasks = [
            ...response.data.tasks.daily, 
            ...response.data.tasks.weekly, 
            ...response.data.tasks.special
          ]
          const foundTask = allTasks.find(t => t._id === taskId)
          
          if (foundTask) {
            setTask(foundTask)
          } else {
            setError("Task not found")
          }
        } else {
          setError("Failed to load task")
        }
      } catch (err) {
        setError("An error occurred while loading the task")
        console.error(err)
      } finally {
        setLoading(false)
      }
    }

    fetchTaskDetails()
  }, [taskId])

  // Start countdown timer
  useEffect(() => {
    if (timeLeft > 0 && !taskCompleted) {
      const timer = setTimeout(() => {
        setTimeLeft(timeLeft - 1)
      }, 1000)

      return () => clearTimeout(timer)
    } else if (timeLeft === 0 && !taskCompleted) {
      setTaskCompleted(true)
    }
  }, [timeLeft, taskCompleted])

  const handleClaim = async () => {
    if (!taskId) return
    
    try {
      // Call API to complete the task
      const response = await TaskService.completeTask(taskId)
      
      if (response.success) {
        // Navigate back to the quest page
        navigate("/quest")
      } else {
        setError("Failed to claim reward")
      }
    } catch (err) {
      setError("An error occurred while claiming reward")
      console.error(err)
    }
  }

  const handleBack = () => {
    navigate("/quest")
  }

  const getTaskIcon = () => {
    if (!task) return <FaTwitter className="w-12 h-12" />
    
    if (task.name.toLowerCase().includes("youtube") || task.name.toLowerCase().includes("video")) {
      return <FaYoutube className="w-12 h-12 text-red-600" />
    }
    
    return <FaTwitter className="w-12 h-12" />
  }

  if (loading) {
    return (
      <div className="flex items-center justify-center min-h-screen bg-black text-white">
        Loading task details...
      </div>
    )
  }

  if (error || !task) {
    return (
      <div className="flex flex-col items-center justify-center min-h-screen bg-black text-white">
        <p className="text-red-500 mb-4">{error || "Task not found"}</p>
        <button 
          onClick={handleBack}
          className="px-4 py-2 bg-gray-800 text-white rounded-lg hover:bg-gray-700"
        >
          Back to Quests
        </button>
      </div>
    )
  }

  return (
    <div className="flex items-center justify-center min-h-[calc(100vh-40px)] bg-black text-white font-mono">
      <div className="w-full max-w-2xl mx-auto p-6 bg-black rounded-2xl">
        <button
          onClick={handleBack}
          className="flex items-center text-gray-400 hover:text-white mb-8 transition-colors"
        >
          <FaArrowLeft className="mr-2" /> Back to Tasks
        </button>

        <div className="bg-gray-900 rounded-xl p-8">
          <div className="flex items-center gap-4 mb-8">
            <div className="w-16 h-16 bg-gray-800 rounded-lg flex items-center justify-center">
              {getTaskIcon()}
            </div>
            <div>
              <h1 className="text-2xl font-bold">{task.name}</h1>
              <p className="text-green-500 font-bold">
                {task.rewardPoints} Points {task.rewardTokens > 0 ? `+ ${task.rewardTokens} Tokens` : ''}
              </p>
            </div>
          </div>

          <p className="text-gray-400 mb-8">{task.description}</p>

          <div className="bg-gray-800 p-6 rounded-lg mb-8">
            <h2 className="text-xl mb-4">Task Requirements:</h2>
            <ul className="list-disc list-inside space-y-2 text-gray-300">
              {task.requirements && task.requirements.length > 0 ? (
                task.requirements.map((req, index) => (
                  <li key={index}>{req}</li>
                ))
              ) : (
                <>
                  <li>{task.name.toLowerCase().includes("youtube") ? "Watch the entire video" : "Complete the social media action"}</li>
                  <li>Stay on this page for at least 20 seconds</li>
                  <li>Click the claim button when it appears</li>
                </>
              )}
            </ul>
          </div>

          <div className="flex flex-col items-center justify-center">
            {!taskCompleted ? (
              <div className="text-center">
                <div className="w-20 h-20 rounded-full bg-gray-800 flex items-center justify-center text-2xl font-bold mb-4">
                  {timeLeft}
                </div>
                <p className="text-gray-400">Please wait {timeLeft} seconds...</p>
              </div>
            ) : (
              <div className="text-center">
                <div className="w-20 h-20 rounded-full bg-green-500 flex items-center justify-center mb-4">
                  <FaCheckCircle className="w-10 h-10 text-black" />
                </div>
                <p className="text-green-500 mb-6">Task completed!</p>
                <button
                  onClick={handleClaim}
                  className="px-8 py-3 bg-green-500 text-black rounded-full hover:bg-green-400 active:bg-green-600 transform active:scale-95 transition-all duration-150 font-mono focus:outline-none focus:ring-2 focus:ring-green-400 focus:ring-opacity-50 text-lg"
                >
                  Claim Reward
                </button>
              </div>
            )}
          </div>
        </div>
      </div>
    </div>
  )
}

export default TaskDetail