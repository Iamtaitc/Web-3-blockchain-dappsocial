import type React from "react"
import { useState } from "react"
import { FiX, FiTwitter, FiShare2 } from "react-icons/fi"
import { FaFacebookF, FaTelegramPlane } from "react-icons/fa"

const CreateNFT = () => {
  const [currentStep, setCurrentStep] = useState(1)
  const [selectedImage, setSelectedImage] = useState<string | null>(null)
  const [title, setTitle] = useState("")
  const [description, setDescription] = useState("")
  const [collection, setCollection] = useState("")
  const [category, setCategory] = useState("")
  const [copyrightStatus, setCopyrightStatus] = useState("")
  const [visibility, setVisibility] = useState("public")
  const [showSuccessModal, setShowSuccessModal] = useState(false)

  const handleImageUpload = (event: React.ChangeEvent<HTMLInputElement>) => {
    const file = event.target.files?.[0]
    if (file) {
      setSelectedImage(URL.createObjectURL(file))
      setCurrentStep(2)
    }
  }

  const handleCreateNFT = () => {
    setCurrentStep(3)
    setShowSuccessModal(true)
  }

  const resetToUpload = () => {
    setSelectedImage(null)
    setCurrentStep(1)
    setTitle("")
    setDescription("")
    setCollection("")
    setCategory("")
    setCopyrightStatus("")
    setShowSuccessModal(false)
  }

  return (
    <div className="min-h-screen ml-[62px] rounded-[10px] bg-white">
      {/* Header */}
      <div className="max-w-7xl mx-auto px-4">
        <div className="flex items-center py-6">
          <button onClick={() => window.history.back()} className="mr-4 text-black hover:opacity-75 transition-opacity">
            <svg
              xmlns="http://www.w3.org/2000/svg"
              fill="none"
              viewBox="0 0 24 24"
              strokeWidth={1.5}
              stroke="currentColor"
              className="w-6 h-6"
            >
              <path strokeLinecap="round" strokeLinejoin="round" d="M15.75 19.5 8.25 12l7.5-7.5" />
            </svg>
          </button>
          <h1 className="text-xl font-semibold text-black">Tạo NFT</h1>
        </div>

        {/* Main Content */}
        <div className="grid grid-cols-4 gap-8 pb-12">
          {/* Left Sidebar */}
          <div className="col-span-1">
            <div className="space-y-8">
              <div className="flex items-center">
                <div
                  className={`w-6 h-6 rounded-full flex items-center justify-center mr-3 
                  ${currentStep >= 1 ? "bg-black text-white" : "bg-gray-200 text-gray-400"}`}
                >
                  1
                </div>
                <span className={currentStep >= 1 ? "text-black" : "text-gray-400"}>Tải tệp lên</span>
              </div>
              <div className="flex items-center">
                <div
                  className={`w-6 h-6 rounded-full flex items-center justify-center mr-3 
                  ${currentStep >= 2 ? "bg-black text-white" : "bg-gray-200 text-gray-400"}`}
                >
                  2
                </div>
                <span className={currentStep >= 2 ? "text-black" : "text-gray-400"}>Thêm chi tiết NFT</span>
              </div>
              <div className="flex items-center">
                <div
                  className={`w-6 h-6 rounded-full flex items-center justify-center mr-3 
                  ${currentStep >= 3 ? "bg-black text-white" : "bg-gray-200 text-gray-400"}`}
                >
                  3
                </div>
                <span className={currentStep >= 3 ? "text-black" : "text-gray-400"}>Đúc NFT</span>
              </div>
            </div>
          </div>

          {/* Right Content */}
          <div className="col-span-3">
            {currentStep === 1 && !selectedImage && (
              <div className="border-2 border-dashed border-gray-200 rounded-lg p-8">
                <div className="flex flex-col items-center justify-center min-h-[400px]">
                  <input
                    type="file"
                    id="imageUpload"
                    className="hidden text-black"
                    accept="image/*"
                    onChange={handleImageUpload}
                  />
                  <div className="mb-4">
                    <svg
                      width="64"
                      height="64"
                      viewBox="0 0 64 64"
                      fill="none"
                      xmlns="http://www.w3.org/2000/svg"
                      className="text-gray-400"
                    >
                      <path
                        d="M42.6667 42.6667L32 32L21.3333 42.6667"
                        stroke="currentColor"
                        strokeWidth="2"
                        strokeLinecap="round"
                        strokeLinejoin="round"
                      />
                      <path
                        d="M32 32V53.3333"
                        stroke="currentColor"
                        strokeWidth="2"
                        strokeLinecap="round"
                        strokeLinejoin="round"
                      />
                      <path
                        d="M54.4 49.3333C57.0933 47.8667 59.2 45.6 60.4 42.8C61.6 40 61.8667 36.9333 61.1333 34.0667C60.4 31.2 58.6667 28.6667 56.2667 26.8C53.8667 24.9333 50.9333 24 48 23.8667H44.6667C43.8667 20.6667 42.1333 17.7333 39.7333 15.3333C37.3333 12.9333 34.2667 11.0667 30.9333 10C27.6 8.93333 24 8.53333 20.5333 9.06667C17.0667 9.6 13.7333 10.9333 10.9333 13.0667C8.13333 15.2 5.73333 18 4.13333 21.3333C2.53333 24.6667 1.73333 28.2667 1.86667 32C2 35.7333 3.06667 39.3333 4.93333 42.5333C6.8 45.7333 9.46667 48.4 12.5333 50.2667"
                        stroke="currentColor"
                        strokeWidth="2"
                        strokeLinecap="round"
                        strokeLinejoin="round"
                      />
                    </svg>
                  </div>
                  <label htmlFor="imageUpload" className="cursor-pointer text-center">
                    <p className="text-gray-500 mb-2">Kéo & thả để tải ảnh lên</p>
                    <p className="text-blue-500 underline">Chọn từ máy tính</p>
                  </label>
                </div>
              </div>
            )}

            {currentStep === 2 && selectedImage && (
              <div className="grid grid-cols-2 gap-8">
                {/* Preview Section */}
                <div className="bg-gray-50 rounded-lg p-6">
                  <div className="bg-white rounded-lg shadow-sm p-4 mb-4">
                    <img
                      src={selectedImage || "/placeholder.svg"}
                      alt="NFT Preview"
                      className="w-full h-[400px] object-cover rounded-lg"
                    />
                  </div>
                  <div className="space-y-4">
                    <div className="h-24 bg-gray-100 rounded-lg"></div>
                    <div className="h-12 bg-gray-100 rounded-lg"></div>
                    <div className="h-12 bg-gray-100 rounded-lg"></div>
                  </div>
                </div>

                {/* Form Section */}
                <div className="space-y-6">
                  <div>
                    <label className="block text-sm font-medium text-gray-700 mb-2">Tiêu đề</label>
                    <input
                      type="text"
                      value={title}
                      onChange={(e) => setTitle(e.target.value)}
                      className="w-full px-4 py-2 border border-gray-200 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-transparent text-black"
                      placeholder="Nhập tiêu đề"
                    />
                  </div>

                  <div>
                    <label className="block text-sm font-medium text-gray-700 mb-2">Mô tả</label>
                    <textarea
                      value={description}
                      onChange={(e) => setDescription(e.target.value)}
                      className="w-full px-4 py-2 text-black border border-gray-200 rounded-lg h-32 focus:ring-2 focus:ring-blue-500 focus:border-transparent"
                      placeholder="Nhập mô tả"
                    />
                  </div>

                  <div>
                    <label className="block text-sm font-medium text-gray-700 mb-2">Bộ sưu tập</label>
                    <select
                      value={collection}
                      onChange={(e) => setCollection(e.target.value)}
                      className="w-full px-4 py-2 border text-black border-gray-200 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-transparent"
                    >
                      <option value="">Chọn bộ sưu tập</option>
                      <option value="collection1">Bộ sưu tập 1</option>
                      <option value="collection2">Bộ sưu tập 2</option>
                    </select>
                  </div>

                  <div>
                    <label className="block text-sm font-medium text-gray-700 mb-2">Thể loại</label>
                    <select
                      value={category}
                      onChange={(e) => setCategory(e.target.value)}
                      className="w-full px-4 py-2 border text-black border-gray-200 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-transparent"
                    >
                      <option value="">Chọn thể loại</option>
                      <option value="painting">Tranh vẽ</option>
                      <option value="children">Thiếu nhi</option>
                      <option value="hometown">Quê hương</option>
                    </select>
                  </div>

                  <div>
                    <label className="block text-sm font-medium text-gray-700 mb-2">Bản quyền và Giấy phép</label>
                    <select
                      value={copyrightStatus}
                      onChange={(e) => setCopyrightStatus(e.target.value)}
                      className="w-full px-4 py-2 border text-black border-gray-200 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-transparent"
                    >
                      <option value="">Đã Đăng ký Bản quyền</option>
                      <option value="registered">Đã đăng ký</option>
                      <option value="pending">Đang chờ</option>
                      <option value="unregistered">Chưa đăng ký</option>
                    </select>
                  </div>

                  <div>
                    <label className="block text-sm font-medium text-gray-700 mb-2">Hiển thị với</label>
                    <div className="flex space-x-6">
                      <label className="flex items-center">
                        <input
                          type="radio"
                          checked={visibility === "public"}
                          onChange={() => setVisibility("public")}
                          className="w-4 h-4 text-blue-500 border-gray-300 focus:ring-blue-500"
                        />
                        <span className="ml-2 text-gray-700">Mọi người</span>
                      </label>
                      <label className="flex items-center">
                        <input
                          type="radio"
                          checked={visibility === "private"}
                          onChange={() => setVisibility("private")}
                          className="w-4 h-4 text-blue-500 border-gray-300 focus:ring-blue-500"
                        />
                        <span className="ml-2 text-gray-700">Chỉ mình tôi</span>
                      </label>
                    </div>
                  </div>

                  <div className="flex gap-4 pt-4">
                    <button
                      onClick={resetToUpload}
                      className="flex-1 px-6 py-2 bg-gray-100 text-gray-700 rounded-lg hover:bg-gray-200 transition-colors"
                    >
                      Tải tệp lên lại
                    </button>
                    <button
                      onClick={handleCreateNFT}
                      className="flex-1 px-6 py-2 bg-blue-500 text-white rounded-lg hover:bg-blue-600 transition-colors"
                    >
                      Tạo
                    </button>
                  </div>
                </div>
              </div>
            )}

            {currentStep === 3 && (
              <div className="flex flex-col items-center justify-center min-h-[500px] bg-gray-50 rounded-lg p-8">
                <h2 className="text-2xl font-bold text-gray-900 mb-4">Quá trình đúc NFT đang diễn ra</h2>
                <p className="text-gray-500 mb-8">NFT của bạn đang được đúc, vui lòng đợi trong giây lát...</p>
                <div className="w-16 h-16 border-4 border-blue-500 border-t-transparent rounded-full animate-spin mb-8"></div>
                <p className="text-gray-500">Quá trình này có thể mất vài phút.</p>
              </div>
            )}
          </div>
        </div>
      </div>

      {/* Success Modal */}
      {showSuccessModal && (
        <div className="fixed inset-0 bg-black bg-opacity-50 flex items-center justify-center z-50">
          <div className="bg-white rounded-lg p-8 max-w-md w-full relative">
            <button
              onClick={() => setShowSuccessModal(false)}
              className="absolute top-4 right-4 text-gray-400 hover:text-gray-600"
            >
              <FiX className="w-6 h-6" />
            </button>

            <div className="flex flex-col items-center">
              <div className="w-36 h-36 rounded-lg overflow-hidden mb-4">
                {selectedImage && (
                  <img src={selectedImage || "/placeholder.svg"} alt="NFT" className="w-full h-full object-cover" />
                )}
              </div>

              <p className="text-gray-500 text-sm mb-2">{title}</p>
              <h3 className="text-xl text-gray-900  font-bold text-center mb-6">Bạn đã tạo NFT thành công!</h3>

              <div className="flex gap-4 mb-8">
                <button className="px-6 py-2 border border-black rounded-full text-black hover:bg-black hover:text-white transition-colors">
                  Xem NFT
                </button>
                <button className="px-6 py-2 bg-black text-white rounded-full hover:bg-gray-800 transition-colors">
                  Niêm yết NFT
                </button>
              </div>

              <div className="w-full text-center">
                <p className="text-gray-500 text-sm mb-4">Chia sẻ trên mạng xã hội</p>
                <div className="flex justify-center space-x-4">
                  <button className="p-2 rounded-full bg-black text-white hover:bg-white hover:text-black border border-transparent hover:border-black transition-all">
                    <FiTwitter className="w-5 h-5" />
                  </button>
                  <button className="p-2 rounded-full bg-black text-white hover:bg-white hover:text-black border border-transparent hover:border-black transition-all">
                    <FaFacebookF className="w-5 h-5" />
                  </button>
                  <button className="p-2 rounded-full bg-black text-white hover:bg-white hover:text-black border border-transparent hover:border-black transition-all">
                    <FaTelegramPlane className="w-5 h-5" />
                  </button>
                  <button className="p-2 rounded-full bg-black text-white hover:bg-white hover:text-black border border-transparent hover:border-black transition-all">
                    <FiShare2 className="w-5 h-5" />
                  </button>
                </div>
              </div>
            </div>
          </div>
        </div>
      )}
    </div>
  )
}

export default CreateNFT

