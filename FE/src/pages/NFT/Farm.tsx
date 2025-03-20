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
    const newParticles = Array.from({ length: 30 }, (_, i) => ({
      id: i,
      x: Math.random() * 100,
      y: Math.random() * 100,
      size: Math.random() * 3 + 1,
      speed: Math.random() * 1 + 0.5,
      opacity: Math.random() * 0.5 + 0.1,
    }))
    setParticles(newParticles)

    const interval = setInterval(() => {
      setParticles((prev) =>
        prev.map((p) => ({
          ...p,
          y: (p.y + p.speed) % 100,
          opacity: Math.random() * 0.5 + 0.1,
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
      color: Math.random() > 0.5 ? "green" : "yellow",
    }))
    setParticles((prev) => [...prev, ...burstParticles])

    setTimeout(() => {
      setClaimed(false)
      setParticles((prev) => prev.filter((p) => p.id < 100))
    }, 2000)
  }

  return (
    <div className="w-full font-mono bg-black text-white min-h-screen relative overflow-hidden p-6">
      {/* Animated Particles Background */}
      <div className="absolute inset-0 overflow-hidden pointer-events-none">
        {particles.map((particle) => (
          <div
            key={particle.id}
            className={`absolute rounded-full ${particle.color === "green" ? "bg-green-500" : "bg-yellow-400"}`}
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

      {/* Animated Gradient Background */}
      <div className="absolute inset-0 bg-gradient-to-b from-black via-gray-900 to-black opacity-80 pointer-events-none"></div>

      {/* Header Section */}
      <div className="relative z-10 flex justify-between items-center mb-8">
        <h1 className="text-3xl font-bold">Farming Dashboard</h1>
        <div className="text-3xl font-bold bg-clip-text text-transparent bg-gradient-to-r from-green-400 to-green-600 animate-pulse">
          189.331.433 <span>Dx</span>
        </div>
      </div>

      {/* Main Content */}
      <div className="relative z-10 grid grid-cols-1 lg:grid-cols-3 gap-6">
        {/* Left Column - Farming Stats */}
        <div className="lg:col-span-2">
          {/* Tabs */}
          <div className="flex mb-6 bg-gray-800 rounded-lg p-1 max-w-md">
            <button
              onClick={() => setActiveTab("farming")}
              className={`flex-1 py-2 rounded-md transition-all duration-300 ${
                activeTab === "farming"
                  ? "bg-gradient-to-r from-green-500 to-green-600 text-black font-bold"
                  : "text-gray-400 hover:text-white"
              }`}
            >
              Farming
            </button>
            <button
              onClick={() => setActiveTab("games")}
              className={`flex-1 py-2 rounded-md transition-all duration-300 ${
                activeTab === "games"
                  ? "bg-gradient-to-r from-green-500 to-green-600 text-black font-bold"
                  : "text-gray-400 hover:text-white"
              }`}
            >
              Games
            </button>
          </div>

          {activeTab === "farming" && (
            <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
              {/* Active Farming */}
              <div className="bg-gray-900 bg-opacity-80 backdrop-blur-sm rounded-xl p-5 border border-gray-800 shadow-xl shadow-green-500/10 transition-all duration-300 hover:shadow-green-500/20">
                <h3 className="font-bold text-xl mb-4 flex items-center">
                  <FaFire className="mr-2 text-orange-500" /> Active Farming
                </h3>

                <div className="flex items-center justify-between mb-4">
                  <div>
                    <p className="text-gray-400 text-sm">Rate</p>
                    <p className="text-xl font-bold">400 Dx/h</p>
                  </div>
                  <div className="text-gray-300 bg-gray-700 px-3 py-1 rounded-md font-bold">x 10</div>
                </div>

                <div className="flex justify-center my-6">
                  <div className="w-24 h-24 bg-gradient-to-br from-gray-800 to-gray-900 rounded-full flex items-center justify-center relative">
                    <div className="absolute inset-0 rounded-full bg-green-500 opacity-20 animate-ping"></div>
                    <FaFire className="text-green-500 text-4xl animate-pulse" />
                  </div>
                </div>

                {/* Progress Bar */}
                <div className="mb-3 bg-gray-700 rounded-full h-4 overflow-hidden">
                  <div
                    className="h-full bg-gradient-to-r from-green-500 to-green-400 transition-all duration-300"
                    style={{ width: `${farmingProgress}%` }}
                  ></div>
                </div>

                <div className="bg-gray-700 rounded-lg p-2 text-center font-bold mb-4">1h 41m 0s</div>

                {showReward && (
                  <div className="mt-3 bg-gradient-to-r from-yellow-500 to-yellow-400 text-black p-2 rounded-lg text-center animate-bounce">
                    <span className="font-bold">+200 Dx</span> Reward Collected!
                  </div>
                )}
              </div>

              {/* Boosters */}
              <div className="bg-gray-900 bg-opacity-80 backdrop-blur-sm rounded-xl p-5 border border-gray-800 shadow-xl shadow-green-500/10 transition-all duration-300 hover:shadow-green-500/20">
                <h3 className="font-bold text-xl mb-4 flex items-center">
                  <FaBolt className="mr-2 text-yellow-400" /> Boosters
                </h3>

                <div className="grid grid-cols-2 gap-4 mb-4">
                  <div className="bg-gray-800 rounded-lg p-4 text-center transition-all duration-300 hover:bg-gray-700 cursor-pointer transform hover:scale-[1.02]">
                    <div className="flex justify-center mb-3">
                      <div className="w-12 h-12 bg-gray-700 rounded-full flex items-center justify-center">
                        <FaBolt className="text-yellow-400 text-xl" />
                      </div>
                    </div>
                    <p className="font-bold">2x Speed</p>
                    <p className="text-sm text-green-400">1 hour</p>
                    <button className="mt-3 w-full py-1 rounded-md text-sm font-medium bg-green-500 text-black hover:bg-green-600 transition-colors">
                      Activate
                    </button>
                  </div>

                  <div className="bg-gray-800 rounded-lg p-4 text-center transition-all duration-300 hover:bg-gray-700 cursor-pointer transform hover:scale-[1.02]">
                    <div className="flex justify-center mb-3">
                      <div className="w-12 h-12 bg-gray-700 rounded-full flex items-center justify-center">
                        <FaGem className="text-purple-400 text-xl" />
                      </div>
                    </div>
                    <p className="font-bold">3x Rewards</p>
                    <p className="text-sm text-green-400">30 mins</p>
                    <button className="mt-3 w-full py-1 rounded-md text-sm font-medium bg-green-500 text-black hover:bg-green-600 transition-colors">
                      Activate
                    </button>
                  </div>
                </div>

                <div className="bg-gray-800 rounded-lg p-4 transition-all duration-300 hover:bg-gray-700 cursor-pointer transform hover:scale-[1.02]">
                  <div className="flex items-center">
                    <div className="w-12 h-12 bg-gray-700 rounded-full flex items-center justify-center mr-4">
                      <FaChartLine className="text-blue-400 text-xl" />
                    </div>
                    <div>
                      <p className="font-bold">Premium Booster Pack</p>
                      <p className="text-sm text-gray-400">Unlock all boosters for 24 hours</p>
                    </div>
                    <button className="ml-auto px-3 py-1 rounded-md text-sm font-medium bg-green-500 text-black hover:bg-green-600 transition-colors">
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
              <div className="bg-gray-900 bg-opacity-80 backdrop-blur-sm rounded-xl overflow-hidden border border-gray-800 shadow-xl shadow-green-500/10 transition-all duration-300 hover:shadow-green-500/20">
                <div className="h-40 bg-gradient-to-r from-blue-900 to-purple-900 relative">
                  <div className="absolute inset-0 flex items-center justify-center">
                    <FaGamepad className="text-white text-6xl opacity-30" />
                  </div>
                </div>
                <div className="p-5">
                  <h3 className="font-bold text-xl mb-2">Pixel Miner</h3>
                  <p className="text-gray-400 mb-4">Mine pixels to earn Dx tokens and rare NFTs</p>
                  <div className="flex justify-between items-center">
                    <div>
                      <p className="text-sm text-gray-400">Current Score</p>
                      <p className="font-bold">41 pezz</p>
                    </div>
                    <button className="px-6 py-2 rounded-lg text-sm font-medium bg-gradient-to-r from-green-500 to-green-400 text-black hover:from-green-400 hover:to-green-500 transition-all duration-300 transform hover:scale-105 active:scale-95 shadow-lg">
                      Play Now
                    </button>
                  </div>
                </div>
              </div>

              {/* Game List */}
              <div className="bg-gray-900 bg-opacity-80 backdrop-blur-sm rounded-xl p-5 border border-gray-800 shadow-xl shadow-green-500/10 transition-all duration-300 hover:shadow-green-500/20">
                <h3 className="font-bold text-xl mb-4">More Games</h3>

                <div className="space-y-4">
                  <div className="bg-gray-800 rounded-lg p-3 flex justify-between items-center transition-all duration-300 hover:bg-gray-700 cursor-pointer">
                    <div className="flex items-center">
                      <div className="w-10 h-10 bg-gray-700 rounded-full flex items-center justify-center mr-3">
                        <FaCoins className="text-yellow-500" />
                      </div>
                      <div>
                        <h4 className="font-bold">Coin Flip</h4>
                        <p className="text-gray-400 text-xs">Win up to 2x your bet</p>
                      </div>
                    </div>
                    <button className="px-3 py-1 rounded-md text-sm font-medium bg-white text-black hover:bg-gray-200 transition-colors">
                      Play
                    </button>
                  </div>

                  <div className="bg-gray-800 rounded-lg p-3 flex justify-between items-center transition-all duration-300 hover:bg-gray-700 cursor-pointer">
                    <div className="flex items-center">
                      <div className="w-10 h-10 bg-gray-700 rounded-full flex items-center justify-center mr-3">
                        <FaGem className="text-purple-500" />
                      </div>
                      <div>
                        <h4 className="font-bold">Gem Hunter</h4>
                        <p className="text-gray-400 text-xs">Find hidden gems for rewards</p>
                      </div>
                    </div>
                    <button className="px-3 py-1 rounded-md text-sm font-medium bg-white text-black hover:bg-gray-200 transition-colors">
                      Play
                    </button>
                  </div>

                  <div className="bg-gray-800 rounded-lg p-3 flex justify-between items-center transition-all duration-300 hover:bg-gray-700 cursor-pointer">
                    <div className="flex items-center">
                      <div className="w-10 h-10 bg-gray-700 rounded-full flex items-center justify-center mr-3">
                        <FaTrophy className="text-amber-500" />
                      </div>
                      <div>
                        <h4 className="font-bold">Tournament</h4>
                        <p className="text-gray-400 text-xs">Compete for massive prizes</p>
                      </div>
                    </div>
                    <button className="px-3 py-1 rounded-md text-sm font-medium bg-white text-black hover:bg-gray-200 transition-colors">
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
          <div className="bg-gray-900 bg-opacity-80 backdrop-blur-sm rounded-xl p-5 border border-gray-800 shadow-xl shadow-green-500/10 transition-all duration-300 hover:shadow-green-500/20">
            <h3 className="font-bold text-xl mb-4 flex items-center">
              <FaCheckCircle className="mr-2 text-green-500" /> Daily Check In
            </h3>

            <div className="flex justify-between items-center mb-4">
              <div>
                <p className="text-gray-400 text-sm">Next Check In</p>
                <p className="font-bold">16h 59m 31s</p>
              </div>
              <div className="text-center">
                <p className="text-gray-400 text-sm">Current Streak</p>
                <p className="font-bold text-xl">Day 14</p>
              </div>
            </div>

            <button
              onClick={handleClaim}
              className={`w-full py-3 rounded-lg text-sm font-medium transition-all duration-300 transform hover:scale-[1.02] active:scale-95 ${
                claimed
                  ? "bg-gray-600"
                  : "bg-gradient-to-r from-green-500 to-green-400 hover:from-green-400 hover:to-green-500 text-black shadow-lg shadow-green-500/20"
              }`}
              disabled={claimed}
            >
              {claimed ? "Claimed Today" : "Claim Daily Reward"}
            </button>

            <div className="mt-4 bg-gray-800 rounded-lg p-3">
              <p className="text-sm text-center mb-2">Today's Reward</p>
              <div className="flex items-center justify-center gap-2">
                <FaCoins className="text-yellow-500" />
                <span className="font-bold">1,000 Dx</span>
              </div>
            </div>
          </div>

          {/* Daily Rewards */}
          <div className="bg-gray-900 bg-opacity-80 backdrop-blur-sm rounded-xl p-5 border border-gray-800 shadow-xl shadow-green-500/10 transition-all duration-300 hover:shadow-green-500/20">
            <h3 className="font-bold text-xl mb-4 flex items-center">
              <FaGem className="mr-2 text-green-500" /> Weekly Rewards
            </h3>

            <div className="grid grid-cols-7 gap-2 mb-4">
              {[1, 2, 3, 4, 5, 6, 7].map((day) => (
                <div
                  key={day}
                  className={`aspect-square rounded-md flex flex-col items-center justify-center transition-all duration-300 ${
                    day < 5 ? "bg-green-500 text-black" : "bg-gray-700 text-gray-400 hover:bg-gray-600"
                  }`}
                >
                  <span className="font-bold">{day}</span>
                  <span className="text-xs">{day < 5 ? "✓" : ""}</span>
                </div>
              ))}
            </div>

            <div className="bg-gray-800 rounded-lg p-3 mb-4">
              <div className="flex justify-between items-center">
                <p className="text-sm">Day 7 Reward:</p>
                <div className="flex items-center">
                  <FaGem className="text-purple-500 mr-1" />
                  <span className="font-bold">Rare NFT</span>
                </div>
              </div>
            </div>

            <p className="text-center text-sm text-gray-400">Claim 7 days in a row for a special reward!</p>
          </div>

          {/* Farming Stats */}
          <div className="bg-gray-900 bg-opacity-80 backdrop-blur-sm rounded-xl p-5 border border-gray-800 shadow-xl shadow-green-500/10 transition-all duration-300 hover:shadow-green-500/20">
            <h3 className="font-bold text-xl mb-4 flex items-center">
              <FaChartLine className="mr-2 text-blue-500" /> Farming Stats
            </h3>

            <div className="space-y-3">
              <div className="flex justify-between">
                <p className="text-gray-400">Total Farmed:</p>
                <p className="font-bold">189,381,433 Dx</p>
              </div>
              <div className="flex justify-between">
                <p className="text-gray-400">Current Rate:</p>
                <p className="font-bold">4,000 Dx/h</p>
              </div>
              <div className="flex justify-between">
                <p className="text-gray-400">Active Boosters:</p>
                <p className="font-bold text-green-500">2x Speed</p>
              </div>
              <div className="flex justify-between">
                <p className="text-gray-400">Next Level:</p>
                <p className="font-bold">Level 15</p>
              </div>
            </div>

            <div className="mt-4 bg-gray-800 rounded-lg p-3">
              <p className="text-sm mb-2">Progress to Next Level</p>
              <div className="bg-gray-700 rounded-full h-2 overflow-hidden">
                <div className="h-full bg-blue-500" style={{ width: "65%" }}></div>
              </div>
              <p className="text-right text-xs mt-1 text-gray-400">65%</p>
            </div>
          </div>
        </div>
      </div>
    </div>
  )
}

export default Farm

