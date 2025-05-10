import { CheckCircle } from "lucide-react"
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "../profile/ui/card"
import SubscriptionBadge from "./subscription-badge"

interface PlanCardProps {
  level: number
  name: string
  price: number
  currency: string
  benefits: string[]
  isSelected?: boolean
}

export default function PlanCard({ level, name, price, currency, benefits, isSelected = false }: PlanCardProps) {
  const getBorderColor = () => {
    if (!isSelected) return "border-gray-200"

    switch (level) {
      case 1:
        return "border-blue-300"
      case 2:
        return "border-purple-300"
      case 5:
        return "border-amber-300"
      case 10:
        return "border-rose-300"
      default:
        return "border-gray-200"
    }
  }

  const getBackgroundGradient = () => {
    if (!isSelected) return ""

    switch (level) {
      case 1:
        return "bg-gradient-to-b from-blue-50 to-transparent"
      case 2:
        return "bg-gradient-to-b from-purple-50 to-transparent"
      case 5:
        return "bg-gradient-to-b from-amber-50 to-transparent"
      case 10:
        return "bg-gradient-to-b from-rose-50 to-transparent"
      default:
        return ""
    }
  }

  return (
    <Card
      className={`transition-all duration-200 ${getBorderColor()} ${getBackgroundGradient()} ${isSelected ? "shadow-md" : ""}`}
    >
      <CardHeader className="pb-3">
        <div className="flex justify-between items-center">
          <CardTitle className="text-xl">{name}</CardTitle>
          <SubscriptionBadge level={level} />
        </div>
        <CardDescription>{price > 0 ? `${price} ${currency} mỗi tháng` : "Gói miễn phí"}</CardDescription>
      </CardHeader>
      <CardContent>
        <ul className="space-y-2">
          {benefits.map((benefit, index) => (
            <li key={index} className="flex items-start">
              <CheckCircle className={`h-5 w-5 mr-2 shrink-0 ${getBenefitIconColor(level)}`} />
              <span>{benefit}</span>
            </li>
          ))}
        </ul>
      </CardContent>
    </Card>
  )
}

function getBenefitIconColor(level: number): string {
  switch (level) {
    case 1:
      return "text-blue-500"
    case 2:
      return "text-purple-500"
    case 5:
      return "text-amber-500"
    case 10:
      return "text-rose-500"
    default:
      return "text-green-500"
  }
}
