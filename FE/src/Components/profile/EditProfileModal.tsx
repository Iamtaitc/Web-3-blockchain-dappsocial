"use client"

import type React from "react"
import { useRef, useState } from "react"
import { Dialog, DialogContent, DialogHeader, DialogTitle, DialogFooter } from "../profile/ui/dialog"
import { Button } from "../profile/ui/button"
import { Input } from "../profile/ui/input"
import { Label } from "../profile/ui/label"
import { Textarea } from "../profile/ui/textarea"
import { Avatar, AvatarFallback, AvatarImage } from "../profile/ui/avatar"
import type { UserProfile } from "../../services/user.api"
import { Camera, X } from "lucide-react"
import { toast } from "../profile/ui/use-toast"


interface EditProfileModalProps {
  isOpen: boolean
  onClose: () => void
  profile: UserProfile
  onSubmit: (formData: FormData) => Promise<void>
}

export default function EditProfileModal({ isOpen, onClose, profile, onSubmit }: EditProfileModalProps) {
  const [username, setUsername] = useState(profile.username || "")
  const [bio, setBio] = useState(profile.bio || "")
  const [avatarPreview, setAvatarPreview] = useState<string | null>(profile.avatarURI)
  const [coverPreview, setCoverPreview] = useState<string | null>(profile.coverURI)
  const [isSubmitting, setIsSubmitting] = useState(false)

  const avatarInputRef = useRef<HTMLInputElement>(null)
  const coverInputRef = useRef<HTMLInputElement>(null)

  const handleAvatarChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    const file = e.target.files?.[0]
    if (file) {
      if (file.size > 5 * 1024 * 1024) {
        toast({
          title: "Lỗi",
          description: "Kích thước ảnh không được vượt quá 5MB",
          variant: "destructive",
        })
        return
      }

      const reader = new FileReader()
      reader.onloadend = () => {
        setAvatarPreview(reader.result as string)
      }
      reader.readAsDataURL(file)
    }
  }

  const handleCoverChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    const file = e.target.files?.[0]
    if (file) {
      if (file.size > 10 * 1024 * 1024) {
        toast({
          title: "Lỗi",
          description: "Kích thước ảnh bìa không được vượt quá 10MB",
          variant: "destructive",
        })
        return
      }

      const reader = new FileReader()
      reader.onloadend = () => {
        setCoverPreview(reader.result as string)
      }
      reader.readAsDataURL(file)
    }
  }

  const clearAvatarPreview = () => {
    setAvatarPreview(null)
    if (avatarInputRef.current) {
      avatarInputRef.current.value = ""
    }
  }

  const clearCoverPreview = () => {
    setCoverPreview(null)
    if (coverInputRef.current) {
      coverInputRef.current.value = ""
    }
  }

  const handleSubmit = async (e: React.FormEvent<HTMLFormElement>) => {
    e.preventDefault()

    if (!username.trim()) {
      toast({
        title: "Lỗi",
        description: "Tên hiển thị không được để trống",
        variant: "destructive",
      })
      return
    }

    setIsSubmitting(true)

    try {
      const form = e.currentTarget
      const formData = new FormData(form)
      await onSubmit(formData)
      toast({
        title: "Thành công",
        description: "Thông tin cá nhân đã được cập nhật",
      })
    } catch (error) {
      console.error("Error updating profile:", error)
      toast({
        title: "Lỗi",
        description: "Không thể cập nhật thông tin. Vui lòng thử lại sau.",
        variant: "destructive",
      })
    } finally {
      setIsSubmitting(false)
    }
  }

  return (
    <Dialog open={isOpen} onOpenChange={onClose}>
      <DialogContent className="sm:max-w-[500px] p-0 overflow-hidden">
        <DialogHeader className="px-6 pt-6 pb-2">
          <DialogTitle className="text-xl">Chỉnh sửa thông tin cá nhân</DialogTitle>
        </DialogHeader>

        <form onSubmit={handleSubmit} className="space-y-6">
          {/* Cover Image Preview */}
          <div className="relative h-40 w-full bg-gradient-to-r from-blue-500 to-purple-500">
            {coverPreview && (
              <img
                src={coverPreview || "/placeholder.svg"}
                alt="Cover preview"
                className="h-full w-full object-cover"
              />
            )}
            <div className="absolute bottom-4 right-4 flex gap-2">
              <Button
                type="button"
                size="icon"
                variant="secondary"
                className="rounded-full bg-white/20 backdrop-blur-sm hover:bg-white/30"
                onClick={() => coverInputRef.current?.click()}
              >
                <Camera className="h-4 w-4" />
              </Button>
              {coverPreview && (
                <Button
                  type="button"
                  size="icon"
                  variant="destructive"
                  className="rounded-full"
                  onClick={clearCoverPreview}
                >
                  <X className="h-4 w-4" />
                </Button>
              )}
            </div>
          </div>

          {/* Avatar Preview */}
          <div className="px-6 -mt-12">
            <div className="relative inline-block">
              <Avatar className="h-24 w-24 border-4 border-white shadow-lg">
                <AvatarImage src={avatarPreview || "/placeholder.svg?height=96&width=96"} />
                <AvatarFallback className="text-2xl">{username.substring(0, 2).toUpperCase() || "UN"}</AvatarFallback>
              </Avatar>
              <Button
                type="button"
                size="icon"
                variant="secondary"
                className="absolute bottom-0 right-0 rounded-full h-8 w-8"
                onClick={() => avatarInputRef.current?.click()}
              >
                <Camera className="h-4 w-4" />
              </Button>
              {avatarPreview && (
                <Button
                  type="button"
                  size="icon"
                  variant="destructive"
                  className="absolute top-0 right-0 rounded-full h-6 w-6"
                  onClick={clearAvatarPreview}
                >
                  <X className="h-3 w-3" />
                </Button>
              )}
            </div>
          </div>

          <div className="px-6 space-y-4">
            <div className="space-y-2">
              <Label htmlFor="username" className="text-sm font-medium">
                Tên hiển thị <span className="text-red-500">*</span>
              </Label>
              <Input
                id="username"
                name="username"
                value={username}
                onChange={(e) => setUsername(e.target.value)}
                placeholder="Nhập tên hiển thị"
                className="h-10"
                required
              />
            </div>

            <div className="space-y-2">
              <Label htmlFor="bio" className="text-sm font-medium">
                Tiểu sử
              </Label>
              <Textarea
                id="bio"
                name="bio"
                value={bio}
                onChange={(e) => setBio(e.target.value)}
                placeholder="Giới thiệu về bạn"
                rows={3}
                className="resize-none"
              />
            </div>

            {/* Hidden file inputs */}
            <input
              ref={avatarInputRef}
              id="avatar"
              name="avatar"
              type="file"
              accept="image/*"
              onChange={handleAvatarChange}
              className="hidden"
            />

            <input
              ref={coverInputRef}
              id="cover"
              name="cover"
              type="file"
              accept="image/*"
              onChange={handleCoverChange}
              className="hidden"
            />
          </div>

          <DialogFooter className="px-6 py-4 bg-gray-50">
            <Button type="button" variant="outline" onClick={onClose} disabled={isSubmitting}>
              Hủy
            </Button>
            <Button
              type="submit"
              disabled={isSubmitting}
              className="bg-gradient-to-r from-blue-600 to-indigo-600 hover:from-blue-700 hover:to-indigo-700"
            >
              {isSubmitting ? (
                <>
                  <span className="mr-2 h-4 w-4 animate-spin rounded-full border-2 border-white border-t-transparent"></span>
                  Đang lưu...
                </>
              ) : (
                "Lưu thay đổi"
              )}
            </Button>
          </DialogFooter>
        </form>
      </DialogContent>
    </Dialog>
  )
}
