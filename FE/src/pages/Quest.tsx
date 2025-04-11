"use client"

import { useState, useEffect } from "react"
import { useNavigate } from "react-router-dom"
import { FaTwitter, FaYoutube, FaDiscord, FaTelegram, FaLock, FaCheckCircle, FaTrophy } from "react-icons/fa"
import { TaskService } from "../services/TaskApi"

// Quest type definition
interface Quest {
  _id: string
  name: string
  description: string
  type: "daily" | "weekly" | "special"
  rewardPoints: number
  rewardTokens: number
  requirements?: string[]
  isCompleted: boolean
  completedAt?: Date
  icon?: "twitter" | "youtube" | "discord" | "telegram" // Frontend only
  url?: string // Frontend only
}

// Map icons based on task name (for frontend visualization)
const getIconFromName = (name: string): "twitter" | "youtube" | "discord" | "telegram" => {
  if (name.toLowerCase().includes("twitter") || name.toLowerCase().includes("x")) return "twitter"
  if (name.toLowerCase().includes("youtube") || name.toLowerCase().includes("video")) return "youtube"
  if (name.toLowerCase().includes("discord")) return "discord"
  if (name.toLowerCase().includes("telegram")) return "telegram"
  // Default
  return "twitter"
}

const Quest = () => {
  const navigate = useNavigate()
  const [activeCategory, setActiveCategory] = useState<"daily" | "weekly" | "special">("daily")
  const [quests, setQuests] = useState<{ daily: Quest[], weekly: Quest[], special: Quest[] }>({
    daily: [],
    weekly: [],
    special: []
  })
  const [loading, setLoading] = useState(true)
  const [stats, setStats] = useState({
    completedCount: 0,
    totalTasks: 0
  })

  // Fetch quests data on component mount
  useEffect(() => {
    fetchUserTasks()
  }, [])

  const fetchUserTasks = async () => {
    try {
      setLoading(true)
      const response = await TaskService.getUserTasks()
      if (response.success) {
        setQuests(response.data.tasks)
        setStats({
          completedCount: response.data.completedCount,
          totalTasks: response.data.totalTasks
        })
      }
    } catch (error) {
      console.error("Failed to load quests:", error)
    } finally {
      setLoading(false)
    }
  }

  // Filter quests by category
  const filteredQuests = quests[activeCategory] || []

  // Handle quest action
  const handleQuestAction = (quest: Quest) => {
    if (quest.isCompleted) return
    
    // For tasks that need redirection to external sites
    if (quest.name.toLowerCase().includes("twitter") || 
        quest.name.toLowerCase().includes("youtube") ||
        quest.name.toLowerCase().includes("discord") ||
        quest.name.toLowerCase().includes("telegram")) {
      // Navigate to task detail page
      navigate(`/task/${quest._id}`)
    } else {
      // For tasks that can be completed directly (like check-in)
      handleDirectCompletion(quest)
    }
  }

  const handleDirectCompletion = async (quest: Quest) => {
    try {
      // For special handling of check-in
      if (quest.name.toLowerCase().includes("check-in")) {
        const response = await TaskService.checkIn()
        if (response.success) {
          // Refresh quests after check-in
          fetchUserTasks()
        }
      } else {
        // Regular task completion
        const response = await TaskService.completeTask(quest._id)
        if (response.success) {
          // Refresh quests after completion
          fetchUserTasks()
        }
      }
    } catch (error) {
      console.error("Failed to complete task:", error)
    }
  }

  // Get icon component based on quest type
  const getQuestIcon = (type: "twitter" | "youtube" | "discord" | "telegram") => {
    switch (type) {
      case "twitter":
        return <FaTwitter className="text-blue-500" />
      case "youtube":
        return <FaYoutube className="text-red-600" />
      case "discord":
        return <FaDiscord className="text-indigo-500" />
      case "telegram":
        return <FaTelegram className="text-blue-500" />
    }
  }

  if (loading) {
    return <div className="w-full flex justify-center items-center min-h-screen">Loading quests...</div>
  }

  return (
    <div className="w-full bg-gray-50 text-gray-800 min-h-screen p-6 font-mono">
      {/* Subtle Background Pattern */}
      <div className="absolute inset-0 bg-[url('data:image/svg+xml;base64,PHN2ZyB3aWR0aD0iNjAiIGhlaWdodD0iNjAiIHZpZXdCb3g9IjAgMCA2MCA2MCIgeG1sbnM9Imh0dHA6Ly93d3cudzMub3JnLzIwMDAvc3ZnIj48ZyBmaWxsPSJub25lIiBmaWxsLXJ1bGU9ImV2ZW5vZGQiPjxnIGZpbGw9IiMwMDAiIGZpbGwtb3BhY2l0eT0iLjAyIj48cGF0aCBkPSJNMzYgMzRjMC0yLjIxLTEuNzktNC00LTRzLTQgMS43OS00IDQgMS43OSA0IDQgNCA0LTEuNzkgNC00eiIvPjwvZz48L2c+PC9zdmc+')] opacity-30 pointer-events-none"></div>

      {/* Header */}
      <div className="relative z-10 flex flex-col md:flex-row justify-between items-center mb-8">
        <div>
          <h1 className="text-4xl font-bold mb-2 text-gray-900">Quests</h1>
          <p className="text-gray-600">Complete quests to earn rewards and boost your farming</p>
        </div>

        <div className="mt-4 md:mt-0 bg-white p-4 rounded-xl shadow-md border border-gray-100">
          <div className="flex items-center">
            <FaTrophy className="text-amber-500 mr-2" />
            <div>
              <p className="text-sm text-gray-500">Quests Completed</p>
              <p className="text-xl font-bold text-gray-800">{stats.completedCount}/{stats.totalTasks}</p>
            </div>
          </div>
        </div>
      </div>

      {/* Category Tabs */}
      <div className="relative z-10 flex mb-8 bg-white rounded-xl p-1 max-w-md shadow-md border border-gray-100">
        <button
          onClick={() => setActiveCategory("daily")}
          className={`flex-1 py-3 rounded-lg transition-all duration-300 ${
            activeCategory === "daily"
              ? "bg-gradient-to-r from-emerald-500 to-teal-500 text-white font-bold shadow-md"
              : "text-gray-500 hover:text-gray-700 hover:bg-gray-50"
          }`}
        >
          Daily
        </button>
        <button
          onClick={() => setActiveCategory("weekly")}
          className={`flex-1 py-3 rounded-lg transition-all duration-300 ${
            activeCategory === "weekly"
              ? "bg-gradient-to-r from-emerald-500 to-teal-500 text-white font-bold shadow-md"
              : "text-gray-500 hover:text-gray-700 hover:bg-gray-50"
          }`}
        >
          Weekly
        </button>
        <button
          onClick={() => setActiveCategory("special")}
          className={`flex-1 py-3 rounded-lg transition-all duration-300 ${
            activeCategory === "special"
              ? "bg-gradient-to-r from-emerald-500 to-teal-500 text-white font-bold shadow-md"
              : "text-gray-500 hover:text-gray-700 hover:bg-gray-50"
          }`}
        >
          Special
        </button>
      </div>

      {/* Quest Grid */}
      <div className="relative z-10 grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
        {filteredQuests.map((quest) => {
          // Assign an icon based on quest name
          const iconType = getIconFromName(quest.name)
          
          return (
            <div
              key={quest._id}
              className="bg-white rounded-xl overflow-hidden border border-gray-100 shadow-md transition-all duration-300 hover:shadow-lg"
            >
              <div className="p-5">
                <div className="flex justify-between items-start mb-4">
                  <div className="flex items-center">
                    <div className="w-12 h-12 bg-gray-50 rounded-lg flex items-center justify-center mr-3 shadow-sm">
                      {getQuestIcon(iconType)}
                    </div>
                    <div>
                      <h3 className="font-bold text-lg text-gray-800">{quest.name}</h3>
                    </div>
                  </div>

                  {quest.isCompleted && (
                    <div className="bg-emerald-500 text-white px-2 py-1 rounded-full text-xs font-bold shadow-sm">
                      Completed
                    </div>
                  )}
                </div>

                <p className="text-gray-600 text-sm mb-4">{quest.description}</p>

                <div className="flex justify-between items-center">
                  <div className="font-bold text-emerald-600">
                    {quest.rewardPoints} Points {quest.rewardTokens > 0 ? `+ ${quest.rewardTokens} Tokens` : ''}
                  </div>

                  <button
                    onClick={() => handleQuestAction(quest)}
                    disabled={quest.isCompleted}
                    className={`px-4 py-2 rounded-lg text-sm font-medium transition-all duration-300 shadow-sm ${
                      quest.isCompleted
                        ? "bg-gray-200 text-gray-700 cursor-not-allowed"
                        : "bg-gradient-to-r from-emerald-500 to-teal-500 text-white hover:from-emerald-600 hover:to-teal-600"
                    }`}
                  >
                    {quest.isCompleted ? "Completed" : "Start"}
                  </button>
                </div>
              </div>
            </div>
          )
        })}
      </div>

      {/* Empty State */}
      {filteredQuests.length === 0 && (
        <div className="relative z-10 bg-white rounded-xl p-8 text-center shadow-md border border-gray-100">
          <FaCheckCircle className="text-emerald-500 text-4xl mx-auto mb-4" />
          <h3 className="text-xl font-bold mb-2 text-gray-800">No Quests Available</h3>
          <p className="text-gray-600">Check back later for new quests in this category.</p>
        </div>
      )}
    </div>
  )
}

export default Quest