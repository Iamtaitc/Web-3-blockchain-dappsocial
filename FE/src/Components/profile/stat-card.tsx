import type React from "react"
import { Card, CardContent } from "../profile/ui/card"

interface StatCardProps {
  icon: React.ReactNode
  label: string
  value: string
}

export default function StatCard({ icon, label, value }: StatCardProps) {
  return (
    <Card>
      <CardContent className="flex flex-col items-center justify-center p-4">
        <div className="mb-2 flex items-center justify-center">{icon}</div>
        <p className="text-xl font-bold">{value}</p>
        <p className="text-xs text-muted-foreground">{label}</p>
      </CardContent>
    </Card>
  )
}
