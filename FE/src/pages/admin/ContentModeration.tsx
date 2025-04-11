"use client"

import { useState } from "react"
import {
  Search,
  Filter,
  ChevronDown,
  ChevronLeft,
  ChevronRight,
  Eye,
  EyeOff,
  Trash2,
  MessageSquare,
  Heart,
  ImageIcon,
  FileText,
} from "lucide-react"

// Mock content data
const mockContent = Array.from({ length: 100 }, (_, i) => {
  // Only text or image content types (no video)
  const contentTypes = ["text", "image", "image", "image"]
  const contentType = contentTypes[Math.floor(Math.random() * contentTypes.length)]

  // Generate different placeholder images
  const imageNumber = Math.floor(Math.random() * 10) + 1
  const mediaUrl = contentType === "image" ? `/placeholder.svg?height=300&width=500&text=Image+${imageNumber}` : null

  return {
    id: i + 1,
    content: `This is a sample ${contentType} post #${i + 1}. ${
      Math.random() > 0.5
        ? "Check out this amazing content! #crypto #web3 #nft"
        : "Just sharing my thoughts on the latest blockchain developments."
    }`,
    author: {
      id: Math.floor(Math.random() * 100) + 1,
      username: `user_${Math.floor(Math.random() * 100) + 1}`,
      avatar: `/placeholder.svg?height=40&width=40`,
      verified: Math.random() > 0.8,
    },
    mediaType: contentType !== "text" ? contentType : null,
    mediaUrl: contentType !== "text" ? mediaUrl : null,
    status: Math.random() > 0.9 ? "deleted" : Math.random() > 0.8 ? "hidden" : "active",
    likes: Math.floor(Math.random() * 1000),
    comments: Math.floor(Math.random() * 100),
    createdAt: new Date(Date.now() - Math.floor(Math.random() * 30 * 24 * 60 * 60 * 1000)).toISOString(),
  }
})

