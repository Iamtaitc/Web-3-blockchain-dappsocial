"use client"

import type React from "react"
import { useState } from "react"
import {
  FaWallet,
  FaExchangeAlt,
  FaArrowUp,
  FaArrowDown,
  FaShieldAlt,
  FaQrcode,
  FaCopy,
  FaEye,
  FaEyeSlash,
  FaEthereum,
  FaBitcoin,
  FaChartLine,
  FaLock,
  FaCheckCircle,
} from "react-icons/fa"
import { LineChart, Line, XAxis, YAxis, Tooltip, ResponsiveContainer, PieChart, Pie, Cell } from "recharts"

// Mock data for charts and transactions
const performanceData = [
  { date: "Jan", value: 2400 },
  { date: "Feb", value: 1398 },
  { date: "Mar", value: 9800 },
  { date: "Apr", value: 3908 },
  { date: "May", value: 4800 },
  { date: "Jun", value: 3800 },
  { date: "Jul", value: 4300 },
]

const assets = [
  { name: "Bitcoin", value: 45, color: "#F7931A", amount: "0.0234 BTC", usdValue: "$1,245.32", icon: <FaBitcoin /> },
  { name: "Ethereum", value: 30, color: "#627EEA", amount: "1.234 ETH", usdValue: "$2,567.89", icon: <FaEthereum /> },
  { name: "DigiX", value: 25, color: "#22C55E", amount: "15,234 DX", usdValue: "$3,890.45", icon: null },
]

const transactions = [
  {
    id: 1,
    type: "receive",
    amount: "+0.0045 BTC",
    usdValue: "+$245.32",
    from: "0x3a2d...8e4f",
    date: "Today, 14:23",
    status: "completed",
  },
  {
    id: 2,
    type: "send",
    amount: "-1.234 ETH",
    usdValue: "-$2,567.89",
    to: "0x7f3c...2a1b",
    date: "Yesterday, 09:45",
    status: "completed",
  },
  {
    id: 3,
    type: "receive",
    amount: "+5,000 DX",
    usdValue: "+$1,250.00",
    from: "0x9e8d...4c2a",
    date: "Jul 12, 2024",
    status: "completed",
  },
  {
    id: 4,
    type: "send",
    amount: "-0.0012 BTC",
    usdValue: "-$65.43",
    to: "0x2b5e...9d3f",
    date: "Jul 10, 2024",
    status: "pending",
  },
  {
    id: 5,
    type: "receive",
    amount: "+0.5 ETH",
    usdValue: "+$1,045.67",
    from: "0x6d4b...7e2c",
    date: "Jul 5, 2024",
    status: "completed",
  },
]

const COLORS = ["#F7931A", "#627EEA", "#22C55E"]

