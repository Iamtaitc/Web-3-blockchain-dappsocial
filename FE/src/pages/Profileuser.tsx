"use client"

import { useEffect, useState } from "react"
import { useParams, useNavigate } from "react-router-dom"
import { Tabs, TabsContent, TabsList, TabsTrigger } from "../components/profile/ui/tabs"
import ProfileHeader from "../components/profile/profile-header"
import ProfileStats from "../components/profile/profile-stats"
import SubscriptionCard from "../components/profile/subscription-card"
import UserPosts from "../components/profile/user-posts"
import UserFollowers from "../components/profile/user-followers"
import UserFollowing from "../components/profile/user-following"
import EditProfileModal from "../components/profile/EditProfileModal"
import VIPUpgradeModal from "../components/profile/vip-upgrade-modal"
import VIPFireworks from "../components/profile/vip-effects/vip-fireworks"
import { useAppSelector } from "../hooks/useAppSelector"
import { useAppDispatch } from "../hooks/useAppDispatch"
import { 
  fetchUserProfile, 
  followUserThunk, 
  setCurrentProfile, 
  unfollowUserThunk, 
  updateUserProfile 
} from "../store/slices/userSlice"
import { toast } from "../components/profile/ui/use-toast"
import { getIpfsUrl } from "../lib/utils"
import { Button } from "../components/UI/buttonlogin"
import userApi from "../services/user.api"

// Mock data cho các level khác nhau để test
const mockLevels = [
  { level: 0, name: "Free" },
  { level: 1, name: "Standard" },
  { level: 2, name: "Plus" },
  { level: 5, name: "Pro" },
  { level: 10, name: "Elite" },
]

