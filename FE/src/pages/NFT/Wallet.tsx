"use client"

import type React from "react"
import { JSX, useEffect, useState } from "react"
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
  FaHistory,
} from "react-icons/fa"
import {
  LineChart,
  Line,
  XAxis,
  YAxis,
  Tooltip,
  ResponsiveContainer,
  PieChart,
  Pie,
  Cell,
  CartesianGrid,
} from "recharts"

// Types for cryptocurrency data
interface CryptoPrice {
  id: string
  name: string
  symbol: string
  current_price: number
  price_change_percentage_24h: number
  image: string
}

interface Asset {
  id: string
  name: string
  symbol: string
  value: number
  color: string
  amount: string
  usdValue: string
  icon: JSX.Element | null
  price: number
  change24h: number
}

interface Transaction {
  id: number
  type: "receive" | "send"
  amount: string
  usdValue: string
  from?: string
  to?: string
  date: string
  status: "completed" | "pending"
  asset: string
}

// Historical price data for chart
const generateHistoricalData = (basePrice: number, days: number) => {
  const data = []
  let price = basePrice * 0.85 // Start a bit lower

  for (let i = days; i >= 0; i--) {
    // Random fluctuation between -3% and +3%
    const change = Math.random() * 0.06 - 0.03
    price = price * (1 + change)

    data.push({
      date: new Date(Date.now() - i * 24 * 60 * 60 * 1000).toLocaleDateString("en-US", {
        month: "short",
        day: "numeric",
      }),
      value: price,
    })
  }

  return data
}

// Sample transactions
const generateTransactions = (btcPrice: number, ethPrice: number): Transaction[] => [
  {
    id: 1,
    type: "receive",
    amount: "+0.0045 BTC",
    usdValue: `+$${(0.0045 * btcPrice).toLocaleString(undefined, { minimumFractionDigits: 2, maximumFractionDigits: 2 })}`,
    from: "0x3a2d...8e4f",
    date: "Today, 14:23",
    status: "completed",
    asset: "BTC",
  },
  {
    id: 2,
    type: "send",
    amount: "-1.234 ETH",
    usdValue: `-$${(1.234 * ethPrice).toLocaleString(undefined, { minimumFractionDigits: 2, maximumFractionDigits: 2 })}`,
    to: "0x7f3c...2a1b",
    date: "Yesterday, 09:45",
    status: "completed",
    asset: "ETH",
  },
  {
    id: 3,
    type: "receive",
    amount: "+5,000 DX",
    usdValue: "+$1,250.00",
    from: "0x9e8d...4c2a",
    date: "Jul 12, 2024",
    status: "completed",
    asset: "DX",
  },
  {
    id: 4,
    type: "send",
    amount: "-0.0012 BTC",
    usdValue: `-$${(0.0012 * btcPrice).toLocaleString(undefined, { minimumFractionDigits: 2, maximumFractionDigits: 2 })}`,
    to: "0x2b5e...9d3f",
    date: "Jul 10, 2024",
    status: "pending",
    asset: "BTC",
  },
  {
    id: 5,
    type: "receive",
    amount: "+0.5 ETH",
    usdValue: `+$${(0.5 * ethPrice).toLocaleString(undefined, { minimumFractionDigits: 2, maximumFractionDigits: 2 })}`,
    from: "0x6d4b...7e2c",
    date: "Jul 5, 2024",
    status: "completed",
    asset: "ETH",
  },
]

