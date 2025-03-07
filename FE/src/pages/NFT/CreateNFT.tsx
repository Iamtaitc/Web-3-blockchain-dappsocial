import React, { useState } from 'react';
import { FiX, FiTwitter, FiShare2 } from "react-icons/fi";
import { FaFacebookF } from "react-icons/fa";
import { FaTelegramPlane } from "react-icons/fa";

const CreateNFT = () => {
  const [currentStep, setCurrentStep] = useState(1);
  const [selectedImage, setSelectedImage] = useState<string | null>(null);
  const [title, setTitle] = useState('');
  const [description, setDescription] = useState('');
  const [collection, setCollection] = useState('');
  const [category, setCategory] = useState('');
  const [copyrightStatus, setCopyrightStatus] = useState('');
  const [visibility, setVisibility] = useState('public');
  const [showSuccessModal, setShowSuccessModal] = useState(false);

  const handleImageUpload = (event: React.ChangeEvent<HTMLInputElement>) => {
    const file = event.target.files?.[0];
    if (file) {
      setSelectedImage(URL.createObjectURL(file));
      setCurrentStep(2);
    }
  };

  const handleCreateNFT = () => {
    setCurrentStep(3);
    setShowSuccessModal(true);
  };

  const resetToUpload = () => {
    setSelectedImage(null);
    setCurrentStep(1);
    setTitle('');
    setDescription('');
    setCollection('');
    setCategory('');
    setCopyrightStatus('');
    setShowSuccessModal(false);
  };

  return (
    <div className="bg-white min-w-full min-h-screen p-4 rounded-lg">
      <div className="max-w-5xl mx-auto rounded-lg">
        {/* Header */}
        <div className="flex items-center p-4">
          <button className="mr-4 text-black" onClick={() => window.history.back()}>
            <svg xmlns="http://www.w3.org/2000/svg" fill="none" viewBox="0 0 24 24" strokeWidth={1.5} stroke="currentColor" className="w-6 h-6">
              <path strokeLinecap="round" strokeLinejoin="round" d="M15.75 19.5 8.25 12l7.5-7.5" />
            </svg>
          </button>
          <h1 className="text-xl text-black font-semibold">Tạo NFT</h1>
        </div>
        <div className="grid grid-cols-3 gap-9 p-4">
          <div className="col-span-1 p-4 rounded-lg">
            <div className="space-y-8">
              <div className="flex items-center">
                <div className={`w-6 text-center h-6 rounded-full mr-2 ${currentStep >= 1 ? 'bg-black text-white' : 'bg-gray-300 text-gray-600'}`}>
                  1
                </div>
                <span className={`${currentStep >= 1 ?  ' text-black':'text-customGray'}`}>Tải tệp lên</span>
              </div>
              <div className="flex items-center">
                <div className={`w-6 text-center h-6 rounded-full mr-2 ${currentStep >= 2 ? 'bg-black text-white' : 'bg-gray-300 text-gray-600'}`}>
                  2
                </div>
                <span className={`${currentStep >= 2 ?  ' text-black':'text-customGray'}`}>Thêm chi tiết NFT</span>
              </div>
              <div className="flex items-center">
                <div className={`w-6 text-center h-6 rounded-full mr-2 ${currentStep >= 3 ? 'bg-black text-white' : 'bg-gray-300 text-gray-600'}`}>
                  3
                </div>
                <span className={`${currentStep >= 3 ?  ' text-black':'text-customGray'}`}>Đúc NFT</span>
              </div>
            </div>
          </div>

          {/* Main Content */}
          <div className="col-span-2">
            {currentStep === 1 && !selectedImage && (
              <div className="border-2 border-dashed border-gray-300 p-10 text-center rounded-lg">
                <input 
                  type="file" 
                  className="hidden" 
                  id="imageUpload"
                  accept="image/*"
                  onChange={handleImageUpload}
                />
                <div className="flex justify-center mb-4">
                  <svg xmlns="http://www.w3.org/2000/svg" width="64" height="64" viewBox="0 0 64 64" fill="none" className="text-gray-400">
                    <path d="M42.6667 42.6667L32 32L21.3333 42.6667" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round"/>
                    <path d="M32 42.6667V53.3333" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round"/>
                    <path d="M54.4 49.3333C56.9647 47.9175 58.9392 45.7351 60.0807 43.0767C61.2222 40.4183 61.4712 37.4939 60.7895 34.7138C60.1078 31.9336 58.5307 29.4348 56.2861 27.5868C54.0414 25.7389 51.2361 24.7333 48.3467 24.6667H45.0667C44.2509 21.574 42.6078 18.7279 40.2667 16.3733C37.9242 14.0175 34.9547 12.2128 31.6933 11.1378C28.4319 10.0628 24.9572 9.74791 21.5511 10.2204C18.1449 10.6929 14.8949 12.0482 12.0667 14.1689C9.23849 16.2895 6.91169 19.1135 5.33841 22.3342C3.76513 25.5548 2.99977 29.0785 3.10667 32.64C3.21357 36.2015 4.19119 39.6786 6 42.7867C7.808 45.8947 10.3447 48.5307 13.3333 50.4" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round"/>
                  </svg>
                </div>
                <label 
                  htmlFor="imageUpload" 
                  className="cursor-pointer block"
                >
                  <p className="text-gray-500 mb-2">Kéo & thả để tải ảnh lên</p>
                  <p className="text-blue-500 underline">Chọn từ máy tính</p>
                </label>
              </div>
            )}

            {currentStep === 2 && selectedImage && (
              <div className="grid grid-cols-2 gap-6"> 
                <div className="grid grid-cols-1 gap-4 p-4 bg-gray-100 rounded-lg">
                  <div className="bg-white p-4 rounded-lg shadow-md">
                    <img  
                      src={selectedImage} 
                      alt="NFT Preview" 
                      className="w-full h-[400px] object-cover rounded-lg"
                    />
                  </div>
                  <div className="p-4 bg-gray-200 rounded-lg h-24"></div>
                  <div className="p-4 bg-gray-200 rounded-lg h-12"></div>
                  <div className="p-4 bg-gray-200 rounded-lg h-12"></div>
                </div>
                <div className="space-y-4">
                  <div>
                    <label className="block text-sm mb-2 text-black">Tiêu đề</label>
                    <input 
                      type="text" 
                      value={title}
                      onChange={(e) => setTitle(e.target.value)}
                      className="w-full border text-black p-2 rounded-lg"
                      placeholder="Nhập tiêu đề"
                    />
                  </div>
                  <div>
                    <label className="block text-sm mb-2 text-black">Mô tả</label>
                    <textarea 
                      value={description}
                      onChange={(e) => setDescription(e.target.value)}
                      className="w-full border text-black p-2 rounded-lg h-32"
                      placeholder="Nhập mô tả"
                    ></textarea>
                  </div>
                  <div>
                    <label className="block text-sm mb-2">Bộ sưu tập</label>
                    <select 
                      value={collection}
                      onChange={(e) => setCollection(e.target.value)}
                      className="w-full border p-2 text-black rounded-lg"
                    >
                      <option value="">Chọn bộ sưu tập</option>
                      <option value="collection1">Bộ sưu tập 1</option>
                      <option value="collection2">Bộ sưu tập 2</option>
                    </select>
                  </div>
                  <div>
                    <label className="block text-black text-sm mb-2">Thể loại</label>
                    <select 
                      value={category}
                      onChange={(e) => setCategory(e.target.value)}
                      className="text-black w-full border p-2 rounded-lg"
                    >
                      <option value="">Chọn thể loại</option>
                      <option value="painting">Tranh vẽ</option>
                      <option value="children">Thiếu nhi</option>
                      <option value="hometown">Quê hương</option>
                    </select>
                  </div>
                  <div>
                    <label className="block text-sm mb-2 text-black">Bản quyền và Giấy phép</label>
                    <select 
                      value={copyrightStatus}
                      onChange={(e) => setCopyrightStatus(e.target.value)}
                      className="text-black w-full border p-2 rounded-lg"
                    >
                      <option value="">Đã Đăng ký Bản quyền</option>
                      <option value="registered">Đã đăng ký</option>
                      <option value="pending">Đang chờ</option>
                      <option value="unregistered">Chưa đăng ký</option>
                    </select>
                  </div>
                  <div>
                    <label className="text-black block text-sm mb-2">Hiển thị với</label>
                    <div className="text-black flex items-center space-x-4">
                      <div className="flex items-center">
                        <input 
                          type="checkbox" 
                          id="public"
                          checked={visibility === 'public'}
                          onChange={() => setVisibility('public')}
                          className="mr-2"
                        />
                        <label htmlFor="public">Mọi người</label>
                      </div>
                      <div className="flex items-center">
                        <input 
                          type="checkbox" 
                          id="private"
                          checked={visibility === 'private'}
                          onChange={() => setVisibility('private')}
                          className="mr-2"
                        />
                        <label htmlFor="private">Chỉ mình tôi</label>
                      </div>
                    </div>
                  </div>
                  <div className="flex space-x-4">
                    <button 
                      className="flex-1 bg-gray-200 text-black py-2 rounded-lg"
                      onClick={resetToUpload}
                    >
                      Tải tệp lên lại
                    </button>
                    <button 
                      className="flex-1 bg-blue-500 text-white py-2 rounded-lg"
                      onClick={handleCreateNFT}
                    >
                      Tạo
                    </button>
                  </div>
                </div>
              </div>
            )}

            {currentStep === 3 && (
              <div className="flex flex-col items-center justify-center bg-gray-100 p-8 rounded-lg min-h-[500px]">
                <div className="text-center">
                  <h2 className="text-2xl font-bold text-black mb-4">Quá trình đúc NFT đang diễn ra</h2>
                  <p className="text-gray-600 mb-6">NFT của bạn đang được đúc, vui lòng đợi trong giây lát...</p>
                  <div className="w-16 h-16 border-4 border-blue-500 border-t-transparent rounded-full animate-spin mx-auto mb-6"></div>
                  <p className="text-gray-600">Quá trình này có thể mất vài phút.</p>
                </div>
              </div>
            )}
          </div>
        </div>
      </div>

      {showSuccessModal && (
        <div className="fixed inset-0 bg-black bg-opacity-50 flex items-center justify-center z-50">
          <div className="bg-white rounded-lg p-6 max-w-md w-full relative">
            <button 
              onClick={() => setShowSuccessModal(false)} 
              className="absolute top-4 right-4 text-gray-500"
            >
              <FiX className="w-5 h-5" />
            </button>
            
            <div className="flex flex-col items-center">
              <div className="mb-4 w-36 h-36 overflow-hidden rounded-lg">
                {selectedImage && (
                  <img 
                    src={selectedImage} 
                    alt="NFT" 
                    className="w-full h-full object-cover"
                  />
                )}
              </div>
              
              <p className="text-center text-gray-500 text-sm mb-2">name</p>
              <h3 className="text-xl text-black font-bold text-center mb-6">Bạn đã tạo NFT thành công!</h3>
              
              <div className="flex gap-4 mb-6">
                <button className="py-2 px-6 border border-black rounded-full text-black font-medium">Xem NFT</button>
                <button className="py-2 px-6 bg-black text-white rounded-full font-medium">Niêm yết NFT</button>
              </div>
              
              <div className="w-full">
                <p className="text-center text-sm text-gray-500 mb-4">Chia sẻ trên mạng xã hội</p>
                <div className="flex justify-center space-x-6">
                 <button className="p-2 rounded-full bg-black text-white hover:bg-white hover:text-black border border-transparent hover:border-black transition-all duration-300">
                   <FiTwitter className="w-5 h-5" />
                 </button>
                 <button className="p-2 rounded-full bg-black text-white hover:bg-white hover:text-black border border-transparent hover:border-black transition-all duration-300">
                   <FaFacebookF className="w-5 h-5" />
                 </button>
                 <button className="p-2 rounded-full bg-black text-white hover:bg-white hover:text-black border border-transparent hover:border-black transition-all duration-300">
                   <FaTelegramPlane className="w-5 h-5" />
                 </button>
                 <button className="p-2 rounded-full bg-black text-white hover:bg-white hover:text-black border border-transparent hover:border-black transition-all duration-300">
                   <FiShare2 className="w-5 h-5" />
                 </button>
               </div>
              </div>
            </div>
          </div>
        </div>
      )}
    </div>
  );
};

export default CreateNFT;