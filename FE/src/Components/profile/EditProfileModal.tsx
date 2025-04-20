"use client"

import type React from "react"

import { useState, useRef, type ChangeEvent } from "react"
import { Button } from "../UI/button.profile"
import { Input } from "../UI/input.profile"
import { Textarea } from "../UI/Textarea.profile"
import { X, Loader2, Camera, ImageIcon } from "lucide-react"
import userApi, { type UserProfile } from "../../services/user.api"
import { toast } from "react-hot-toast"

interface EditProfileModalProps {
  isOpen: boolean
  onClose: () => void
  profile: UserProfile
  onProfileUpdated: (profile: UserProfile) => void
}

export default function EditProfileModal({ isOpen, onClose, profile, onProfileUpdated }: EditProfileModalProps) {
  const [username, setUsername] = useState(profile.username)
  const [bio, setBio] = useState(profile.bio || "")
  const [avatarFile, setAvatarFile] = useState<File | null>(null)
  const [coverFile, setCoverFile] = useState<File | null>(null)
  const [avatarPreview, setAvatarPreview] = useState<string | null>(profile.avatarURI)
  const [coverPreview, setCoverPreview] = useState<string | null>(profile.coverURI)
  const [loading, setLoading] = useState(false)
  const [error, setError] = useState("")

  const avatarInputRef = useRef<HTMLInputElement>(null)
  const coverInputRef = useRef<HTMLInputElement>(null)

  if (!isOpen) return null

  const handleAvatarChange = (e: ChangeEvent<HTMLInputElement>) => {
    const file = e.target.files?.[0]
    if (!file) return

    // Validate file size (max 5MB)
    if (file.size > 5 * 1024 * 1024) {
      toast.error("Avatar image must be less than 5MB")
      return
    }

    setAvatarFile(file)
    const previewUrl = URL.createObjectURL(file)
    setAvatarPreview(previewUrl)
  }

  const handleCoverChange = (e: ChangeEvent<HTMLInputElement>) => {
    const file = e.target.files?.[0]
    if (!file) return

    // Validate file size (max 10MB)
    if (file.size > 10 * 1024 * 1024) {
      toast.error("Cover image must be less than 10MB")
      return
    }

    setCoverFile(file)
    const previewUrl = URL.createObjectURL(file)
    setCoverPreview(previewUrl)
  }

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault()

    if (!username.trim()) {
      setError("Username is required")
      return
    }

    try {
      setLoading(true)
      setError("")

      const formData = new FormData()
      formData.append("username", username)
      formData.append("bio", bio)

      if (avatarFile) {
        formData.append("avatar", avatarFile)
      }

      if (coverFile) {
        formData.append("cover", coverFile)
      }

      const updatedProfile = await userApi.updateProfile(formData)
      toast.success("Profile updated successfully")
      onProfileUpdated(updatedProfile)
    } catch (err: any) {
      console.error("Error updating profile:", err)
      setError(err.response?.data?.message || "Failed to update profile")
      toast.error("Failed to update profile")
    } finally {
      setLoading(false)
    }
  }

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center bg-black/60 backdrop-blur-sm">
      <div className="relative w-full max-w-md bg-white rounded-xl shadow-2xl overflow-hidden">
        {/* Header */}
        <div className="flex items-center justify-between p-4 border-b bg-gradient-to-r from-green-500 to-green-600">
          <h2 className="text-xl font-bold text-white">Edit Profile</h2>
          <button
            onClick={onClose}
            className="p-1.5 rounded-full bg-white/20 hover:bg-white/30 text-white transition-colors"
          >
            <X size={20} />
          </button>
        </div>

        <form onSubmit={handleSubmit} className="p-6">
          {/* Cover Image */}
          <div className="mb-6">
            <label className="block text-sm font-medium text-gray-700 mb-2">Cover Image</label>
            <div
              className="relative h-32 bg-gray-100 rounded-lg overflow-hidden cursor-pointer"
              onClick={() => coverInputRef.current?.click()}
            >
              {coverPreview ? (
                <img
                  src={coverPreview || "/placeholder.svg"}
                  alt="Cover Preview"
                  className="w-full h-full object-cover"
                />
              ) : (
                <div className="w-full h-full flex items-center justify-center bg-gray-200">
                  <ImageIcon size={32} className="text-gray-400" />
                </div>
              )}
              <div className="absolute inset-0 bg-black/30 flex items-center justify-center opacity-0 hover:opacity-100 transition-opacity">
                <Camera size={24} className="text-white mr-2" />
                <span className="text-white font-medium">Change Cover</span>
              </div>
            </div>
            <input type="file" ref={coverInputRef} onChange={handleCoverChange} accept="image/*" className="hidden" />
          </div>

          {/* Avatar */}
          <div className="mb-6">
            <label className="block text-sm font-medium text-gray-700 mb-2">Profile Picture</label>
            <div
              className="relative w-24 h-24 mx-auto bg-gray-100 rounded-full overflow-hidden cursor-pointer"
              onClick={() => avatarInputRef.current?.click()}
            >
              {avatarPreview ? (
                <img
                  src={avatarPreview || "/placeholder.svg"}
                  alt="Avatar Preview"
                  className="w-full h-full object-cover"
                />
              ) : (
                <div className="w-full h-full flex items-center justify-center bg-green-500 text-white text-4xl font-bold">
                  {username.charAt(0).toUpperCase()}
                </div>
              )}
              <div className="absolute inset-0 bg-black/30 flex items-center justify-center opacity-0 hover:opacity-100 transition-opacity">
                <Camera size={20} className="text-white" />
              </div>
            </div>
            <input type="file" ref={avatarInputRef} onChange={handleAvatarChange} accept="image/*" className="hidden" />
          </div>

          {/* Username */}
          <div className="mb-6">
            <label htmlFor="username" className="block text-sm font-medium text-gray-700 mb-2">
              Username
            </label>
            <Input
              id="username"
              value={username}
              onChange={(e) => setUsername(e.target.value)}
              placeholder="Enter your username"
              className="w-full"
              required
            />
          </div>

          {/* Bio */}
          <div className="mb-6">
            <label htmlFor="bio" className="block text-sm font-medium text-gray-700 mb-2">
              Bio
            </label>
            <Textarea
              id="bio"
              value={bio}
              onChange={(e) => setBio(e.target.value)}
              placeholder="Tell others about yourself"
              className="w-full min-h-[100px]"
            />
          </div>

          {/* Error message */}
          {error && <div className="mb-4 p-3 bg-red-50 text-red-700 rounded-md text-sm">{error}</div>}

          {/* Submit button */}
          <div className="flex justify-end space-x-3">
            <Button type="button" variant="outline" onClick={onClose} disabled={loading}>
              Cancel
            </Button>
            <Button type="submit" className="bg-green-500 hover:bg-green-600 text-white" disabled={loading}>
              {loading ? (
                <>
                  <Loader2 size={16} className="mr-2 animate-spin" />
                  Saving...
                </>
              ) : (
                "Save Changes"
              )}
            </Button>
          </div>
        </form>
      </div>
    </div>
  )
}
