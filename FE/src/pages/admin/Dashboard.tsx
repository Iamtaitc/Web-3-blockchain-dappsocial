"use client";

import React, { useState, useEffect, JSX } from "react";
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
  X,
} from "lucide-react";
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
} from "recharts";
import AdminApi from "../../services/AdminApi";

// Interfaces
interface Stat {
  title: string;
  value: string;
  change: string;
  trend: "up" | "down";
  icon: JSX.Element;
}

interface UserGrowthData {
  name: string;
  users: number;
}

interface ContentData {
  name: string;
  value: number;
}

interface TopUser {
  _id: string;
  username: string;
  walletAddress: string;
  points: number;
  avatar?: string;
  verified: boolean;
}

const COLORS = ["#10b981", "#3b82f6", "#f59e0b", "#ef4444"];

const AdminDashboard = () => {
  const [stats, setStats] = useState<Stat[]>([]);
  const [userGrowthData, setUserGrowthData] = useState<UserGrowthData[]>([]);
  const [contentData, setContentData] = useState<ContentData[]>([]);
  const [topUsers, setTopUsers] = useState<TopUser[]>([]);
  const [timeRange, setTimeRange] = useState<"week" | "month" | "year">("month");
  const [isLoading, setIsLoading] = useState(false);
  const [error, setError] = useState<string | null>(null);
  const [selectedUser, setSelectedUser] = useState<TopUser | null>(null);
  const [showUserModal, setShowUserModal] = useState(false);

  // Fetch dashboard data
  const fetchDashboardData = async () => {
    setIsLoading(true);
    setError(null);
    try {
      const response = await AdminApi.getDashboardStats({ timeRange });
      console.log("Dashboard API response:", response);
      console.log("Response data:", JSON.stringify(response.data, null, 2));

      if (response.success && response.data) {
        const { users, content, topUsers: apiTopUsers } = response.data;

        // Kiểm tra users và content tồn tại
        if (!users || !content) {
          console.warn("Users or content data is missing. Response data:", response.data);
          throw new Error("Users or content data is missing in API response");
        }

        // Set stats
        setStats([
          {
            title: "Total Users",
            value: (users.total ?? 0).toLocaleString(),
            change: "0.0%", // API không cung cấp change
            trend: "up",
            icon: <Users className="text-blue-500" />,
          },
          {
            title: "New Users (7d)",
            value: (users.new ?? 0).toLocaleString(),
            change: "0.0%",
            trend: "up",
            icon: <UserPlus className="text-green-500" />,
          },
          {
            title: "Premium Users",
            value: (users.premium ?? 0).toLocaleString(),
            change: "0.0%",
            trend: "up",
            icon: <Crown className="text-amber-500" />,
          },
          {
            title: "Total Posts",
            value: (content.posts ?? 0).toLocaleString(),
            change: "0.0%",
            trend: "up",
            icon: <FileText className="text-purple-500" />,
          },
          {
            title: "New Posts (7d)",
            value: (content.newPosts ?? 0).toLocaleString(),
            change: "0.0%",
            trend: "up",
            icon: <FileText className="text-indigo-500" />,
          },
          {
            title: "Comments",
            value: (content.comments ?? 0).toLocaleString(),
            change: "0.0%",
            trend: "up",
            icon: <MessageSquare className="text-pink-500" />,
          },
          {
            title: "Total NFTs",
            value: (content.nfts ?? 0).toLocaleString(),
            change: "0.0%",
            trend: "up",
            icon: <ImageIcon className="text-cyan-500" />,
          },
          {
            title: "NFTs For Sale",
            value: (content.listedNFTs ?? 0).toLocaleString(),
            change: "0.0%",
            trend: "up",
            icon: <Tag className="text-emerald-500" />,
          },
        ]);

        // API không cung cấp userGrowth và contentDistribution
        setUserGrowthData([]);
        setContentData([]);

        // Xử lý topUsers
        setTopUsers(
          (apiTopUsers ?? []).map((user: any) => ({
            _id: user.walletAddress, // Tạo _id từ walletAddress
            username: user.username || "Unknown", // Mặc định nếu không có username
            walletAddress: user.walletAddress,
            points: user.points ?? 0,
            avatar: user.avatarURI || undefined,
            verified: false, // API không cung cấp verified
          }))
        );
      } else {
        console.warn("API response unsuccessful or missing data:", response);
        setError(response.message || "Failed to fetch dashboard data");
      }
    } catch (err: any) {
      console.error("Error fetching dashboard data:", err);
      setError(err.message || "Failed to fetch dashboard data");
    } finally {
      setIsLoading(false);
    }
  };

  // Load data on mount and when timeRange changes
  useEffect(() => {
    fetchDashboardData();
  }, [timeRange]);

  // View user details
  const viewUserDetails = (user: TopUser) => {
    setSelectedUser(user);
    setShowUserModal(true);
    setError(null);
  };

  return (
    <div className="space-y-6">
      <div className="flex justify-between items-center">
        <h1 className="text-2xl font-bold text-gray-900 dark:text-white">Admin Dashboard</h1>
        <div className="flex items-center space-x-2">
          <span className="text-sm text-gray-500 dark:text-gray-400">Last updated:</span>
          <span className="text-sm font-medium">
            {new Date().toLocaleString("en-US", {
              dateStyle: "medium",
              timeStyle: "short",
            })}
          </span>
        </div>
      </div>

      {/* Error Message */}
      {error && (
        <div className="rounded-md bg-red-50 dark:bg-red-900/30 p-4">
          <div className="flex">
            <div className="flex-shrink-0">
              <X className="h-5 w-5 text-red-400 dark:text-red-500" aria-hidden="true" />
            </div>
            <div className="ml-3">
              <h3 className="text-sm font-medium text-red-800 dark:text-red-300">{error}</h3>
            </div>
          </div>
        </div>
      )}

      {/* Stats Grid */}
      {isLoading ? (
        <div className="flex items-center justify-center h-64">
          <div className="animate-spin rounded-full h-12 w-12 border-t-2 border-b-2 border-emerald-500"></div>
        </div>
      ) : (
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-6">
          {stats.length === 0 ? (
            <div className="col-span-4 text-center text-gray-500 dark:text-gray-400">
              No statistics available
            </div>
          ) : (
            stats.map((stat, index) => (
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
            ))
          )}
        </div>
      )}

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
                disabled={isLoading}
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
                disabled={isLoading}
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
                disabled={isLoading}
              >
                Year
              </button>
            </div>
          </div>
          <div className="h-80">
            <div className="flex items-center justify-center h-full text-gray-500 dark:text-gray-400">
              No data available
            </div>
          </div>
        </div>

        {/* Content Distribution Chart */}
        <div className="bg-white dark:bg-gray-800 rounded-lg shadow p-6">
          <h2 className="text-lg font-bold text-gray-900 dark:text-white mb-6">Content Distribution</h2>
          <div className="grid grid-cols-2 gap-4">
            <div className="h-80">
              <div className="flex items-center justify-center h-full text-gray-500 dark:text-gray-400">
                No data available
              </div>
            </div>
            <div className="h-80">
              <div className="flex items-center justify-center h-full text-gray-500 dark:text-gray-400">
                No data available
              </div>
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
          {isLoading ? (
            <div className="flex items-center justify-center h-64">
              <div className="animate-spin rounded-full h-12 w-12 border-t-2 border-b-2 border-emerald-500"></div>
            </div>
          ) : topUsers.length === 0 ? (
            <div className="flex items-center justify-center h-64 text-gray-500 dark:text-gray-400">
              No top users available
            </div>
          ) : (
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
                  <tr key={user._id} className="hover:bg-gray-50 dark:hover:bg-gray-700">
                    <td className="px-6 py-4 whitespace-nowrap">
                      <div className="flex items-center justify-center w-8 h-8 rounded-full bg-gray-100 dark:bg-gray-700 text-gray-800 dark:text-gray-200 font-bold">
                        {index + 1}
                      </div>
                    </td>
                    <td className="px-6 py-4 whitespace-nowrap">
                      <div className="flex items-center">
                        <img
                          src={user.avatar || "/placeholder.svg?height=40&width=40"}
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
                                  />
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
                      <button
                        className="text-blue-600 dark:text-blue-500 hover:text-blue-800 dark:hover:text-blue-400 font-medium"
                        onClick={() => viewUserDetails(user)}
                        disabled={isLoading}
                      >
                        View Details
                      </button>
                    </td>
                  </tr>
                ))}
              </tbody>
            </table>
          )}
        </div>
      </div>

      {/* User Details Modal */}
      {showUserModal && selectedUser && (
        <div className="fixed inset-0 z-50 overflow-y-auto">
          <div className="flex items-center justify-center min-h-screen pt-4 px-4 pb-20 text-center sm:block sm:p-0">
            
            <span className="hidden sm:inline-block sm:align-middle sm:h-screen" aria-hidden="true">
              ​
            </span>
            <div className="inline-block align-bottom bg-white dark:bg-gray-800 rounded-lg text-left overflow-hidden shadow-xl transform transition-all sm:my-8 sm:align-middle sm:max-w-lg sm:w-full">
              <div className="bg-white dark:bg-gray-800 px-4 pt-5 pb-4 sm:p-6 sm:pb-4">
                <div className="sm:flex sm:items-start">
                  <div className="mt-3 text-center sm:mt-0 sm:ml-4 sm:text-left w-full">
                    <h3 className="text-lg leading-6 font-medium text-gray-900 dark:text-white">User Details</h3>
                    <div className="mt-4 space-y-4">
                      <div className="flex justify-center mb-4">
                        <div className="relative">
                          <img
                            src={selectedUser.avatar || "/placeholder.svg?height=96&width=96"}
                            alt={selectedUser.username}
                            className="h-24 w-24 rounded-full"
                          />
                          {selectedUser.verified && (
                            <div className="absolute bottom-0 right-0 h-6 w-6 bg-blue-500 rounded-full border-2 border-white dark:border-gray-800 flex items-center justify-center">
                              <svg
                                className="w-4 h-4 text-white"
                                fill="currentColor"
                                viewBox="0 0 20 20"
                                xmlns="http://www.w3.org/2000/svg"
                              >
                                <path
                                  fillRule="evenodd"
                                  d="M16.707 5.293a1 1 0 010 1.414l-8 8a1 1 0 01-1.414 0l-4-4a1 1 0 011.414-1.414L8 12.586l7.293-7.293a1 1 0 011.414 0z"
                                  clipRule="evenodd"
                                />
                              </svg>
                            </div>
                          )}
                        </div>
                      </div>
                      <div className="grid grid-cols-2 gap-4">
                        <div>
                          <p className="text-sm font-medium text-gray-500 dark:text-gray-400">Username</p>
                          <p className="mt-1 text-sm text-gray-900 dark:text-white">{selectedUser.username}</p>
                        </div>
                        <div>
                          <p className="text-sm font-medium text-gray-500 dark:text-gray-400">Wallet Address</p>
                          <p className="mt-1 text-sm text-gray-900 dark:text-white">{selectedUser.walletAddress}</p>
                        </div>
                        <div>
                          <p className="text-sm font-medium text-gray-500 dark:text-gray-400">Points</p>
                          <p className="mt-1 text-sm text-gray-900 dark:text-white">
                            {selectedUser.points.toLocaleString()}
                          </p>
                        </div>
                        <div>
                          <p className="text-sm font-medium text-gray-500 dark:text-gray-400">Verified</p>
                          <p className="mt-1 text-sm text-gray-900 dark:text-white">
                            {selectedUser.verified ? "Yes" : "No"}
                          </p>
                        </div>
                      </div>
                    </div>
                  </div>
                </div>
              </div>
              <div className="bg-gray-50 dark:bg-gray-700 px-4 py-3 sm:px-6 sm:flex sm:flex-row-reverse">
                <button
                  type="button"
                  className="mt-3 w-full inline-flex justify-center rounded-md border border-gray-300 dark:border-gray-600 shadow-sm px-4 py-2 bg-white dark:bg-gray-800 text-base font-medium text-gray-700 dark:text-gray-200 hover:bg-gray-50 dark:hover:bg-gray-700 focus:outline-none focus:ring-2 focus:ring-offset-2 focus:ring-emerald-500 sm:mt-0 sm:ml-3 sm:w-auto sm:text-sm"
                  onClick={() => setShowUserModal(false)}
                >
                  <X className="h-4 w-4 mr-2" />
                  Close
                </button>
              </div>
            </div>
          </div>
        </div>
      )}
    </div>
  );
};

export default AdminDashboard;