const Wallet: React.FC = () => {
  const [activeTab, setActiveTab] = useState<"assets" | "transactions" | "security">("assets")
  const [showBalance, setShowBalance] = useState(true)
  const [showSendModal, setShowSendModal] = useState(false)
  const [showReceiveModal, setShowReceiveModal] = useState(false)
  const [copiedAddress, setCopiedAddress] = useState(false)
  const [loading, setLoading] = useState(true)
  const [cryptoData, setCryptoData] = useState<CryptoPrice[]>([])
  const [assets, setAssets] = useState<Asset[]>([])
  const [transactions, setTransactions] = useState<Transaction[]>([])
  const [performanceData, setPerformanceData] = useState<any[]>([])
  const [totalBalance, setTotalBalance] = useState("$0.00")
  const [error, setError] = useState<string | null>(null)

  const walletAddress = "0x7F3c8d9E2a1B4C5D6e7F8g9H0j1K2L3M4N5O6P7Q"

  // Fetch cryptocurrency data
  useEffect(() => {
    const fetchCryptoData = async () => {
      try {
        setLoading(true)
        // Using CoinGecko's public API to get real-time BTC and ETH prices
        const response = await fetch(
          "https://api.coingecko.com/api/v3/coins/markets?vs_currency=usd&ids=bitcoin,ethereum&order=market_cap_desc&per_page=100&page=1&sparkline=true&price_change_percentage=1h,24h,7d",
        )

        if (!response.ok) {
          throw new Error("Failed to fetch cryptocurrency data")
        }

        const data: any[] = await response.json()
        setCryptoData(data)

        // Create assets with real prices
        const btcData = data.find((crypto) => crypto.id === "bitcoin")
        const ethData = data.find((crypto) => crypto.id === "ethereum")

        if (btcData && ethData) {
          console.log("Real-time BTC price:", btcData.current_price)
          console.log("Real-time ETH price:", ethData.current_price)

          const btcAmount = 0.0234
          const ethAmount = 1.234
          const dxAmount = 15234
          const dxPrice = 0.255 // Fixed price for our fictional token

          const btcValue = btcAmount * btcData.current_price
          const ethValue = ethAmount * ethData.current_price
          const dxValue = dxAmount * dxPrice
          const total = btcValue + ethValue + dxValue

          const btcPercentage = Math.round((btcValue / total) * 100)
          const ethPercentage = Math.round((ethValue / total) * 100)
          const dxPercentage = 100 - btcPercentage - ethPercentage

          const newAssets: Asset[] = [
            {
              id: "bitcoin",
              name: "Bitcoin",
              symbol: "BTC",
              value: btcPercentage,
              color: "#F7931A",
              amount: `${btcAmount.toFixed(4)} BTC`,
              usdValue: `$${btcValue.toLocaleString(undefined, { minimumFractionDigits: 2, maximumFractionDigits: 2 })}`,
              icon: <FaBitcoin />,
              price: btcData.current_price,
              change24h: btcData.price_change_percentage_24h,
            },
            {
              id: "ethereum",
              name: "Ethereum",
              symbol: "ETH",
              value: ethPercentage,
              color: "#627EEA",
              amount: `${ethAmount.toFixed(4)} ETH`,
              usdValue: `$${ethValue.toLocaleString(undefined, { minimumFractionDigits: 2, maximumFractionDigits: 2 })}`,
              icon: <FaEthereum />,
              price: ethData.current_price,
              change24h: ethData.price_change_percentage_24h,
            },
            {
              id: "digix",
              name: "DigiX",
              symbol: "DX",
              value: dxPercentage,
              color: "#22C55E",
              amount: `${dxAmount.toFixed(0)} DX`,
              usdValue: `$${dxValue.toLocaleString(undefined, { minimumFractionDigits: 2, maximumFractionDigits: 2 })}`,
              icon: null,
              price: dxPrice,
              change24h: 1.25,
            },
          ]

          setAssets(newAssets)
          setTotalBalance(`$${total.toLocaleString(undefined, { minimumFractionDigits: 2, maximumFractionDigits: 2 })}`)

          // Generate transactions with real prices
          setTransactions(generateTransactions(btcData.current_price, ethData.current_price))

          // Use real sparkline data from CoinGecko if available
          if (btcData.sparkline_in_7d && btcData.sparkline_in_7d.price) {
            const sparklineData = btcData.sparkline_in_7d.price
            const chartData = sparklineData.map((price: number, index: number) => {
              // Create a date for each point (168 points for 7 days, 1 hour intervals)
              const date = new Date()
              date.setHours(date.getHours() - (sparklineData.length - index))
              return {
                date: date.toLocaleDateString("en-US", { month: "short", day: "numeric", hour: "2-digit" }),
                value: price * btcAmount + ethData.sparkline_in_7d.price[index] * ethAmount + dxPrice * dxAmount,
              }
            })

            // Take every 6th point to reduce density (approximately 4-hour intervals)
            const filteredChartData = chartData.filter((_: any, i: number) => i % 6 === 0)
            setPerformanceData(filteredChartData)
          } else {
            // Fallback to generated data if sparkline not available
            setPerformanceData(generateHistoricalData(total, 30))
          }
        }

        setLoading(false)
      } catch (err) {
        console.error("Error fetching crypto data:", err)
        setError("Failed to fetch cryptocurrency data. Using demo data instead.")
        setLoading(false)

        // Use fallback data
        const fallbackAssets = [
          {
            id: "bitcoin",
            name: "Bitcoin",
            symbol: "BTC",
            value: 45,
            color: "#F7931A",
            amount: "0.0234 BTC",
            usdValue: "$1,245.32",
            icon: <FaBitcoin />,
            price: 53219.75,
            change24h: 2.34,
          },
          {
            id: "ethereum",
            name: "Ethereum",
            symbol: "ETH",
            value: 30,
            color: "#627EEA",
            amount: "1.234 ETH",
            usdValue: "$2,567.89",
            icon: <FaEthereum />,
            price: 2081.76,
            change24h: -1.45,
          },
          {
            id: "digix",
            name: "DigiX",
            symbol: "DX",
            value: 25,
            color: "#22C55E",
            amount: "15,234 DX",
            usdValue: "$3,890.45",
            icon: null,
            price: 0.255,
            change24h: 1.25,
          },
        ]

        setAssets(fallbackAssets)
        setTotalBalance("$7,703.66")
        setTransactions(generateTransactions(53219.75, 2081.76))
        setPerformanceData(generateHistoricalData(7703.66, 30))
      }
    }

    fetchCryptoData()

    // Refresh data every 30 seconds
    const interval = setInterval(() => {
      fetchCryptoData()
    }, 30000)

    return () => clearInterval(interval)
  }, [])

  const copyToClipboard = () => {
    navigator.clipboard.writeText(walletAddress)
    setCopiedAddress(true)
    setTimeout(() => setCopiedAddress(false), 2000)
  }

  return (
    <div className="w-full max-w-6xl mx-auto p-6 font-sans bg-gray-950 text-white min-h-screen">
      <h1 className="text-4xl font-bold mb-8 text-center tracking-wider bg-gradient-to-r from-blue-500 via-purple-500 to-green-500 bg-clip-text text-transparent">
        Crypto Wallet
      </h1>

      {/* Error notification */}
      {/* {error && (
        <div className="bg-red-500/20 border border-red-500 text-red-200 px-4 py-3 rounded-lg mb-6 flex items-center">
          <FaShieldAlt className="mr-2" />
          {error}
        </div>
      )} */}

      {/* Wallet Overview Card */}
      <div className="bg-gray-900 rounded-2xl p-8 mb-8 border border-gray-800 shadow-xl">
        <div className="flex flex-col md:flex-row justify-between items-center mb-8">
          <div className="flex items-center mb-4 md:mb-0">
            <div className="w-16 h-16 bg-gradient-to-br from-blue-500/20 to-purple-500/20 rounded-full flex items-center justify-center mr-4 border border-blue-500/30">
              <FaWallet className="text-blue-400 text-2xl" />
            </div>
            <div>
              <div className="flex items-center">
                <h2 className="text-xl font-bold mr-2">Main Wallet</h2>
                <div className="bg-green-500/20 text-green-400 text-xs px-2 py-1 rounded-full border border-green-500/30">
                  Active
                </div>
              </div>
              <div className="flex items-center text-gray-400 text-sm mt-1">
                <span className="mr-2">
                  {walletAddress.substring(0, 8)}...{walletAddress.substring(walletAddress.length - 8)}
                </span>
                <button
                  onClick={copyToClipboard}
                  className="text-gray-400  hover:text-gray-700 transition-colors"
                  aria-label="Copy wallet address"
                >
                  {copiedAddress ? <FaCheckCircle className="text-green-500" /> : <FaCopy />}
                </button>
              </div>
            </div>
          </div>

          <div className="flex flex-col items-end">
            <div className="flex items-center mb-2">
              <h3 className="text-gray-400 mr-2">Total Balance:</h3>
              <div className="flex items-center">
                {loading ? (
                  <div className="h-8 w-32 bg-gray-800 animate-pulse rounded"></div>
                ) : showBalance ? (
                  <span className="text-2xl font-bold">{totalBalance}</span>
                ) : (
                  <span className="text-2xl font-bold">••••••••</span>
                )}
                <button
                  onClick={() => setShowBalance(!showBalance)}
                  className="ml-2 text-gray-400 hover:text-gray-700 transition-colors"
                  aria-label={showBalance ? "Hide balance" : "Show balance"}
                >
                  {showBalance ? <FaEyeSlash /> : <FaEye />}
                </button>
              </div>
            </div>
            <div className="flex space-x-3">
              <button
                onClick={() => setShowSendModal(true)}
                className="flex items-center bg-gradient-to-r from-red-500/20 to-red-600/20 bg-red-600 hover:from-red-500/30 hover:to-red-600/30 px-4 py-2 rounded-lg transition-colors border border-red-500/30"
              >
                <FaArrowUp className="mr-2 text-red-400" />
                <span>Send</span>
              </button>
              <button
                onClick={() => setShowReceiveModal(true)}
                className="flex items-center bg-gradient-to-r from-green-500/20 bg-green-600 to-green-600/20 hover:from-green-500/30 hover:to-green-600/30 px-4 py-2 rounded-lg transition-colors border border-green-500/30"
              >
                <FaArrowDown className="mr-2 text-green-400" />
                <span>Receive</span>
              </button>
              <button className="flex items-center bg-gradient-to-r from-blue-500/20 bg-blue-600 to-blue-600/20 hover:from-blue-500/30 hover:to-blue-600/30 px-4 py-2 rounded-lg transition-colors border border-blue-500/30">
                <FaExchangeAlt className="mr-2 text-blue-400" />
                <span>Swap</span>
              </button>
            </div>
          </div>
        </div>

        {/* Performance Chart */}
        <div>
          <div className="flex justify-between items-center mb-4">
            <h3 className="text-lg font-bold">Portfolio Performance</h3>
            <div className="flex bg-gray-800 rounded-full p-1 border border-gray-700">
              <button
                className={`px-3 py-1 text-xs rounded-full transition-colors ${
                  activeTab === "assets"
                    ? "bg-gradient-to-r from-blue-500 to-purple-500 text-white"
                    : "text-gray-400 hover:text-white"
                }`}
                onClick={() => setActiveTab("assets")}
              >
                Assets
              </button>
              <button
                className={`px-3 py-1 text-xs rounded-full transition-colors ${
                  activeTab === "transactions"
                    ? "bg-gradient-to-r from-blue-500 to-purple-500 text-white"
                    : "text-gray-400 hover:text-white"
                }`}
                onClick={() => setActiveTab("transactions")}
              >
                Transactions
              </button>
              <button
                className={`px-3 py-1 text-xs rounded-full transition-colors ${
                  activeTab === "security"
                    ? "bg-gradient-to-r from-blue-500 to-purple-500 text-white"
                    : "text-gray-400 hover:text-white"
                }`}
                onClick={() => setActiveTab("security")}
              >
                Security
              </button>
            </div>
          </div>

          {loading ? (
            <div className="h-64 w-full bg-gray-800 animate-pulse rounded-lg"></div>
          ) : (
            <div className="h-64 w-full">
              <ResponsiveContainer width="100%" height="100%">
                <LineChart data={performanceData}>
                  <XAxis
                    dataKey="date"
                    axisLine={false}
                    tickLine={false}
                    tick={{ fill: "#9CA3AF", fontSize: 12 }}
                    tickFormatter={(value) => {
                      // Only show day and month, not time
                      if (typeof value === "string") {
                        return value.split(",")[0]
                      }
                      return value
                    }}
                  />
                  <YAxis
                    axisLine={false}
                    tickLine={false}
                    tick={{ fill: "#9CA3AF", fontSize: 12 }}
                    domain={["auto", "auto"]}
                    tickFormatter={(value) => `$${Math.round(value).toLocaleString()}`}
                    width={80}
                  />
                  <Tooltip
                    contentStyle={{
                      backgroundColor: "#111827",
                      border: "1px solid #374151",
                      borderRadius: "8px",
                      color: "white",
                      boxShadow: "0 10px 25px -5px rgba(0, 0, 0, 0.3)",
                    }}
                    formatter={(value: number) => [
                      `$${value.toLocaleString(undefined, { minimumFractionDigits: 2, maximumFractionDigits: 2 })}`,
                    ]}
                    labelFormatter={(label) => `Date: ${label}`}
                    cursor={{ stroke: "#6366F1", strokeWidth: 1, strokeDasharray: "5 5" }}
                  />
                  <Line
                    type="monotone"
                    dataKey="value"
                    stroke="url(#colorGradient)"
                    strokeWidth={3}
                    dot={false}
                    activeDot={{ fill: "#6366F1", r: 6, strokeWidth: 2, stroke: "#312E81" }}
                  />
                  <defs>
                    <linearGradient id="colorGradient" x1="0" y1="0" x2="1" y2="0">
                      <stop offset="0%" stopColor="#6366F1" />
                      <stop offset="50%" stopColor="#8B5CF6" />
                      <stop offset="100%" stopColor="#EC4899" />
                    </linearGradient>
                    <filter id="glow" x="-20%" y="-20%" width="140%" height="140%">
                      <feGaussianBlur stdDeviation="4" result="blur" />
                      <feComposite in="SourceGraphic" in2="blur" operator="over" />
                    </filter>
                  </defs>
                  <CartesianGrid stroke="#1F2937" strokeDasharray="5 5" vertical={false} />
                </LineChart>
              </ResponsiveContainer>
            </div>
          )}
        </div>
      </div>

      {/* Content based on active tab */}
      {activeTab === "assets" && (
        <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
          {/* Assets Distribution */}
          <div className="bg-gray-900 rounded-2xl p-6 lg:col-span-1 border border-gray-800 shadow-lg">
            <h3 className="text-lg font-bold mb-4">Assets Distribution</h3>
            {loading ? (
              <div className="h-64 w-full bg-gray-800 animate-pulse rounded-lg"></div>
            ) : (
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
                        <Cell key={`cell-${index}`} fill={entry.color} stroke="rgba(0,0,0,0.3)" />
                      ))}
                    </Pie>
                    <Tooltip
                      contentStyle={{
                        backgroundColor: "#1F2937",
                        border: "1px solid #374151",
                        borderRadius: "8px",
                        color: "white",
                        boxShadow: "0 10px 15px -3px rgba(0, 0, 0, 0.1)",
                      }}
                      formatter={(value) => [`${value}%`]}
                      labelFormatter={(index) => assets[index as number].name}
                    />
                  </PieChart>
                </ResponsiveContainer>
              </div>
            )}
          </div>

          {/* Assets List */}
          <div className="bg-gray-900 rounded-2xl p-6 lg:col-span-2 border border-gray-800 shadow-lg">
            <h3 className="text-lg font-bold mb-4">Your Assets</h3>
            {loading ? (
              <div className="space-y-4">
                {[1, 2, 3].map((i) => (
                  <div key={i} className="h-20 bg-gray-800 animate-pulse rounded-lg"></div>
                ))}
              </div>
            ) : (
              <div className="space-y-4">
                {assets.map((asset, index) => (
                  <div
                    key={index}
                    className="flex items-center justify-between p-4 bg-gray-800/50 rounded-xl hover:bg-gray-800 transition-colors border border-gray-700/50"
                  >
                    <div className="flex items-center">
                      <div
                        className="w-12 h-12 rounded-full flex items-center justify-center mr-4 border"
                        style={{
                          backgroundColor: `${asset.color}20`,
                          borderColor: `${asset.color}40`,
                        }}
                      >
                        {asset.icon ? (
                          <span className="text-xl" style={{ color: asset.color }}>
                            {asset.icon}
                          </span>
                        ) : (
                          <span className="text-lg font-bold" style={{ color: asset.color }}>
                            DX
                          </span>
                        )}
                      </div>
                      <div>
                        <div className="flex items-center">
                          <h4 className="font-bold">{asset.name}</h4>
                          <span className="text-gray-400 text-xs ml-2">({asset.symbol})</span>
                        </div>
                        <div className="flex items-center mt-1">
                          <p className="text-gray-400 text-sm">{asset.amount}</p>
                          <span className={`text-xs ml-2 ${asset.change24h >= 0 ? "text-green-400" : "text-red-400"}`}>
                            {asset.change24h >= 0 ? "↑" : "↓"} {Math.abs(asset.change24h).toFixed(2)}%
                          </span>
                        </div>
                      </div>
                    </div>
                    <div className="text-right">
                      <p className="font-bold">{asset.usdValue}</p>
                      <p className="text-gray-400 text-sm">
                        ${asset.price.toLocaleString(undefined, { minimumFractionDigits: 2, maximumFractionDigits: 2 })}
                      </p>
                    </div>
                  </div>
                ))}
              </div>
            )}
          </div>
        </div>
      )}

      {activeTab === "transactions" && (
        <div className="bg-gray-900 rounded-2xl p-6 border border-gray-800 shadow-lg">
          <div className="flex items-center justify-between mb-4">
            <h3 className="text-lg font-bold">Recent Transactions</h3>
            <button className="flex items-center text-sm text-gray-400 hover:text-white transition-colors">
              <FaHistory className="mr-1" /> View All
            </button>
          </div>
          {loading ? (
            <div className="space-y-4">
              {[1, 2, 3, 4].map((i) => (
                <div key={i} className="h-20 bg-gray-800 animate-pulse rounded-lg"></div>
              ))}
            </div>
          ) : (
            <div className="space-y-4">
              {transactions.map((tx) => (
                <div
                  key={tx.id}
                  className="flex items-center justify-between p-4 bg-gray-800/50 rounded-xl hover:bg-gray-800 transition-colors border border-gray-700/50"
                >
                  <div className="flex items-center">
                    <div
                      className={`w-12 h-12 rounded-full flex items-center justify-center mr-4 border ${
                        tx.type === "receive"
                          ? "bg-green-500/10 border-green-500/30"
                          : "bg-red-500/10 border-red-500/30"
                      }`}
                    >
                      {tx.type === "receive" ? (
                        <FaArrowDown className="text-green-400" />
                      ) : (
                        <FaArrowUp className="text-red-400" />
                      )}
                    </div>
                    <div>
                      <div className="flex items-center">
                        <h4 className="font-bold">{tx.type === "receive" ? "Received" : "Sent"}</h4>
                        <span className="text-gray-400 text-xs ml-2">{tx.asset}</span>
                      </div>
                      <p className="text-gray-400 text-sm">
                        {tx.type === "receive" ? `From: ${tx.from}` : `To: ${tx.to}`}
                      </p>
                    </div>
                  </div>
                  <div className="text-right">
                    <p className={`font-bold ${tx.type === "receive" ? "text-green-400" : "text-red-400"}`}>
                      {tx.amount}
                    </p>
                    <div className="flex items-center justify-end">
                      <p className="text-gray-400 text-sm mr-2">{tx.date}</p>
                      <span
                        className={`text-xs px-2 py-0.5 rounded-full ${
                          tx.status === "completed"
                            ? "bg-green-500/10 text-green-400 border border-green-500/30"
                            : "bg-yellow-500/10 text-yellow-400 border border-yellow-500/30"
                        }`}
                      >
                        {tx.status}
                      </span>
                    </div>
                  </div>
                </div>
              ))}
            </div>
          )}
        </div>
      )}

      {activeTab === "security" && (
        <div className="bg-gray-900 rounded-2xl p-6 border border-gray-800 shadow-lg">
          <h3 className="text-lg font-bold mb-6">Security Settings</h3>

          <div className="space-y-6">
            <div className="flex items-center justify-between p-4 bg-gray-800/50 rounded-xl border border-gray-700/50 hover:bg-gray-800 transition-colors">
              <div className="flex items-center">
                <div className="w-12 h-12 bg-blue-500/10 rounded-full flex items-center justify-center mr-4 border border-blue-500/30">
                  <FaLock className="text-blue-400" />
                </div>
                <div>
                  <h4 className="font-bold">Two-Factor Authentication</h4>
                  <p className="text-gray-400 text-sm">Add an extra layer of security to your account</p>
                </div>
              </div>
              <div className="flex items-center">
                <span className="bg-green-500/10 text-green-400 text-xs px-2 py-1 rounded-full mr-2 border border-green-500/30">
                  Enabled
                </span>
                <button className="bg-gray-700 hover:bg-gray-600 px-3 py-1 rounded-lg text-sm transition-colors">
                  Manage
                </button>
              </div>
            </div>

            <div className="flex items-center justify-between p-4 bg-gray-800/50 rounded-xl border border-gray-700/50 hover:bg-gray-800 transition-colors">
              <div className="flex items-center">
                <div className="w-12 h-12 bg-purple-500/10 rounded-full flex items-center justify-center mr-4 border border-purple-500/30">
                  <FaShieldAlt className="text-purple-400" />
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

            <div className="flex items-center justify-between p-4 bg-gray-800/50 rounded-xl border border-gray-700/50 hover:bg-gray-800 transition-colors">
              <div className="flex items-center">
                <div className="w-12 h-12 bg-red-500/10 rounded-full flex items-center justify-center mr-4 border border-red-500/30">
                  <FaChartLine className="text-red-400" />
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
        <div className="fixed inset-0 bg-black/80 flex items-center justify-center z-50 p-4 backdrop-blur-sm">
          <div className="bg-gray-900 rounded-xl p-6 max-w-md w-full border border-gray-800 shadow-2xl">
            <div className="flex justify-between items-center mb-6">
              <h3 className="text-xl font-bold">Send Assets</h3>
              <button
                onClick={() => setShowSendModal(false)}
                className="text-gray-400 hover:text-white transition-colors"
                aria-label="Close modal"
              >
                ✕
              </button>
            </div>

            <div className="space-y-4">
              <div>
                <label className="block text-gray-400 mb-2">Select Asset</label>
                <select className="w-full bg-gray-800 border border-gray-700 rounded-lg p-3 focus:outline-none focus:border-blue-500 transition-colors">
                  {assets.map((asset) => (
                    <option key={asset.id} value={asset.symbol.toLowerCase()}>
                      {asset.name} ({asset.symbol}) - {asset.amount}
                    </option>
                  ))}
                </select>
              </div>

              <div>
                <label className="block text-gray-400 mb-2">Recipient Address</label>
                <input
                  type="text"
                  placeholder="Enter wallet address"
                  className="w-full bg-gray-800 border border-gray-700 rounded-lg p-3 focus:outline-none focus:border-blue-500 transition-colors"
                />
              </div>

              <div>
                <label className="block text-gray-400 mb-2">Amount</label>
                <div className="flex">
                  <input
                    type="number"
                    placeholder="0.00"
                    className="w-full bg-gray-800 border border-gray-700 rounded-l-lg p-3 focus:outline-none focus:border-blue-500 transition-colors"
                  />
                  <div className="bg-gray-700 border border-gray-700 rounded-r-lg px-4 flex items-center">BTC</div>
                </div>
                <p className="text-gray-400 text-sm mt-1">≈ $0.00</p>
              </div>

              <div>
                <label className="block text-gray-400 mb-2">Network Fee</label>
                <div className="flex space-x-2">
                  <button className="flex-1 bg-gray-800 border border-gray-700 rounded-lg p-2 focus:outline-none hover:bg-gray-700 transition-colors">
                    <div className="text-sm font-bold">Slow</div>
                    <div className="text-xs text-gray-400">0.0001 BTC</div>
                  </button>
                  <button className="flex-1 bg-gray-800 border border-blue-500 rounded-lg p-2 focus:outline-none hover:bg-gray-700 transition-colors">
                    <div className="text-sm font-bold">Medium</div>
                    <div className="text-xs text-gray-400">0.0002 BTC</div>
                  </button>
                  <button className="flex-1 bg-gray-800 border border-gray-700 rounded-lg p-2 focus:outline-none hover:bg-gray-700 transition-colors">
                    <div className="text-sm font-bold">Fast</div>
                    <div className="text-xs text-gray-400">0.0003 BTC</div>
                  </button>
                </div>
              </div>

              <button className="w-full bg-gradient-to-r from-blue-500 to-purple-500 hover:from-blue-600 hover:to-purple-600 text-white font-bold py-3 rounded-lg transition-colors mt-4">
                Send Transaction
              </button>
            </div>
          </div>
        </div>
      )}

      {/* Receive Modal */}
      {showReceiveModal && (
        <div className="fixed inset-0 bg-black/80 flex items-center justify-center z-50 p-4 backdrop-blur-sm">
          <div className="bg-gray-900 rounded-xl p-6 max-w-md w-full border border-gray-800 shadow-2xl">
            <div className="flex justify-between items-center mb-6">
              <h3 className="text-xl font-bold">Receive Assets</h3>
              <button
                onClick={() => setShowReceiveModal(false)}
                className="text-gray-400 hover:text-white transition-colors"
                aria-label="Close modal"
              >
                ✕
              </button>
            </div>

            <div className="space-y-4 text-center">
              <div>
                <label className="block text-gray-400 mb-2">Select Asset</label>
                <select className="w-full bg-gray-800 border border-gray-700 rounded-lg p-3 focus:outline-none focus:border-blue-500 transition-colors">
                  {assets.map((asset) => (
                    <option key={asset.id} value={asset.symbol.toLowerCase()}>
                      {asset.name} ({asset.symbol})
                    </option>
                  ))}
                </select>
              </div>

              <div className="bg-white p-4 rounded-lg mx-auto w-48 h-48 flex items-center justify-center">
                <FaQrcode className="text-black text-8xl" />
              </div>

              <div>
                <p className="text-gray-400 mb-2">Your Wallet Address</p>
                <div className="flex items-center justify-center bg-gray-800 rounded-lg p-3 border border-gray-700">
                  <span className="text-sm mr-2 truncate">{walletAddress}</span>
                  <button
                    onClick={copyToClipboard}
                    className="text-gray-400 hover:text-white transition-colors"
                    aria-label="Copy wallet address"
                  >
                    {copiedAddress ? <FaCheckCircle className="text-green-500" /> : <FaCopy />}
                  </button>
                </div>
              </div>

              <div className="pt-4">
                <p className="text-yellow-400 text-sm flex items-center justify-center">
                  <FaShieldAlt className="mr-1" />
                  Only send the selected asset to this address
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

