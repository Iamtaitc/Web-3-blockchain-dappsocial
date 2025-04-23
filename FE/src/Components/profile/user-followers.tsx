"use client"

import { Card, CardTitle, CardDescription } from "../profile/ui/card"
import { ExternalLink, UserPlus, Users } from "lucide-react"
import { useEffect, useState } from "react"
import { Avatar, AvatarFallback, AvatarImage } from "../profile/ui/avatar"
import { Button } from "../profile/ui/button"
import { toast } from "../profile/ui/use-toast"
import { formatDate } from "../../lib/utils"
import { useNavigate } from "react-router-dom"
import userApi from "../../services/user.api"
import type { UserListItem } from "../../services/user.api"

interface UserFollowersProps {
  address: string
}

export default function UserFollowers({ address }: UserFollowersProps) {
  const navigate = useNavigate();
  const [isLoading, setIsLoading] = useState(true)
  const [followers, setFollowers] = useState<UserListItem[]>([])
  const [page, setPage] = useState(1)
  const [hasMore, setHasMore] = useState(false)
  const [followingMap, setFollowingMap] = useState<Record<string, boolean>>({})
  const [loadingFollow, setLoadingFollow] = useState<Record<string, boolean>>({})

  useEffect(() => {
    const fetchFollowers = async () => {
      try {
        setIsLoading(true)

        try {
          const response = await userApi.getUserFollowers(address, page)
          const newFollowers = response.data

          setFollowers((prev) => (page === 1 ? newFollowers : [...prev, ...newFollowers]))
          setHasMore(page < response.pagination.totalPages)

          // Kiểm tra xem người dùng hiện tại có đang theo dõi những người này không
          const followingStatus: Record<string, boolean> = {}
          for (const follower of newFollowers) {
            followingStatus[follower.walletAddress] = follower.isFollowedByCurrentUser || false
          }
          setFollowingMap((prev) => ({ ...prev, ...followingStatus }))
        } catch (error) {
          console.error("Error fetching followers:", error)

          // Mock data nếu API lỗi
          const mockFollowers: UserListItem[] = [
            {
              walletAddress: "0x1234567890abcdef1234567890abcdef12345678",
              username: "crypto_lover",
              avatarURI: "/placeholder.svg?height=64&width=64",
              followedAt: "2023-05-15T10:30:00.000Z",
              isFollowedByCurrentUser: false,
            },
            {
              walletAddress: "0xabcdef1234567890abcdef1234567890abcdef12",
              username: "nft_collector",
              avatarURI: "/placeholder.svg?height=64&width=64",
              followedAt: "2023-06-20T14:45:00.000Z",
              isFollowedByCurrentUser: true,
            },
            {
              walletAddress: "0x7890abcdef1234567890abcdef1234567890abcd",
              username: "web3_enthusiast",
              avatarURI: "/placeholder.svg?height=64&width=64",
              followedAt: "2023-07-05T09:15:00.000Z",
              isFollowedByCurrentUser: false,
            },
          ]

          setFollowers(mockFollowers)

          // Cập nhật followingMap từ mock data
          const followingStatus: Record<string, boolean> = {}
          for (const follower of mockFollowers) {
            followingStatus[follower.walletAddress] = follower.isFollowedByCurrentUser || false
          }
          setFollowingMap(followingStatus)

          setHasMore(false)
        }
      } finally {
        setIsLoading(false)
      }
    }

    fetchFollowers()
  }, [address, page])

  const loadMore = () => {
    setPage((prev) => prev + 1)
  }

  const handleFollow = async (userAddress: string) => {
    setLoadingFollow((prev) => ({ ...prev, [userAddress]: true }))

    try {
      await userApi.followUser(userAddress)
      setFollowingMap((prev) => ({ ...prev, [userAddress]: true }))
      toast({
        title: "Thành công",
        description: "Bạn đã theo dõi người dùng này",
      })
    } catch (error) {
      console.error("Lỗi khi theo dõi người dùng:", error)
      toast({
        title: "Lỗi",
        description: "Không thể theo dõi người dùng này. Vui lòng thử lại sau.",
        variant: "destructive",
      })
    } finally {
      setLoadingFollow((prev) => ({ ...prev, [userAddress]: false }))
    }
  }

  const handleUnfollow = async (userAddress: string) => {
    setLoadingFollow((prev) => ({ ...prev, [userAddress]: true }))

    try {
      await userApi.unfollowUser(userAddress)
      setFollowingMap((prev) => ({ ...prev, [userAddress]: false }))
      toast({
        title: "Thành công",
        description: "Bạn đã hủy theo dõi người dùng này",
      })
    } catch (error) {
      console.error("Lỗi khi hủy theo dõi người dùng:", error)
      toast({
        title: "Lỗi",
        description: "Không thể hủy theo dõi người dùng này. Vui lòng thử lại sau.",
        variant: "destructive",
      })
    } finally {
      setLoadingFollow((prev) => ({ ...prev, [userAddress]: false }))
    }
  }

  const navigateToProfile = (userAddress: string) => {
    navigate(`/profile/${userAddress}`)
  }

  if (isLoading && page === 1) {
    return (
      <div className="space-y-4">
        {Array(3)
          .fill(0)
          .map((_, i) => (
            <div key={i} className="flex items-center gap-4 animate-pulse">
              <div className="h-12 w-12 rounded-full bg-gray-200"></div>
              <div className="space-y-2">
                <div className="h-4 w-32 bg-gray-200 rounded"></div>
                <div className="h-3 w-24 bg-gray-200 rounded"></div>
              </div>
            </div>
          ))}
      </div>
    )
  }

  if (followers.length === 0) {
    return (
      <Card className="flex flex-col items-center justify-center p-8 text-center">
        <Users className="mb-2 h-12 w-12 text-muted-foreground" />
        <CardTitle className="mb-2">Chưa có người theo dõi</CardTitle>
        <CardDescription>Người dùng này chưa có người theo dõi nào.</CardDescription>
      </Card>
    )
  }

  return (
    <div className="space-y-4">
      {followers.map((follower) => (
        <div
          key={follower.walletAddress}
          className="flex items-center justify-between p-4 rounded-lg border bg-card text-card-foreground hover:bg-accent/50 transition-colors flow-card"
        >
          <div className="flex items-center gap-4">
            <Avatar className="h-12 w-12">
              <AvatarImage src={follower.avatarURI || "/placeholder.svg?height=48&width=48"} />
              <AvatarFallback>{follower.username.substring(0, 2).toUpperCase()}</AvatarFallback>
            </Avatar>
            <div>
              <h3 className="font-medium">{follower.username}</h3>
              <p className="text-sm text-muted-foreground">Theo dõi từ {formatDate(follower.followedAt)}</p>
            </div>
          </div>
          <div className="flex gap-2">
            <Button variant="outline" size="sm" onClick={() => navigateToProfile(follower.walletAddress)}>
              <ExternalLink className="h-4 w-4 mr-1" />
              Xem profile
            </Button>

            {follower.walletAddress !== address &&
              (followingMap[follower.walletAddress] ? (
                <Button
                  variant="outline"
                  size="sm"
                  onClick={() => handleUnfollow(follower.walletAddress)}
                  disabled={loadingFollow[follower.walletAddress]}
                >
                  {loadingFollow[follower.walletAddress] ? (
                    <span className="h-4 w-4 animate-spin rounded-full border-2 border-primary border-t-transparent"></span>
                  ) : (
                    "Bỏ theo dõi"
                  )}
                </Button>
              ) : (
                <Button
                  variant="default"
                  size="sm"
                  onClick={() => handleFollow(follower.walletAddress)}
                  disabled={loadingFollow[follower.walletAddress]}
                >
                  {loadingFollow[follower.walletAddress] ? (
                    <span className="h-4 w-4 animate-spin rounded-full border-2 border-white border-t-transparent"></span>
                  ) : (
                    <>
                      <UserPlus className="h-4 w-4 mr-1" />
                      Theo dõi
                    </>
                  )}
                </Button>
              ))}
          </div>
        </div>
      ))}

      {hasMore && (
        <div className="flex justify-center mt-4">
          <Button variant="outline" onClick={loadMore} disabled={isLoading}>
            {isLoading ? (
              <>
                <span className="mr-2 h-4 w-4 animate-spin rounded-full border-2 border-primary border-t-transparent"></span>
                Đang tải...
              </>
            ) : (
              "Xem thêm"
            )}
          </Button>
        </div>
      )}
    </div>
  )
}
