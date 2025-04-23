import { Users, MessageSquare, Award } from "lucide-react"
import StatCard from "./stat-card"
import { formatNumber } from "../../lib/utils"
import type { UserProfile } from "../../services/user.api"

interface ProfileStatsProps {
  profile: UserProfile
}

export default function ProfileStats({ profile }: ProfileStatsProps) {
  return (
    <div className="mt-8 grid grid-cols-2 gap-4 sm:grid-cols-4">
      <StatCard
        icon={<Users className="h-5 w-5 text-blue-500" />}
        label="Người theo dõi"
        value={formatNumber(profile.followerCount)}
      />
      <StatCard
        icon={<Users className="h-5 w-5 text-purple-500" />}
        label="Đang theo dõi"
        value={formatNumber(profile.followingCount)}
      />
      <StatCard
        icon={<MessageSquare className="h-5 w-5 text-amber-500" />}
        label="Bài viết"
        value={formatNumber(profile.postCount)}
      />
      <StatCard icon={<Award className="h-5 w-5 text-rose-500" />} label="Điểm" value={formatNumber(profile.points)} />
    </div>
  )
}
