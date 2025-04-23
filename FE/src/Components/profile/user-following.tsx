"use client"

import { Card, CardTitle, CardDescription } from "../profile/ui/card"
import { ExternalLink, UserMinus, Users } from "lucide-react"
import { useEffect, useState } from "react"
import { Avatar, AvatarFallback, AvatarImage } from "../profile/ui/avatar"
import { Button } from "../profile/ui/button"
import { toast } from "../profile/ui/use-toast"
import { formatDate } from "../../lib/utils"
import { useNavigate, } from "react-router-dom"
import userApi from "../../services/user.api"
import type { UserListItem } from "../../services/user.api"

interface UserFollowingProps {
  address: string
}

export default function UserFollowing({ address }: UserFollowingProps) {
  // const router = useRouter()
  const navigate = useNavigate();
  const [isLoading, setIsLoading] = useState(true)
  const [following, setFollowing] = useState<UserListItem[]>([])
  const [page, setPage] = useState(1)
  const [hasMore, setHasMore] = useState(false)
  const [loadingUnfollow, setLoadingUnfollow] = useState<Record<string, boolean>>({})

  useEffect(() => {
    const fetchFollowing = async () => {
      try {
        setIsLoading(true)

        try {
          const response = await userApi.getUserFollowing(address, page)
          setFollowing((prev) => (page === 1 ? response.data : [...prev, ...response.data]))
          setHasMore(page < response.pagination.totalPages)
        } catch (error) {
          console.error("Error fetching following:", error)

          // Mock data nếu API lỗi
          const mockFollowing: UserListItem[] = [
            {
              walletAddress: "0x2345678901abcdef2345678901abcdef23456789",
              username: "defi_master",
              avatarURI: "/placeholder.svg?height=64&width=64",
              followedAt: "2023-04-10T08:20:00.000Z",
            },
            {
              walletAddress: "0x3456789012abcdef3456789012abcdef34567890",
              username: "blockchain_dev",
              avatarURI: "/placeholder.svg?height=64&width=64",
              followedAt: "2023-05-22T16:30:00.000Z",
            },
            {
              walletAddress: "0x4567890123abcdef4567890123abcdef45678901",
              username: "crypto_artist",
              avatarURI: "/placeholder.svg?height=64&width=64",
              followedAt: "2023-06-15T11:45:00.000Z",
            },
            {
              walletAddress: "0x5678901234abcdef5678901234abcdef56789012",
              username: "metaverse_explorer",
              avatarURI: "/placeholder.svg?height=64&width=64",
              followedAt: "2023-07-30T13:10:00.000Z",
            },
            {
              walletAddress: "0x6789012345abcdef6789012345abcdef67890123",
              username: "token_trader",
              avatarURI: "/placeholder.svg?height=64&width=64",
              followedAt: "2023-08-05T09:25:00.000Z",
            },
          ]

          setFollowing(mockFollowing)
          setHasMore(false)
        }
      } finally {
        setIsLoading(false)
      }
    }

    fetchFollowing()
  }, [address, page])

  const loadMore = () => {
    setPage((prev) => prev + 1)
  }

  const handleUnfollow = async (userAddress: string) => {
    setLoadingUnfollow((prev) => ({ ...prev, [userAddress]: true }))

    try {
      await userApi.unfollowUser(userAddress)

      // Xóa người dùng khỏi danh sách đang theo dõi
      setFollowing((prev) => prev.filter((user) => user.walletAddress !== userAddress))

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
      setLoadingUnfollow((prev) => ({ ...prev, [userAddress]: false }))
    }
  }

  const navigateToProfile = (userAddress: string) => {
    navigate(`/user/${userAddress}`)
  }

  // Kiểm tra xem có phải profile của người dùng đang đăng nhập không
  // Trong thực tế, bạn sẽ lấy địa chỉ ví của người dùng đang đăng nhập từ context hoặc store
  const isCurrentUserProfile = true // Giả sử đây là profile của người dùng đang đăng nhập

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

  if (following.length === 0) {
    return (
      <Card className="flex flex-col items-center justify-center p-8 text-center">
        <Users className="mb-2 h-12 w-12 text-muted-foreground" />
        <CardTitle className="mb-2">Chưa theo dõi ai</CardTitle>
        <CardDescription>Người dùng này chưa theo dõi ai.</CardDescription>
      </Card>
    )
  }

  return (
    <div className="space-y-4">
      {following.map((user) => (
        <div
          key={user.walletAddress}
          className="flex items-center justify-between p-4 rounded-lg border bg-card text-card-foreground hover:bg-accent/50 transition-colors flow-card"
        >
          <div className="flex items-center gap-4">
            <Avatar className="h-12 w-12">
              <AvatarImage src={user.avatarURI || "/placeholder.svg?height=48&width=48"} />
              <AvatarFallback>{user.username.substring(0, 2).toUpperCase()}</AvatarFallback>
            </Avatar>
            <div>
              <h3 className="font-medium">{user.username}</h3>
              <p className="text-sm text-muted-foreground">Đang theo dõi từ {formatDate(user.followedAt)}</p>
            </div>
          </div>
          <div className="flex gap-2">
            <Button variant="outline" size="sm" onClick={() => navigateToProfile(user.walletAddress)}>
              <ExternalLink className="h-4 w-4 mr-1" />
              Xem profile
            </Button>

            {isCurrentUserProfile && (
              <Button
                variant="outline"
                size="sm"
                className="text-red-500 hover:text-red-700 hover:bg-red-50"
                onClick={() => handleUnfollow(user.walletAddress)}
                disabled={loadingUnfollow[user.walletAddress]}
              >
                {loadingUnfollow[user.walletAddress] ? (
                  <span className="h-4 w-4 animate-spin rounded-full border-2 border-red-500 border-t-transparent"></span>
                ) : (
                  <>
                    <UserMinus className="h-4 w-4 mr-1" />
                    Bỏ theo dõi
                  </>
                )}
              </Button>
            )}
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