export default function ProfilePage() {
  const { address } = useParams<{ address: string }>()
  const navigate = useNavigate()
  const dispatch = useAppDispatch()

  // Lấy thông tin người dùng từ Redux store
  const { currentProfile, loading, profiles } = useAppSelector((state) => state.user)
  const currentUserWalletAddress = useAppSelector((state) => state.auth.walletAddress)
  
  // Tận dụng cache nếu có sẵn profile
  const cachedProfile = address ? profiles[address] : null

  const [showUpgradeModal, setShowUpgradeModal] = useState(false)
  const [showEditModal, setShowEditModal] = useState(false)
  const [showFireworks, setShowFireworks] = useState(false)
  const [mockLevel, setMockLevel] = useState<number | null>(null)

  // Kiểm tra xem có phải profile của người dùng đang đăng nhập không
  const isCurrentUser = currentUserWalletAddress === address

  useEffect(() => {
    // Nếu địa chỉ không hợp lệ, chuyển hướng về trang chủ
    if (!address || typeof address !== "string") {
      navigate("/")
      return
    }

    // Chỉ fetch profile khi:
    // 1. Không có trong cache
    // 2. Hoặc đang xem profile của người dùng hiện tại (để đảm bảo dữ liệu luôn mới nhất)
    if (!cachedProfile || address === currentUserWalletAddress) {
      dispatch(fetchUserProfile(address))
    } else {
      // Nếu có trong cache, sử dụng luôn để tránh gọi API
      dispatch(setCurrentProfile(cachedProfile))
    }
  }, [address, currentUserWalletAddress])

  // Profile hiển thị là profile hiện tại hoặc profile từ cache
  const profile = currentProfile?.walletAddress === address 
    ? currentProfile 
    : cachedProfile

  // Đảm bảo sử dụng đúng level từ database
  const subscriptionLevel = mockLevel !== null 
    ? mockLevel 
    : profile?.subscription?.level || 0

  const isFollowing = profile?.isFollowing || false

  const handleFollow = async () => {
    if (!address) return

    try {
      await dispatch(followUserThunk(address))
      
      toast({
        title: "Thành công",
        description: `Bạn đã theo dõi ${profile?.username || "người dùng này"}`,
      })
    } catch (error) {
      console.error("Lỗi khi theo dõi người dùng:", error)
      toast({
        title: "Lỗi",
        description: "Không thể theo dõi người dùng này. Vui lòng thử lại sau.",
        variant: "destructive",
      })
    }
  }

  const handleUnfollow = async () => {
    if (!address) return

    try {
      await dispatch(unfollowUserThunk(address))
      
      toast({
        title: "Thành công",
        description: `Bạn đã hủy theo dõi ${profile?.username || "người dùng này"}`,
      })
    } catch (error) {
      console.error("Lỗi khi hủy theo dõi người dùng:", error)
      toast({
        title: "Lỗi",
        description: "Không thể hủy theo dõi người dùng này. Vui lòng thử lại sau.",
        variant: "destructive",
      })
    }
  }

  const handleUpgradeSubscription = async (level: number) => {
    if (!profile) return

    try {
      // Giả lập gọi API để nâng cấp subscription
      await userApi.upgradeSubscription(address as string, level)

      // Cập nhật profile với level VIP mới trong Redux
      const updatedProfile = {
        ...profile,
        subscription: {
          ...profile.subscription,
          level: level,
          isActive: true,
          expiration: new Date(new Date().setDate(new Date().getDate() + 30)).toISOString(),
        },
      }
      
      // Cập nhật profile trong Redux
      dispatch(setCurrentProfile(updatedProfile))

      // Hiển thị hiệu ứng pháo hoa
      setShowFireworks(true)
      setTimeout(() => setShowFireworks(false), 3000)

      // Đóng modal nâng cấp
      setShowUpgradeModal(false)

      // Cập nhật mock level
      setMockLevel(level)

      toast({
        title: "Nâng cấp thành công!",
        description: `Bạn đã nâng cấp lên gói ${level === 10 ? "Elite" : level === 5 ? "Pro" : level === 2 ? "Plus" : "Standard"}`,
      })
    } catch (error) {
      console.error("Lỗi khi nâng cấp gói VIP:", error)
      toast({
        title: "Lỗi",
        description: "Không thể nâng cấp gói VIP. Vui lòng thử lại sau.",
        variant: "destructive",
      })
    }
  }

  const handleProfileUpdate = async (formData: FormData) => {
    try {
      await dispatch(updateUserProfile(formData))
      setShowEditModal(false)
      
      toast({
        title: "Cập nhật thành công",
        description: "Thông tin cá nhân của bạn đã được cập nhật",
      })
    } catch (error) {
      console.error("Lỗi khi cập nhật thông tin:", error)
      toast({
        title: "Lỗi",
        description: "Không thể cập nhật thông tin. Vui lòng thử lại sau.",
        variant: "destructive",
      })
    }
  }

  if (loading && !profile) {
    return (
      <div className="flex items-center justify-center min-h-screen">
        <div className="text-center">
          <div className="w-16 h-16 border-4 border-blue-500 border-t-transparent rounded-full animate-spin mx-auto mb-4"></div>
          <h2 className="text-xl font-semibold mb-2">Đang tải thông tin...</h2>
          <p className="text-gray-500">Vui lòng đợi trong giây lát...</p>
        </div>
      </div>
    )
  }

  if (!profile) {
    return (
      <div className="flex items-center justify-center min-h-screen">
        <div className="text-center">
          <h2 className="text-xl font-semibold mb-2">Không tìm thấy người dùng</h2>
          <p className="text-gray-500">Địa chỉ ví không tồn tại hoặc đã bị xóa.</p>
        </div>
      </div>
    )
  }

  // Hiệu ứng pháo hoa khi nâng cấp VIP
  if (showFireworks) {
    return <VIPFireworks level={subscriptionLevel} />
  }

  // Sử dụng level từ subscription (đã được xử lý đúng từ database)
  const updatedProfile = {
    ...profile,
    subscription: {
      ...profile.subscription,
      level: subscriptionLevel,
    },
    // Chuyển đổi các URI IPFS thành URL có thể truy cập
    avatarURI: getIpfsUrl(profile.avatarURI),
    coverURI: getIpfsUrl(profile.coverURI),
  }

  return (
    <div className="space-y-8 max-w-6xl mx-auto p-4">
      {/* Mock Level Selector - Chỉ hiển thị cho người dùng đang đăng nhập
      {isCurrentUser && (
        <div className="bg-white p-4 rounded-lg shadow mb-4">
          <h3 className="text-lg font-semibold mb-2">Test các level VIP</h3>
          <div className="flex flex-wrap gap-2">
            {mockLevels.map((level) => (
              <Button
                key={level.level}
                variant={mockLevel === level.level ? "default" : "outline"}
                size="sm"
                onClick={() => setMockLevel(level.level)}
              >
                Level {level.level}: {level.name}
              </Button>
            ))}
          </div>
        </div>
      )} */}

      <ProfileHeader
        profile={updatedProfile}
        isCurrentUser={isCurrentUser}
        isFollowing={isFollowing}
        onFollow={handleFollow}
        onUnfollow={handleUnfollow}
        onEdit={() => setShowEditModal(true)}
      />

      <ProfileStats profile={updatedProfile} />

      <SubscriptionCard
        subscription={updatedProfile.subscription}
        onUpgrade={() => setShowUpgradeModal(true)}
        isCurrentUser={isCurrentUser}
      />

      <Tabs defaultValue="posts" className="w-full">
        <TabsList className="grid w-full grid-cols-3">
          <TabsTrigger value="posts">Bài viết</TabsTrigger>
          <TabsTrigger value="followers">Người theo dõi</TabsTrigger>
          <TabsTrigger value="following">Đang theo dõi</TabsTrigger>
        </TabsList>
        <TabsContent value="posts">
          <UserPosts address={updatedProfile.walletAddress} />
        </TabsContent>
        <TabsContent value="followers">
          <UserFollowers address={updatedProfile.walletAddress} />
        </TabsContent>
        <TabsContent value="following">
          <UserFollowing address={updatedProfile.walletAddress} />
        </TabsContent>
      </Tabs>

      {/* Modals - Chỉ hiển thị cho người dùng đang đăng nhập */}
      {isCurrentUser && (
        <>
          <EditProfileModal
            isOpen={showEditModal}
            onClose={() => setShowEditModal(false)}
            profile={updatedProfile}
            onSubmit={handleProfileUpdate}
          />

          <VIPUpgradeModal
            isOpen={showUpgradeModal}
            onClose={() => setShowUpgradeModal(false)}
            currentLevel={subscriptionLevel}
            onUpgrade={handleUpgradeSubscription}
          />
        </>
      )}
    </div>
  )
}