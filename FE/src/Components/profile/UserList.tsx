"use client"

import { useState } from "react"
// import { useRouter } from "next/navigation"
import { Button } from "../UI/button.profile"
import { Loader2 } from "lucide-react"
import type { UserListItem } from "../../services/user.api"

interface UserListProps {
  users: UserListItem[]
  title: string
  emptyMessage: string
  currentPage: number
  totalItems: number
  onLoadMore: () => void
}

export default function UserList({ users, title, emptyMessage, currentPage, totalItems, onLoadMore }: UserListProps) {
//   const router = useRouter()
  const [loading, setLoading] = useState(false)
  const itemsPerPage = 20
  const hasMore = users.length < totalItems

  const handleLoadMore = async () => {
    if (loading || !hasMore) return

    setLoading(true)
    await onLoadMore()
    setLoading(false)
  }

  const navigateToProfile = (address: string) => {
    router.push(`/profile/${address}`)
  }

  if (users.length === 0) {
    return (
      <div className="bg-white rounded-lg shadow-md p-8 text-center">
        <h3 className="text-xl font-semibold text-gray-700 mb-2">{title}</h3>
        <p className="text-gray-500">{emptyMessage}</p>
      </div>
    )
  }

  return (
    <div className="bg-white rounded-lg shadow-md p-6">
      <h3 className="text-xl font-semibold text-gray-700 mb-4">{title}</h3>

      <div className="space-y-4">
        {users.map((user) => (
          <div
            key={user.walletAddress}
            className="flex items-center p-3 hover:bg-gray-50 rounded-lg cursor-pointer transition-colors"
            onClick={() => navigateToProfile(user.walletAddress)}
          >
            <div className="w-12 h-12 rounded-full overflow-hidden bg-green-100 mr-4">
              {user.avatarURI ? (
                <img
                  src={user.avatarURI || "/placeholder.svg"}
                  alt={user.username}
                  className="w-full h-full object-cover"
                />
              ) : (
                <div className="w-full h-full flex items-center justify-center bg-green-500 text-white text-lg font-bold">
                  {user.username.charAt(0).toUpperCase()}
                </div>
              )}
            </div>

            <div className="flex-1">
              <h4 className="font-medium text-gray-900">{user.username}</h4>
              <p className="text-xs text-gray-500 truncate">{user.walletAddress}</p>
            </div>

            <div className="text-xs text-gray-500">{new Date(user.followedAt).toLocaleDateString()}</div>
          </div>
        ))}
      </div>

      {hasMore && (
        <div className="mt-6 text-center">
          <Button onClick={handleLoadMore} variant="outline" disabled={loading}>
            {loading ? (
              <>
                <Loader2 size={16} className="mr-2 animate-spin" />
                Loading...
              </>
            ) : (
              "Load More"
            )}
          </Button>
        </div>
      )}
    </div>
  )
}