const ContentModeration = () => {
  const [searchTerm, setSearchTerm] = useState("")
  const [statusFilter, setStatusFilter] = useState("all")
  const [currentPage, setCurrentPage] = useState(1)
  const [selectedContent, setSelectedContent] = useState<any>(null)
  const [showContentModal, setShowContentModal] = useState(false)
  const [showActionModal, setShowActionModal] = useState(false)
  const [actionType, setActionType] = useState<"hide" | "delete" | "activate" | null>(null)

  const itemsPerPage = 20

  // Filter content based on search term and status
  const filteredContent = mockContent.filter((content) => {
    const matchesSearch =
      searchTerm === "" ||
      content.content.toLowerCase().includes(searchTerm.toLowerCase()) ||
      content.author.username.toLowerCase().includes(searchTerm.toLowerCase())

    const matchesStatus = statusFilter === "all" || content.status === statusFilter

    return matchesSearch && matchesStatus
  })

  // Paginate content
  const totalPages = Math.ceil(filteredContent.length / itemsPerPage)
  const paginatedContent = filteredContent.slice((currentPage - 1) * itemsPerPage, currentPage * itemsPerPage)

  // Handle content action
  const handleContentAction = (content: any, action: "hide" | "delete" | "activate") => {
    setSelectedContent(content)
    setActionType(action)
    setShowActionModal(true)
  }

  // View content details
  const viewContentDetails = (content: any) => {
    setSelectedContent(content)
    setShowContentModal(true)
  }

  // Get status badge color
  const getStatusBadgeColor = (status: string) => {
    switch (status) {
      case "active":
        return "bg-green-100 text-green-800 dark:bg-green-900 dark:text-green-300"
      case "hidden":
        return "bg-yellow-100 text-yellow-800 dark:bg-yellow-900 dark:text-yellow-300"
      case "deleted":
        return "bg-red-100 text-red-800 dark:bg-red-900 dark:text-red-300"
      default:
        return "bg-gray-100 text-gray-800 dark:bg-gray-700 dark:text-gray-300"
    }
  }

  // Get media icon
  const getMediaIcon = (mediaType: string | null) => {
    switch (mediaType) {
      case "image":
        return <ImageIcon className="h-5 w-5 text-blue-500" />
      default:
        return <FileText className="h-5 w-5 text-gray-500" />
    }
  }

  return (
    <div className="space-y-6">
      <div className="flex justify-between items-center">
        <h1 className="text-2xl font-bold text-gray-900 dark:text-white">Content Moderation</h1>
        <div className="flex items-center space-x-2">
          <span className="text-sm text-gray-500 dark:text-gray-400">Total Content:</span>
          <span className="text-sm font-medium">{mockContent.length}</span>
        </div>
      </div>

      {/* Filters and Search */}
      <div className="flex flex-col md:flex-row md:items-center md:justify-between gap-4">
        <div className="flex items-center space-x-2">
          <div className="relative">
            <div className="absolute inset-y-0 left-0 flex items-center pl-3 pointer-events-none">
              <Search className="w-4 h-4 text-gray-500 dark:text-gray-400" />
            </div>
            <input
              type="text"
              className="bg-white dark:bg-gray-800 border border-gray-300 dark:border-gray-700 text-gray-900 dark:text-white text-sm rounded-lg focus:ring-emerald-500 focus:border-emerald-500 block w-full pl-10 p-2.5"
              placeholder="Search content..."
              value={searchTerm}
              onChange={(e) => setSearchTerm(e.target.value)}
            />
          </div>
        </div>

        <div className="flex items-center space-x-2">
          <div className="relative">
            <div className="absolute inset-y-0 left-0 flex items-center pl-3 pointer-events-none">
              <Filter className="w-4 h-4 text-gray-500 dark:text-gray-400" />
            </div>
            <select
              className="bg-white dark:bg-gray-800 border border-gray-300 dark:border-gray-700 text-gray-900 dark:text-white text-sm rounded-lg focus:ring-emerald-500 focus:border-emerald-500 block w-full pl-10 p-2.5 pr-8"
              value={statusFilter}
              onChange={(e) => setStatusFilter(e.target.value)}
            >
              <option value="all">All Status</option>
              <option value="active">Active</option>
              <option value="hidden">Hidden</option>
              <option value="deleted">Deleted</option>
            </select>
            <div className="absolute inset-y-0 right-0 flex items-center pr-3 pointer-events-none">
              <ChevronDown className="w-4 h-4 text-gray-500 dark:text-gray-400" />
            </div>
          </div>
        </div>
      </div>

      {/* Content Table */}
      <div className="bg-white dark:bg-gray-800 shadow rounded-lg overflow-hidden">
        <div className="overflow-x-auto">
          <table className="min-w-full divide-y divide-gray-200 dark:divide-gray-700">
            <thead className="bg-gray-50 dark:bg-gray-700">
              <tr>
                <th
                  scope="col"
                  className="px-6 py-3 text-left text-xs font-medium text-gray-500 dark:text-gray-400 uppercase tracking-wider"
                >
                  ID
                </th>
                <th
                  scope="col"
                  className="px-6 py-3 text-left text-xs font-medium text-gray-500 dark:text-gray-400 uppercase tracking-wider"
                >
                  Content
                </th>
                <th
                  scope="col"
                  className="px-6 py-3 text-left text-xs font-medium text-gray-500 dark:text-gray-400 uppercase tracking-wider"
                >
                  Author
                </th>
                <th
                  scope="col"
                  className="px-6 py-3 text-left text-xs font-medium text-gray-500 dark:text-gray-400 uppercase tracking-wider"
                >
                  Media
                </th>
                <th
                  scope="col"
                  className="px-6 py-3 text-left text-xs font-medium text-gray-500 dark:text-gray-400 uppercase tracking-wider"
                >
                  Stats
                </th>
                <th
                  scope="col"
                  className="px-6 py-3 text-left text-xs font-medium text-gray-500 dark:text-gray-400 uppercase tracking-wider"
                >
                  Status
                </th>
                <th
                  scope="col"
                  className="px-6 py-3 text-left text-xs font-medium text-gray-500 dark:text-gray-400 uppercase tracking-wider"
                >
                  Created
                </th>
                <th scope="col" className="px-6 py-3 text-right">
                  <span className="sr-only">Actions</span>
                </th>
              </tr>
            </thead>
            <tbody className="bg-white dark:bg-gray-800 divide-y divide-gray-200 dark:divide-gray-700">
              {paginatedContent.map((content) => (
                <tr key={content.id} className="hover:bg-gray-50 dark:hover:bg-gray-700">
                  <td className="px-6 py-4 whitespace-nowrap text-sm text-gray-500 dark:text-gray-400">
                    #{content.id}
                  </td>
                  <td className="px-6 py-4">
                    <div className="text-sm text-gray-900 dark:text-white line-clamp-2">{content.content}</div>
                  </td>
                  <td className="px-6 py-4 whitespace-nowrap">
                    <div className="flex items-center">
                      <div className="flex-shrink-0 h-8 w-8 relative">
                        <img
                          className="h-8 w-8 rounded-full"
                          src={content.author.avatar || "/placeholder.svg"}
                          alt={content.author.username}
                        />
                        {content.author.verified && (
                          <div className="absolute bottom-0 right-0 h-3 w-3 bg-blue-500 rounded-full border-2 border-white dark:border-gray-800"></div>
                        )}
                      </div>
                      <div className="ml-3">
                        <div className="text-sm font-medium text-gray-900 dark:text-white">
                          {content.author.username}
                        </div>
                      </div>
                    </div>
                  </td>
                  <td className="px-6 py-4 whitespace-nowrap">
                    {content.mediaType ? (
                      <div className="flex items-center">
                        {getMediaIcon(content.mediaType)}
                        <span className="ml-1 text-sm text-gray-500 dark:text-gray-400 capitalize">
                          {content.mediaType}
                        </span>
                      </div>
                    ) : (
                      <span className="text-sm text-gray-500 dark:text-gray-400">-</span>
                    )}
                  </td>
                  <td className="px-6 py-4 whitespace-nowrap">
                    <div className="flex items-center space-x-2">
                      <div className="flex items-center text-sm text-gray-500 dark:text-gray-400">
                        <Heart className="h-4 w-4 text-red-500 mr-1" />
                        {content.likes}
                      </div>
                      <div className="flex items-center text-sm text-gray-500 dark:text-gray-400">
                        <MessageSquare className="h-4 w-4 text-blue-500 mr-1" />
                        {content.comments}
                      </div>
                    </div>
                  </td>
                  <td className="px-6 py-4 whitespace-nowrap">
                    <span
                      className={`px-2 inline-flex text-xs leading-5 font-semibold rounded-full ${getStatusBadgeColor(
                        content.status,
                      )}`}
                    >
                      {content.status.charAt(0).toUpperCase() + content.status.slice(1)}
                    </span>
                  </td>
                  <td className="px-6 py-4 whitespace-nowrap text-sm text-gray-500 dark:text-gray-400">
                    {new Date(content.createdAt).toLocaleDateString()}
                  </td>
                  <td className="px-6 py-4 whitespace-nowrap text-right text-sm font-medium">
                    <button
                      className="text-emerald-600 dark:text-emerald-500 hover:text-emerald-900 dark:hover:text-emerald-400"
                      onClick={() => viewContentDetails(content)}
                    >
                      View
                    </button>
                  </td>
                </tr>
              ))}
            </tbody>
          </table>
        </div>

        {/* Pagination */}
        <div className="bg-white dark:bg-gray-800 px-4 py-3 flex items-center justify-between border-t border-gray-200 dark:border-gray-700 sm:px-6">
          <div className="hidden sm:flex-1 sm:flex sm:items-center sm:justify-between">
            <div>
              <p className="text-sm text-gray-700 dark:text-gray-400">
                Showing <span className="font-medium">{(currentPage - 1) * itemsPerPage + 1}</span> to{" "}
                <span className="font-medium">{Math.min(currentPage * itemsPerPage, filteredContent.length)}</span> of{" "}
                <span className="font-medium">{filteredContent.length}</span> results
              </p>
            </div>
            <div>
              <nav className="relative z-0 inline-flex rounded-md shadow-sm -space-x-px" aria-label="Pagination">
                <button
                  onClick={() => setCurrentPage((prev) => Math.max(prev - 1, 1))}
                  disabled={currentPage === 1}
                  className="relative inline-flex items-center px-2 py-2 rounded-l-md border border-gray-300 dark:border-gray-600 bg-white dark:bg-gray-800 text-sm font-medium text-gray-500 dark:text-gray-400 hover:bg-gray-50 dark:hover:bg-gray-700 disabled:opacity-50 disabled:cursor-not-allowed"
                >
                  <span className="sr-only">Previous</span>
                  <ChevronLeft className="h-5 w-5" />
                </button>
                {/* Page numbers */}
                {Array.from({ length: Math.min(5, totalPages) }, (_, i) => {
                  const pageNumber = currentPage <= 3 ? i + 1 : currentPage - 2 + i
                  if (pageNumber <= totalPages) {
                    return (
                      <button
                        key={pageNumber}
                        onClick={() => setCurrentPage(pageNumber)}
                        className={`relative inline-flex items-center px-4 py-2 border ${
                          currentPage === pageNumber
                            ? "z-10 bg-emerald-50 dark:bg-emerald-900 border-emerald-500 dark:border-emerald-600 text-emerald-600 dark:text-emerald-300"
                            : "bg-white dark:bg-gray-800 border-gray-300 dark:border-gray-600 text-gray-500 dark:text-gray-400 hover:bg-gray-50 dark:hover:bg-gray-700"
                        } text-sm font-medium`}
                      >
                        {pageNumber}
                      </button>
                    )
                  }
                  return null
                })}
                <button
                  onClick={() => setCurrentPage((prev) => Math.min(prev + 1, totalPages))}
                  disabled={currentPage === totalPages}
                  className="relative inline-flex items-center px-2 py-2 rounded-r-md border border-gray-300 dark:border-gray-600 bg-white dark:bg-gray-800 text-sm font-medium text-gray-500 dark:text-gray-400 hover:bg-gray-50 dark:hover:bg-gray-700 disabled:opacity-50 disabled:cursor-not-allowed"
                >
                  <span className="sr-only">Next</span>
                  <ChevronRight className="h-5 w-5" />
                </button>
              </nav>
            </div>
          </div>
        </div>
      </div>

      {/* Content Details Modal */}
      {showContentModal && selectedContent && (
        <div className="fixed inset-0 z-50 overflow-y-auto" onClick={() => setShowContentModal(false)}>
          <div className="flex items-center justify-center min-h-screen pt-4 px-4 pb-20 text-center sm:block sm:p-0">
            <span className="hidden sm:inline-block sm:align-middle sm:h-screen" aria-hidden="true">
              &#8203;
            </span>
            <div
              className="inline-block align-bottom bg-white dark:bg-gray-800 rounded-lg text-left overflow-hidden shadow-xl transform transition-all sm:my-8 sm:align-middle sm:max-w-lg sm:w-full"
              onClick={(e) => e.stopPropagation()}
            >
              <div className="bg-white dark:bg-gray-800 px-4 pt-5 pb-4 sm:p-6 sm:pb-4">
                <div className="sm:flex sm:items-start">
                  <div className="mt-3 text-center sm:mt-0 sm:ml-4 sm:text-left w-full">
                    <h3 className="text-lg leading-6 font-medium text-gray-900 dark:text-white">Content Details</h3>
                    <div className="mt-4 space-y-4">
                      <div className="flex items-center">
                        <img
                          src={selectedContent.author.avatar || "/placeholder.svg"}
                          alt={selectedContent.author.username}
                          className="h-10 w-10 rounded-full mr-3"
                        />
                        <div>
                          <p className="text-sm font-medium text-gray-900 dark:text-white">
                            {selectedContent.author.username}
                          </p>
                          <p className="text-xs text-gray-500 dark:text-gray-400">
                            {new Date(selectedContent.createdAt).toLocaleString()}
                          </p>
                        </div>
                      </div>
                      <div>
                        <p className="text-sm text-gray-900 dark:text-white">{selectedContent.content}</p>
                      </div>
                      {selectedContent.mediaType === "image" && (
                        <div className="mt-4">
                          <h4 className="text-sm font-medium text-gray-700 dark:text-gray-300 mb-2">Image:</h4>
                          <img
                            src={selectedContent.mediaUrl || "/placeholder.svg?height=300&width=500"}
                            alt="Content"
                            className="w-full h-auto rounded-lg border border-gray-200 dark:border-gray-700"
                          />
                        </div>
                      )}
                      <div className="flex items-center justify-between">
                        <div className="flex items-center space-x-4">
                          <div className="flex items-center text-sm text-gray-500 dark:text-gray-400">
                            <Heart className="h-4 w-4 text-red-500 mr-1" />
                            {selectedContent.likes}
                          </div>
                          <div className="flex items-center text-sm text-gray-500 dark:text-gray-400">
                            <MessageSquare className="h-4 w-4 text-blue-500 mr-1" />
                            {selectedContent.comments}
                          </div>
                        </div>
                        <span
                          className={`px-2 inline-flex text-xs leading-5 font-semibold rounded-full ${getStatusBadgeColor(
                            selectedContent.status,
                          )}`}
                        >
                          {selectedContent.status.charAt(0).toUpperCase() + selectedContent.status.slice(1)}
                        </span>
                      </div>
                    </div>
                  </div>
                </div>
              </div>
              <div className="bg-gray-50 dark:bg-gray-700 px-4 py-3 sm:px-6 sm:flex sm:flex-row-reverse">
                {selectedContent.status === "active" && (
                  <>
                    <button
                      type="button"
                      className="w-full inline-flex justify-center rounded-md border border-transparent shadow-sm px-4 py-2 bg-yellow-600 text-base font-medium text-white hover:bg-yellow-700 focus:outline-none focus:ring-2 focus:ring-offset-2 focus:ring-yellow-500 sm:ml-3 sm:w-auto sm:text-sm"
                      onClick={() => handleContentAction(selectedContent, "hide")}
                    >
                      <EyeOff className="h-4 w-4 mr-2" />
                      Hide Content
                    </button>
                    <button
                      type="button"
                      className="mt-3 w-full inline-flex justify-center rounded-md border border-transparent shadow-sm px-4 py-2 bg-red-600 text-base font-medium text-white hover:bg-red-700 focus:outline-none focus:ring-2 focus:ring-offset-2 focus:ring-red-500 sm:mt-0 sm:ml-3 sm:w-auto sm:text-sm"
                      onClick={() => handleContentAction(selectedContent, "delete")}
                    >
                      <Trash2 className="h-4 w-4 mr-2" />
                      Delete Content
                    </button>
                  </>
                )}
                {selectedContent.status === "hidden" && (
                  <>
                    <button
                      type="button"
                      className="w-full inline-flex justify-center rounded-md border border-transparent shadow-sm px-4 py-2 bg-emerald-600 text-base font-medium text-white hover:bg-emerald-700 focus:outline-none focus:ring-2 focus:ring-offset-2 focus:ring-emerald-500 sm:ml-3 sm:w-auto sm:text-sm"
                      onClick={() => handleContentAction(selectedContent, "activate")}
                    >
                      <Eye className="h-4 w-4 mr-2" />
                      Restore Content
                    </button>
                    <button
                      type="button"
                      className="mt-3 w-full inline-flex justify-center rounded-md border border-transparent shadow-sm px-4 py-2 bg-red-600 text-base font-medium text-white hover:bg-red-700 focus:outline-none focus:ring-2 focus:ring-offset-2 focus:ring-red-500 sm:mt-0 sm:ml-3 sm:w-auto sm:text-sm"
                      onClick={() => handleContentAction(selectedContent, "delete")}
                    >
                      <Trash2 className="h-4 w-4 mr-2" />
                      Delete Content
                    </button>
                  </>
                )}
                {selectedContent.status === "deleted" && (
                  <button
                    type="button"
                    className="w-full inline-flex justify-center rounded-md border border-transparent shadow-sm px-4 py-2 bg-emerald-600 text-base font-medium text-white hover:bg-emerald-700 focus:outline-none focus:ring-2 focus:ring-offset-2 focus:ring-emerald-500 sm:ml-3 sm:w-auto sm:text-sm"
                    onClick={() => handleContentAction(selectedContent, "activate")}
                  >
                    <Eye className="h-4 w-4 mr-2" />
                    Restore Content
                  </button>
                )}
                <button
                  type="button"
                  className="mt-3 w-full inline-flex justify-center rounded-md border border-gray-300 dark:border-gray-600 shadow-sm px-4 py-2 bg-white dark:bg-gray-800 text-base font-medium text-gray-700 dark:text-gray-200 hover:bg-gray-50 dark:hover:bg-gray-700 focus:outline-none focus:ring-2 focus:ring-offset-2 focus:ring-emerald-500 sm:mt-0 sm:w-auto sm:text-sm"
                  onClick={() => setShowContentModal(false)}
                >
                  Close
                </button>
              </div>
            </div>
          </div>
        </div>
      )}

      {/* Action Confirmation Modal */}
      {showActionModal && selectedContent && actionType && (
        <div className="fixed inset-0 z-50 overflow-y-auto" onClick={() => setShowActionModal(false)}>
          <div className="flex items-center justify-center min-h-screen pt-4 px-4 pb-20 text-center sm:block sm:p-0">
            <span className="hidden sm:inline-block sm:align-middle sm:h-screen" aria-hidden="true">
              &#8203;
            </span>
            <div
              className="inline-block align-bottom bg-white dark:bg-gray-800 rounded-lg text-left overflow-hidden shadow-xl transform transition-all sm:my-8 sm:align-middle sm:max-w-lg sm:w-full"
              onClick={(e) => e.stopPropagation()}
            >
              <div className="bg-white dark:bg-gray-800 px-4 pt-5 pb-4 sm:p-6 sm:pb-4">
                <div className="sm:flex sm:items-start">
                  <div
                    className={`mx-auto flex-shrink-0 flex items-center justify-center h-12 w-12 rounded-full sm:mx-0 sm:h-10 sm:w-10 ${
                      actionType === "delete"
                        ? "bg-red-100 dark:bg-red-900"
                        : actionType === "hide"
                          ? "bg-yellow-100 dark:bg-yellow-900"
                          : "bg-emerald-100 dark:bg-emerald-900"
                    }`}
                  >
                    {actionType === "delete" ? (
                      <Trash2 className="h-6 w-6 text-red-600 dark:text-red-400" />
                    ) : actionType === "hide" ? (
                      <EyeOff className="h-6 w-6 text-yellow-600 dark:text-yellow-400" />
                    ) : (
                      <Eye className="h-6 w-6 text-emerald-600 dark:text-emerald-400" />
                    )}
                  </div>
                  <div className="mt-3 text-center sm:mt-0 sm:ml-4 sm:text-left">
                    <h3 className="text-lg leading-6 font-medium text-gray-900 dark:text-white">
                      {actionType === "delete"
                        ? "Delete Content"
                        : actionType === "hide"
                          ? "Hide Content"
                          : "Restore Content"}
                    </h3>
                    <div className="mt-2">
                      <p className="text-sm text-gray-500 dark:text-gray-400">
                        {actionType === "delete"
                          ? "Are you sure you want to delete this content? This action cannot be undone."
                          : actionType === "hide"
                            ? "Are you sure you want to hide this content? It will no longer be visible to users."
                            : "Are you sure you want to restore this content? It will be visible to users again."}
                      </p>
                    </div>
                  </div>
                </div>
              </div>
              <div className="bg-gray-50 dark:bg-gray-700 px-4 py-3 sm:px-6 sm:flex sm:flex-row-reverse">
                <button
                  type="button"
                  className={`w-full inline-flex justify-center rounded-md border border-transparent shadow-sm px-4 py-2 text-base font-medium text-white focus:outline-none focus:ring-2 focus:ring-offset-2 sm:ml-3 sm:w-auto sm:text-sm ${
                    actionType === "delete"
                      ? "bg-red-600 hover:bg-red-700 focus:ring-red-500"
                      : actionType === "hide"
                        ? "bg-yellow-600 hover:bg-yellow-700 focus:ring-yellow-500"
                        : "bg-emerald-600 hover:bg-emerald-700 focus:ring-emerald-500"
                  }`}
                  onClick={() => {
                    // In a real app, you would update the content status here
                    setShowActionModal(false)
                    setShowContentModal(false)
                  }}
                >
                  Confirm
                </button>
                <button
                  type="button"
                  className="mt-3 w-full inline-flex justify-center rounded-md border border-gray-300 dark:border-gray-600 shadow-sm px-4 py-2 bg-white dark:bg-gray-800 text-base font-medium text-gray-700 dark:text-gray-200 hover:bg-gray-50 dark:hover:bg-gray-700 focus:outline-none focus:ring-2 focus:ring-offset-2 focus:ring-emerald-500 sm:mt-0 sm:ml-3 sm:w-auto sm:text-sm"
                  onClick={() => setShowActionModal(false)}
                >
                  Cancel
                </button>
              </div>
            </div>
          </div>
        </div>
      )}
    </div>
  )
}

export default ContentModeration
