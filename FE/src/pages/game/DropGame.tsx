"use client"

import { useState, useEffect, useRef } from "react"
import { motion, AnimatePresence } from "framer-motion"
import { Clock, Pause } from "lucide-react"
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

export default function DropGame() {
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
      if (time - lastPointTime.current > 500) {
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
    <div className="flex flex-col items-center justify-center min-h-screen bg-[#1a0d2c] p-4 font-mono"
      style={{
        backgroundImage: `
          linear-gradient(to bottom, transparent, #1a0d2c),
          radial-gradient(#3b1d6c 2px, transparent 2px)
        `,
        backgroundSize: '100% 100%, 24px 24px'
      }}
    >
      <div
        className="w-full max-w-md overflow-hidden shadow-[0_0_0_4px_#352c63,0_0_0_8px_#251b43,0_8px_20px_rgba(0,0,0,0.6)]"
        style={{
          imageRendering: 'pixelated',
          border: '4px solid #6b46c1',
          boxShadow: '0 0 0 4px #352c63, 0 0 0 8px #251b43, 0 8px 20px rgba(0,0,0,0.6)'
        }}
      >
        <div className="p-3 bg-[#251b43] flex justify-between items-center border-b-4 border-[#6b46c1]">
          <div className="flex items-center gap-2 text-[#f8d15b] px-2 py-1 bg-[#1a0d2c] border-2 border-[#6b46c1]" style={{ clipPath: 'polygon(0 0, 100% 0, 95% 100%, 5% 100%)' }}>
            <Clock className="h-5 w-5" />
            <span className="font-bold text-lg tracking-wider">{timeLeft}s</span>
          </div>
          <div className="text-[#f8d15b] font-bold text-xl px-3 py-1 bg-[#1a0d2c] border-2 border-[#6b46c1]" style={{ clipPath: 'polygon(5% 0, 95% 0, 100% 100%, 0% 100%)' }}>
            {score.toString().padStart(5, '0')}
          </div>
        </div>

        <div
          ref={containerRef}
          className="relative w-full h-[500px] bg-[#160925] overflow-hidden"
          style={{
            touchAction: "none",
            backgroundImage: `
              linear-gradient(rgba(103, 76, 209, 0.05) 1px, transparent 1px),
              linear-gradient(90deg, rgba(103, 76, 209, 0.05) 1px, transparent 1px)
            `,
            backgroundSize: '16px 16px'
          }}
        >
          {!gameStarted && !gameOver && (
            <div className="absolute inset-0 flex flex-col items-center justify-center bg-[#0f061a]/90 z-10 p-6 text-center">
              <h1 className="text-3xl font-bold text-[#f8d15b] mb-4 uppercase tracking-widest" style={{ textShadow: '3px 3px 0 #6b46c1' }}>Pixel Drop</h1>
              <div className="mb-6 px-4 py-2 text-[#e2ccff] border-2 border-[#6b46c1] bg-[#251b43]">
                <p>Click on falling items to collect points.<br/>You have 60 seconds!</p>
              </div>
              <Button
                onClick={startGame}
                className="bg-[#6b46c1] border-b-4 border-[#4c2889] hover:brightness-110 text-white font-bold py-2 px-6 tracking-wider uppercase transition-all hover:translate-y-[-2px] active:translate-y-[2px] active:border-b-2"
              >
                Start Game
              </Button>
            </div>
          )}

          {gameOver && (
            <div className="absolute inset-0 flex flex-col items-center justify-center bg-[#0f061a]/90 z-10 p-6 text-center">
              <h1 className="text-3xl font-bold text-[#f8d15b] mb-4 uppercase tracking-widest" style={{ textShadow: '3px 3px 0 #6b46c1' }}>Game Over!</h1>
              <div className="mb-6 px-6 py-3 bg-[#251b43] border-2 border-[#6b46c1]">
                <p className="text-[#e2ccff] mb-2">Your score: <span className="text-[#f8d15b]">{score.toString().padStart(5, '0')}</span></p>
                <p className="text-[#e2ccff]">High score: <span className="text-[#f8d15b]">{highScore.toString().padStart(5, '0')}</span></p>
              </div>
              <Button
                onClick={startGame}
                className="bg-[#6b46c1] border-b-4 border-[#4c2889] hover:brightness-110 text-white font-bold py-2 px-6 tracking-wider uppercase transition-all hover:translate-y-[-2px] active:translate-y-[2px] active:border-b-2"
              >
                Play Again
              </Button>
            </div>
          )}

          {freezeActive && (
            <div className="absolute top-4 left-1/2 transform -translate-x-1/2 bg-[#4c9dd6] border-2 border-[#3675a0] text-white px-3 py-1 z-10 flex items-center gap-1" style={{ clipPath: 'polygon(0 0, 100% 0, 95% 100%, 5% 100%)' }}>
              <Pause className="h-4 w-4" />
              <span className="font-bold tracking-wide">FREEZE!</span>
            </div>
          )}

          <AnimatePresence>
            {points.map((point) => (
              <motion.div
                key={point.id}
                initial={{ opacity: 0, scale: 0.5 }}
                animate={{ opacity: 1, scale: 1 }}
                exit={{ opacity: 0, scale: 0, rotate: 180 }}
                transition={{ duration: 0.2 }}
                className={cn(
                  "absolute w-14 h-14 flex items-center justify-center font-bold text-xl cursor-pointer select-none",
                  point.type === "points" && point.value === 1 && "text-white",
                  point.type === "points" && point.value === 3 && "text-white",
                  point.type === "points" && point.value === 5 && "text-white",
                  point.type === "negative" && "text-white",
                  point.type === "time" && "text-black",
                  point.type === "freeze" && "text-white",
                )}
                style={{
                  left: `${point.x}px`,
                  top: `${point.y}px`,
                  imageRendering: 'pixelated',
                  ...(point.type === "points" && point.value === 1 && {
                    backgroundColor: '#4ade80',
                    border: '3px solid #16a34a',
                    boxShadow: 'inset 0 0 0 2px rgba(255,255,255,0.3), 2px 2px 0 rgba(22,163,74,0.8)',
                    clipPath: 'polygon(50% 0%, 100% 25%, 100% 75%, 50% 100%, 0% 75%, 0% 25%)'
                  }),
                  ...(point.type === "points" && point.value === 3 && {
                    backgroundColor: '#3b82f6',
                    border: '3px solid #2563eb',
                    boxShadow: 'inset 0 0 0 2px rgba(255,255,255,0.3), 2px 2px 0 rgba(37,99,235,0.8)',
                    clipPath: 'polygon(30% 0%, 70% 0%, 100% 30%, 100% 70%, 70% 100%, 30% 100%, 0% 70%, 0% 30%)'
                  }),
                  ...(point.type === "points" && point.value === 5 && {
                    backgroundColor: '#a855f7',
                    border: '3px solid #7e22ce',
                    boxShadow: 'inset 0 0 0 2px rgba(255,255,255,0.3), 2px 2px 0 rgba(126,34,206,0.8)',
                    clipPath: 'polygon(50% 0%, 90% 20%, 100% 60%, 75% 100%, 25% 100%, 0% 60%, 10% 20%)'
                  }),
                  ...(point.type === "negative" && point.value === -3 && {
                    backgroundColor: '#ef4444',
                    border: '3px solid #dc2626',
                    boxShadow: 'inset 0 0 0 2px rgba(255,255,255,0.2), 2px 2px 0 rgba(220,38,38,0.8)',
                    clipPath: 'polygon(20% 0%, 80% 0%, 100% 20%, 100% 80%, 80% 100%, 20% 100%, 0% 80%, 0% 20%)',
                    transform: 'rotate(45deg)'
                  }),
                  ...(point.type === "negative" && point.value === -5 && {
                    backgroundColor: '#b91c1c',
                    border: '3px solid #7f1d1d',
                    boxShadow: 'inset 0 0 0 2px rgba(255,255,255,0.2), 2px 2px 0 rgba(127,29,29,0.8)',
                    clipPath: 'polygon(20% 0%, 80% 0%, 100% 20%, 100% 80%, 80% 100%, 20% 100%, 0% 80%, 0% 20%)',
                    transform: 'rotate(45deg)'
                  }),
                  ...(point.type === "time" && {
                    backgroundColor: '#fbbf24',
                    border: '3px solid #d97706',
                    boxShadow: 'inset 0 0 0 2px rgba(255,255,255,0.4), 2px 2px 0 rgba(217,119,6,0.8)',
                    borderRadius: '50%',
                  }),
                  ...(point.type === "freeze" && {
                    backgroundColor: '#22d3ee',
                    border: '3px solid #0891b2',
                    boxShadow: 'inset 0 0 0 2px rgba(255,255,255,0.4), 2px 2px 0 rgba(8,145,178,0.8)',
                    clipPath: 'polygon(50% 0%, 100% 38%, 82% 100%, 18% 100%, 0% 38%)'
                  }),
                }}
                onClick={() => handlePointClick(point)}
              >
                <div
                  className="flex items-center justify-center font-bold w-full h-full"
                  style={{ transform: point.type === "negative" ? 'rotate(-45deg)' : 'none' }}
                >
                  {point.type === "points" || point.type === "negative" ?
                    <span style={{ textShadow: '1px 1px 0 rgba(0,0,0,0.5)' }}>{point.value > 0 ? `+${point.value}` : point.value}</span> :
                    ""
                  }
                  {point.type === "time" && <span style={{ textShadow: '1px 1px 0 rgba(0,0,0,0.5)' }}>+5s</span>}
                  {point.type === "freeze" && <span style={{ fontSize: '1.5rem' }}>❄️</span>}
                </div>
              </motion.div>
            ))}
          </AnimatePresence>
        </div>

        <div className="p-3 bg-[#251b43] border-t-4 border-[#6b46c1]">
          <div className="grid grid-cols-4 gap-2 text-center text-xs">
            <div className="p-2 border-2 flex flex-col items-center"
              style={{
                backgroundColor: '#4ade80',
                borderColor: '#16a34a',
                clipPath: 'polygon(50% 0%, 100% 25%, 100% 75%, 50% 100%, 0% 75%, 0% 25%)',
                transform: 'scale(0.8)'
              }}>
              <span className="font-bold text-white" style={{ textShadow: '1px 1px 0 rgba(0,0,0,0.5)' }}>+1</span>
            </div>
            <div className="p-2 border-2 flex flex-col items-center"
              style={{
                backgroundColor: '#3b82f6',
                borderColor: '#2563eb',
                clipPath: 'polygon(30% 0%, 70% 0%, 100% 30%, 100% 70%, 70% 100%, 30% 100%, 0% 70%, 0% 30%)',
                transform: 'scale(0.8)'
              }}>
              <span className="font-bold text-white" style={{ textShadow: '1px 1px 0 rgba(0,0,0,0.5)' }}>+3</span>
            </div>
            <div className="p-2 border-2 flex flex-col items-center"
              style={{
                backgroundColor: '#a855f7',
                borderColor: '#7e22ce',
                clipPath: 'polygon(50% 0%, 90% 20%, 100% 60%, 75% 100%, 25% 100%, 0% 60%, 10% 20%)',
                transform: 'scale(0.8)'
              }}>
              <span className="font-bold text-white" style={{ textShadow: '1px 1px 0 rgba(0,0,0,0.5)' }}>+5</span>
            </div>
            <div className="p-2 border-2 flex flex-col items-center"
              style={{
                backgroundColor: '#fbbf24',
                borderColor: '#d97706',
                borderRadius: '50%',
                transform: 'scale(0.8)'
              }}>
              <span className="font-bold text-black" style={{ textShadow: '1px 1px 0 rgba(255,255,255,0.5)' }}>+5s</span>
            </div>
            <div className="p-2 border-2 flex flex-col items-center"
              style={{
                backgroundColor: '#ef4444',
                borderColor: '#dc2626',
                clipPath: 'polygon(20% 0%, 80% 0%, 100% 20%, 100% 80%, 80% 100%, 20% 100%, 0% 80%, 0% 20%)',
                transform: 'scale(0.8) rotate(45deg)'
              }}>
              <span className="font-bold text-white" style={{ textShadow: '1px 1px 0 rgba(0,0,0,0.5)', transform: 'rotate(-45deg)' }}>-3</span>
            </div>
            <div className="p-2 border-2 flex flex-col items-center"
              style={{
                backgroundColor: '#b91c1c',
                borderColor: '#7f1d1d',
                clipPath: 'polygon(20% 0%, 80% 0%, 100% 20%, 100% 80%, 80% 100%, 20% 100%, 0% 80%, 0% 20%)',
                transform: 'scale(0.8) rotate(45deg)'
              }}>
              <span className="font-bold text-white" style={{ textShadow: '1px 1px 0 rgba(0,0,0,0.5)', transform: 'rotate(-45deg)' }}>-5</span>
            </div>
            <div className="p-2 border-2 flex flex-col items-center col-span-2"
              style={{
                backgroundColor: '#22d3ee',
                borderColor: '#0891b2',
                clipPath: 'polygon(50% 0%, 100% 38%, 82% 100%, 18% 100%, 0% 38%)',
                transform: 'scale(0.8)'
              }}>
              <span className="font-bold text-white" style={{ textShadow: '1px 1px 0 rgba(0,0,0,0.5)' }}>❄️ Freeze (3s)</span>
            </div>
          </div>
        </div>
      </div>
    </div>
  )
}
