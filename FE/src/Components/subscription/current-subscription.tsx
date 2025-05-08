import { Shield, Zap, Star, Diamond, Check } from "lucide-react"
import { Card, CardContent } from "../../components/profile/ui/card"
import SubscriptionBadge from "../../components/subscription/subscription-badge"

interface CurrentSubscriptionProps {
  level: number
  expiration?: string
  username?: string
}

export default function CurrentSubscription({ level, expiration, username }: CurrentSubscriptionProps) {
  // Lấy thông tin gói dựa trên level
  const getPlanInfo = (level: number) => {
    switch (level) {
      case 2:
        return {
          name: "Plus",
          icon: Zap,
          color: "purple",
          multiplier: "2x",
          tokenLimit: "16",
          pricePerMonth: "0.000002 ETH",
          benefits: [
            "Reward multiplier 2x",
            "Tất cả tính năng Standard",
            "Giới hạn claim token hàng ngày: 16 tokens",
            "Tối đa 10 bài đăng mỗi ngày",
            "Truy cập nội dung độc quyền",
          ],
        }
      case 5:
        return {
          name: "Pro",
          icon: Star,
          color: "amber",
          multiplier: "3x",
          tokenLimit: "24",
          pricePerMonth: "0.00001 ETH",
          benefits: [
            "Reward multiplier 3x",
            "Tất cả tính năng Plus",
            "Giới hạn claim token hàng ngày: 24 tokens",
            "Không giới hạn bài đăng",
            "Hỗ trợ ưu tiên",
            "Huy hiệu Premium",
          ],
        }
      case 10:
        return {
          name: "Elite",
          icon: Diamond,
          color: "rose",
          multiplier: "5x",
          tokenLimit: "40",
          pricePerMonth: "0.0001 ETH",
          benefits: [
            "Reward multiplier 5x",
            "Tất cả tính năng Pro",
            "Giới hạn claim token hàng ngày: 40 tokens",
            "Truy cập NFT độc quyền",
            "Tham gia sự kiện VIP",
            "Kênh hỗ trợ riêng",
            "Tính năng hồ sơ tùy chỉnh",
          ],
        }
      default:
        return {
          name: "Standard",
          icon: Shield,
          color: "blue",
          multiplier: "1.5x",
          tokenLimit: "12",
          pricePerMonth: "Miễn phí",
          benefits: [
            "Reward multiplier 1.5x",
            "Truy cập tính năng cơ bản",
            "Giới hạn claim token hàng ngày: 12 tokens",
            "Tối đa 3 bài đăng mỗi ngày",
          ],
        }
    }
  }

  const planInfo = getPlanInfo(level)
  const Icon = planInfo.icon

  // Format ngày hết hạn
  const formatExpirationDate = (dateString?: string) => {
    if (!dateString) return "Không có thông tin"

    try {
      const date = new Date(dateString)
      return date.toLocaleDateString("vi-VN")
    } catch (e) {
      return "Không hợp lệ"
    }
  }

  return (
    <Card className="w-full shadow-sm overflow-hidden">
      <div className="p-4 bg-gradient-to-r from-purple-50 to-white">
        <div className="flex justify-between items-center">
          <div className="flex items-center gap-2">
            <Icon className={`h-5 w-5 text-${planInfo.color}-500`} />
            <h3 className="font-medium text-lg">{planInfo.name}</h3>
          </div>
          <SubscriptionBadge level={level} />
        </div>
        {username && <p className="text-sm text-gray-500 mt-1">Người dùng: {username}</p>}
        <p className="text-sm text-gray-600 mt-1">{planInfo.pricePerMonth} mỗi tháng</p>
      </div>
      <CardContent className="pt-4">
        <div className="space-y-3">
          <ul className="space-y-2">
            {planInfo.benefits.map((benefit, index) => (
              <li key={index} className="flex items-start">
                <Check className={`h-5 w-5 mr-2 shrink-0 text-${planInfo.color}-500 rounded-full`} />
                <span className="text-sm">{benefit}</span>
              </li>
            ))}
            <li className="flex items-start">
              <Check className={`h-5 w-5 mr-2 shrink-0 text-${planInfo.color}-500 rounded-full`} />
              <span className="text-sm">Hết hạn: {formatExpirationDate(expiration)}</span>
            </li>
          </ul>

          {level > 1 && (
            <div className="pt-2 mt-2 border-t border-gray-100">
              <p className="text-xs text-gray-500">
                Gói Premium của bạn đang hoạt động. Bạn có thể nâng cấp lên gói cao hơn bất kỳ lúc nào.
              </p>
            </div>
          )}
        </div>
      </CardContent>
    </Card>
  )
}
