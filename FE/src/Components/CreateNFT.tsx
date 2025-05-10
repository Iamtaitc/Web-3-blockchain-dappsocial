"use client"

import type React from "react"
import { useState } from "react"
import { FaImage } from "react-icons/fa"

const CreateNFT: React.FC = () => {
  const [previewImage, setPreviewImage] = useState<string | null>(null)
 
  
  console.log("🔑 Token hiện tại trong Redux:", token)

  const handleImageChange = (event: React.ChangeEvent<HTMLInputElement>) => {
    const file = event.target.files?.[0]
    if (file) {
      const reader = new FileReader()
      reader.onloadend = () => {
        setPreviewImage(reader.result as string)
      }
      reader.readAsDataURL(file)
    }
  }


  return (
    <div className="w-screen max-w-[calc(100vw-200px)] p-20 max-w-3xl mx-auto font-mono">
      <h1 className="text-4xl font-bold mb-8 text-center">Create New NFT</h1>

      <form className="space-y-6">
        {/* Image Upload */}
        <div className="space-y-2">
          <label className="block text-sm font-medium text-gray-400">NFT Image</label>
          <div className="relative">
            <input type="file" accept="image/*" onChange={handleImageChange} className="hidden" id="nft-image" />
            <label
              htmlFor="nft-image"
              className={`flex flex-col items-center justify-center w-full h-64 border-2 border-dashed rounded-lg cursor-pointer
                ${previewImage ? "border-green-500" : "border-gray-600 hover:border-gray-500"}`}
            >
              {previewImage ? (
                <img
                  src={previewImage || "/placeholder.svg"}
                  alt="Preview"
                  className="w-full h-full object-contain rounded-lg"
                />
              ) : (
                <div className="flex flex-col items-center justify-center pt-5 pb-6">
                  <FaImage className="w-12 h-12 text-gray-400 mb-4" />
                  <p className="mb-2 text-sm text-gray-400">
                    <span className="font-semibold">Click to upload</span> or drag and drop
                  </p>
                  <p className="text-xs text-gray-400">PNG, JPG, GIF up to 10MB</p>
                </div>
              )}
            </label>
          </div>
        </div>

        {/* Name */}
        <div className="space-y-2">
          <label className="block text-sm font-medium text-gray-400">Name</label>
          <input
            type="text"
            className="w-full px-4 py-2 bg-gray-900 border border-gray-800 rounded-lg focus:outline-none focus:border-green-500"
            placeholder="Item name"
          />
        </div>

        {/* Description */}
        <div className="space-y-2">
          <label className="block text-sm font-medium text-gray-400">Description</label>
          <textarea
            rows={4}
            className="w-full px-4 py-2 bg-gray-900 border border-gray-800 rounded-lg focus:outline-none focus:border-green-500"
            placeholder="Provide a detailed description of your item"
          />
        </div>

        {/* Price */}
        <div className="space-y-2">
          <label className="block text-sm font-medium text-gray-400">Price (ETH)</label>
          <input
            type="number"
            step="0.000001"
            className="w-full px-4 py-2 bg-gray-900 border border-gray-800 rounded-lg focus:outline-none focus:border-green-500"
            placeholder="0.00"
          />
        </div>

        {/* Properties */}
        <div className="space-y-2">
          <label className="block text-sm font-medium text-gray-400">Properties (Optional)</label>
          <div className="grid grid-cols-2 gap-4">
            <input
              type="text"
              className="px-4 py-2 bg-gray-900 border border-gray-800 rounded-lg focus:outline-none focus:border-green-500"
              placeholder="Property name"
            />
            <input
              type="text"
              className="px-4 py-2 bg-gray-900 border border-gray-800 rounded-lg focus:outline-none focus:border-green-500"
              placeholder="Property value"
            />
          </div>
          <button type="button" className="text-sm text-green-500 hover:text-green-400">
            + Add more
          </button>
        </div>

        {/* Submit Button */}
        <button
          type="submit"
          className="w-full py-3 px-4 bg-green-500 hover:bg-green-600 text-black rounded-lg transition-colors font-bold"
        >
          Create NFT
        </button>
      </form>
    </div>
  )
}

export default CreateNFT

