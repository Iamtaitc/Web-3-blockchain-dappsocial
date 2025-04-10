"use client"

import { useState } from "react"
import { FaTwitter, FaYoutube, FaDiscord, FaTelegram, FaLock, FaCheckCircle, FaTrophy } from "react-icons/fa"

// Simple Quest type
interface Quest {
  id: number
  icon: "twitter" | "youtube" | "discord" | "telegram"
  title: string
  description: string
  reward: string
  status: "available" | "completed" | "locked"
  url: string
  category: "daily" | "weekly" | "special"
}

const Quest = () => {
  const [activeCategory, setActiveCategory] = useState<"daily" | "weekly" | "special">("daily")

  // Sample quests data
  const quests: Quest[] = [
    {
      id: 1,
      icon: "twitter",
      title: "Follow on Twitter",
      description: "Follow our official Twitter account to earn Dx tokens.",
      reward: "3,000 Dx",
      status: "available",
      url: "https://twitter.com/example",
      category: "daily",
    },
    {
      id: 2,
      icon: "youtube",
      title: "Watch Tutorial Video",
      description: "Watch our tutorial video to learn about farming.",
      reward: "5,000 Dx",
      status: "available",
      url: "https://youtube.com/watch?v=example",
      category: "daily",
    },
    {
      id: 3,
      icon: "discord",
      title: "Join Discord Community",
      description: "Join our Discord server to connect with other farmers.",
      reward: "4,000 Dx",
      status: "completed",
      url: "https://discord.gg/example",
      category: "daily",
    },
    {
      id: 4,
      icon: "telegram",
      title: "Join Telegram Group",
      description: "Join our Telegram group for instant updates.",
      reward: "3,500 Dx",
      status: "available",
      url: "https://t.me/example",
      category: "daily",
    },
    {
      id: 5,
      icon: "youtube",
      title: "Complete Platform Tutorial",
      description: "Watch the complete series of tutorial videos.",
      reward: "10,000 Dx",
      status: "available",
      url: "https://youtube.com/playlist?list=example",
      category: "weekly",
    },
    {
      id: 6,
      icon: "twitter",
      title: "Retweet Announcement",
      description: "Retweet our latest announcement.",
      reward: "7,500 Dx",
      status: "available",
      url: "https://twitter.com/example/status/123456",
      category: "weekly",
    },
    {
      id: 7,
      icon: "discord",
      title: "Participate in AMA",
      description: "Join our Ask Me Anything session on Discord.",
      reward: "2x Speed Booster",
      status: "locked",
      url: "https://discord.gg/example/events",
      category: "weekly",
    },
    {
      id: 8,
      icon: "youtube",
      title: "NFT Creation Tutorial",
      description: "Learn how to create and list your first NFT.",
      reward: "Rare NFT",
      status: "available",
      url: "https://youtube.com/watch?v=example2",
      category: "special",
    },
  ]

  // Filter quests by category
  const filteredQuests = quests.filter((quest) => quest.category === activeCategory)

  // Handle quest action
  const handleQuestAction = (quest: Quest) => {
    if (quest.status === "locked") return
    window.open(quest.url, "_blank")
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
              <p className="text-xl font-bold text-gray-800">1/8</p>
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
        {filteredQuests.map((quest) => (
          <div
            key={quest.id}
            className={`bg-white rounded-xl overflow-hidden border border-gray-100 shadow-md transition-all duration-300 hover:shadow-lg ${
              quest.status === "locked" ? "opacity-80" : ""
            }`}
          >
            <div className="p-5">
              <div className="flex justify-between items-start mb-4">
                <div className="flex items-center">
                  <div className="w-12 h-12 bg-gray-50 rounded-lg flex items-center justify-center mr-3 shadow-sm">
                    {getQuestIcon(quest.icon)}
                  </div>
                  <div>
                    <h3 className="font-bold text-lg text-gray-800">{quest.title}</h3>
                  </div>
                </div>

                {quest.status === "completed" && (
                  <div className="bg-emerald-500 text-white px-2 py-1 rounded-full text-xs font-bold shadow-sm">
                    Completed
                  </div>
                )}

                {quest.status === "locked" && (
                  <div className="bg-gray-200 text-gray-600 px-2 py-1 rounded-full text-xs font-bold flex items-center shadow-sm">
                    <FaLock className="mr-1 text-xs" /> Locked
                  </div>
                )}
              </div>

              <p className="text-gray-600 text-sm mb-4">{quest.description}</p>

              <div className="flex justify-between items-center">
                <div className="font-bold text-emerald-600">{quest.reward}</div>

                <button
                  onClick={() => handleQuestAction(quest)}
                  disabled={quest.status === "locked"}
                  className={`px-4 py-2 rounded-lg text-sm font-medium transition-all duration-300 shadow-sm ${
                    quest.status === "locked"
                      ? "bg-gray-200 text-gray-500 cursor-not-allowed"
                      : quest.status === "completed"
                        ? "bg-gray-200 text-gray-700"
                        : "bg-gradient-to-r from-emerald-500 to-teal-500 text-white hover:from-emerald-600 hover:to-teal-600"
                  }`}
                >
                  {quest.status === "locked" ? "Locked" : quest.status === "completed" ? "Completed" : "Start"}
                </button>
              </div>
            </div>
          </div>
        ))}
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

