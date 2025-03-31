"use client"

import { useState, useEffect } from "react"
import { FaCheckCircle, FaGamepad, FaCoins, FaFire, FaGem, FaBolt, FaTrophy, FaChartLine } from "react-icons/fa"

const Farm = () => {
  const [claimed, setClaimed] = useState(false)
  const [activeTab, setActiveTab] = useState("farming")
  const [farmingProgress, setFarmingProgress] = useState(45)
  const [showReward, setShowReward] = useState(false)
  const [particles, setParticles] = useState([])

  // Generate random particles for background effect
  useEffect(() => {
    const newParticles = Array.from({ length: 20 }, (_, i) => ({
      id: i,
      x: Math.random() * 100,
      y: Math.random() * 100,
      size: Math.random() * 3 + 1,
      speed: Math.random() * 1 + 0.5,
      opacity: Math.random() * 0.3 + 0.1,
    }))
    setParticles(newParticles)

    const interval = setInterval(() => {
      setParticles((prev) =>
        prev.map((p) => ({
          ...p,
          y: (p.y + p.speed) % 100,
          opacity: Math.random() * 0.3 + 0.1,
        })),
      )
    }, 100)

    return () => clearInterval(interval)
  }, [])

  // Progress bar animation
  useEffect(() => {
    const interval = setInterval(() => {
      setFarmingProgress((prev) => {
        if (prev >= 100) {
          setShowReward(true)
          return 0
        }
        return prev + 1
      })
    }, 1000)

    return () => clearInterval(interval)
  }, [])

  const handleClaim = () => {
    setClaimed(true)
    // Create a burst of particles
    const burstParticles = Array.from({ length: 30 }, (_, i) => ({
      id: i + 100,
      x: 50,
      y: 50,
      size: Math.random() * 5 + 2,
      speed: Math.random() * 3 + 1,
      angle: Math.random() * 360,
      opacity: 1,
      color: Math.random() > 0.5 ? "green" : "gold",
    }))
    setParticles((prev) => [...prev, ...burstParticles])

    setTimeout(() => {
      setClaimed(false)
      setParticles((prev) => prev.filter((p) => p.id < 100))
    }, 2000)
  }

  return (
    <div className="w-full font-mono bg-white text-gray-800 min-h-screen relative overflow-hidden p-6">
      {/* Animated Particles Background */}
      <div className="absolute inset-0 overflow-hidden pointer-events-none">
        {particles.map((particle) => (
          <div
            key={particle.id}
            className={`absolute rounded-full ${particle.color === "green" ? "bg-emerald-500" : "bg-amber-400"}`}
            style={{
              left: `${particle.x}%`,
              top: `${particle.y}%`,
              width: `${particle.size}px`,
              height: `${particle.size}px`,
              opacity: particle.opacity,
              transform: particle.angle ? `rotate(${particle.angle}deg)` : "none",
              transition: "opacity 0.3s ease",
            }}
          />
        ))}
      </div>

      {/* Subtle Background Pattern */}
      <div className="absolute inset-0 bg-gradient-to-br from-gray-50 via-white to-gray-100 opacity-90 pointer-events-none"></div>
      <div className="absolute inset-0 bg-[url('data:image/svg+xml;base64,PHN2ZyB3aWR0aD0iNjAiIGhlaWdodD0iNjAiIHZpZXdCb3g9IjAgMCA2MCA2MCIgeG1sbnM9Imh0dHA6Ly93d3cudzMub3JnLzIwMDAvc3ZnIj48ZyBmaWxsPSJub25lIiBmaWxsLXJ1bGU9ImV2ZW5vZGQiPjxnIGZpbGw9IiMwMDAiIGZpbGwtb3BhY2l0eT0iLjAyIj48cGF0aCBkPSJNMzYgMzRjMC0yLjIxLTEuNzktNC00LTRzLTQgMS43OS00IDQgMS43OSA0IDQgNCA0LTEuNzkgNC00eiIvPjwvZz48L2c+PC9zdmc+')] opacity-30 pointer-events-none"></div>

      {/* Header Section */}
      <div className="relative z-10 flex justify-between items-center mb-8">
        <h1 className="text-3xl font-bold text-gray-900 tracking-tight">Farming Dashboard</h1>
        <div className="text-3xl font-bold bg-clip-text text-transparent bg-gradient-to-r from-emerald-500 to-teal-600">
          189.331.433 <span>Dx</span>
        </div>
      </div>

      {/* Main Content */}
      <div className="relative z-10 grid grid-cols-1 lg:grid-cols-3 gap-6">
        {/* Left Column - Farming Stats */}
        <div className="lg:col-span-2">
          {/* Tabs */}
          <div className="flex mb-6 bg-white rounded-xl p-1 max-w-md shadow-sm border border-gray-100">
            <button
              onClick={() => setActiveTab("farming")}
              className={`flex-1 py-2 rounded-lg transition-all duration-300 ${
                activeTab === "farming"
                  ? "bg-gradient-to-r from-emerald-500 to-teal-500 text-white font-bold shadow-md"
                  : "text-gray-500 hover:text-gray-700 hover:bg-gray-50"
              }`}
            >
              Farming
            </button>
            <button
              onClick={() => setActiveTab("games")}
              className={`flex-1 py-2 rounded-lg transition-all duration-300 ${
                activeTab === "games"
                  ? "bg-gradient-to-r from-emerald-500 to-teal-500 text-white font-bold shadow-md"
                  : "text-gray-500 hover:text-gray-700 hover:bg-gray-50"
              }`}
            >
              Games
            </button>
          </div>

          {activeTab === "farming" && (
            <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
              {/* Active Farming */}
              <div className="bg-white rounded-xl p-6 border border-gray-100 shadow-lg transition-all duration-300 hover:shadow-xl group">
                <h3 className="font-bold text-xl mb-4 flex items-center text-gray-800">
                  <FaFire className="mr-2 text-amber-500" /> Active Farming
                </h3>

                <div className="flex items-center justify-between mb-4">
                  <div>
                    <p className="text-gray-500 text-sm">Rate</p>
                    <p className="text-xl font-bold text-gray-800">400 Dx/h</p>
                  </div>
                  <div className="text-gray-700 bg-gray-100 px-3 py-1 rounded-md font-bold">x 10</div>
                </div>

                <div className="flex justify-center my-6">
                  <div className="w-24 h-24 bg-gradient-to-br from-emerald-50 to-emerald-100 rounded-full flex items-center justify-center relative shadow-inner group-hover:shadow-emerald-100 transition-all duration-500">
                    <div className="absolute inset-0 rounded-full bg-emerald-500 opacity-10 animate-ping"></div>
                    <FaFire className="text-emerald-500 text-4xl animate-pulse" />
                  </div>
                </div>

                {/* Progress Bar */}
                <div className="mb-3 bg-gray-100 rounded-full h-4 overflow-hidden shadow-inner">
                  <div
                    className="h-full bg-gradient-to-r from-emerald-500 to-teal-400 transition-all duration-300"
                    style={{ width: `${farmingProgress}%` }}
                  ></div>
                </div>

                <div className="bg-gray-50 rounded-lg p-2 text-center font-bold mb-4 text-gray-700 shadow-sm">
                  1h 41m 0s
                </div>

                {showReward && (
                  <div className="mt-3 bg-gradient-to-r from-amber-400 to-amber-300 text-amber-900 p-2 rounded-lg text-center animate-bounce shadow-md">
                    <span className="font-bold">+200 Dx</span> Reward Collected!
                  </div>
                )}
              </div>

              {/* Boosters */}
              <div className="bg-white rounded-xl p-6 border border-gray-100 shadow-lg transition-all duration-300 hover:shadow-xl">
                <h3 className="font-bold text-xl mb-4 flex items-center text-gray-800">
                  <FaBolt className="mr-2 text-amber-500" /> Boosters
                </h3>

                <div className="grid grid-cols-2 gap-4 mb-4">
                  <div className="bg-gray-50 rounded-lg p-4 text-center transition-all duration-300 hover:bg-white hover:shadow-md cursor-pointer transform hover:scale-[1.02] border border-gray-100">
                    <div className="flex justify-center mb-3">
                      <div className="w-12 h-12 bg-amber-50 rounded-full flex items-center justify-center shadow-sm">
                        <FaBolt className="text-amber-500 text-xl" />
                      </div>
                    </div>
                    <p className="font-bold text-gray-800">2x Speed</p>
                    <p className="text-sm text-emerald-600">1 hour</p>
                    <button className="mt-3 w-full py-1 rounded-md text-sm font-medium bg-emerald-500 text-white hover:bg-emerald-600 transition-colors shadow-sm">
                      Activate
                    </button>
                  </div>

                  <div className="bg-gray-50 rounded-lg p-4 text-center transition-all duration-300 hover:bg-white hover:shadow-md cursor-pointer transform hover:scale-[1.02] border border-gray-100">
                    <div className="flex justify-center mb-3">
                      <div className="w-12 h-12 bg-purple-50 rounded-full flex items-center justify-center shadow-sm">
                        <FaGem className="text-purple-500 text-xl" />
                      </div>
                    </div>
                    <p className="font-bold text-gray-800">3x Rewards</p>
                    <p className="text-sm text-emerald-600">30 mins</p>
                    <button className="mt-3 w-full py-1 rounded-md text-sm font-medium bg-emerald-500 text-white hover:bg-emerald-600 transition-colors shadow-sm">
                      Activate
                    </button>
                  </div>
                </div>

                <div className="bg-gray-50 rounded-lg p-4 transition-all duration-300 hover:bg-white hover:shadow-md cursor-pointer transform hover:scale-[1.01] border border-gray-100">
                  <div className="flex items-center">
                    <div className="w-12 h-12 bg-blue-50 rounded-full flex items-center justify-center mr-4 shadow-sm">
                      <FaChartLine className="text-blue-500 text-xl" />
                    </div>
                    <div>
                      <p className="font-bold text-gray-800">Premium Booster Pack</p>
                      <p className="text-sm text-gray-500">Unlock all boosters for 24 hours</p>
                    </div>
                    <button className="ml-auto px-3 py-1 rounded-md text-sm font-medium bg-emerald-500 text-white hover:bg-emerald-600 transition-colors shadow-sm">
                      Buy
                    </button>
                  </div>
                </div>
              </div>
            </div>
          )}

          {activeTab === "games" && (
            <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
              {/* Featured Game */}
              <div className="bg-white rounded-xl overflow-hidden border border-gray-100 shadow-lg transition-all duration-300 hover:shadow-xl">
                <div className="h-40 bg-gradient-to-r from-blue-500 to-indigo-600 relative">
                  <div className="absolute inset-0 flex items-center justify-center">
                    <FaGamepad className="text-white text-6xl opacity-30" />
                  </div>
                </div>
                <div className="p-5">
                  <h3 className="font-bold text-xl mb-2 text-gray-800">Pixel Miner</h3>
                  <p className="text-gray-500 mb-4">Mine pixels to earn Dx tokens and rare NFTs</p>
                  <div className="flex justify-between items-center">
                    <div>
                      <p className="text-sm text-gray-500">Current Score</p>
                      <p className="font-bold text-gray-800">41 pezz</p>
                    </div>
                    <button className="px-6 py-2 rounded-lg text-sm font-medium bg-gradient-to-r from-emerald-500 to-teal-400 text-white hover:from-emerald-600 hover:to-teal-500 transition-all duration-300 transform hover:scale-105 active:scale-95 shadow-md">
                      Play Now
                    </button>
                  </div>
                </div>
              </div>

              {/* Game List */}
              <div className="bg-white rounded-xl p-5 border border-gray-100 shadow-lg transition-all duration-300 hover:shadow-xl">
                <h3 className="font-bold text-xl mb-4 text-gray-800">More Games</h3>

                <div className="space-y-4">
                  <div className="bg-gray-50 rounded-lg p-3 flex justify-between items-center transition-all duration-300 hover:bg-white hover:shadow-md cursor-pointer border border-gray-100">
                    <div className="flex items-center">
                      <div className="w-10 h-10 bg-amber-50 rounded-full flex items-center justify-center mr-3 shadow-sm">
                        <FaCoins className="text-amber-500" />
                      </div>
                      <div>
                        <h4 className="font-bold text-gray-800">Coin Flip</h4>
                        <p className="text-gray-500 text-xs">Win up to 2x your bet</p>
                      </div>
                    </div>
                    <button className="px-3 py-1 rounded-md text-sm font-medium bg-gray-800 text-white hover:bg-gray-700 transition-colors shadow-sm">
                      Play
                    </button>
                  </div>

                  <div className="bg-gray-50 rounded-lg p-3 flex justify-between items-center transition-all duration-300 hover:bg-white hover:shadow-md cursor-pointer border border-gray-100">
                    <div className="flex items-center">
                      <div className="w-10 h-10 bg-purple-50 rounded-full flex items-center justify-center mr-3 shadow-sm">
                        <FaGem className="text-purple-500" />
                      </div>
                      <div>
                        <h4 className="font-bold text-gray-800">Gem Hunter</h4>
                        <p className="text-gray-500 text-xs">Find hidden gems for rewards</p>
                      </div>
                    </div>
                    <button className="px-3 py-1 rounded-md text-sm font-medium bg-gray-800 text-white hover:bg-gray-700 transition-colors shadow-sm">
                      Play
                    </button>
                  </div>

                  <div className="bg-gray-50 rounded-lg p-3 flex justify-between items-center transition-all duration-300 hover:bg-white hover:shadow-md cursor-pointer border border-gray-100">
                    <div className="flex items-center">
                      <div className="w-10 h-10 bg-amber-50 rounded-full flex items-center justify-center mr-3 shadow-sm">
                        <FaTrophy className="text-amber-500" />
                      </div>
                      <div>
                        <h4 className="font-bold text-gray-800">Tournament</h4>
                        <p className="text-gray-500 text-xs">Compete for massive prizes</p>
                      </div>
                    </div>
                    <button className="px-3 py-1 rounded-md text-sm font-medium bg-gray-800 text-white hover:bg-gray-700 transition-colors shadow-sm">
                      Join
                    </button>
                  </div>
                </div>
              </div>
            </div>
          )}
        </div>

        {/* Right Column - Check In & Daily Rewards */}
        <div className="space-y-6">
          {/* Check In Section */}
          <div className="bg-white rounded-xl p-6 border border-gray-100 shadow-lg transition-all duration-300 hover:shadow-xl">
            <h3 className="font-bold text-xl mb-4 flex items-center text-gray-800">
              <FaCheckCircle className="mr-2 text-emerald-500" /> Daily Check In
            </h3>

            <div className="flex justify-between items-center mb-4">
              <div>
                <p className="text-gray-500 text-sm">Next Check In</p>
                <p className="font-bold text-gray-800">16h 59m 31s</p>
              </div>
              <div className="text-center">
                <p className="text-gray-500 text-sm">Current Streak</p>
                <p className="font-bold text-xl text-gray-800">Day 14</p>
              </div>
            </div>

            <button
              onClick={handleClaim}
              className={`w-full py-3 rounded-lg text-sm font-medium transition-all duration-300 transform hover:scale-[1.02] active:scale-95 shadow-md ${
                claimed
                  ? "bg-gray-200 text-gray-500"
                  : "bg-gradient-to-r from-emerald-500 to-teal-400 hover:from-emerald-600 hover:to-teal-500 text-white"
              }`}
              disabled={claimed}
            >
              {claimed ? "Claimed Today" : "Claim Daily Reward"}
            </button>

            <div className="mt-4 bg-gray-50 rounded-lg p-3 border border-gray-100">
              <p className="text-sm text-center mb-2 text-gray-600">Today's Reward</p>
              <div className="flex items-center justify-center gap-2">
                <FaCoins className="text-amber-500" />
                <span className="font-bold text-gray-800">1,000 Dx</span>
              </div>
            </div>
          </div>

          {/* Daily Rewards */}
          <div className="bg-white rounded-xl p-6 border border-gray-100 shadow-lg transition-all duration-300 hover:shadow-xl">
            <h3 className="font-bold text-xl mb-4 flex items-center text-gray-800">
              <FaGem className="mr-2 text-emerald-500" /> Weekly Rewards
            </h3>

            <div className="grid grid-cols-7 gap-2 mb-4">
              {[1, 2, 3, 4, 5, 6, 7].map((day) => (
                <div
                  key={day}
                  className={`aspect-square rounded-md flex flex-col items-center justify-center transition-all duration-300 ${
                    day < 5
                      ? "bg-gradient-to-br from-emerald-500 to-teal-400 text-white shadow-md"
                      : "bg-gray-100 text-gray-500 hover:bg-gray-200 border border-gray-200"
                  }`}
                >
                  <span className="font-bold">{day}</span>
                  <span className="text-xs">{day < 5 ? "✓" : ""}</span>
                </div>
              ))}
            </div>

            <div className="bg-gray-50 rounded-lg p-3 mb-4 border border-gray-100">
              <div className="flex justify-between items-center">
                <p className="text-sm text-gray-600">Day 7 Reward:</p>
                <div className="flex items-center">
                  <FaGem className="text-purple-500 mr-1" />
                  <span className="font-bold text-gray-800">Rare NFT</span>
                </div>
              </div>
            </div>

            <p className="text-center text-sm text-gray-500">Claim 7 days in a row for a special reward!</p>
          </div>

          {/* Farming Stats */}
          <div className="bg-white rounded-xl p-6 border border-gray-100 shadow-lg transition-all duration-300 hover:shadow-xl">
            <h3 className="font-bold text-xl mb-4 flex items-center text-gray-800">
              <FaChartLine className="mr-2 text-blue-500" /> Farming Stats
            </h3>

            <div className="space-y-3">
              <div className="flex justify-between">
                <p className="text-gray-500">Total Farmed:</p>
                <p className="font-bold text-gray-800">189,381,433 Dx</p>
              </div>
              <div className="flex justify-between">
                <p className="text-gray-500">Current Rate:</p>
                <p className="font-bold text-gray-800">4,000 Dx/h</p>
              </div>
              <div className="flex justify-between">
                <p className="text-gray-500">Active Boosters:</p>
                <p className="font-bold text-emerald-500">2x Speed</p>
              </div>
              <div className="flex justify-between">
                <p className="text-gray-500">Next Level:</p>
                <p className="font-bold text-gray-800">Level 15</p>
              </div>
            </div>

            <div className="mt-4 bg-gray-50 rounded-lg p-3 border border-gray-100">
              <p className="text-sm mb-2 text-gray-600">Progress to Next Level</p>
              <div className="bg-gray-200 rounded-full h-2 overflow-hidden shadow-inner">
                <div className="h-full bg-gradient-to-r from-blue-500 to-indigo-500" style={{ width: "65%" }}></div>
              </div>
              <p className="text-right text-xs mt-1 text-gray-500">65%</p>
            </div>
          </div>
        </div>
      </div>
    </div>
  )
}

export default Farm

