"use client"

import { useState, useEffect, useRef } from "react"
import { motion, AnimatePresence } from "framer-motion"
import { Clock, Pause } from 'lucide-react'
import { Button } from "../../Components/UI/buttonlogin"
import { cn } from "../../lib/utils"

type Point = {
  id: number
  x: number
  y: number
  value: number
  type: "points" | "time" | "freeze" | "negative"
  speed: number
}

export default function FallingPointsGame() {
  const [gameStarted, setGameStarted] = useState(false)
  const [gameOver, setGameOver] = useState(false)
  const [score, setScore] = useState(0)
  const [timeLeft, setTimeLeft] = useState(60)
  const [points, setPoints] = useState<Point[]>([])
  const [freezeActive, setFreezeActive] = useState(false)
  const [highScore, setHighScore] = useState(0)
  const containerRef = useRef<HTMLDivElement>(null)
  const requestRef = useRef<number>()
  const lastPointTime = useRef(0)
  const pointIdCounter = useRef(0)

  // Start the game
  const startGame = () => {
    console.log("Starting game...")
    setGameStarted(true)
    setGameOver(false)
    setScore(0)
    setTimeLeft(60)
    setPoints([])
    setFreezeActive(false)
    lastPointTime.current = 0
    pointIdCounter.current = 0
  }

  // Reset the game
  const resetGame = () => {
    setGameStarted(false)
    setGameOver(true)
    if (score > highScore) {
      setHighScore(score)
    }
  }

  // Create a new point
  const createPoint = () => {
    if (!containerRef.current || freezeActive) return

    // Limit maximum number of points on screen
    if (points.length >= 5) return

    const containerWidth = containerRef.current.clientWidth
    const pointTypes = [
      { type: "points", value: 1, probability: 0.4 },
      { type: "points", value: 3, probability: 0.25 },
      { type: "points", value: 5, probability: 0.15 },
      { type: "negative", value: -3, probability: 0.1 },
      { type: "negative", value: -5, probability: 0.05 },
      { type: "time", value: 5, probability: 0.03 },
      { type: "freeze", value: 0, probability: 0.02 },
    ]

    const random = Math.random()
    let cumulativeProbability = 0
    let selectedType = pointTypes[0]

    for (const type of pointTypes) {
      cumulativeProbability += type.probability
      if (random <= cumulativeProbability) {
        selectedType = type
        break
      }
    }

    const newPoint: Point = {
      id: pointIdCounter.current++,
      x: Math.random() * (containerWidth - 60),
      y: -50,
      value: selectedType.value,
      type: selectedType.type as Point["type"],
      speed: 1 + Math.random() * 2,
    }

    setPoints((prevPoints) => [...prevPoints, newPoint])
  }

  // Handle point click
  const handlePointClick = (point: Point) => {
    setPoints((prevPoints) => prevPoints.filter((p) => p.id !== point.id))

    if (point.type === "points" || point.type === "negative") {
      setScore((prevScore) => prevScore + point.value)
    } else if (point.type === "time") {
      setTimeLeft((prevTime) => prevTime + point.value)
    } else if (point.type === "freeze") {
      setFreezeActive(true)
      setTimeout(() => {
        setFreezeActive(false)
      }, 3000)
    }
  }

  // Game loop
  useEffect(() => {
    if (!gameStarted || gameOver) return

    const updateGame = (time: number) => {
      // Create new points
      if (time - lastPointTime.current > 1000) {
        createPoint()
        lastPointTime.current = time
      }

      // Update points positions
      setPoints((prevPoints) => {
        if (freezeActive) return prevPoints

        return prevPoints
          .map((point) => ({
            ...point,
            y: point.y + point.speed,
          }))
          .filter((point) => {
            const isOutOfBounds = point.y > (containerRef.current?.clientHeight || 600)
            return !isOutOfBounds
          })
      })

      requestRef.current = requestAnimationFrame(updateGame)
    }

    requestRef.current = requestAnimationFrame(updateGame)

    return () => {
      if (requestRef.current) {
        cancelAnimationFrame(requestRef.current)
      }
    }
  }, [gameStarted, gameOver, freezeActive])

  // Timer
  useEffect(() => {
    if (!gameStarted || gameOver) return

    const timer = setInterval(() => {
      setTimeLeft((prevTime) => {
        if (prevTime <= 1) {
          clearInterval(timer)
          resetGame()
          return 0
        }
        return prevTime - 1
      })
    }, 1000)

    return () => clearInterval(timer)
  }, [gameStarted, gameOver])

  return (
    <div className="flex flex-col items-center justify-center min-h-screen p-4 font-mono bg-gradient-to-b from-[#5D54A4] to-[#2A265F] relative overflow-hidden select-none">
      <style jsx global>{`
        @import url('https://fonts.googleapis.com/css2?family=Press+Start+2P&display=swap');
        .pixel-font {
          font-family: 'Press Start 2P', cursive;
        }
        .pixel-border {
          box-shadow: 
            -4px 0 0 0 #000,
            4px 0 0 0 #000,
            0 -4px 0 0 #000,
            0 4px 0 0 #000;
        }
        .pixel-item {
          image-rendering: pixelated;
          image-rendering: crisp-edges;
        }
        .pixel-stars {
          background-image: 
            radial-gradient(2px 2px at 20px 30px, #ffffff, rgba(0,0,0,0)),
            radial-gradient(2px 2px at 40px 70px, #ffffff, rgba(0,0,0,0)),
            radial-gradient(2px 2px at 50px 160px, #ffffff, rgba(0,0,0,0)),
            radial-gradient(2px 2px at 90px 40px, #ffffff, rgba(0,0,0,0)),
            radial-gradient(2px 2px at 130px 80px, #ffffff, rgba(0,0,0,0)),
            radial-gradient(2px 2px at 160px 120px, #ffffff, rgba(0,0,0,0));
          background-repeat: repeat;
          background-size: 200px 200px;
        }
      `}</style>

      {/* Decorative background elements */}
      <div className="absolute inset-0 pixel-stars opacity-70"></div>
      
      {/* Pixel clouds */}
      <div className="absolute top-10 left-[10%] w-20 h-10 bg-white opacity-30 rounded-full"></div>
      <div className="absolute top-20 left-[20%] w-32 h-12 bg-white opacity-20 rounded-full"></div>
      <div className="absolute top-15 right-[15%] w-24 h-8 bg-white opacity-25 rounded-full"></div>
      <div className="absolute top-40 right-[25%] w-28 h-10 bg-white opacity-15 rounded-full"></div>
      
      {/* Pixel mountains in the background */}
      <div className="absolute bottom-0 left-0 right-0 h-32 bg-[#2A265F] z-0"></div>
      <div className="absolute bottom-0 left-[5%] w-40 h-40 bg-[#3D3880] rounded-t-[100%] z-0"></div>
      <div className="absolute bottom-0 left-[25%] w-60 h-60 bg-[#3D3880] rounded-t-[100%] z-0"></div>
      <div className="absolute bottom-0 right-[15%] w-52 h-48 bg-[#3D3880] rounded-t-[100%] z-0"></div>
      <div className="absolute bottom-0 right-[35%] w-40 h-36 bg-[#3D3880] rounded-t-[100%] z-0"></div>

      <div className="w-full max-w-md bg-[#EF476F] rounded-none overflow-hidden shadow-[8px_8px_0px_0px_rgba(0,0,0,0.8)] border-4 border-black pixel-border relative z-10">
        <div className="p-4 bg-[#26547C] flex justify-between items-center border-b-4 border-black">
          <div className="flex items-center gap-2 text-white pixel-font text-xs">
            <Clock className="h-5 w-5" />
            <span>{timeLeft}s</span>
          </div>
          <div className="text-white pixel-font text-xs">SCORE: {score}</div>
        </div>

        <div
          ref={containerRef}
          className="relative w-full h-[500px] overflow-hidden"
          style={{ 
            touchAction: "none",
            background: "linear-gradient(to bottom, #06D6A0, #1AC9E6)"
          }}
        >
          {/* Grid pattern overlay */}
          <div className="absolute inset-0 pointer-events-none" 
            style={{
              backgroundImage: "linear-gradient(rgba(255,255,255,0.1) 1px, transparent 1px), linear-gradient(90deg, rgba(255,255,255,0.1) 1px, transparent 1px)",
              backgroundSize: "20px 20px"
            }}>
          </div>

          {/* Game elements */}
          {!gameStarted && !gameOver && (
            <div className="absolute inset-0 flex flex-col items-center justify-center bg-[#26547C] z-10 p-6 text-center">
              <div className="absolute inset-0 opacity-20 pointer-events-none">
                <div className="absolute top-0 left-0 w-full h-full" 
                  style={{
                    backgroundImage: "radial-gradient(circle, rgba(255,255,255,0.1) 1px, transparent 1px)",
                    backgroundSize: "16px 16px"
                  }}>
                </div>
              </div>
              <h1 className="text-xl pixel-font text-white mb-8">PIXEL POINTS</h1>
              <p className="text-white mb-8 pixel-font text-xs leading-relaxed">
                CLICK FALLING ITEMS
                <br />
                COLLECT POINTS
                <br />
                60 SECONDS!
              </p>
              <button
                onClick={() => startGame()}
                className="bg-[#EF476F] hover:bg-[#FF6B8B] text-white border-4 border-black shadow-[4px_4px_0px_0px_rgba(0,0,0,1)] hover:shadow-[2px_2px_0px_0px_rgba(0,0,0,1)] hover:translate-x-[2px] hover:translate-y-[2px] transition-all pixel-font text-xs py-6 px-8 cursor-pointer z-20"
              >
                START GAME
              </button>
            </div>
          )}

          {gameOver && (
            <div className="absolute inset-0 flex flex-col items-center justify-center bg-[#26547C] z-10 p-6 text-center">
              <div className="absolute inset-0 opacity-20 pointer-events-none">
                <div className="absolute top-0 left-0 w-full h-full" 
                  style={{
                    backgroundImage: "radial-gradient(circle, rgba(255,255,255,0.1) 1px, transparent 1px)",
                    backgroundSize: "16px 16px"
                  }}>
                </div>
              </div>
              <h1 className="text-xl pixel-font text-white mb-4">GAME OVER!</h1>
              <p className="text-white mb-2 pixel-font text-xs">YOUR SCORE: {score}</p>
              <p className="text-white mb-8 pixel-font text-xs">HIGH SCORE: {highScore}</p>
              <button
                onClick={() => startGame()}
                className="bg-[#EF476F] hover:bg-[#FF6B8B] text-white border-4 border-black shadow-[4px_4px_0px_0px_rgba(0,0,0,1)] hover:shadow-[2px_2px_0px_0px_rgba(0,0,0,1)] hover:translate-x-[2px] hover:translate-y-[2px] transition-all pixel-font text-xs py-6 px-8 cursor-pointer z-20"
              >
                PLAY AGAIN
              </button>
            </div>
          )}

          {freezeActive && (
            <div className="absolute top-4 left-1/2 transform -translate-x-1/2 bg-[#118AB2] text-white px-3 py-1 border-2 border-black flex items-center gap-1 z-10 pixel-font text-xs">
              <Pause className="h-4 w-4" />
              <span>FREEZE!</span>
            </div>
          )}

          <AnimatePresence>
            {points.map((point) => (
              <motion.div
                key={point.id}
                initial={{ opacity: 0, scale: 0.5 }}
                animate={{
                  opacity: 1,
                  scale: 1,
                  rotate: point.type === "freeze" ? 15 : 0,
                }}
                exit={{ opacity: 0 }}
                transition={{
                  duration: 0.2,
                  rotate:
                    point.type === "freeze" ? { repeat: Number.POSITIVE_INFINITY, duration: 3, ease: "linear" } : {},
                }}
                className={cn(
                  "absolute w-16 h-16 flex items-center justify-center cursor-pointer pixel-item",
                  "border-4 border-black",
                )}
                style={{
                  left: `${point.x}px`,
                  top: `${point.y}px`,
                  imageRendering: "pixelated",
                }}
                onClick={() => handlePointClick(point)}
              >
                {point.type === "points" && point.value === 1 && (
                  <div className="w-full h-full bg-[#73D2DE] relative">
                    <div className="absolute top-0 left-0 w-1/2 h-1/2 bg-[#8EEAF7]"></div>
                    <div className="absolute bottom-0 right-0 w-1/2 h-1/2 bg-[#5BBFCB]"></div>
                    <span className="absolute inset-0 flex items-center justify-center pixel-font text-black text-lg">
                      +1
                    </span>
                  </div>
                )}

                {point.type === "points" && point.value === 3 && (
                  <div className="w-full h-full bg-[#26547C] relative">
                    <div className="absolute top-0 left-0 w-1/2 h-1/2 bg-[#3A6A94]"></div>
                    <div className="absolute bottom-0 right-0 w-1/2 h-1/2 bg-[#1A4265]"></div>
                    <span className="absolute inset-0 flex items-center justify-center pixel-font text-white text-lg">
                      +3
                    </span>
                  </div>
                )}

                {point.type === "points" && point.value === 5 && (
                  <div className="w-full h-full bg-[#FFD166] relative">
                    <div className="absolute top-0 left-0 w-1/2 h-1/2 bg-[#FFDC85]"></div>
                    <div className="absolute bottom-0 right-0 w-1/2 h-1/2 bg-[#EBBD52]"></div>
                    <span className="absolute inset-0 flex items-center justify-center pixel-font text-black text-lg">
                      +5
                    </span>
                  </div>
                )}

                {point.type === "negative" && (
                  <div className="w-full h-full bg-[#EF476F] relative">
                    <div className="absolute top-0 left-0 w-1/2 h-1/2 bg-[#F15C80]"></div>
                    <div className="absolute bottom-0 right-0 w-1/2 h-1/2 bg-[#DB3359]"></div>
                    <span className="absolute inset-0 flex items-center justify-center pixel-font text-white text-lg">{point.value}</span>
                  </div>
                )}

                {point.type === "time" && (
                  <div className="w-full h-full bg-[#FCFCFC] relative">
                    <div className="absolute top-0 left-0 w-1/2 h-1/2 bg-white"></div>
                    <div className="absolute bottom-0 right-0 w-1/2 h-1/2 bg-[#EBEBEB]"></div>
                    <div className="absolute inset-0 flex items-center justify-center">
                      <div className="w-8 h-8 rounded-full border-4 border-black"></div>
                      <span className="absolute pixel-font text-black text-sm">+5s</span>
                    </div>
                  </div>
                )}

                {point.type === "freeze" && (
                  <div className="w-full h-full bg-[#118AB2] relative">
                    <div className="absolute top-0 left-0 w-1/2 h-1/2 bg-[#25A0C8]"></div>
                    <div className="absolute bottom-0 right-0 w-1/2 h-1/2 bg-[#0D7599]"></div>
                    <div className="absolute inset-0 flex items-center justify-center">
                      <div className="text-3xl">❄️</div>
                    </div>
                  </div>
                )}
              </motion.div>
            ))}
          </AnimatePresence>
        </div>

        <div className="p-4 bg-[#118AB2] border-t-4 border-black">
          <div className="grid grid-cols-4 gap-3 text-center">
            <div className="bg-[#73D2DE] text-black p-2 border-2 border-black pixel-font text-xs h-12 flex items-center justify-center">
              <span>+1</span>
            </div>
            <div className="bg-[#26547C] text-white p-2 border-2 border-black pixel-font text-xs h-12 flex items-center justify-center">
              <span>+3</span>
            </div>
            <div className="bg-[#FFD166] text-black p-2 border-2 border-black pixel-font text-xs h-12 flex items-center justify-center">
              <span>+5</span>
            </div>
            <div className="bg-[#FCFCFC] text-black p-2 border-2 border-black pixel-font text-xs h-12 flex items-center justify-center">
              <span>+5s</span>
            </div>
            <div className="bg-[#EF476F] text-white p-2 border-2 border-black pixel-font text-xs h-12 flex items-center justify-center">
              <span>-3</span>
            </div>
            <div className="bg-[#EF476F] text-white p-2 border-2 border-black pixel-font text-xs h-12 flex items-center justify-center">
              <span>-5</span>
            </div>
            <div className="bg-[#118AB2] text-white p-2 border-2 border-black col-span-2 pixel-font text-xs h-12 flex items-center justify-center">
              <span>❄️ FREEZE</span>
            </div>
          </div>
        </div>
      </div>
    </div>
  )
}