const Wallet: React.FC = () => {
  const [activeTab, setActiveTab] = useState<"assets" | "transactions" | "security">("assets")
  const [showBalance, setShowBalance] = useState(true)
  const [showSendModal, setShowSendModal] = useState(false)
  const [showReceiveModal, setShowReceiveModal] = useState(false)
  const [copiedAddress, setCopiedAddress] = useState(false)

  const walletAddress = "0x7F3c8d9E2a1B4C5D6e7F8g9H0j1K2L3M4N5O6P7Q"
  const totalBalance = "$7,703.66"

  const copyToClipboard = () => {
    navigator.clipboard.writeText(walletAddress)
    setCopiedAddress(true)
    setTimeout(() => setCopiedAddress(false), 2000)
  }

  return (
    <div className="w-full max-w-6xl mx-auto p-6 font-mono bg-black text-white">
      <h1 className="text-4xl font-bold mb-8 text-center tracking-widest">Wallet</h1>

      {/* Wallet Overview Card */}
      <div className="bg-gray-900 rounded-xl p-8 mb-8">
        <div className="flex flex-col md:flex-row justify-between items-center mb-8">
          <div className="flex items-center mb-4 md:mb-0">
            <div className="w-16 h-16 bg-green-500/20 rounded-full flex items-center justify-center mr-4">
              <FaWallet className="text-green-500 text-2xl" />
            </div>
            <div>
              <div className="flex items-center">
                <h2 className="text-xl font-bold mr-2">Main Wallet</h2>
                <div className="bg-green-500/20 text-green-500 text-xs px-2 py-1 rounded-full">Active</div>
              </div>
              <div className="flex items-center text-gray-400 text-sm mt-1">
                <span className="mr-2">
                  {walletAddress.substring(0, 8)}...{walletAddress.substring(walletAddress.length - 8)}
                </span>
                <button onClick={copyToClipboard} className="text-gray-400 hover:text-white transition-colors">
                  {copiedAddress ? <FaCheckCircle className="text-green-500" /> : <FaCopy />}
                </button>
              </div>
            </div>
          </div>

          <div className="flex flex-col items-end">
            <div className="flex items-center mb-2">
              <h3 className="text-gray-400 mr-2">Total Balance:</h3>
              <div className="flex items-center">
                {showBalance ? (
                  <span className="text-2xl font-bold">{totalBalance}</span>
                ) : (
                  <span className="text-2xl font-bold">••••••••</span>
                )}
                <button
                  onClick={() => setShowBalance(!showBalance)}
                  className="ml-2 text-gray-400 hover:text-white transition-colors"
                >
                  {showBalance ? <FaEyeSlash /> : <FaEye />}
                </button>
              </div>
            </div>
            <div className="flex space-x-3">
              <button
                onClick={() => setShowSendModal(true)}
                className="flex items-center bg-gray-800 hover:bg-gray-700 px-4 py-2 rounded-lg transition-colors"
              >
                <FaArrowUp className="mr-2 text-red-500" />
                <span>Send</span>
              </button>
              <button
                onClick={() => setShowReceiveModal(true)}
                className="flex items-center bg-gray-800 hover:bg-gray-700 px-4 py-2 rounded-lg transition-colors"
              >
                <FaArrowDown className="mr-2 text-green-500" />
                <span>Receive</span>
              </button>
              <button className="flex items-center bg-gray-800 hover:bg-gray-700 px-4 py-2 rounded-lg transition-colors">
                <FaExchangeAlt className="mr-2 text-blue-500" />
                <span>Swap</span>
              </button>
            </div>
          </div>
        </div>

        {/* Performance Chart */}
        <div>
          <div className="flex justify-between items-center mb-4">
            <h3 className="text-lg font-bold">Portfolio Performance</h3>
            <div className="flex bg-gray-800 rounded-full p-1">
              <button
                className={`px-3 py-1 text-xs rounded-full ${activeTab === "assets" ? "bg-green-500 text-black" : "text-gray-400"}`}
                onClick={() => setActiveTab("assets")}
              >
                Assets
              </button>
              <button
                className={`px-3 py-1 text-xs rounded-full ${activeTab === "transactions" ? "bg-green-500 text-black" : "text-gray-400"}`}
                onClick={() => setActiveTab("transactions")}
              >
                Transactions
              </button>
              <button
                className={`px-3 py-1 text-xs rounded-full ${activeTab === "security" ? "bg-green-500 text-black" : "text-gray-400"}`}
                onClick={() => setActiveTab("security")}
              >
                Security
              </button>
            </div>
          </div>

          <div className="h-64 w-full">
            <ResponsiveContainer width="100%" height="100%">
              <LineChart data={performanceData}>
                <XAxis dataKey="date" axisLine={false} tickLine={false} tick={{ fill: "#9CA3AF", fontSize: 12 }} />
                <YAxis axisLine={false} tickLine={false} tick={{ fill: "#9CA3AF", fontSize: 12 }} domain={[0, 10000]} />
                <Tooltip
                  contentStyle={{ backgroundColor: "#22c55e", border: "none", borderRadius: "4px", color: "white" }}
                  formatter={(value) => [`$${value}`]}
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
      </div>

      {/* Content based on active tab */}
      {activeTab === "assets" && (
        <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
          {/* Assets Distribution */}
          <div className="bg-gray-900 rounded-xl p-6 lg:col-span-1">
            <h3 className="text-lg font-bold mb-4">Assets Distribution</h3>
            <div className="h-64 flex items-center justify-center">
              <ResponsiveContainer width="100%" height="100%">
                <PieChart>
                  <Pie
                    data={assets}
                    cx="50%"
                    cy="50%"
                    innerRadius={60}
                    outerRadius={80}
                    paddingAngle={5}
                    dataKey="value"
                  >
                    {assets.map((entry, index) => (
                      <Cell key={`cell-${index}`} fill={entry.color} />
                    ))}
                  </Pie>
                  <Tooltip
                    contentStyle={{ backgroundColor: "#1F2937", border: "none", borderRadius: "4px", color: "white" }}
                    formatter={(value) => [`${value}%`]}
                  />
                </PieChart>
              </ResponsiveContainer>
            </div>
          </div>

          {/* Assets List */}
          <div className="bg-gray-900 rounded-xl p-6 lg:col-span-2">
            <h3 className="text-lg font-bold mb-4">Your Assets</h3>
            <div className="space-y-4">
              {assets.map((asset, index) => (
                <div
                  key={index}
                  className="flex items-center justify-between p-4 bg-gray-800 rounded-lg hover:bg-gray-700 transition-colors"
                >
                  <div className="flex items-center">
                    <div
                      className="w-10 h-10 rounded-full flex items-center justify-center mr-3"
                      style={{ backgroundColor: `${asset.color}20` }}
                    >
                      {asset.icon ? (
                        asset.icon
                      ) : (
                        <span className="text-lg font-bold" style={{ color: asset.color }}>
                          DX
                        </span>
                      )}
                    </div>
                    <div>
                      <h4 className="font-bold">{asset.name}</h4>
                      <p className="text-gray-400 text-sm">{asset.amount}</p>
                    </div>
                  </div>
                  <div className="text-right">
                    <p className="font-bold">{asset.usdValue}</p>
                    <p className="text-gray-400 text-sm">{asset.value}% of portfolio</p>
                  </div>
                </div>
              ))}
            </div>
          </div>
        </div>
      )}

      {activeTab === "transactions" && (
        <div className="bg-gray-900 rounded-xl p-6">
          <h3 className="text-lg font-bold mb-4">Recent Transactions</h3>
          <div className="space-y-4">
            {transactions.map((tx) => (
              <div
                key={tx.id}
                className="flex items-center justify-between p-4 bg-gray-800 rounded-lg hover:bg-gray-700 transition-colors"
              >
                <div className="flex items-center">
                  <div
                    className={`w-10 h-10 rounded-full flex items-center justify-center mr-3 ${tx.type === "receive" ? "bg-green-500/20" : "bg-red-500/20"}`}
                  >
                    {tx.type === "receive" ? (
                      <FaArrowDown className="text-green-500" />
                    ) : (
                      <FaArrowUp className="text-red-500" />
                    )}
                  </div>
                  <div>
                    <h4 className="font-bold">{tx.type === "receive" ? "Received" : "Sent"}</h4>
                    <p className="text-gray-400 text-sm">
                      {tx.type === "receive" ? `From: ${tx.from}` : `To: ${tx.to}`}
                    </p>
                  </div>
                </div>
                <div className="text-right">
                  <p className={`font-bold ${tx.type === "receive" ? "text-green-500" : "text-red-500"}`}>
                    {tx.amount}
                  </p>
                  <p className="text-gray-400 text-sm">{tx.date}</p>
                  <span
                    className={`text-xs px-2 py-0.5 rounded-full ${tx.status === "completed" ? "bg-green-500/20 text-green-500" : "bg-yellow-500/20 text-yellow-500"}`}
                  >
                    {tx.status}
                  </span>
                </div>
              </div>
            ))}
          </div>
        </div>
      )}

      {activeTab === "security" && (
        <div className="bg-gray-900 rounded-xl p-6">
          <h3 className="text-lg font-bold mb-6">Security Settings</h3>

          <div className="space-y-6">
            <div className="flex items-center justify-between p-4 bg-gray-800 rounded-lg">
              <div className="flex items-center">
                <div className="w-10 h-10 bg-blue-500/20 rounded-full flex items-center justify-center mr-4">
                  <FaLock className="text-blue-500" />
                </div>
                <div>
                  <h4 className="font-bold">Two-Factor Authentication</h4>
                  <p className="text-gray-400 text-sm">Add an extra layer of security to your account</p>
                </div>
              </div>
              <div className="flex items-center">
                <span className="bg-green-500/20 text-green-500 text-xs px-2 py-1 rounded-full mr-2">Enabled</span>
                <button className="bg-gray-700 hover:bg-gray-600 px-3 py-1 rounded-lg text-sm transition-colors">
                  Manage
                </button>
              </div>
            </div>

            <div className="flex items-center justify-between p-4 bg-gray-800 rounded-lg">
              <div className="flex items-center">
                <div className="w-10 h-10 bg-purple-500/20 rounded-full flex items-center justify-center mr-4">
                  <FaShieldAlt className="text-purple-500" />
                </div>
                <div>
                  <h4 className="font-bold">Backup Recovery Phrase</h4>
                  <p className="text-gray-400 text-sm">Secure your wallet with a 12-word recovery phrase</p>
                </div>
              </div>
              <button className="bg-gray-700 hover:bg-gray-600 px-3 py-1 rounded-lg text-sm transition-colors">
                View
              </button>
            </div>

            <div className="flex items-center justify-between p-4 bg-gray-800 rounded-lg">
              <div className="flex items-center">
                <div className="w-10 h-10 bg-red-500/20 rounded-full flex items-center justify-center mr-4">
                  <FaChartLine className="text-red-500" />
                </div>
                <div>
                  <h4 className="font-bold">Transaction Limits</h4>
                  <p className="text-gray-400 text-sm">Set daily transaction limits for added security</p>
                </div>
              </div>
              <div className="flex items-center">
                <span className="text-gray-400 mr-2">$5,000/day</span>
                <button className="bg-gray-700 hover:bg-gray-600 px-3 py-1 rounded-lg text-sm transition-colors">
                  Edit
                </button>
              </div>
            </div>
          </div>
        </div>
      )}

      {/* Send Modal */}
      {showSendModal && (
        <div className="fixed inset-0 bg-black/80 flex items-center justify-center z-50 p-4">
          <div className="bg-gray-900 rounded-xl p-6 max-w-md w-full">
            <div className="flex justify-between items-center mb-6">
              <h3 className="text-xl font-bold">Send Assets</h3>
              <button onClick={() => setShowSendModal(false)} className="text-gray-400 hover:text-white">
                ✕
              </button>
            </div>

            <div className="space-y-4">
              <div>
                <label className="block text-gray-400 mb-2">Select Asset</label>
                <select className="w-full bg-gray-800 border border-gray-700 rounded-lg p-3 focus:outline-none focus:border-green-500">
                  <option value="btc">Bitcoin (BTC) - 0.0234 BTC</option>
                  <option value="eth">Ethereum (ETH) - 1.234 ETH</option>
                  <option value="dx">DigiX (DX) - 15,234 DX</option>
                </select>
              </div>

              <div>
                <label className="block text-gray-400 mb-2">Recipient Address</label>
                <input
                  type="text"
                  placeholder="Enter wallet address"
                  className="w-full bg-gray-800 border border-gray-700 rounded-lg p-3 focus:outline-none focus:border-green-500"
                />
              </div>

              <div>
                <label className="block text-gray-400 mb-2">Amount</label>
                <div className="flex">
                  <input
                    type="number"
                    placeholder="0.00"
                    className="w-full bg-gray-800 border border-gray-700 rounded-l-lg p-3 focus:outline-none focus:border-green-500"
                  />
                  <div className="bg-gray-700 border border-gray-700 rounded-r-lg px-4 flex items-center">BTC</div>
                </div>
                <p className="text-gray-400 text-sm mt-1">≈ $0.00</p>
              </div>

              <div>
                <label className="block text-gray-400 mb-2">Network Fee</label>
                <div className="flex space-x-2">
                  <button className="flex-1 bg-gray-800 border border-gray-700 rounded-lg p-2 focus:outline-none hover:bg-gray-700">
                    <div className="text-sm font-bold">Slow</div>
                    <div className="text-xs text-gray-400">0.0001 BTC</div>
                  </button>
                  <button className="flex-1 bg-gray-800 border border-green-500 rounded-lg p-2 focus:outline-none hover:bg-gray-700">
                    <div className="text-sm font-bold">Medium</div>
                    <div className="text-xs text-gray-400">0.0002 BTC</div>
                  </button>
                  <button className="flex-1 bg-gray-800 border border-gray-700 rounded-lg p-2 focus:outline-none hover:bg-gray-700">
                    <div className="text-sm font-bold">Fast</div>
                    <div className="text-xs text-gray-400">0.0003 BTC</div>
                  </button>
                </div>
              </div>

              <button className="w-full bg-green-500 hover:bg-green-600 text-black font-bold py-3 rounded-lg transition-colors mt-4">
                Send Transaction
              </button>
            </div>
          </div>
        </div>
      )}

      {/* Receive Modal */}
      {showReceiveModal && (
        <div className="fixed inset-0 bg-black/80 flex items-center justify-center z-50 p-4">
          <div className="bg-gray-900 rounded-xl p-6 max-w-md w-full">
            <div className="flex justify-between items-center mb-6">
              <h3 className="text-xl font-bold">Receive Assets</h3>
              <button onClick={() => setShowReceiveModal(false)} className="text-gray-400 hover:text-white">
                ✕
              </button>
            </div>

            <div className="space-y-4 text-center">
              <div>
                <label className="block text-gray-400 mb-2">Select Asset</label>
                <select className="w-full bg-gray-800 border border-gray-700 rounded-lg p-3 focus:outline-none focus:border-green-500">
                  <option value="btc">Bitcoin (BTC)</option>
                  <option value="eth">Ethereum (ETH)</option>
                  <option value="dx">DigiX (DX)</option>
                </select>
              </div>

              <div className="bg-white p-4 rounded-lg mx-auto w-48 h-48 flex items-center justify-center">
                <FaQrcode className="text-black text-8xl" />
              </div>

              <div>
                <p className="text-gray-400 mb-2">Your Wallet Address</p>
                <div className="flex items-center justify-center bg-gray-800 rounded-lg p-3">
                  <span className="text-sm mr-2 truncate">{walletAddress}</span>
                  <button onClick={copyToClipboard} className="text-gray-400 hover:text-white transition-colors">
                    {copiedAddress ? <FaCheckCircle className="text-green-500" /> : <FaCopy />}
                  </button>
                </div>
              </div>

              <div className="pt-4">
                <p className="text-yellow-500 text-sm">
                  <FaShieldAlt className="inline mr-1" />
                  Only send Bitcoin (BTC) to this address. Sending any other asset may result in permanent loss.
                </p>
              </div>
            </div>
          </div>
        </div>
      )}
    </div>
  )
}

export default Wallet

