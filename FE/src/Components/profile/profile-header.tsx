"use client"

import { Avatar, AvatarFallback, AvatarImage } from "../profile/ui/avatar"
import { Button } from "../profile/ui/button"
import { Edit, Share2, UserPlus, UserMinus } from "lucide-react"
import { formatDate } from "../../lib/utils"
import VIPAura from "./vip-effects/vip-aura"
import VIPBadgeAnimation from "./vip-effects/vip-badge-animation"
import SubscriptionBadge from "./subscription-badge"
import type { UserProfile } from "../../services/user.api"

interface ProfileHeaderProps {
  profile: UserProfile
  isCurrentUser: boolean
  isFollowing: boolean
  onFollow: () => void
  onUnfollow: () => void
  onEdit: () => void
}

export default function ProfileHeader({
  profile,
  isCurrentUser,
  isFollowing,
  onFollow,
  onUnfollow,
  onEdit,
}: ProfileHeaderProps) {
  return (
    <>
      {/* Cover Image */}
      <div className="relative h-64 w-full overflow-hidden rounded-xl bg-gradient-to-r from-violet-500 to-fuchsia-500">
        {profile.coverURI && (
          <img
            src={profile.coverURI || "/placeholder.svg?height=256&width=1024"}
            alt="Ảnh bìa"
            className="w-full h-full object-cover"
          />
        )}

        {/* VIP Effects */}
        {profile.subscription.level >= 5 && (
          <div className="absolute inset-0 bg-gradient-to-t from-black/30 to-transparent"></div>
        )}

        {profile.subscription.level >= 10 && (
          <div className="absolute inset-0 overflow-hidden">
            <div className="stars-container">
              {[...Array(20)].map((_, i) => (
                <div
                  key={i}
                  className="star-elite"
                  style={{
                    top: `${Math.random() * 100}%`,
                    left: `${Math.random() * 100}%`,
                    animationDelay: `${Math.random() * 5}s`,
                    animationDuration: `${1 + Math.random() * 2}s`,
                  }}
                ></div>
              ))}
            </div>
          </div>
        )}
      </div>

      {/* User Info */}
      <div className="relative px-4">
        <div className="absolute -top-20 left-4 rounded-full">
          <VIPAura level={profile.subscription.level}>
            <Avatar className="h-32 w-32 border-4 border-white">
              <AvatarImage
                src={profile.avatarURI || "/placeholder.svg?height=128&width=128"}
                alt={profile.username || ""}
              />
              <AvatarFallback className="text-3xl">
                {profile.username?.substring(0, 2).toUpperCase() || "UN"}
              </AvatarFallback>
            </Avatar>
          </VIPAura>

          {profile.isVerified && (
            <div className="absolute bottom-0 right-0 rounded-full bg-primary p-1 z-10">
              <svg width="20" height="20" viewBox="0 0 24 24" fill="none" xmlns="http://www.w3.org/2000/svg">
                <path
                  d="M9 12L11 14L15 10M21 12C21 16.9706 16.9706 21 12 21C7.02944 21 3 16.9706 3 12C3 7.02944 7.02944 3 12 3C16.9706 3 21 7.02944 21 12Z"
                  stroke="white"
                  strokeWidth="2"
                  strokeLinecap="round"
                  strokeLinejoin="round"
                />
              </svg>
            </div>
          )}

          {/* VIP Badge Animation */}
          <VIPBadgeAnimation level={profile.subscription.level} />
        </div>

        <div className="ml-40 flex items-start justify-between">
          <div>
            <div className="flex text-black items-center gap-2">
              <h1 className="text-2xl font-bold">{profile.username || profile.walletAddress.substring(0, 8)}</h1>
              <SubscriptionBadge level={profile.subscription.level} />
            </div>
            {profile.ensName && <p className="text-muted-foreground text-black">{profile.ensName}</p>}
            <p className="mt-1 text-sm text-muted-foreground">Tham gia {formatDate(profile.createdAt)}</p>
          </div>

          <div className="flex gap-2">
            {isCurrentUser ? (
              <Button variant="outline" size="sm" onClick={onEdit}>
                <Edit className="mr-2 h-4 w-4" />
                Chỉnh sửa
              </Button>
            ) : (
              <>
                {isFollowing ? (
                  <Button variant="outline" size="sm" onClick={onUnfollow}>
                    <UserMinus className="mr-2 h-4 w-4" />
                    Bỏ theo dõi
                  </Button>
                ) : (
                  <Button size="sm" onClick={onFollow}>
                    <UserPlus className="mr-2 h-4 w-4" />
                    Theo dõi
                  </Button>
                )}
              </>
            )}
            <Button variant="outline" size="icon">
              <Share2 className="h-4 w-4" />
            </Button>
          </div>
        </div>

        {/* Bio */}
        {profile.bio && (
          <div className="mt-6">
            <p>{profile.bio}</p>
          </div>
        )}
      </div>
    </>
  )
}
