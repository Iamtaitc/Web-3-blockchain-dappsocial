"use client"

import { useState } from "react"
import { LineChart, Line, XAxis, YAxis, Tooltip, ResponsiveContainer } from "recharts"
import { Home, Search, Heart, Plus, Crown, MessageSquare, Wallet, Grid } from "lucide-react"

export default function Dashboard() {
  const [activeTab, setActiveTab] = useState("month")

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

  return (
    <div className="flex  flex-1 screen bg-black text-white font-mono">
      {/* Sidebar */}
      <div className="w-16 border-r border-gray-800 flex flex-col items-center py-4 space-y-8">
        <div className="w-8 h-8 bg-black flex items-center justify-center">
          <span className="text-white font-bold">D</span>
          <span className="text-green-500 font-bold">x</span>
        </div>
        <div className="flex flex-col items-center space-y-8">
          <Home className="w-6 h-6 text-gray-400" />
          <Search className="w-6 h-6 text-gray-400" />
          <Heart className="w-6 h-6 text-gray-400" />
          <Plus className="w-6 h-6 text-gray-400" />
          <Crown className="w-6 h-6 text-gray-400" />
          <MessageSquare className="w-6 h-6 text-gray-400" />
          <Wallet className="w-6 h-6 text-gray-400" />
          <Grid className="w-6 h-6 text-gray-400" />
        </div>
      </div>

      {/* Main Content */}
      <div className="flex-1 p-6">
        <h1 className="text-4xl font-bold mb-8 text-center tracking-widest">Dashboard</h1>

        <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
          {/* Balance Card */}
          <div className="bg-gray-900 rounded-lg p-8 flex items-center justify-center">
            <div className="text-center">
              <h2 className="text-4xl font-bold tracking-wider">
                189.381.433 <span className="text-green-500">Dx</span>
              </h2>
            </div>
          </div>

          {/* Wallet Card */}
          <div className="bg-gray-900 rounded-lg p-6">
            <div className="flex justify-between items-center mb-2">
              <h2 className="text-xl font-bold">Wallet</h2>
              <span className="text-green-500">Connected</span>
            </div>
            <p className="text-gray-400 text-sm mb-6">Connect your wallet to start farming...</p>

            <div className="flex justify-between items-center">
              <div className="flex items-center space-x-2">
                <Wallet className="w-5 h-5" />
                <span className="text-sm">HuJwPz7D...hgMV</span>
              </div>
              <button className="bg-red-500 hover:bg-red-600 text-white px-4 py-2 rounded-lg text-sm">
                Disconnect
              </button>
            </div>
          </div>
        </div>

        {/* Statistics Card */}
        <div className="bg-gray-900 rounded-lg p-6 mt-6">
          <div className="flex justify-between items-center mb-4">
            <div>
              <h2 className="text-sm text-gray-400">Statistics</h2>
              <p className="font-bold flex items-center">
                Dx received
                <span className="w-2 h-2 bg-green-500 rounded-full ml-2 mr-1"></span>
                <span className="text-xs text-gray-400">Farming</span>
              </p>
            </div>

            <div className="flex bg-gray-800 rounded-full p-1">
              <button
                className={`px-4 py-1 text-xs rounded-full ${activeTab === "day" ? "bg-green-500 text-white" : "text-gray-400"}`}
                onClick={() => setActiveTab("day")}
              >
                Day
              </button>
              <button
                className={`px-4 py-1 text-xs rounded-full ${activeTab === "week" ? "bg-green-500 text-white" : "text-gray-400"}`}
                onClick={() => setActiveTab("week")}
              >
                Week
              </button>
              <button
                className={`px-4 py-1 text-xs rounded-full ${activeTab === "month" ? "bg-green-500 text-white" : "text-gray-400"}`}
                onClick={() => setActiveTab("month")}
              >
                Month
              </button>
              <button
                className={`px-4 py-1 text-xs rounded-full ${activeTab === "year" ? "bg-green-500 text-white" : "text-gray-400"}`}
                onClick={() => setActiveTab("year")}
              >
                Year
              </button>
            </div>
          </div>

          <div className="h-64 w-full">
            <ResponsiveContainer width="100%" height="100%">
              <LineChart data={chartData}>
                <XAxis dataKey="date" axisLine={false} tickLine={false} tick={{ fill: "#9CA3AF", fontSize: 12 }} />
                <YAxis
                  axisLine={false}
                  tickLine={false}
                  tick={{ fill: "#9CA3AF", fontSize: 12 }}
                  ticks={[0, 1000, 2000, 3000, 4000]}
                  domain={[0, 4000]}
                />
                <Tooltip
                  contentStyle={{ backgroundColor: "#22c55e", border: "none", borderRadius: "4px", color: "white" }}
                  formatter={(value) => [`${value} Dx`]}
                  labelStyle={{ display: "none" }}
                />
                <Line
                  type="monotone"
                  dataKey="value"
                  stroke="#22c55e"
                  strokeWidth={2}
                  dot={{ fill: "#22c55e", r: 4, strokeWidth: 2, stroke: "white" }}
                  activeDot={{ fill: "#22c55e", r: 6, strokeWidth: 2, stroke: "white" }}
                />
              </LineChart>
            </ResponsiveContainer>
          </div>
        </div>

        <div className="grid grid-cols-1 md:grid-cols-2 gap-6 mt-6">
          {/* Referrals Card */}
          <div className="bg-gray-900 rounded-lg p-6">
            <h2 className="text-xl font-bold mb-2">Referrals</h2>
            <p className="text-gray-400 text-sm mb-6">Refer users with your referral code to earn points.</p>

            <div className="flex justify-between items-center">
              <div>
                <span className="text-3xl font-bold">3</span>
                <p className="text-gray-400 text-sm">Total Referrals</p>
              </div>
              <button className="bg-white text-black px-4 py-2 rounded-lg text-sm font-medium hover:bg-gray-200">
                Copy Link
              </button>
            </div>
          </div>

          {/* Your Referrals Card */}
          <div className="bg-gray-900 rounded-lg p-6">
            <h2 className="text-xl font-bold mb-4">You Referrals</h2>
            <div className="space-y-3">
              {referrals.map((referral, index) => (
                <div key={index} className="flex justify-between items-center border-b border-gray-800 pb-2">
                  <span>{referral.name}</span>
                  <span className="text-gray-400">{referral.date}</span>
                  <span className="text-green-500">{referral.amount}</span>
                </div>
              ))}
            </div>
          </div>
        </div>
      </div>
    </div>
  )
}

