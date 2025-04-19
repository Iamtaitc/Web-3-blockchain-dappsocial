"use client"

import type React from "react"
import { useState, useRef, type ChangeEvent, useEffect } from "react"
import { X, Tag, Send, Loader2, Camera, Smile, ImageIcon, AlertCircle, Search } from "lucide-react"
import { useSelector } from "react-redux"
import type { RootState } from "../../store"
import postApi from "../../services/post.api"
// import userApi from "../../services/user.api" // Thêm import API người dùng
import { isValidImage } from "../../utils/image-utils"
import { toast } from "react-hot-toast"

// Interface cho người dùng được mention
interface MentionedUser {
  username: string
  walletAddress: string // Thêm địa chỉ ví
  displayName?: string
  avatarUrl?: string
}

interface CreatePostModalProps {
  isOpen: boolean
  onClose: () => void
  onPostCreated?: () => void
}

const CreatePostModal = ({ isOpen, onClose, onPostCreated }: CreatePostModalProps) => {
  const [content, setContent] = useState("")
  const [tags, setTags] = useState<string[]>([])
  const [mentions, setMentions] = useState<MentionedUser[]>([]) // Thay đổi kiểu dữ liệu
  const [mediaFiles, setMediaFiles] = useState<File[]>([])
  const [mediaPreviewUrls, setMediaPreviewUrls] = useState<string[]>([])
  const [currentTag, setCurrentTag] = useState("")
  const [currentMention, setCurrentMention] = useState("")
  const [isSubmitting, setIsSubmitting] = useState(false)
  const [uploadingMedia, setUploadingMedia] = useState(false)
  const [error, setError] = useState("")
  const [activeTab, setActiveTab] = useState<"content" | "tags" | "mentions">("content")
  const fileInputRef = useRef<HTMLInputElement>(null)
  const contentRef = useRef<HTMLTextAreaElement>(null)
  const modalContentRef = useRef<HTMLDivElement>(null)
  const dragAreaRef = useRef<HTMLDivElement>(null)
  const [isDragging, setIsDragging] = useState(false)
  const [searchResults, setSearchResults] = useState<MentionedUser[]>([]) // Kết quả tìm kiếm người dùng
  const [isSearching, setIsSearching] = useState(false) // Trạng thái đang tìm kiếm

  // Lấy thông tin người dùng từ Redux store
  const token = useSelector((state: RootState) => state.auth.token)
  const user = useSelector((state: RootState) => state.auth.user)
  const isAuthenticated = !!token

  // Reset form khi mở modal
  useEffect(() => {
    if (isOpen) {
      setContent("")
      setTags([])
      setMentions([])
      setMediaFiles([])
      setMediaPreviewUrls([])
      setActiveTab("content")
      setError("")
      setSearchResults([])
      setCurrentMention("")
    }
  }, [isOpen])

  // Reset scroll position khi chuyển tab
  useEffect(() => {
    if (modalContentRef.current) {
      modalContentRef.current.scrollTop = 0
    }
  }, [activeTab])

  // Xử lý drag and drop
  useEffect(() => {
    const dragArea = dragAreaRef.current
    if (!dragArea) return

    const handleDragOver = (e: DragEvent) => {
      e.preventDefault()
      e.stopPropagation()
      setIsDragging(true)
    }

    const handleDragEnter = (e: DragEvent) => {
      e.preventDefault()
      e.stopPropagation()
      setIsDragging(true)
    }

    const handleDragLeave = (e: DragEvent) => {
      e.preventDefault()
      e.stopPropagation()
      setIsDragging(false)
    }

    const handleDrop = async (e: DragEvent) => {
      e.preventDefault()
      e.stopPropagation()
      setIsDragging(false)

      if (e.dataTransfer?.files && e.dataTransfer.files.length > 0) {
        await handleFiles(Array.from(e.dataTransfer.files))
      }
    }

    dragArea.addEventListener("dragover", handleDragOver)
    dragArea.addEventListener("dragenter", handleDragEnter)
    dragArea.addEventListener("dragleave", handleDragLeave)
    dragArea.addEventListener("drop", handleDrop)

    return () => {
      dragArea.removeEventListener("dragover", handleDragOver)
      dragArea.removeEventListener("dragenter", handleDragEnter)
      dragArea.removeEventListener("dragleave", handleDragLeave)
      dragArea.removeEventListener("drop", handleDrop)
    }
  }, [])

  if (!isOpen) return null

  const handleContentChange = (e: React.ChangeEvent<HTMLTextAreaElement>) => {
    setContent(e.target.value)
    // Tự động điều chỉnh chiều cao của textarea
    e.target.style.height = "auto"
    e.target.style.height = `${e.target.scrollHeight}px`
  }

  const handleAddTag = () => {
    if (currentTag.trim() && !tags.includes(currentTag.trim())) {
      setTags([...tags, currentTag.trim()])
      setCurrentTag("")
    }
  }

  const handleRemoveTag = (tagToRemove: string) => {
    setTags(tags.filter((tag) => tag !== tagToRemove))
  }

  // Tìm kiếm người dùng để mention
  const handleSearchUsers = async (query: string) => {
    setCurrentMention(query)

    if (!query.trim() || query.length < 2) {
      setSearchResults([])
      return
    }

    try {
      setIsSearching(true)
      // Gọi API tìm kiếm người dùng
      const response = await userApi.searchUsers(query)
      if (response.success && response.data) {
        setSearchResults(
          response.data.map((user) => ({
            username: user.username,
            walletAddress: user.walletAddress,
            displayName: user.displayName,
            avatarUrl: user.avatarUrl,
          })),
        )
      }
    } catch (error) {
      console.error("Lỗi khi tìm kiếm người dùng:", error)
      setSearchResults([])
    } finally {
      setIsSearching(false)
    }
  }

  // Thêm người dùng vào danh sách mention
  const handleAddMention = (selectedUser?: MentionedUser) => {
    if (selectedUser) {
      // Nếu có người dùng được chọn từ kết quả tìm kiếm
      if (!mentions.some((m) => m.walletAddress === selectedUser.walletAddress)) {
        setMentions([...mentions, selectedUser])
      }
    } else if (currentMention.trim()) {
      // Nếu nhập thủ công (không khuyến khích nhưng vẫn hỗ trợ)
      const newMention = {
        username: currentMention.trim(),
        walletAddress: "", // Không có địa chỉ ví
      }
      if (!mentions.some((m) => m.username === newMention.username)) {
        setMentions([...mentions, newMention])
      }
    }

    setCurrentMention("")
    setSearchResults([])
  }

  const handleRemoveMention = (walletAddress: string) => {
    setMentions(mentions.filter((mention) => mention.walletAddress !== walletAddress))
  }

  // Xử lý các file được chọn hoặc kéo thả
  const handleFiles = async (files: File[]) => {
    if (files.length === 0) return

    setUploadingMedia(true)
    setError("")

    try {
      // Giới hạn số lượng file
      if (mediaFiles.length + files.length > 3) {
        setError("Chỉ được đăng tối đa 3 hình ảnh trong một bài viết")
        setUploadingMedia(false)
        return
      }

      // Lọc các file hợp lệ
      const maxSize = 10 * 1024 * 1024 // Tăng lên 10MB
      const validFiles: File[] = []
      const invalidFiles: { name: string; reason: string }[] = []

      for (const file of files) {
        if (!isValidImage(file)) {
          invalidFiles.push({ name: file.name, reason: "Định dạng không hỗ trợ" })
        } else if (file.size > maxSize) {
          invalidFiles.push({ name: file.name, reason: "Vượt quá 10MB" })
        } else {
          validFiles.push(file)
        }
      }

      if (invalidFiles.length > 0) {
        const invalidFileNames = invalidFiles.map((f) => `${f.name} (${f.reason})`).join(", ")
        setError(`Một số file không hợp lệ: ${invalidFileNames}`)

        if (validFiles.length === 0) {
          setUploadingMedia(false)
          return
        }
      }

      // Tạo URL xem trước cho các file mới (không nén)
      const newPreviewUrls = validFiles.map((file) => URL.createObjectURL(file))

      // Thêm files vào state
      setMediaFiles((prevFiles) => [...prevFiles, ...validFiles])
      setMediaPreviewUrls((prevUrls) => [...prevUrls, ...newPreviewUrls])

      // Thông báo thành công
      if (validFiles.length > 0) {
        toast.success(`Đã thêm ${validFiles.length} hình ảnh`)
      }
    } catch (err) {
      console.error("Lỗi khi xử lý file:", err)
      setError("Không thể tải lên file. Vui lòng thử lại.")
    } finally {
      setUploadingMedia(false)
    }
  }

  // Xử lý khi chọn file từ input
  const handleFileChange = async (e: ChangeEvent<HTMLInputElement>) => {
    if (e.target.files && e.target.files.length > 0) {
      await handleFiles(Array.from(e.target.files))
      // Reset input để có thể chọn lại file đã chọn trước đó
      e.target.value = ""
    }
  }

  const handleRemoveMedia = (index: number) => {
    // Thu hồi URL đối tượng để tránh rò rỉ bộ nhớ
    URL.revokeObjectURL(mediaPreviewUrls[index])

    // Xóa file và preview URL
    setMediaFiles((prevFiles) => prevFiles.filter((_, i) => i !== index))
    setMediaPreviewUrls((prevUrls) => prevUrls.filter((_, i) => i !== index))
  }

  // Xử lý khi nhấn Enter trong input tag hoặc mention
  const handleKeyDown = (e: React.KeyboardEvent, type: "tag" | "mention") => {
    if (e.key === "Enter") {
      e.preventDefault()
      if (type === "tag") {
        handleAddTag()
      } else if (searchResults.length > 0) {
        handleAddMention(searchResults[0]) // Chọn kết quả đầu tiên
      } else {
        handleAddMention()
      }
    }
  }

  // Xử lý khi submit form
  const handleSubmit = async () => {
    // Kiểm tra xác thực
    if (!isAuthenticated) {
      setError("Vui lòng đăng nhập để đăng bài")
      return
    }

    if (!content.trim() && mediaFiles.length === 0) {
      setError("Vui lòng nhập nội dung hoặc thêm hình ảnh")
      return
    }

    setIsSubmitting(true)
    setError("")

    try {
      // Lấy thông tin người dùng từ Redux store
      const authorName = user?.username || user?.name || user?.displayName || user?.address || "Người dùng ẩn danh"

      // Tạo FormData
      const formData = new FormData()

      // Thêm content
      formData.append("content", content.trim())

      // Thêm author nếu có
      if (authorName) {
        formData.append("author", authorName)
      }

      // Thêm tags nếu có
      if (tags.length > 0) {
        formData.append("tags", JSON.stringify(tags))
      }

      // Thêm mentions nếu có - bây giờ bao gồm cả username và walletAddress
      if (mentions.length > 0) {
        // Chuyển đổi mảng mentions thành định dạng phù hợp để lưu trữ
        const mentionsData = mentions.map((mention) => ({
          username: mention.username,
          walletAddress: mention.walletAddress,
        }))
        formData.append("mentions", JSON.stringify(mentionsData))
      }

      // Thêm media files nếu có
      mediaFiles.forEach((file) => {
        formData.append("media", file)
      })

      // Gọi API để tạo bài viết với FormData
      const response = await postApi.createPost(formData)

      if (response.success) {
        // Đóng modal và thông báo cho component cha
        onClose()
        if (onPostCreated) {
          onPostCreated()
        }
      } else {
        setError(response.message || "Có lỗi xảy ra khi đăng bài")
      }
    } catch (err: any) {
      console.error("Lỗi khi đăng bài:", err)
      if (err.response?.status === 413) {
        setError("Dữ liệu quá lớn. Vui lòng giảm số lượng hoặc kích thước hình ảnh.")
      } else if (err.response?.status === 401) {
        setError("Phiên đăng nhập đã hết hạn, vui lòng đăng nhập lại")
      } else {
        setError(err.message || "Có lỗi xảy ra khi đăng bài")
      }
    } finally {
      setIsSubmitting(false)
    }
  }

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center bg-black/60 backdrop-blur-sm transition-opacity">
      <div
        className="relative w-full max-w-xl bg-white rounded-xl shadow-2xl overflow-hidden flex flex-col"
        style={{ maxHeight: "90vh" }}
      >
        {/* Header */}
        <div className="flex items-center justify-between p-4 border-b bg-gradient-to-r from-emerald-500 to-teal-500">
          <h2 className="text-xl  text-white">Tạo bài viết mới</h2>
          <button
            onClick={onClose}
            className="p-1.5 rounded-full bg-white/20 hover:bg-white/30 text-white transition-colors"
          >
            <X size={20} />
          </button>
        </div>

        {/* Tabs */}
        <div className="flex border-b ">
  <button
    className={`flex-1 py-3  text-center transition-colors rounded-none ${
      activeTab === "content"
        ? "text-emerald-500 border-b-emerald-500"
        : "text-gray-500 hover:text-gray-700"
    }`}
    onClick={() => setActiveTab("content")}
  >
    Nội dung
  </button>
  <button
    className={`flex-1 py-3  text-center transition-colors rounded-none ${
      activeTab === "tags"
        ? "text-emerald-500 border-b-emerald-500"
        : "text-gray-500 hover:text-gray-700"
    }`}
    onClick={() => setActiveTab("tags")}
  >
    Thẻ
  </button>
  <button
    className={`flex-1 py-3 text-center transition-colors rounded-none ${
      activeTab === "mentions"
        ? "text-emerald-500 border-b-emerald-500"
        : "text-gray-500 hover:text-gray-700"
    }`}
    onClick={() => setActiveTab("mentions")}
  >
    Đề cập
  </button>
</div>


        {/* Scrollable content */}
        <div
          ref={modalContentRef}
          className="p-4 overflow-y-auto flex-1"
          style={{
            scrollbarWidth: "none" /* Firefox */,
            msOverflowStyle: "none" /* IE and Edge */,
          }}
        >
          <style jsx global>{`
            /* Hide scrollbar for Chrome, Safari and Opera */
            div::-webkit-scrollbar {
              display: none;
            }
          `}</style>

          {/* User info */}
          <div className="flex items-center mb-4">
            <div className="w-10 h-10 rounded-full bg-gradient-to-r from-green-400 to-green-500 flex items-center justify-center text-white font-bold">
              {user?.username?.charAt(0) || user?.name?.charAt(0) || user?.displayName?.charAt(0) || "U"}
            </div>
            <div className="ml-3">
              <p className="font-medium">{user?.username || user?.name || user?.displayName || "Người dùng"}</p>
              <p className="text-xs text-gray-500">Đang đăng bài công khai</p>
            </div>
          </div>

          {activeTab === "content" && (
            <>
              {/* Content textarea */}
              <div className="mb-4">
                <textarea
                  ref={contentRef}
                  placeholder="Bạn đang nghĩ gì?"
                  value={content}
                  onChange={handleContentChange}
                  className="w-full min-h-[120px] p-4 border border-gray-200 rounded-lg resize-none focus:outline-none focus:ring-2 focus:ring-emerald-500 bg-white text-gray-800 transition-all"
                  style={{ fontSize: "16px" }}
                />
              </div>

              {/* Drag & Drop area */}
              {mediaFiles.length === 0 && (
                <div
                  ref={dragAreaRef}
                  className={`border-2 border-dashed rounded-lg p-6 mb-4 text-center transition-colors ${
                    isDragging ? "border-green-500 bg-green-50" : "border-gray-300 hover:border-gray-400"
                  }`}
                >
                  <div className="flex flex-col items-center">
                    <ImageIcon size={40} className="text-gray-400 mb-2" />
                    <p className="text-gray-600 mb-1">Kéo và thả hình ảnh vào đây</p>
                    <p className="text-gray-500 text-sm mb-3">hoặc</p>
                    <button
                      onClick={() => fileInputRef.current?.click()}
                      className="px-4 py-2 bg-emerald-500 text-white rounded-lg hover:bg-emerald-700 transition-colors"
                      disabled={uploadingMedia}
                    >
                      {uploadingMedia ? (
                        <div className="flex items-center">
                          <Loader2 size={16} className="animate-spin mr-2" />
                          <span>Đang tải...</span>
                        </div>
                      ) : (
                        <span>Chọn hình ảnh</span>
                      )}
                    </button>
                    <p className="text-xs text-gray-500 mt-2">Hỗ trợ JPG, PNG, GIF (tối đa 10MB)</p>
                  </div>
                </div>
              )}

              {/* Media preview */}
              {mediaPreviewUrls.length > 0 && (
                <div className={`grid ${mediaPreviewUrls.length === 1 ? "grid-cols-1" : "grid-cols-2"} gap-3 mb-4`}>
                  {mediaPreviewUrls.map((url, index) => (
                    <div key={index} className="relative group rounded-lg overflow-hidden aspect-square">
                      <img
                        src={url || "/placeholder.svg"}
                        alt={`Xem trước ${index}`}
                        className="object-cover w-full h-full rounded-lg transition-transform group-hover:scale-105"
                      />
                      <div className="absolute inset-0 bg-black bg-opacity-0 group-hover:bg-opacity-30 transition-opacity flex items-center justify-center">
                        <button
                          onClick={() => handleRemoveMedia(index)}
                          className="opacity-0 group-hover:opacity-100 p-2 bg-red-500 text-white rounded-full shadow-lg hover:bg-red-600 transition-all transform scale-90 hover:scale-100"
                        >
                          <X size={16} />
                        </button>
                      </div>
                    </div>
                  ))}
                </div>
              )}

              {/* Tags display */}
              {tags.length > 0 && (
                <div className="flex flex-wrap gap-2 mb-4">
                  {tags.map((tag, index) => (
                    <div
                      key={index}
                      className="flex items-center px-3 py-1.5 text-sm bg-green-100 text-green-800 rounded-full hover:bg-green-200 transition-colors"
                    >
                      #{tag}
                      <button
                        onClick={() => handleRemoveTag(tag)}
                        className="ml-1.5 text-green-600 hover:text-green-800"
                      >
                        <X size={14} />
                      </button>
                    </div>
                  ))}
                </div>
              )}

              {/* Mentions display */}
              {mentions.length > 0 && (
                <div className="flex flex-wrap gap-2 mb-4">
                  {mentions.map((mention, index) => (
                    <div
                      key={index}
                      className="flex items-center px-3 py-1.5 text-sm bg-purple-100 text-purple-800 rounded-full hover:bg-purple-200 transition-colors"
                    >
                      @{mention.username}
                      <button
                        onClick={() => handleRemoveMention(mention.walletAddress)}
                        className="ml-1.5 text-purple-600 hover:text-purple-800"
                      >
                        <X size={14} />
                      </button>
                    </div>
                  ))}
                </div>
              )}
            </>
          )}

          {activeTab === "tags" && (
            <div className="space-y-4">
              <h3 className="text-lg font-medium text-gray-800">Thêm thẻ cho bài viết</h3>
              <p className="text-sm text-gray-600">Thẻ giúp người dùng tìm thấy bài viết của bạn dễ dàng hơn</p>

              <div className="flex items-center gap-2">
                <div className="flex items-center flex-1 px-4 py-3 border border-gray-200 rounded-lg bg-white focus-within:ring-2 focus-within:ring-green-500 focus-within:border-transparent transition-all">
                  <Tag size={18} className="mr-2 text-green-500" />
                  <input
                    type="text"
                    placeholder="Nhập thẻ và nhấn Enter"
                    value={currentTag}
                    onChange={(e) => setCurrentTag(e.target.value)}
                    onKeyDown={(e) => handleKeyDown(e, "tag")}
                    className="flex-1 focus:outline-none text-gray-800 bg-white"
                  />
                </div>
                <button
                  onClick={handleAddTag}
                  className="px-4 py-3 text-white bg-emerald-500 rounded-lg hover:bg-emerald-700 transition-colors shadow-sm"
                >
                  Thêm
                </button>
              </div>

              {tags.length > 0 ? (
                <div className="mt-4">
                  <h4 className="text-sm font-medium text-gray-700 mb-2">Thẻ đã thêm:</h4>
                  <div className="flex flex-wrap gap-2">
                    {tags.map((tag, index) => (
                      <div
                        key={index}
                        className="flex items-center px-3 py-1.5 text-sm bg-green-100 text-green-800 rounded-full hover:bg-green-200 transition-colors"
                      >
                        #{tag}
                        <button
                          onClick={() => handleRemoveTag(tag)}
                          className="ml-1.5 text-green-600 hover:text-green-800"
                        >
                          <X size={14} />
                        </button>
                      </div>
                    ))}
                  </div>
                </div>
              ) : (
                <p className="text-sm text-gray-500 italic">Chưa có thẻ nào được thêm</p>
              )}

              {/* Content preview */}
              {content && (
                <div className="mt-6 p-4 border border-gray-200 rounded-lg bg-gray-50">
                  <h4 className="text-sm font-medium text-gray-700 mb-2">Xem trước nội dung:</h4>
                  <p className="text-gray-800">{content}</p>
                </div>
              )}

              {/* Media preview in tags tab */}
              {mediaPreviewUrls.length > 0 && (
                <div className="mt-6">
                  <h4 className="text-sm font-medium text-gray-700 mb-2">Hình ảnh đã thêm:</h4>
                  <div className="grid grid-cols-3 gap-2">
                    {mediaPreviewUrls.map((url, index) => (
                      <div key={index} className="relative rounded-lg overflow-hidden aspect-square">
                        <img
                          src={url || "/placeholder.svg"}
                          alt={`Preview ${index}`}
                          className="w-full h-full object-cover"
                        />
                      </div>
                    ))}
                  </div>
                </div>
              )}
            </div>
          )}

          {activeTab === "mentions" && (
            <div className="space-y-4">
              <h3 className="text-lg font-medium text-gray-800">Đề cập người dùng</h3>
              <p className="text-sm text-gray-600">Đề cập sẽ thông báo cho người dùng về bài viết của bạn</p>

              {/* Tìm kiếm người dùng */}
              <div className="flex items-center gap-2">
                <div className="flex items-center flex-1 px-4 py-3 border border-gray-200 rounded-lg bg-white focus-within:ring-2 focus-within:ring-green-500 focus-within:border-transparent transition-all">
                  <Search size={18} className="mr-2 text-green-500" />
                  <input
                    type="text"
                    placeholder="Tìm kiếm người dùng..."
                    value={currentMention}
                    onChange={(e) => handleSearchUsers(e.target.value)}
                    onKeyDown={(e) => handleKeyDown(e, "mention")}
                    className="flex-1 focus:outline-none text-gray-800 bg-white"
                  />
                  {isSearching && <Loader2 size={18} className="animate-spin text-green-500" />}
                </div>
              </div>

              {/* Kết quả tìm kiếm */}
              {searchResults.length > 0 && (
                <div className="mt-2 border border-gray-200 rounded-lg overflow-hidden">
                  {searchResults.map((user, index) => (
                    <div
                      key={index}
                      className="flex items-center p-3 hover:bg-gray-50 cursor-pointer border-b last:border-b-0"
                      onClick={() => handleAddMention(user)}
                    >
                      <div className="w-8 h-8 rounded-full bg-green-100 flex items-center justify-center text-green-700 font-medium">
                        {user.username.charAt(0).toUpperCase()}
                      </div>
                      <div className="ml-3">
                        <p className="font-medium text-gray-800">{user.username}</p>
                        <p className="text-xs text-gray-500 truncate max-w-[200px]">{user.walletAddress}</p>
                      </div>
                    </div>
                  ))}
                </div>
              )}

              {/* Danh sách người dùng đã đề cập */}
              {mentions.length > 0 ? (
                <div className="mt-4">
                  <h4 className="text-sm font-medium text-gray-700 mb-2">Người dùng đã đề cập:</h4>
                  <div className="flex flex-wrap gap-2">
                    {mentions.map((mention, index) => (
                      <div
                        key={index}
                        className="flex items-center px-3 py-1.5 text-sm bg-purple-100 text-purple-800 rounded-full hover:bg-purple-200 transition-colors"
                      >
                        @{mention.username}
                        <button
                          onClick={() => handleRemoveMention(mention.walletAddress)}
                          className="ml-1.5 text-purple-600 hover:text-purple-800"
                        >
                          <X size={14} />
                        </button>
                      </div>
                    ))}
                  </div>
                </div>
              ) : (
                <p className="text-sm text-gray-500 italic">Chưa có người dùng nào được đề cập</p>
              )}

              {/* Content preview */}
              {content && (
                <div className="mt-6 p-4 border border-gray-200 rounded-lg bg-gray-50">
                  <h4 className="text-sm font-medium text-gray-700 mb-2">Xem trước nội dung:</h4>
                  <p className="text-gray-800">{content}</p>
                </div>
              )}

              {/* Media preview in mentions tab */}
              {mediaPreviewUrls.length > 0 && (
                <div className="mt-6">
                  <h4 className="text-sm font-medium text-gray-700 mb-2">Hình ảnh đã thêm:</h4>
                  <div className="grid grid-cols-3 gap-2">
                    {mediaPreviewUrls.map((url, index) => (
                      <div key={index} className="relative rounded-lg overflow-hidden aspect-square">
                        <img
                          src={url || "/placeholder.svg"}
                          alt={`Preview ${index}`}
                          className="w-full h-full object-cover"
                        />
                      </div>
                    ))}
                  </div>
                </div>
              )}
            </div>
          )}

          {/* Error message */}
          {error && (
            <div className="p-3 mb-4 text-sm text-red-700 bg-red-100 rounded-lg border border-red-200">
              <div className="flex items-center">
                <AlertCircle size={18} className="mr-2 text-red-600" />
                {error}
              </div>
            </div>
          )}
        </div>

        {/* Footer - Fixed at bottom */}
        <div className="flex items-center justify-between p-4 border-t bg-gray-50">
          <div className="flex items-center gap-3">
            <button
              onClick={() => fileInputRef.current?.click()}
              className="flex items-center gap-2 px-3 py-2 text-gray-700 bg-white border border-gray-200 rounded-lg hover:bg-gray-50 transition-colors shadow-sm"
              disabled={uploadingMedia || mediaFiles.length >= 3}
              title={mediaFiles.length >= 3 ? "Đã đạt giới hạn 3 hình ảnh" : "Thêm hình ảnh"}
            >
              {uploadingMedia ? (
                <Loader2 size={18} className="animate-spin text-green-500" />
              ) : (
                <Camera size={18} className="text-green-500" />
              )}
              <span>Thêm ảnh</span>
            </button>
            <input
              type="file"
              ref={fileInputRef}
              onChange={handleFileChange}
              multiple
              accept="image/*"
              className="hidden"
              disabled={mediaFiles.length >= 3}
            />

            <button className="flex items-center gap-2 px-3 py-2 text-gray-700 bg-white border border-gray-200 rounded-lg hover:bg-gray-50 transition-colors shadow-sm">
              <Smile size={18} className="text-yellow-500" />
              <span>Cảm xúc</span>
            </button>
          </div>

          <button
            onClick={handleSubmit}
            disabled={isSubmitting || !isAuthenticated || uploadingMedia}
            className={`flex items-center gap-2 px-5 py-2.5 text-white rounded-lg shadow-md transition-all ${
              isSubmitting || !isAuthenticated || uploadingMedia
                ? "bg-emerald-500 opacity-70 cursor-not-allowed"
                : "bg-emerald-500 hover:bg-emerald-700 transform hover:scale-105"
            }`}
          >
            {isSubmitting ? <Loader2 size={18} className="animate-spin" /> : <Send size={18} />}
            <span>{isSubmitting ? "Đang đăng..." : "Đăng bài"}</span>
          </button>
        </div>
      </div>
    </div>
  )
}

export default CreatePostModal
