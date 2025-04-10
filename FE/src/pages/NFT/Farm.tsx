"use client"

import { useState, useEffect } from "react"
import { FaCheckCircle, FaGamepad, FaCoins, FaFire, FaGem, FaBolt, FaTrophy, FaChartLine, FaCalendarCheck, FaArrowRight } from "react-icons/fa"
import { Link } from "react-router-dom"

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
    <div className="w-full font-sans bg-gradient-to-br from-gray-50 to-white text-gray-800 min-h-screen relative overflow-hidden">
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
      <div className="absolute inset-0 bg-[url('data:image/svg+xml;base64,PHN2ZyB3aWR0aD0iNjAiIGhlaWdodD0iNjAiIHZpZXdCb3g9IjAgMCA2MCA2MCIgeG1sbnM9Imh0dHA6Ly93d3cudzMub3JnLzIwMDAvc3ZnIj48ZyBmaWxsPSJub25lIiBmaWxsLXJ1bGU9ImV2ZW5vZGQiPjxnIGZpbGw9IiMwMDAiIGZpbGwtb3BhY2l0eT0iLjAyIj48cGF0aCBkPSJNMzYgMzRjMC0yLjIxLTEuNzktNC00LTRzLTQgMS43OS00IDQgMS43OSA0IDQgNCA0LTEuNzkgNC00eiIvPjwvZz48L2c+PC9zdmc+')] opacity-30 pointer-events-none"></div>

      {/* Header Section with curved design */}
      <div className="relative bg-gradient-to-r from-emerald-500 to-teal-600 pt-8 pb-16 px-6 md:px-10 rounded-b-[40px] shadow-lg">
        <div className="max-w-7xl mx-auto">
          <div className="flex flex-col md:flex-row justify-between items-start md:items-center gap-4">
            <h1 className="text-3xl md:text-4xl font-bold text-white tracking-tight">Farming Dashboard</h1>
            <div className="flex items-center bg-white/20 backdrop-blur-sm px-6 py-3 rounded-xl border border-white/30 shadow-lg">
              <div className="text-2xl md:text-3xl font-bold text-white">
                189.331.433 <span className="text-white/80">Dx</span>
              </div>
            </div>
          </div>
          
          {/* Tabs - Moved to header for better visibility */}
          <div className="flex mt-8 bg-white/20 backdrop-blur-sm rounded-xl p-1 max-w-xs border border-white/30 shadow-md">
            <button
              onClick={() => setActiveTab("farming")}
              className={`flex-1 py-2 px-4 rounded-lg transition-all duration-300 ${
                activeTab === "farming"
                  ? "bg-white text-emerald-600 font-bold shadow-md"
                  : "text-gray-500 hover:bg-white/10"
              }`}
            >
              Farming
            </button>
            <button
              onClick={() => setActiveTab("games")}
              className={`flex-1 py-2 px-4 rounded-lg transition-all duration-300 ${
                activeTab === "games"
                  ? "bg-white text-emerald-600 font-bold shadow-md"
                  : "text-gray-400 hover:bg-white/10"
              }`}
            >
              Games
            </button>
          </div>
        </div>
        
        {/* Decorative wave shape at bottom of header */}
        <div className="absolute bottom-0 left-0 right-0 h-8 overflow-hidden">
          <svg xmlns="http://www.w3.org/2000/svg" viewBox="0 0 1200 120" preserveAspectRatio="none" className="absolute bottom-0 w-full h-20 text-white">
            <path d="M0,0V46.29c47.79,22.2,103.59,32.17,158,28,70.36-5.37,136.33-33.31,206.8-37.5C438.64,32.43,512.34,53.67,583,72.05c69.27,18,138.3,24.88,209.4,13.08,36.15-6,69.85-17.84,104.45-29.34C989.49,25,1113-14.29,1200,52.47V0Z" fill="currentColor" opacity=".25"></path>
            <path d="M0,0V15.81C13,36.92,27.64,56.86,47.69,72.05,99.41,111.27,165,111,224.58,91.58c31.15-10.15,60.09-26.07,89.67-39.8,40.92-19,84.73-46,130.83-49.67,36.26-2.85,70.9,9.42,98.6,31.56,31.77,25.39,62.32,62,103.63,73,40.44,10.79,81.35-6.69,119.13-24.28s75.16-39,116.92-43.05c59.73-5.85,113.28,22.88,168.9,38.84,30.2,8.66,59,6.17,87.09-7.5,22.43-10.89,48-26.93,60.65-49.24V0Z" fill="currentColor" opacity=".5"></path>
            <path d="M0,0V5.63C149.93,59,314.09,71.32,475.83,42.57c43-7.64,84.23-20.12,127.61-26.46,59-8.63,112.48,12.24,165.56,35.4C827.93,77.22,886,95.24,951.2,90c86.53-7,172.46-45.71,248.8-84.81V0Z" fill="currentColor"></path>
          </svg>
      </div>

      {/* Main Content - Shifted up to overlap with header */}
      <div className="relative z-10 max-w-7xl mx-auto px-6 -mt-10">
                <div className="bg-white rounded-2xl p-6 border border-gray-100 shadow-xl transition-all duration-300 hover:shadow-2xl group">
                  <h3 className="font-bold text-xl mb-4 flex items-center text-gray-800">
                    <FaFire className="mr-2 text-amber-500" /> Active Farming
                  </h3>

                  <div className="flex items-center justify-between mb-6">
                    <div>
                      <p className="text-gray-500 text-sm">Rate</p>
                      <p className="text-xl font-bold text-gray-800">400 Dx/h</p>
                    </div>
                    <div className="text-gray-700 bg-gray-100 px-4 py-2 rounded-lg font-bold shadow-sm">x 10</div>
                  </div>
                  <div className="flex justify-center my-8">
                    <div className="w-28 h-28 bg-gradient-to-br from-emerald-50 to-emerald-100 rounded-full flex items-center justify-center relative shadow-lg group-hover:shadow-emerald-100/50 transition-all duration-500">
                      <div className="absolute inset-0 rounded-full bg-emerald-500 opacity-10 animate-ping"></div>
                      <div className="absolute inset-0 rounded-full bg-gradient-to-br from-emerald-500/20 to-teal-500/20 animate-pulse"></div>
                      <FaFire className="text-emerald-500 text-5xl" />
                    </div>
                  </div>

                  {/* Progress Bar */}
                  <div className="mb-3 bg-gray-100 rounded-full h-5 overflow-hidden shadow-inner">
                    <div
                      className="h-full bg-gradient-to-r from-emerald-500 to-teal-400 transition-all duration-300 relative"
                      style={{ width: `${farmingProgress}%` }}
                    >
                      <div className="absolute inset-0 bg-white/20 overflow-hidden flex">
                        <div className="w-full h-full bg-stripes-white opacity-20"></div>
                      </div>
                    </div>
                  </div>

                  <div className="bg-gray-50 rounded-lg p-3 text-center font-bold mb-4 text-gray-700 shadow-sm border border-gray-100">
                    1h 41m 0s
                  </div>

                  {showReward && (
                    <div className="mt-3 bg-gradient-to-r from-amber-400 to-amber-300 text-amber-900 p-3 rounded-lg text-center animate-bounce shadow-md">
                      <span className="font-bold">+200 Dx</span> Reward Collected!
                    </div>
                  )}
                </div>

                {/* Boosters */}
                <div className="bg-white rounded-2xl p-6 border border-gray-100 shadow-xl transition-all duration-300 hover:shadow-2xl">
                  <h3 className="font-bold text-xl mb-4 flex items-center text-gray-800">
                    <FaBolt className="mr-2 text-amber-500" /> Boosters
                  </h3>

                  <div className="grid grid-cols-2 gap-4 mb-6">
                    <div className="bg-gradient-to-br from-gray-50 to-white rounded-xl p-4 text-center transition-all duration-300 hover:shadow-lg cursor-pointer transform hover:scale-[1.02] border border-gray-100">
                      <div className="flex justify-center mb-3">
                        <div className="w-14 h-14 bg-amber-50 rounded-full flex items-center justify-center shadow-md border border-amber-100">
                          <FaBolt className="text-amber-500 text-xl" />
                        </div>
                      </div>
                      <p className="font-bold text-gray-800">2x Speed</p>
                      <p className="text-sm text-emerald-600 mb-3">1 hour</p>
                      <button className="w-full py-2 rounded-lg text-sm font-medium bg-gradient-to-r from-emerald-500 to-teal-500 text-white hover:from-emerald-600 hover:to-teal-600 transition-colors shadow-md">
                        Activate
                      </button>
                    </div>

                    <div className="bg-gradient-to-br from-gray-50 to-white rounded-xl p-4 text-center transition-all duration-300 hover:shadow-lg cursor-pointer transform hover:scale-[1.02] border border-gray-100">
                      <div className="flex justify-center mb-3">
                        <div className="w-14 h-14 bg-purple-50 rounded-full flex items-center justify-center shadow-md border border-purple-100">
                          <FaGem className="text-purple-500 text-xl" />
                        </div>
                      </div>
                      <p className="font-bold text-gray-800">3x Rewards</p>
                      <p className="text-sm text-emerald-600 mb-3">30 mins</p>
                      <button className="w-full py-2 rounded-lg text-sm font-medium bg-gradient-to-r from-emerald-500 to-teal-500 text-white hover:from-emerald-600 hover:to-teal-600 transition-colors shadow-md">
                        Activate
                      </button>
                    </div>
                  </div>

                  <div className="bg-gradient-to-br from-gray-50 to-white rounded-xl p-5 transition-all duration-300 hover:shadow-lg cursor-pointer transform hover:scale-[1.01] border border-gray-100">
                    <div className="flex items-center">
                      <div className="w-14 h-14 bg-blue-50 rounded-full flex items-center justify-center mr-4 shadow-md border border-blue-100">
                        <FaChartLine className="text-blue-500 text-xl" />
                      </div>
                      <div>
                        <p className="font-bold text-gray-800">Premium Booster Pack</p>
                        <p className="text-sm text-gray-500">Unlock all boosters for 24 hours</p>
                      </div>
                      <button className="ml-auto px-4 py-2 rounded-lg text-sm font-medium bg-gradient-to-r from-emerald-500 to-teal-500 text-white hover:from-emerald-600 hover:to-teal-600 transition-colors shadow-md">
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
                <div className="bg-white rounded-2xl overflow-hidden border border-gray-100 shadow-xl transition-all duration-300 hover:shadow-2xl group">
                  <div className="h-48 bg-gradient-to-r from-blue-500 to-indigo-600 relative overflow-hidden">
                    <div className="absolute inset-0 flex items-center justify-center">
                      <FaGamepad className="text-white text-7xl opacity-20" />
                    </div>
                    <div className="absolute inset-0 bg-[url('data:image/svg+xml;base64,PHN2ZyB3aWR0aD0iNjAiIGhlaWdodD0iNjAiIHZpZXdCb3g9IjAgMCA2MCA2MCIgeG1sbnM9Imh0dHA6Ly93d3cudzMub3JnLzIwMDAvc3ZnIj48ZyBmaWxsPSJub25lIiBmaWxsLXJ1bGU9ImV2ZW5vZGQiPjxnIGZpbGw9IiNmZmYiIGZpbGwtb3BhY2l0eT0iLjEiPjxwYXRoIGQ9Ik0zNiAzNGMwLTIuMjEtMS43OS00LTQtNHMtNCAxLjc5LTQgNCAxLjc5IDQgNCA0IDQtMS43OSA0LTR6Ii8+PC9nPjwvZz48L3N2Zz4=')] opacity-20"></div>
                    <div className="absolute bottom-0 left-0 right-0 bg-gradient-to-t from-black/50 to-transparent h-24"></div>
                    <div className="absolute bottom-4 left-6">
                      <div className="bg-white/20 backdrop-blur-sm px-3 py-1 rounded-full text-xs text-white font-medium inline-flex items-center">
                        <span className="w-2 h-2 bg-green-400 rounded-full mr-1"></span>
                        Live Now
                      </div>
                    </div>
                  </div>
                  <div className="p-6">
                    <h3 className="font-bold text-xl mb-2 text-gray-800">Pixel Miner</h3>
                    <p className="text-gray-500 mb-6">Mine pixels to earn Dx tokens and rare NFTs</p>
                    <div className="flex justify-between items-center">
                      <div>
                        <p className="text-sm text-gray-500">Current Score</p>
                        <p className="font-bold text-gray-800">41 pezz</p>
                      </div>
                      <Link
                       to="/DropGame">
                      <button className="px-6 py-2 rounded-lg text-sm font-medium bg-gradient-to-r from-emerald-500 to-teal-500 text-white hover:from-emerald-600 hover:to-teal-600 transition-all duration-300 transform hover:scale-105 active:scale-95 shadow-md">
                        Play Now
                      </button>
                      </Link>
                    </div>
                  </div>
                </div>

                {/* Game List */}
                <div className="bg-white rounded-2xl p-6 border border-gray-100 shadow-xl transition-all duration-300 hover:shadow-2xl">
                  <h3 className="font-bold text-xl mb-6 text-gray-800">More Games</h3>

                  <div className="space-y-4">
                    <div className="bg-gradient-to-br from-gray-50 to-white rounded-xl p-4 flex justify-between items-center transition-all duration-300 hover:shadow-lg cursor-pointer border border-gray-100">
                      <div className="flex items-center">
                        <div className="w-12 h-12 bg-amber-50 rounded-full flex items-center justify-center mr-4 shadow-md border border-amber-100">
                          <FaCoins className="text-amber-500" />
                        </div>
                        <div>
                          <h4 className="font-bold text-gray-800">Coin Flip</h4>
                          <p className="text-gray-500 text-xs">Win up to 2x your bet</p>
                        </div>
                      </div>
                      <button className="px-4 py-2 rounded-lg text-sm font-medium bg-gradient-to-r from-gray-700 to-gray-800 text-white hover:from-gray-800 hover:to-gray-900 transition-colors shadow-md">
                        Play
                      </button>
                    </div>

                    <div className="bg-gradient-to-br from-gray-50 to-white rounded-xl p-4 flex justify-between items-center transition-all duration-300 hover:shadow-lg cursor-pointer border border-gray-100">
                      <div className="flex items-center">
                        <div className="w-12 h-12 bg-purple-50 rounded-full flex items-center justify-center mr-4 shadow-md border border-purple-100">
                          <FaGem className="text-purple-500" />
                        </div>
                        <div>
                          <h4 className="font-bold text-gray-800">Gem Hunter</h4>
                          <p className="text-gray-500 text-xs">Find hidden gems for rewards</p>
                        </div>
                      </div>
                      <button className="px-4 py-2 rounded-lg text-sm font-medium bg-gradient-to-r from-gray-700 to-gray-800 text-white hover:from-gray-800 hover:to-gray-900 transition-colors shadow-md">
                        Play
                      </button>
                    </div>

                    <div className="bg-gradient-to-br from-gray-50 to-white rounded-xl p-4 flex justify-between items-center transition-all duration-300 hover:shadow-lg cursor-pointer border border-gray-100">
                      <div className="flex items-center">
                        <div className="w-12 h-12 bg-amber-50 rounded-full flex items-center justify-center mr-4 shadow-md border border-amber-100">
                          <FaTrophy className="text-amber-500" />
                        </div>
                        <div>
                          <h4 className="font-bold text-gray-800">Tournament</h4>
                          <p className="text-gray-500 text-xs">Compete for massive prizes</p>
                        </div>
                      </div>
                      <button className="px-4 py-2 rounded-lg text-sm font-medium bg-gradient-to-r from-gray-700 to-gray-800 text-white hover:from-gray-800 hover:to-gray-900 transition-colors shadow-md">
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
            <div className="bg-white rounded-2xl p-6 border border-gray-100 shadow-xl transition-all duration-300 hover:shadow-2xl">
              <h3 className="font-bold text-xl mb-4 flex items-center text-gray-800">
                <FaCalendarCheck className="mr-2 text-emerald-500" /> Daily Check In
              </h3>

              <div className="flex justify-between items-center mb-6">
                <div>
                  <p className="text-gray-500 text-sm">Next Check In</p>
                  <p className="font-bold text-gray-800">16h 59m 31s</p>
                </div>
                <div className="text-center">
                  <p className="text-gray-500 text-sm">Current Streak</p>
                  <div className="flex items-center">
                    <div className="bg-emerald-50 border border-emerald-100 rounded-lg px-3 py-1 shadow-sm">
                      <p className="font-bold text-xl text-emerald-600">Day 14</p>
                    </div>
                    <div className="w-8 h-8 bg-emerald-500 rounded-full flex items-center justify-center ml-2 shadow-md">
                      <FaCheckCircle className="text-white" />
                    </div>
                  </div>
                </div>
              </div>

              <button
                onClick={handleClaim}
                className={`w-full py-3 rounded-xl text-sm font-medium transition-all duration-300 transform hover:scale-[1.02] active:scale-95 shadow-lg ${
                  claimed
                    ? "bg-gray-200 text-gray-500"
                    : "bg-gradient-to-r from-emerald-500 to-teal-500 hover:from-emerald-600 hover:to-teal-600 text-white"
                }`}
                disabled={claimed}
              >
                {claimed ? "Claimed Today" : "Claim Daily Reward"}
              </button>

              <div className="mt-4 bg-gradient-to-br from-gray-50 to-white rounded-xl p-4 border border-gray-100 shadow-sm">
                <p className="text-sm text-center mb-3 text-gray-600">Today's Reward</p>
                <div className="flex items-center justify-center gap-3 bg-amber-50 p-3 rounded-lg border border-amber-100">
                  <FaCoins className="text-amber-500 text-xl" />
                  <span className="font-bold text-gray-800 text-lg">1,000 Dx</span>
            </div>
          </div>
        </div>
      </div>
    </div>
  )
}

export default Farm
  
