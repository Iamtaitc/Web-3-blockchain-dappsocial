"use client"

import { useEffect, useState } from "react"
import { Button } from "../ui/button"

interface VIPFireworksProps {
  level: number
}

export default function VIPFireworks({ level }: VIPFireworksProps) {
  const [fireworks, setFireworks] = useState<{ top: string; left: string; delay: string; duration: string }[]>([])
  const [countdown, setCountdown] = useState(3)

  useEffect(() => {
    // Tạo hiệu ứng pháo hoa
    const newFireworks = Array.from({ length: 30 }).map(() => ({
      top: `${Math.random() * 100}%`,
      left: `${Math.random() * 100}%`,
      delay: `${Math.random() * 2}s`,
      duration: `${1 + Math.random() * 2}s`,
    }))
    setFireworks(newFireworks)

    // Đếm ngược
    const timer = setInterval(() => {
      setCountdown((prev) => {
        if (prev <= 1) {
          clearInterval(timer)
        }
        return prev - 1
      })
    }, 1000)

    return () => clearInterval(timer)
  }, [])

  const title = level >= 10 ? "Elite VIP" : level >= 5 ? "Pro VIP" : "VIP"
  const subtitle = "Chúc mừng bạn đã nâng cấp thành công!"

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center bg-black/90">
      <div className="fireworks-container">
        {fireworks.map((fw, i) => (
          <div
            key={i}
            className="firework"
            style={{
              top: fw.top,
              left: fw.left,
              animationDelay: fw.delay,
              animationDuration: fw.duration,
            }}
          />
        ))}
      </div>

      <div className="text-center z-10">
        <h1 className="text-4xl font-bold text-white mb-2">{title}</h1>
        <p className="text-xl text-white/80 mb-6">{subtitle}</p>

        {countdown > 0 ? (
          <p className="text-white text-2xl">Tự động đóng sau {countdown}s</p>
        ) : (
          <Button
            size="lg"
            className="bg-gradient-to-r from-amber-500 to-amber-600 hover:from-amber-600 hover:to-amber-700"
            onClick={() => window.location.reload()}
          >
            Tiếp tục
          </Button>
        )}
      </div>
    </div>
  )
}
