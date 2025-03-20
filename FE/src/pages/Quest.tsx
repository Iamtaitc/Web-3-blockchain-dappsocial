"use client"

import type React from "react"
import { useState } from "react"
import { FaTwitter, FaYoutube } from "react-icons/fa"

interface Task {
  id: number
  icon: "twitter" | "youtube"
  title: string
  reward: string
  status: "start" | "claim"
  url: string
}

const Quest: React.FC = () => {
  // State to track task statuses
  const [tasks, setTasks] = useState<Task[]>([
    {
      id: 1,
      icon: "twitter",
      title: "Follow X",
      reward: "3.000Dx",
      status: "start",
      url: "https://twitter.com/example",
    },
    {
      id: 2,
      icon: "youtube",
      title: "Watching Youtube",
      reward: "3.000Dx",
      status: "claim",
      url: "https://youtube.com/watch?v=example",
    },
    {
      id: 3,
      icon: "youtube",
      title: "Watching Youtube",
      reward: "3.000Dx",
      status: "claim",
      url: "https://youtube.com/watch?v=example2",
    },
    {
      id: 4,
      icon: "youtube",
      title: "Watching Youtube",
      reward: "3.000Dx",
      status: "claim",
      url: "https://youtube.com/watch?v=example3",
    },
  ])

  const handleTaskAction = (taskId: number) => {
    // Find the task
    const task = tasks.find((t) => t.id === taskId)

    if (!task) return

    if (task.status === "start") {
      // Open the URL in a new tab
      window.open(task.url, "_blank")

      // In a real app, you might want to set a timer or check if the task was completed
      // For this example, we'll just update the status after a delay to simulate completion
      setTimeout(() => {
        setTasks((prevTasks) => prevTasks.map((t) => (t.id === taskId ? { ...t, status: "claim" } : t)))
      }, 3000) // Simulate a delay before the task becomes claimable
    } else if (task.status === "claim") {
      // Handle claim logic
      alert(`Claimed reward of ${task.reward} for task ${taskId}`)

      // Update task status or remove it from the list
      setTasks((prevTasks) => prevTasks.map((t) => (t.id === taskId ? { ...t, status: "start" } : t)))
    }
  }

  const TaskIcon = ({ type }: { type: "twitter" | "youtube" }) => {
    return type === "twitter" ? <FaTwitter className="w-66 h-8" /> : <FaYoutube className="w-8 h-8 text-red-600" />
  }

  return (
    <div className="flex items-center justify-center min-h-[calc(100vh-40px)] bg-black text-white w-screen max-w-[calc(100vw-200px)] p-20 font-mono">
      <div className="w-full mx-auto p-6 bg-black rounded-2xl">
        <h1 className="text-4xl font-bold text-center mb-12 tracking-wider">Task</h1>

        <div className="space-y-8">
          {tasks.map((task) => (
            <div
              key={task.id}
              className="bg-gray-900 rounded-xl p-5 flex items-center justify-between hover:bg-gray-800 transition-colors duration-200"
            >
              <div className="flex items-center gap-4">
                <div className="w-12 h-12 bg-gray-800 rounded-lg flex items-center justify-center">
                  <TaskIcon type={task.icon} />
                </div>
                <span className="text-lg">{task.title}</span>
              </div>

              <div className="flex items-center gap-6">
                <span className="text-lg font-bold text-green-500">{task.reward}</span>
                {task.status === "start" ? (
                  <button
                    onClick={() => handleTaskAction(task.id)}
                    className="px-6 py-2 bg-white text-black rounded-full hover:bg-gray-200 active:bg-gray-300 transform active:scale-95 transition-all duration-150 font-mono focus:outline-none focus:ring-2 focus:ring-gray-400 focus:ring-opacity-50"
                  >
                    Start
                  </button>
                ) : (
                  <button
                    onClick={() => handleTaskAction(task.id)}
                    className="px-6 py-2 bg-green-500 text-black rounded-full hover:bg-green-400 active:bg-green-600 transform active:scale-95 transition-all duration-150 font-mono focus:outline-none focus:ring-2 focus:ring-green-400 focus:ring-opacity-50"
                  >
                    Claim
                  </button>
                )}
              </div>
            </div>
          ))}
        </div>
      </div>
    </div>
  )
}

export default Quest

