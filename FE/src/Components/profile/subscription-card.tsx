"use client"

import { Card, CardContent, CardHeader, CardTitle, CardDescription } from "../profile/ui/card"
import { Badge } from "../profile/ui/badge"
import { Button } from "../profile/ui/button"
import { formatDate, getSubscriptionDetails } from "../../lib/utils"
import SubscriptionBadge from "./subscription-badge"

interface SubscriptionCardProps {
  subscription: {
    level: number
    isActive: boolean
    expiration: string | null
  }
  onUpgrade: () => void
  isCurrentUser: boolean
}

export default function SubscriptionCard({ subscription, onUpgrade, isCurrentUser }: SubscriptionCardProps) {
  const subscriptionDetails = getSubscriptionDetails(subscription.level)
  const cardClass = `vip-card vip-card-${subscriptionDetails.className} border-2 ${subscriptionDetails.borderColor}`
  const headerClass = `vip-card-header-${subscriptionDetails.className} ${subscriptionDetails.headerBg} text-white`
  const buttonClass = `upgrade-button upgrade-button-${subscriptionDetails.className} mt-4 ${subscriptionDetails.buttonBg}`

  return (
    <Card className={cardClass}>
      <CardHeader className={headerClass}>
        <div className="flex items-center justify-between">
          <div>
            <CardTitle className="flex items-center gap-2">
              {subscriptionDetails.icon}
              <span className="flex items-center">
                Gói {subscriptionDetails.name}
                {subscription.level >= 5 && <span className="ml-2">✨</span>}
                {subscription.level >= 10 && <span className="ml-1">👑</span>}
              </span>
            </CardTitle>
            <CardDescription className="text-white/80">
              {subscription.isActive
                ? `Hoạt động đến ${subscription.expiration ? formatDate(subscription.expiration) : "N/A"}`
                : "Không hoạt động"}
            </CardDescription>
          </div>
          <SubscriptionBadge level={subscription.level} size="lg" />
        </div>
      </CardHeader>
      <CardContent className="pt-6">
        <div className="grid gap-4 md:grid-cols-2">
          <div>
            <h3 className="mb-2 font-semibold">Đặc quyền</h3>
            <ul className="space-y-1 text-sm">
              {subscriptionDetails.benefits.map((benefit, index) => (
                <li key={index} className="flex items-center gap-2">
                  <svg className="h-4 w-4 text-green-500" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                    <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M5 13l4 4L19 7" />
                  </svg>
                  {benefit}
                </li>
              ))}
            </ul>
          </div>
          <div>
            <h3 className="mb-2 font-semibold">Hệ số nhân phần thưởng</h3>
            <div className="flex items-center gap-2">
              <Badge variant="outline" className="text-lg text-black ">
                {subscriptionDetails.multiplier}x
              </Badge>
              <span className="text-sm text-muted-foreground">Nhận {subscriptionDetails.multiplier}x token</span>
            </div>

            {isCurrentUser && (
              <Button className={buttonClass} size="sm" onClick={onUpgrade}>
                {subscription.level < 10 ? "Nâng cấp gói VIP" : "Gia hạn gói VIP"}
              </Button>
            )}
          </div>
        </div>
      </CardContent>
    </Card>
  )
}
