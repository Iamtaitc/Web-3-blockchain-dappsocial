"use client"

// Tạo file này nếu chưa có
import { useState, useEffect } from "react"

type ToastVariant = "default" | "destructive"

interface ToastProps {
  title: string
  description?: string
  variant?: ToastVariant
  duration?: number
}

interface ToastState extends ToastProps {
  id: string
  visible: boolean
}

export function toast(props: ToastProps) {
  const event = new CustomEvent("toast", {
    detail: {
      ...props,
      id: Math.random().toString(36).substring(2, 9),
    },
  })

  window.dispatchEvent(event)
}

export function useToast() {
  const [toasts, setToasts] = useState<ToastState[]>([])

  useEffect(() => {
    const handleToast = (event: Event) => {
      const detail = (event as CustomEvent).detail
      const newToast: ToastState = {
        ...detail,
        visible: true,
      }

      setToasts((prev) => [...prev, newToast])

      // Auto dismiss
      setTimeout(() => {
        setToasts((prev) => prev.map((toast) => (toast.id === newToast.id ? { ...toast, visible: false } : toast)))

        // Remove from DOM after animation
        setTimeout(() => {
          setToasts((prev) => prev.filter((toast) => toast.id !== newToast.id))
        }, 300)
      }, detail.duration || 3000)
    }

    window.addEventListener("toast", handleToast)

    return () => {
      window.removeEventListener("toast", handleToast)
    }
  }, [])

  return { toasts }
}

export function Toaster() {
  const { toasts } = useToast()

  return (
    <div className="fixed top-4 right-4 z-50 flex flex-col gap-2">
      {toasts.map((toast) => (
        <div
          key={toast.id}
          className={`
            transform transition-all duration-300 ease-in-out
            ${toast.visible ? "translate-x-0 opacity-100" : "translate-x-full opacity-0"}
            ${toast.variant === "destructive" ? "bg-red-500" : "bg-white"}
            rounded-lg shadow-lg p-4 min-w-[300px] max-w-md
          `}
        >
          <div className={`font-semibold ${toast.variant === "destructive" ? "text-white" : "text-gray-900"}`}>
            {toast.title}
          </div>
          {toast.description && (
            <div className={`mt-1 text-sm ${toast.variant === "destructive" ? "text-white/90" : "text-gray-600"}`}>
              {toast.description}
            </div>
          )}
        </div>
      ))}
    </div>
  )
}
