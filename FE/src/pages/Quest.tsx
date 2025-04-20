"use client"

import { useState, useEffect } from "react"
import { useNavigate } from "react-router-dom"
import { FaTwitter, FaYoutube, FaDiscord, FaTelegram, FaCheckCircle, FaTrophy } from "react-icons/fa"
import { TaskService } from "../services/TaskApi"

interface Quest {
  _id: string
  name: string
  description: string
  type: "daily" | "weekly" | "special"
  rewardPoints: number
  rewardTokens: number
  requirements: { count: number }
  isCompleted: boolean
  completedAt?: string
  icon?: "twitter" | "youtube" | "discord" | "telegram"
  url?: string
}

const Quest = () => {
  const navigate = useNavigate()
  const [activeCategory, setActiveCategory] = useState<"daily" | "weekly" | "special">("daily")
  const [quests, setQuests] = useState<{ daily: Quest[]; weekly: Quest[]; special: Quest[] }>({
    daily: [],
    weekly: [],
    special: [],
  })
  const [loading, setLoading] = useState(true)
  const [error, setError] = useState<string | null>(null)
  const [successMessage, setSuccessMessage] = useState<string | null>(null) // Thêm state cho thông báo thành công
  const [stats, setStats] = useState({
    completedCount: 0,
    totalTasks: 0,
  })

  useEffect(() => {
    fetchUserTasks()
  }, [])

  const fetchUserTasks = async () => {
    try {
      setLoading(true)
      setError(null)
      const response = await TaskService.getUserTasks()
      if (response.success) {
        const formattedQuests = {
          daily: response.data.tasks.daily.map((task) => ({
            ...task,
            icon: getIconFromName(task.name),
          })),
          weekly: response.data.tasks.weekly.map((task) => ({
            ...task,
            icon: getIconFromName(task.name),
          })),
          special: response.data.tasks.special.map((task) => ({
            ...task,
            icon: getIconFromName(task.name),
          })),
        }
        setQuests(formattedQuests)
        setStats({
          completedCount: response.data.completedCount,
          totalTasks: response.data.totalTasks,
        })
      } else {
        setError("Không thể tải nhiệm vụ. Vui lòng thử lại.")
      }
    } catch (error: any) {
      console.error("Failed to load quests:", error)
      setError("Lỗi kết nối server. Vui lòng kiểm tra mạng và thử lại.")
    } finally {
      setLoading(false)
    }
  }

  const getIconFromName = (name: string): "twitter" | "youtube" | "discord" | "telegram" => {
    if (name.toLowerCase().includes("twitter") || name.toLowerCase().includes("x")) return "twitter"
    if (name.toLowerCase().includes("youtube") || name.toLowerCase().includes("video")) return "youtube"
    if (name.toLowerCase().includes("discord")) return "discord"
    if (name.toLowerCase().includes("telegram")) return "telegram"
    if (name.toLowerCase().includes("điểm danh")) return "telegram"
    return "twitter"
  }

  const handleQuestAction = (quest: Quest) => {
    if (quest.isCompleted) return

    if (
      quest.name.toLowerCase().includes("twitter") ||
      quest.name.toLowerCase().includes("youtube") ||
      quest.name.toLowerCase().includes("discord") ||
      quest.name.toLowerCase().includes("telegram") ||
      quest.name.toLowerCase().includes("sự kiện") ||
      quest.name.toLowerCase().includes("lớp học") ||
      quest.name.toLowerCase().includes("bài học")
    ) {
      navigate(`/task/${quest._id}`)
    } else {
      handleDirectCompletion(quest)
    }
  }

  const handleDirectCompletion = async (quest: Quest) => {
    try {
      setSuccessMessage(null) // Reset thông báo thành công
      if (quest.name.toLowerCase().includes("điểm danh")) {
        const response = await TaskService.checkIn()
        if (response.success) {
          setSuccessMessage("Điểm danh thành công! Bạn nhận được phần thưởng.")
          fetchUserTasks() // Làm mới danh sách nhiệm vụ
        } else {
          setError("Không thể điểm danh. Vui lòng thử lại.")
        }
      } else {
        const response = await TaskService.completeTask(quest._id)
        if (response.success) {
          setSuccessMessage(
            `Nhiệm vụ "${quest.name}" hoàn thành! Bạn nhận được ${response.data.rewardPoints} điểm${
              response.data.rewardTokens > 0 ? ` và ${response.data.rewardTokens} tokens` : ""
            }.`
          )
          fetchUserTasks() // Làm mới danh sách nhiệm vụ
        } else {
          setError("Không thể hoàn thành nhiệm vụ. Vui lòng thử lại.")
        }
      }
    } catch (error: any) {
      console.error("Failed to complete task:", error)
      setError("Lỗi khi hoàn thành nhiệm vụ. Vui lòng thử lại sau.")
    }
  }

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
      default:
        return <FaCheckCircle className="text-gray-500" />
    }
  }

  if (loading) {
    return <div className="w-full flex justify-center items-center min-h-screen">Đang tải nhiệm vụ...</div>
  }

  if (error) {
    return (
      <div className="w-full flex justify-center items-center min-h-screen">
        <div className="bg-red-100 text-red-700 p-4 rounded-lg">
          {error}
          <button
            onClick={fetchUserTasks}
            className="ml-4 bg-blue-500 text-white px-4 py-2 rounded-lg"
          >
            Thử lại
          </button>
        </div>
      </div>
    )
  }

  return (
    <div className="w-full bg-gray-50 text-gray-800 min-h-screen p-6 font-mono">
      <div className="absolute inset-0 bg-[url('data:image/svg+xml;base64,PHN2ZyB3aWR0aD0iNjAiIGhlaWdodD0iNjAiIHZpZXdCb3g9IjAgMCA2MCA2MCIgeG1sbnM9Imh0dHA6Ly93d3cudzMub3JnLzIwMDAvc3ZnIj48ZyBmaWxsPSJub25lIiBmaWxsLXJ1bGU9ImV2ZW5vZGQiPjxnIGZpbGw9IiMwMDAiIGZpbGwtb3BhY2l0eT0iLjAyIj48cGF0aCBkPSJNMzYgMzRjMC0yLjIxLTEuNzktNC00LTRzLTQgMS43OS00IDQgMS43OSA0IDQgNCA0LTEuNzkgNC00eiIvPjwvZz48L2c+PC9zdmc+')] opacity-30 pointer-events-none"></div>

      <div className="relative z-10 flex flex-col md:flex-row justify-between items-center mb-8">
        <div>
          <h1 className="text-4xl font-bold mb-2 text-gray-900">Nhiệm Vụ</h1>
          <p className="text-gray-600">Hoàn thành nhiệm vụ để nhận phần thưởng và tăng điểm</p>
        </div>
        <div className="mt-4 md:mt-0 bg-white p-4 rounded-xl shadow-md border border-gray-100">
          <div className="flex items-center">
            <FaTrophy className="text-amber-500 mr-2" />
            <div>
              <p className="text-sm text-gray-500">Nhiệm Vụ Đã Hoàn Thành</p>
              <p className="text-xl font-bold text-gray-800">
                {stats.completedCount}/{stats.totalTasks}
              </p>
            </div>
          </div>
        </div>
      </div>

      {successMessage && (
        <div className="relative z-10 mb-6 bg-green-100 text-green-700 p-4 rounded-lg shadow-md flex justify-between items-center">
          <span>{successMessage}</span>
          <button
            onClick={() => setSuccessMessage(null)}
            className="text-green-700 hover:text-green-900"
          >
            ✕
          </button>
        </div>
      )}

      <div className="relative z-10 flex mb-8 bg-white rounded-xl p-1 max-w-md shadow-md border border-gray-100">
        <button
          onClick={() => setActiveCategory("daily")}
          className={`flex-1 py-3 rounded-lg transition-all duration-300 ${
            activeCategory === "daily"
              ? "bg-gradient-to-r from-emerald-500 to-teal-500 text-white font-bold shadow-md"
              : "text-gray-500 hover:text-gray-700 hover:bg-gray-50"
          }`}
        >
          Hàng Ngày
        </button>
        <button
          onClick={() => setActiveCategory("weekly")}
          className={`flex-1 py-3 rounded-lg transition-all duration-300 ${
            activeCategory === "weekly"
              ? "bg-gradient-to-r from-emerald-500 to-teal-500 text-white font-bold shadow-md"
              : "text-gray-500 hover:text-gray-700 hover:bg-gray-50"
          }`}
        >
          Hàng Tuần
        </button>
        <button
          onClick={() => setActiveCategory("special")}
          className={`flex-1 py-3 rounded-lg transition-all duration-300 ${
            activeCategory === "special"
              ? "bg-gradient-to-r from-emerald-500 to-teal-500 text-white font-bold shadow-md"
              : "text-gray-500 hover:text-gray-700 hover:bg-gray-50"
          }`}
        >
          Đặc Biệt
        </button>
      </div>

      <div className="relative z-10 grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
        {quests[activeCategory].map((quest) => (
          <div
            key={quest._id}
            className="bg-white rounded-xl overflow-hidden border border-gray-100 shadow-md transition-all duration-300 hover:shadow-lg"
          >
            <div className="p-5">
              <div className="flex justify-between items-start mb-4">
                <div className="flex items-center">
                  <div className="w-12 h-12 bg-gray-50 rounded-lg flex items-center justify-center mr-3 shadow-sm">
                    {getQuestIcon(quest.icon!)}
                  </div>
                  <div>
                    <h3 className="font-bold text-lg text-gray-800">{quest.name}</h3>
                  </div>
                </div>
                {quest.isCompleted && (
                  <div className="bg-emerald-500 text-white px-2 py-1 rounded-full text-xs font-bold shadow-sm">
                    Đã Hoàn Thành
                  </div>
                )}
              </div>
              <p className="text-gray-600 text-sm mb-4">{quest.description}</p>
              <div className="flex justify-between items-center">
                <div className="font-bold text-emerald-600">
                  {quest.rewardPoints} Điểm{" "}
                  {quest.rewardTokens > 0 ? `+ ${quest.rewardTokens} Tokens` : ""}
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
                  {quest.isCompleted ? "Đã Hoàn Thành" : "Bắt Đầu"}
                </button>
              </div>
            </div>
          </div>
        ))}
      </div>

      {quests[activeCategory].length === 0 && !error && (
        <div className="relative z-10 bg-white rounded-xl p-8 text-center shadow-md border border-gray-100">
          <FaCheckCircle className="text-emerald-500 text-4xl mx-auto mb-4" />
          <h3 className="text-xl font-bold mb-2 text-gray-800">Không Có Nhiệm Vụ</h3>
          <p className="text-gray-600">Kiểm tra lại sau để xem nhiệm vụ mới trong danh mục này.</p>
        </div>
      )}
    </div>
  )
}

export default Quest