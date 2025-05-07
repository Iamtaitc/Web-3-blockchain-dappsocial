import type React from "react"
interface VIPAuraProps {
  level: number
  children: React.ReactNode
}

export default function VIPAura({ level, children }: VIPAuraProps) {
  if (level < 5) {
    return <>{children}</>
  }

  const auraClass = level >= 10 ? "elite-aura" : "pro-aura"

  return <div className={`relative ${auraClass}`}>{children}</div>
}
