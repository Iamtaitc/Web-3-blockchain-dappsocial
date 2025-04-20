"use client"

import type React from "react"

interface ButtonProps extends React.ButtonHTMLAttributes<HTMLButtonElement> {
  variant?: "default" | "outline"
}

export function Button({ 
  variant = "default", 
  className = "", 
  children, 
  ...props 
}: ButtonProps) {
  const baseStyles = "px-4 py-2 rounded-lg font-medium transition-all duration-200 focus:outline-none focus:ring-2 focus:ring-green-400 focus:ring-opacity-50"
  
  const variantStyles = {
    default: "bg-green-500 text-white hover:bg-green-600",
    outline: "border border-green-500 text-green-500 hover:bg-green-50",
  }

  const disabledStyles = props.disabled ? "opacity-50 cursor-not-allowed" : ""

  return (
    <button
      className={`${baseStyles} ${variantStyles[variant]} ${disabledStyles} ${className}`}
      {...props}
    >
      {children}
    </button>
  )
}