import { Badge } from "../profile/ui/badge"
import { Star, Diamond, Shield, Zap } from "lucide-react"

interface SubscriptionBadgeProps {
  level: number
  size?: "sm" | "md" | "lg"
}

export default function SubscriptionBadge({ level, size = "md" }: SubscriptionBadgeProps) {
  const sizeClasses = {
    sm: "text-xs px-2 py-0.5",
    md: "text-sm px-2.5 py-0.5",
    lg: "text-base px-3 py-1",
  }

  const renderIcon = () => {
    switch (level) {
      case 5:
        return <Star className="h-3 w-3 mr-1" />
      case 10:
        return <Diamond className="h-3 w-3 mr-1" />
      case 2:
        return <Zap className="h-3 w-3 mr-1" />
      case 1:
        return <Shield className="h-3 w-3 mr-1" />
      default:
        return null
    }
  }

  switch (level) {
    case 1:
      return (
        <Badge
          className={`bg-gradient-to-r from-blue-500 to-blue-600 hover:from-blue-600 hover:to-blue-700 ${sizeClasses[size]}`}
        >
          <div className="flex items-center">
            {renderIcon()}
            Standard
          </div>
        </Badge>
      )
    case 2:
      return (
        <Badge
          className={`bg-gradient-to-r from-purple-500 to-purple-600 hover:from-purple-600 hover:to-purple-700 ${sizeClasses[size]}`}
        >
          <div className="flex items-center">
            {renderIcon()}
            Plus
          </div>
        </Badge>
      )
    case 5:
      return (
        <Badge
          className={`bg-gradient-to-r from-amber-500 to-amber-600 hover:from-amber-600 hover:to-amber-700 ${sizeClasses[size]}`}
        >
          <div className="flex items-center">
            {renderIcon()}
            Pro
          </div>
        </Badge>
      )
    case 10:
      return (
        <Badge
          className={`bg-gradient-to-r from-rose-500 to-rose-600 hover:from-rose-600 hover:to-rose-700 ${sizeClasses[size]}`}
        >
          <div className="flex items-center">
            {renderIcon()}
            Elite
          </div>
        </Badge>
      )
    default:
      return (
        <Badge variant="outline" className={`text-muted-foreground ${sizeClasses[size]}`}>
          Free
        </Badge>
      )
  }
}
