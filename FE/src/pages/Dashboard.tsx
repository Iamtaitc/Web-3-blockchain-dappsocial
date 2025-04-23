"use client"

import { useState } from "react"
import { LineChart, Line, XAxis, YAxis, Tooltip, ResponsiveContainer } from "recharts"
import { Wallet } from "lucide-react"
import TestReduxData from "../components/TestReduxData"


export default function Dashboard() {
  const [activeTab, setActiveTab] = useState("month")
  const [activePage, setActivePage] = useState("home")

  const chartData = [
    { date: "1 Oct", value: 500 },
    { date: "3 Oct", value: 1200 },
    { date: "7 Oct", value: 1800 },
    { date: "10 Oct", value: 900 },
    { date: "14 Oct", value: 2800 },
    { date: "20 Oct", value: 3500 },
    { date: "23 Oct", value: 3000 },
    { date: "27 Oct", value: 3800 },
    { date: "30 Oct", value: 3200 },
  ]

  const referrals = [
    { name: "Amyly", date: "23/1/2024", amount: "3000 Dx" },
    { name: "Amyly", date: "23/1/2024", amount: "3000 Dx" },
    { name: "Amyly", date: "23/1/2024", amount: "3000 Dx" },
    { name: "Amyly", date: "23/1/2024", amount: "3000 Dx" },
  ]

  const handleNavigate = (page: string) => {
    setActivePage(page)
    // Here you would typically handle navigation to different pages
    // For example, using Next.js router or React Router
    console.log(`Navigating to ${page}`)
  }

  return (
    <div className="flex h-screen bg-gray-50 text-gray-800 font-mono">
      {/* Sidebar Component */}
      

      {/* Main Content */}
      <div className="flex-1 p-6 overflow-auto">
        {/* Subtle Background Pattern */}
        <div className="absolute inset-0 bg-[url('data:image/svg+xml;base64,PHN2ZyB3aWR0aD0iNjAiIGhlaWdodD0iNjAiIHZpZXdCb3g9IjAgMCA2MCA2MCIgeG1sbnM9Imh0dHA6Ly93d3cudzMub3JnLzIwMDAvc3ZnIj48ZyBmaWxsPSJub25lIiBmaWxsLXJ1bGU9ImV2ZW5vZGQiPjxnIGZpbGw9IiMwMDAiIGZpbGwtb3BhY2l0eT0iLjAyIj48cGF0aCBkPSJNMzYgMzRjMC0yLjIxLTEuNzktNC00LTRzLTQgMS43OS00IDQgMS43OSA0IDQgNCA0LTEuNzkgNC00eiIvPjwvZz48L2c+PC9zdmc+')] opacity-30 pointer-events-none"></div>

        <h1 className="text-4xl font-bold mb-8 text-center tracking-widest text-gray-900 relative z-10">Dashboard</h1>

        <div className="grid grid-cols-1 md:grid-cols-2 gap-6 relative z-10">
          {/* Balance Card */}
          <div className="bg-white rounded-xl p-8 flex items-center justify-center shadow-md border border-gray-100 transition-all duration-300 hover:shadow-lg">
            <div className="text-center">
              <h2 className="text-4xl font-bold tracking-wider bg-clip-text text-transparent bg-gradient-to-r from-emerald-500 to-teal-600">
                189.381.433 <span>Dx</span>
              </h2>
            </div>
          </div>

          {/* Wallet Card */}
          <div className="bg-white rounded-xl p-6 shadow-md border border-gray-100 transition-all duration-300 hover:shadow-lg">
            <div className="flex justify-between items-center mb-2">
              <h2 className="text-xl font-bold text-gray-800">Wallet</h2>
              <span className="text-emerald-500 font-medium">Connected</span>
            </div>
            <p className="text-gray-500 text-sm mb-6">Connect your wallet to start farming...</p>

            <div className="flex justify-between items-center">
              <div className="flex items-center space-x-2">
                <Wallet className="w-5 h-5 text-gray-600" />
                <span className="text-sm text-gray-700">HuJwPz7D...hgMV</span>
              </div>
              <button className="bg-red-500 hover:bg-red-600 text-white px-4 py-2 rounded-lg text-sm shadow-sm transition-colors">
                Disconnect
              </button>
            </div>
          </div>
        </div>

        {/* Statistics Card */}
        <div className="bg-white rounded-xl p-6 mt-6 shadow-md border border-gray-100 transition-all duration-300 hover:shadow-lg relative z-10">
          <div className="flex justify-between items-center mb-4">
            <div>
              <h2 className="text-sm text-gray-500">Statistics</h2>
              <p className="font-bold flex items-center text-gray-800">
                Dx received
                <span className="w-2 h-2 bg-emerald-500 rounded-full ml-2 mr-1"></span>
                <span className="text-xs text-gray-500">Farming</span>
              </p>
            </div>

            <div className="flex bg-gray-100 rounded-full p-1 shadow-inner">
              <button
                className={`px-4 py-1 text-xs rounded-full transition-all duration-300 ${
                  activeTab === "day"
                    ? "bg-gradient-to-r from-emerald-500 to-teal-500 text-white shadow-sm"
                    : "text-gray-500 hover:text-gray-700"
                }`}
                onClick={() => setActiveTab("day")}
              >
                Day
              </button>
              <button
                className={`px-4 py-1 text-xs rounded-full transition-all duration-300 ${
                  activeTab === "week"
                    ? "bg-gradient-to-r from-emerald-500 to-teal-500 text-white shadow-sm"
                    : "text-gray-500 hover:text-gray-700"
                }`}
                onClick={() => setActiveTab("week")}
              >
                Week
              </button>
              <button
                className={`px-4 py-1 text-xs rounded-full transition-all duration-300 ${
                  activeTab === "month"
                    ? "bg-gradient-to-r from-emerald-500 to-teal-500 text-white shadow-sm"
                    : "text-gray-500 hover:text-gray-700"
                }`}
                onClick={() => setActiveTab("month")}
              >
                Month
              </button>
              <button
                className={`px-4 py-1 text-xs rounded-full transition-all duration-300 ${
                  activeTab === "year"
                    ? "bg-gradient-to-r from-emerald-500 to-teal-500 text-white shadow-sm"
                    : "text-gray-500 hover:text-gray-700"
                }`}
                onClick={() => setActiveTab("year")}
              >
                Year
              </button>
            </div>
          </div>

          <div className="h-64 w-full">
            <ResponsiveContainer width="100%" height="100%">
              <LineChart data={chartData}>
                <XAxis dataKey="date" axisLine={false} tickLine={false} tick={{ fill: "#6B7280", fontSize: 12 }} />
                <YAxis
                  axisLine={false}
                  tickLine={false}
                  tick={{ fill: "#6B7280", fontSize: 12 }}
                  ticks={[0, 1000, 2000, 3000, 4000]}
                  domain={[0, 4000]}
                />
                <Tooltip
                  contentStyle={{
                    backgroundColor: "#ffffff",
                    border: "none",
                    borderRadius: "8px",
                    color: "white",
                    boxShadow: "0 4px 6px rgba(0, 0, 0, 0.1)",
                  }}
                  formatter={(value) => [`${value} Dx`]}
                  labelStyle={{ display: "none" }}
                />
                <Line
                  type="monotone"
                  dataKey="value"
                  stroke="#10B981"
                  strokeWidth={3}
                  dot={{ fill: "#10B981", r: 4, strokeWidth: 2, stroke: "white" }}
                  activeDot={{ fill: "#10B981", r: 6, strokeWidth: 2, stroke: "white" }}
                />
              </LineChart>
            </ResponsiveContainer>
          </div>
        </div>

        <div className="grid grid-cols-1 md:grid-cols-2 gap-6 mt-6 relative z-10">
          {/* Referrals Card */}
          <div className="bg-white rounded-xl p-6 shadow-md border border-gray-100 transition-all duration-300 hover:shadow-lg">
            <h2 className="text-xl font-bold mb-2 text-gray-800">Referrals</h2>
            <p className="text-gray-500 text-sm mb-6">Refer users with your referral code to earn points.</p>

            <div className="flex justify-between items-center">
              <div>
                <span className="text-3xl font-bold text-gray-800">3</span>
                <p className="text-gray-500 text-sm">Total Referrals</p>
              </div>
              <button className="bg-gradient-to-r from-emerald-500 to-teal-500 text-white px-4 py-2 rounded-lg text-sm font-medium hover:from-emerald-600 hover:to-teal-600 transition-all duration-300 shadow-sm">
                Copy Link
              </button>
            </div>
          </div>

          {/* Your Referrals Card */}
          <div className="bg-white rounded-xl p-6 shadow-md border border-gray-100 transition-all duration-300 hover:shadow-lg">
            <h2 className="text-xl font-bold mb-4 text-gray-800">Your Referrals</h2>
            <div className="space-y-3">
              {referrals.map((referral, index) => (
                <div key={index} className="flex justify-between items-center border-b border-gray-200 pb-2">
                  <span className="text-gray-800">{referral.name}</span>
                  <span className="text-gray-500">{referral.date}</span>
                  <span className="text-emerald-500 font-medium">{referral.amount}</span>
                </div>
              ))}
            </div>
          </div>
        </div>
        <TestReduxData />
      </div>
    </div>
  )
}

