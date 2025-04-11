"use client"

import { useState } from "react"
import {
  Users,
  UserPlus,
  Crown,
  FileText,
  MessageSquare,
  ImageIcon,
  Tag,
  TrendingUp,
  ArrowUp,
  ArrowDown,
} from "lucide-react"
import {
  LineChart,
  Line,
  XAxis,
  YAxis,
  CartesianGrid,
  Tooltip,
  ResponsiveContainer,
  BarChart,
  Bar,
  PieChart,
  Pie,
  Cell,
} from "recharts"

// Mock data for charts
const userGrowthData = [
  { name: "Jan", users: 400 },
  { name: "Feb", users: 600 },
  { name: "Mar", users: 800 },
  { name: "Apr", users: 1000 },
  { name: "May", users: 1400 },
  { name: "Jun", users: 1800 },
  { name: "Jul", users: 2200 },
  { name: "Aug", users: 2600 },
  { name: "Sep", users: 3000 },
  { name: "Oct", users: 3400 },
  { name: "Nov", users: 3800 },
  { name: "Dec", users: 4200 },
]

const contentData = [
  { name: "Posts", value: 1200 },
  { name: "NFTs", value: 800 },
  { name: "Comments", value: 2400 },
]

const COLORS = ["#10b981", "#3b82f6", "#f59e0b", "#ef4444"]

// Mock data for top users
const topUsers = [
  {
    id: 1,
    username: "crypto_king",
    walletAddress: "0x1a2b...3c4d",
    points: 12500,
    avatar: "/placeholder.svg?height=40&width=40",
    verified: true,
  },
  {
    id: 2,
    username: "nft_collector",
    walletAddress: "0x5e6f...7g8h",
    points: 10800,
    avatar: "/placeholder.svg?height=40&width=40",
    verified: true,
  },
  {
    id: 3,
    username: "blockchain_guru",
    walletAddress: "0x9i0j...1k2l",
    points: 9200,
    avatar: "/placeholder.svg?height=40&width=40",
    verified: false,
  },
  {
    id: 4,
    username: "defi_master",
    walletAddress: "0x3m4n...5o6p",
    points: 8500,
    avatar: "/placeholder.svg?height=40&width=40",
    verified: true,
  },
  {
    id: 5,
    username: "token_trader",
    walletAddress: "0x7q8r...9s0t",
    points: 7800,
    avatar: "/placeholder.svg?height=40&width=40",
    verified: false,
  },
]

