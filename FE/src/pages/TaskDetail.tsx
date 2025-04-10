"use client"

import type React from "react"
import { useState, useEffect } from "react"
import { useParams, useNavigate } from "react-router-dom"
import { FaTwitter, FaYoutube, FaArrowLeft, FaCheckCircle } from "react-icons/fa"

const TaskDetail: React.FC = () => {
  const { taskId } = useParams<{ taskId: string }>()
  const navigate = useNavigate()
  const [timeLeft, setTimeLeft] = useState(20)
  const [taskCompleted, setTaskCompleted] = useState(false)

  // Mock task data - in a real app, you would fetch this based on taskId
  const task = {
    id: Number.parseInt(taskId || "1"),
    icon: taskId === "1" ? "twitter" : "youtube",
    title: taskId === "1" ? "Follow X" : "Watching Youtube",
    reward: "3.000Dx",
    description:
      taskId === "1"
        ? "Follow our official Twitter account to earn Dx tokens."
        : "Watch our promotional video for at least 20 seconds to earn Dx tokens.",
    url: taskId === "1" ? "https://twitter.com/example" : "https://youtube.com/watch?v=example",
  }

  useEffect(() => {
    // Start the countdown timer
    if (timeLeft > 0 && !taskCompleted) {
      const timer = setTimeout(() => {
        setTimeLeft(timeLeft - 1)
      }, 1000)

      return () => clearTimeout(timer)
    } else if (timeLeft === 0 && !taskCompleted) {
      setTaskCompleted(true)
    }
  }, [timeLeft, taskCompleted])

  const handleClaim = () => {
    // Here you would handle the claim logic
    console.log(`Claimed reward for task ${taskId}`)
    // Navigate back to the quest page
    navigate("/quest")
  }

  const handleBack = () => {
    navigate("/quest")
  }

  const TaskIcon = () => {
    return task.icon === "twitter" ? (
      <FaTwitter className="w-12 h-12" />
    ) : (
      <FaYoutube className="w-12 h-12 text-red-600" />
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
              <TaskIcon />
            </div>
            <div>
              <h1 className="text-2xl font-bold">{task.title}</h1>
              <p className="text-green-500 font-bold">{task.reward}</p>
            </div>
          </div>

          <p className="text-gray-400 mb-8">{task.description}</p>

          <div className="bg-gray-800 p-6 rounded-lg mb-8">
            <h2 className="text-xl mb-4">Task Requirements:</h2>
            <ul className="list-disc list-inside space-y-2 text-gray-300">
              <li>{task.icon === "twitter" ? "Follow our official Twitter account" : "Watch the entire video"}</li>
              <li>Stay on this page for at least 20 seconds</li>
              <li>Click the claim button when it appears</li>
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

