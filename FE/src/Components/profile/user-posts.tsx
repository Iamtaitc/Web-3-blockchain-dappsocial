"use client"

import { Card, CardHeader, CardContent, CardTitle, CardDescription } from "../profile/ui/card"
import { MessageSquare } from "lucide-react"
import { useEffect, useState } from "react"

interface UserPostsProps {
  address: string
}

export default function UserPosts({ address }: UserPostsProps) {
  const [isLoading, setIsLoading] = useState(true)
  const [posts, setPosts] = useState<any[]>([])

  useEffect(() => {
    // Mô phỏng lệnh gọi API để lấy bài đăng
    const fetchPosts = async () => {
      try {
        setIsLoading(true)
        // Thay thế bằng lệnh gọi API thực tế
        await new Promise((resolve) => setTimeout(resolve, 1000))
        setPosts([])
      } catch (error) {
        console.error("Error fetching posts:", error)
      } finally {
        setIsLoading(false)
      }
    }

    fetchPosts()
  }, [address])

  if (isLoading) {
    return (
      <div className="space-y-4">
        {Array(3)
          .fill(0)
          .map((_, i) => (
            <Card key={i} className="animate-pulse">
              <CardHeader>
                <div className="h-4 w-32 bg-gray-200 rounded"></div>
                <div className="h-3 w-24 bg-gray-200 rounded"></div>
              </CardHeader>
              <CardContent>
                <div className="h-24 w-full bg-gray-200 rounded"></div>
              </CardContent>
            </Card>
          ))}
      </div>
    )
  }

  if (posts.length === 0) {
    return (
      <Card className="flex flex-col items-center justify-center p-8 text-center">
        <MessageSquare className="mb-2 h-12 w-12 text-muted-foreground" />
        <CardTitle className="mb-2">Chưa có bài viết</CardTitle>
        <CardDescription>Người dùng này chưa đăng bài viết nào.</CardDescription>
      </Card>
    )
  }

  return <div className="space-y-4">{/* Bài viết sẽ được hiển thị ở đây */}</div>
}