const AdminDashboard = () => {
  const [timeRange, setTimeRange] = useState("month")

  // Stats data
  const stats = [
    {
      title: "Total Users",
      value: "4,235",
      change: "+12.5%",
      trend: "up",
      icon: <Users className="text-blue-500" />,
    },
    {
      title: "New Users (7d)",
      value: "128",
      change: "+5.2%",
      trend: "up",
      icon: <UserPlus className="text-green-500" />,
    },
    {
      title: "Premium Users",
      value: "842",
      change: "+18.7%",
      trend: "up",
      icon: <Crown className="text-amber-500" />,
    },
    {
      title: "Total Posts",
      value: "1,248",
      change: "+7.3%",
      trend: "up",
      icon: <FileText className="text-purple-500" />,
    },
    {
      title: "New Posts (7d)",
      value: "86",
      change: "-2.1%",
      trend: "down",
      icon: <FileText className="text-indigo-500" />,
    },
    {
      title: "Comments",
      value: "2,453",
      change: "+14.2%",
      trend: "up",
      icon: <MessageSquare className="text-pink-500" />,
    },
    {
      title: "Total NFTs",
      value: "824",
      change: "+21.5%",
      trend: "up",
      icon: <ImageIcon className="text-cyan-500" />,
    },
    {
      title: "NFTs For Sale",
      value: "312",
      change: "+9.8%",
      trend: "up",
      icon: <Tag className="text-emerald-500" />,
    },
  ]

  return (
    <div className="space-y-6">
      <div className="flex justify-between items-center">
        <h1 className="text-2xl font-bold text-gray-900 dark:text-white">Admin Dashboard</h1>
        <div className="flex items-center space-x-2">
          <span className="text-sm text-gray-500 dark:text-gray-400">Last updated:</span>
          <span className="text-sm font-medium">Today, 10:30 AM</span>
        </div>
      </div>

      {/* Stats Grid */}
      <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-6">
        {stats.map((stat, index) => (
          <div
            key={index}
            className="bg-white dark:bg-gray-800 rounded-lg shadow p-6 transition-transform hover:scale-[1.02]"
          >
            <div className="flex items-center justify-between mb-4">
              <div className="p-3 rounded-full bg-gray-100 dark:bg-gray-700">{stat.icon}</div>
              <div
                className={`flex items-center ${
                  stat.trend === "up" ? "text-green-500" : "text-red-500"
                } text-sm font-medium`}
              >
                {stat.trend === "up" ? <ArrowUp size={16} /> : <ArrowDown size={16} />}
                <span>{stat.change}</span>
              </div>
            </div>
            <h3 className="text-gray-500 dark:text-gray-400 text-sm font-medium">{stat.title}</h3>
            <p className="text-2xl font-bold text-gray-900 dark:text-white mt-1">{stat.value}</p>
          </div>
        ))}
      </div>

      {/* Charts Section */}
      <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
        {/* User Growth Chart */}
        <div className="bg-white dark:bg-gray-800 rounded-lg shadow p-6">
          <div className="flex justify-between items-center mb-6">
            <h2 className="text-lg font-bold text-gray-900 dark:text-white">User Growth</h2>
            <div className="flex bg-gray-100 dark:bg-gray-700 rounded-lg p-1">
              <button
                onClick={() => setTimeRange("week")}
                className={`px-3 py-1 text-xs rounded-md ${
                  timeRange === "week"
                    ? "bg-emerald-500 text-white"
                    : "text-gray-600 dark:text-gray-300 hover:bg-gray-200 dark:hover:bg-gray-600"
                }`}
              >
                Week
              </button>
              <button
                onClick={() => setTimeRange("month")}
                className={`px-3 py-1 text-xs rounded-md ${
                  timeRange === "month"
                    ? "bg-emerald-500 text-white"
                    : "text-gray-600 dark:text-gray-300 hover:bg-gray-200 dark:hover:bg-gray-600"
                }`}
              >
                Month
              </button>
              <button
                onClick={() => setTimeRange("year")}
                className={`px-3 py-1 text-xs rounded-md ${
                  timeRange === "year"
                    ? "bg-emerald-500 text-white"
                    : "text-gray-600 dark:text-gray-300 hover:bg-gray-200 dark:hover:bg-gray-600"
                }`}
              >
                Year
              </button>
            </div>
          </div>
          <div className="h-80">
            <ResponsiveContainer width="100%" height="100%">
              <LineChart data={userGrowthData}>
                <CartesianGrid strokeDasharray="3 3" stroke="#374151" />
                <XAxis dataKey="name" stroke="#6B7280" />
                <YAxis stroke="#6B7280" />
                <Tooltip
                  contentStyle={{
                    backgroundColor: "#1F2937",
                    borderColor: "#374151",
                    color: "#F9FAFB",
                  }}
                />
                <Line
                  type="monotone"
                  dataKey="users"
                  stroke="#10B981"
                  strokeWidth={2}
                  activeDot={{ r: 8 }}
                  dot={{ r: 4 }}
                />
              </LineChart>
            </ResponsiveContainer>
          </div>
        </div>

        {/* Content Distribution Chart */}
        <div className="bg-white dark:bg-gray-800 rounded-lg shadow p-6">
          <h2 className="text-lg font-bold text-gray-900 dark:text-white mb-6">Content Distribution</h2>
          <div className="grid grid-cols-2 gap-4">
            <div className="h-80">
              <ResponsiveContainer width="100%" height="100%">
                <PieChart>
                  <Pie
                    data={contentData}
                    cx="50%"
                    cy="50%"
                    labelLine={false}
                    outerRadius={80}
                    fill="#8884d8"
                    dataKey="value"
                    label={({ name, percent }) => `${name} ${(percent * 100).toFixed(0)}%`}
                  >
                    {contentData.map((entry, index) => (
                      <Cell key={`cell-${index}`} fill={COLORS[index % COLORS.length]} />
                    ))}
                  </Pie>
                  <Tooltip />
                </PieChart>
              </ResponsiveContainer>
            </div>
            <div className="h-80">
              <ResponsiveContainer width="100%" height="100%">
                <BarChart data={contentData}>
                  <CartesianGrid strokeDasharray="3 3" stroke="#374151" />
                  <XAxis dataKey="name" stroke="#6B7280" />
                  <YAxis stroke="#6B7280" />
                  <Tooltip
                    contentStyle={{
                      backgroundColor: "#1F2937",
                      borderColor: "#374151",
                      color: "#F9FAFB",
                    }}
                  />
                  <Bar dataKey="value" fill="#10B981" />
                </BarChart>
              </ResponsiveContainer>
            </div>
          </div>
        </div>
      </div>

      {/* Top Users Section */}
      <div className="bg-white dark:bg-gray-800 rounded-lg shadow">
        <div className="p-6 border-b border-gray-200 dark:border-gray-700">
          <div className="flex justify-between items-center">
            <h2 className="text-lg font-bold text-gray-900 dark:text-white">Top Users</h2>
            <button className="text-sm text-emerald-600 dark:text-emerald-500 hover:underline">View All</button>
          </div>
        </div>
        <div className="overflow-x-auto">
          <table className="w-full">
            <thead>
              <tr className="text-left text-xs font-medium text-gray-500 dark:text-gray-400 uppercase tracking-wider">
                <th className="px-6 py-3">Rank</th>
                <th className="px-6 py-3">User</th>
                <th className="px-6 py-3">Wallet Address</th>
                <th className="px-6 py-3">Points</th>
                <th className="px-6 py-3">Actions</th>
              </tr>
            </thead>
            <tbody className="divide-y divide-gray-200 dark:divide-gray-700">
              {topUsers.map((user, index) => (
                <tr key={user.id} className="hover:bg-gray-50 dark:hover:bg-gray-700">
                  <td className="px-6 py-4 whitespace-nowrap">
                    <div className="flex items-center justify-center w-8 h-8 rounded-full bg-gray-100 dark:bg-gray-700 text-gray-800 dark:text-gray-200 font-bold">
                      {index + 1}
                    </div>
                  </td>
                  <td className="px-6 py-4 whitespace-nowrap">
                    <div className="flex items-center">
                      <img
                        src={user.avatar || "/placeholder.svg"}
                        alt={user.username}
                        className="w-10 h-10 rounded-full mr-3 bg-gray-200 dark:bg-gray-700"
                      />
                      <div>
                        <div className="flex items-center">
                          <p className="font-medium text-gray-900 dark:text-white">{user.username}</p>
                          {user.verified && (
                            <span className="ml-2 inline-flex items-center justify-center w-4 h-4 bg-blue-500 rounded-full">
                              <svg
                                className="w-3 h-3 text-white"
                                fill="currentColor"
                                viewBox="0 0 20 20"
                                xmlns="http://www.w3.org/2000/svg"
                              >
                                <path
                                  fillRule="evenodd"
                                  d="M16.707 5.293a1 1 0 010 1.414l-8 8a1 1 0 01-1.414 0l-4-4a1 1 0 011.414-1.414L8 12.586l7.293-7.293a1 1 0 011.414 0z"
                                  clipRule="evenodd"
                                ></path>
                              </svg>
                            </span>
                          )}
                        </div>
                      </div>
                    </div>
                  </td>
                  <td className="px-6 py-4 whitespace-nowrap text-gray-500 dark:text-gray-400">{user.walletAddress}</td>
                  <td className="px-6 py-4 whitespace-nowrap">
                    <div className="flex items-center">
                      <TrendingUp className="text-emerald-500 mr-2" size={16} />
                      <span className="font-medium text-gray-900 dark:text-white">{user.points.toLocaleString()}</span>
                    </div>
                  </td>
                  <td className="px-6 py-4 whitespace-nowrap">
                    <button className="text-blue-600 dark:text-blue-500 hover:text-blue-800 dark:hover:text-blue-400 font-medium">
                      View Details
                    </button>
                  </td>
                </tr>
              ))}
            </tbody>
          </table>
        </div>
      </div>
    </div>
  )
}

export default AdminDashboard
