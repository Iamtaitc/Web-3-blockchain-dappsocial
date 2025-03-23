"use client"

import { useEffect, useRef, useState } from "react"

// Định nghĩa hướng di chuyển
const DIRECTIONS = {
  UP: { x: 0, y: -1 },
  DOWN: { x: 0, y: 1 },
  LEFT: { x: -1, y: 0 },
  RIGHT: { x: 1, y: 0 },
}

// Kích thước của game
const GRID_SIZE = 20
const CELL_SIZE = 20
const CANVAS_SIZE = GRID_SIZE * CELL_SIZE

const SimpleSnakeGame = () => {
  const canvasRef = useRef<HTMLCanvasElement>(null)
  const [score, setScore] = useState(0)
  const [gameOver, setGameOver] = useState(false)
  const [maxScore, setMaxScore] = useState(
    typeof window !== "undefined" ? Number(localStorage.getItem("maxScore") || 0) : 0,
  )

  // Game state
  const snakeRef = useRef<{ x: number; y: number }[]>([
    { x: 10, y: 10 }, // Head
  ])
  const foodRef = useRef<{ x: number; y: number }>({ x: 5, y: 5 })
  const directionRef = useRef(DIRECTIONS.RIGHT)
  const speedRef = useRef(150) // ms per move
  const gameLoopRef = useRef<NodeJS.Timeout | null>(null)

  // Tạo thức ăn mới ở vị trí ngẫu nhiên
  const createFood = () => {
    const snake = snakeRef.current
    let newFood
    let foodOnSnake = true

    // Đảm bảo thức ăn không xuất hiện trên thân rắn
    while (foodOnSnake) {
      newFood = {
        x: Math.floor(Math.random() * GRID_SIZE),
        y: Math.floor(Math.random() * GRID_SIZE),
      }

      foodOnSnake = snake.some((segment) => segment.x === newFood.x && segment.y === newFood.y)
    }

    foodRef.current = newFood
  }

  // Vẽ game
  const drawGame = () => {
    const canvas = canvasRef.current
    if (!canvas) return

    const ctx = canvas.getContext("2d")
    if (!ctx) return

    // Xóa canvas
    ctx.clearRect(0, 0, CANVAS_SIZE, CANVAS_SIZE)

    // Vẽ rắn
    const snake = snakeRef.current
    ctx.fillStyle = "white"
    snake.forEach((segment) => {
      ctx.fillRect(segment.x * CELL_SIZE, segment.y * CELL_SIZE, CELL_SIZE, CELL_SIZE)
    })

    // Vẽ thức ăn
    const food = foodRef.current
    ctx.fillStyle = "red"
    ctx.fillRect(food.x * CELL_SIZE, food.y * CELL_SIZE, CELL_SIZE, CELL_SIZE)

    // Vẽ lưới
    ctx.strokeStyle = "#232332"
    ctx.lineWidth = 1
    for (let i = 0; i < GRID_SIZE; i++) {
      ctx.beginPath()
      ctx.moveTo(i * CELL_SIZE, 0)
      ctx.lineTo(i * CELL_SIZE, CANVAS_SIZE)
      ctx.stroke()

      ctx.beginPath()
      ctx.moveTo(0, i * CELL_SIZE)
      ctx.lineTo(CANVAS_SIZE, i * CELL_SIZE)
      ctx.stroke()
    }
  }

  // Vẽ màn hình game over
  const drawGameOver = () => {
    const canvas = canvasRef.current
    if (!canvas) return

    const ctx = canvas.getContext("2d")
    if (!ctx) return

    // Xóa canvas và vẽ nền đen
    ctx.fillStyle = "#181825"
    ctx.fillRect(0, 0, CANVAS_SIZE, CANVAS_SIZE)

    // Vẽ text game over
    ctx.fillStyle = "#4cffd7"
    ctx.textAlign = "center"
    ctx.font = "bold 40px Poppins, sans-serif"
    ctx.fillText("GAME OVER", CANVAS_SIZE / 2, CANVAS_SIZE / 2 - 20)

    ctx.font = "20px Poppins, sans-serif"
    ctx.fillText(`SCORE   ${score}`, CANVAS_SIZE / 2, CANVAS_SIZE / 2 + 40)
    ctx.fillText(`MAXSCORE   ${maxScore}`, CANVAS_SIZE / 2, CANVAS_SIZE / 2 + 80)
  }

  // Kiểm tra va chạm - chỉ kiểm tra va chạm với thân rắn
  const checkCollision = (head: { x: number; y: number }) => {
    const snake = snakeRef.current

    // Kiểm tra va chạm với thân rắn (bỏ qua đầu)
    for (let i = 0; i < snake.length - 1; i++) {
      if (snake[i].x === head.x && snake[i].y === head.y) {
        console.log("Self collision detected!")
        return true
      }
    }

    return false
  }

  // Di chuyển rắn
  const moveSnake = () => {
    if (gameOver) return

    const snake = snakeRef.current
    const direction = directionRef.current
    const food = foodRef.current

    // Tính toán vị trí mới cho đầu rắn
    const newHead = {
      x: snake[snake.length - 1].x + direction.x,
      y: snake[snake.length - 1].y + direction.y,
    }

    // Xử lý khi rắn đi qua tường (xuất hiện ở phía đối diện)
    if (newHead.x < 0) newHead.x = GRID_SIZE - 1
    if (newHead.x >= GRID_SIZE) newHead.x = 0
    if (newHead.y < 0) newHead.y = GRID_SIZE - 1
    if (newHead.y >= GRID_SIZE) newHead.y = 0

    // Kiểm tra va chạm với thân rắn
    if (checkCollision(newHead)) {
      console.log("Game over!")
      setGameOver(true)

      // Cập nhật điểm cao nhất
      if (score > maxScore) {
        setMaxScore(score)
        if (typeof window !== "undefined") {
          localStorage.setItem("maxScore", score.toString())
        }
      }

      // Vẽ màn hình game over
      drawGameOver()
      return
    }

    // Thêm đầu mới vào rắn
    snake.push(newHead)

    // Kiểm tra ăn thức ăn
    if (newHead.x === food.x && newHead.y === food.y) {
      // Tăng điểm
      setScore((prevScore) => prevScore + 1)
      // Tạo thức ăn mới
      createFood()
    } else {
      // Nếu không ăn thức ăn, xóa đuôi
      snake.shift()
    }

    // Vẽ lại game
    drawGame()
  }

  // Xử lý phím
  const handleKeyDown = (e: KeyboardEvent) => {
    const direction = directionRef.current

    switch (e.key) {
      case "ArrowUp":
        if (direction !== DIRECTIONS.DOWN) {
          directionRef.current = DIRECTIONS.UP
        }
        break
      case "ArrowDown":
        if (direction !== DIRECTIONS.UP) {
          directionRef.current = DIRECTIONS.DOWN
        }
        break
      case "ArrowLeft":
        if (direction !== DIRECTIONS.RIGHT) {
          directionRef.current = DIRECTIONS.LEFT
        }
        break
      case "ArrowRight":
        if (direction !== DIRECTIONS.LEFT) {
          directionRef.current = DIRECTIONS.RIGHT
        }
        break
    }
  }

  // Reset game
  const resetGame = () => {
    // Reset state
    setScore(0)
    setGameOver(false)

    // Reset refs
    snakeRef.current = [{ x: 10, y: 10 }]
    directionRef.current = DIRECTIONS.RIGHT
    createFood()

    // Xóa interval cũ
    if (gameLoopRef.current) {
      clearInterval(gameLoopRef.current)
    }

    // Bắt đầu game loop mới
    gameLoopRef.current = setInterval(moveSnake, speedRef.current)

    // Vẽ lại game
    drawGame()
  }

  // Khởi tạo game
  useEffect(() => {
    const canvas = canvasRef.current
    if (canvas) {
      canvas.width = CANVAS_SIZE
      canvas.height = CANVAS_SIZE
    }

    // Thêm event listener cho phím
    window.addEventListener("keydown", handleKeyDown)

    // Khởi tạo game
    createFood()
    drawGame()
    gameLoopRef.current = setInterval(moveSnake, speedRef.current)

    // Cleanup
    return () => {
      window.removeEventListener("keydown", handleKeyDown)
      if (gameLoopRef.current) {
        clearInterval(gameLoopRef.current)
      }
    }
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [])

  // Dừng game loop khi game over
  useEffect(() => {
    if (gameOver && gameLoopRef.current) {
      clearInterval(gameLoopRef.current)
      drawGameOver()
    }
  }, [gameOver])

  return (
    <div className="flex flex-col items-center justify-center min-h-screen bg-[#222738] text-white">
      <div className="flex items-center mb-4">
        <button
          onClick={resetGame}
          className="px-4 py-2 mr-4 font-bold text-[#222738] bg-[#4cffd7] rounded-full hover:bg-[#a6aab5] transition-all"
        >
          RESTART
        </button>
        <div className="text-xl">
          Score: <span className="font-bold">{score}</span>
        </div>
      </div>
      <canvas ref={canvasRef} className="border border-gray-700 bg-[#181825]"></canvas>
      <div className="mt-4 text-center">
        <h1 className="text-2xl font-bold">SNAKE</h1>
        <span className="text-sm text-gray-400">by Dx</span>
      </div>
    </div>
  )
}

export default SimpleSnakeGame

