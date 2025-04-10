import React, { useEffect, useState } from "react";
import { useNavigate } from "react-router-dom";
import adminService from "../../../api/services/admin.service";
import PageLayout from "../../../Components/PageLayout";
import DashboardCard from "../../../Components/DashboardCard";
import DataTable from "../../../Components/DataTable";
import StatusBadge from "../../../Components/StatusBadge";
import Modal from "../../../Components/Modal";

// Điều chỉnh ActionButton để hỗ trợ theme sáng và tối
type ButtonTheme = "light" | "dark";

// Wrapper component để bổ sung theme cho ActionButton
const ThemedActionButton: React.FC<{
  text: string;
  onClick: () => void;
  color: "indigo" | "green" | "yellow" | "gray" | "red" | "blue";
  fullWidth?: boolean;
  icon?: React.ReactNode;
  theme?: ButtonTheme;
}> = ({ text, onClick, color, fullWidth = false, icon, theme = "dark" }) => {
  // Kiểm tra nếu là theme sáng, đảo ngược màu chữ và nền
  const getThemeStyles = () => {
    if (theme === "light") {
      return {
        bgColor: "bg-white hover:bg-gray-50",
        textColor: getTextColorForTheme(color),
        borderColor: getBorderColorForTheme(color),
      };
    }
    return {
      bgColor: getButtonColor(color),
      textColor: "text-white",
      borderColor: "",
    };
  };

  const getButtonColor = (colorName: string) => {
    switch (colorName) {
      case "indigo":
        return "bg-indigo-500 hover:bg-indigo-600";
      case "green":
        return "bg-green-500 hover:bg-green-600";
      case "yellow":
        return "bg-yellow-500 hover:bg-yellow-600";
      case "gray":
        return "bg-gray-500 hover:bg-gray-600";
      case "red":
        return "bg-red-500 hover:bg-red-600";
      case "blue":
        return "bg-blue-500 hover:bg-blue-600";
      default:
        return "bg-gray-500 hover:bg-gray-600";
    }
  };

  const getTextColorForTheme = (colorName: string) => {
    switch (colorName) {
      case "indigo":
        return "text-indigo-600";
      case "green":
        return "text-green-600";
      case "yellow":
        return "text-yellow-600";
      case "gray":
        return "text-gray-600";
      case "red":
        return "text-red-600";
      case "blue":
        return "text-blue-600";
      default:
        return "text-gray-600";
    }
  };

  const getBorderColorForTheme = (colorName: string) => {
    switch (colorName) {
      case "indigo":
        return "border border-indigo-200 hover:border-indigo-300";
      case "green":
        return "border border-green-200 hover:border-green-300";
      case "yellow":
        return "border border-yellow-200 hover:border-yellow-300";
      case "gray":
        return "border border-gray-200 hover:border-gray-300";
      case "red":
        return "border border-red-200 hover:border-red-300";
      case "blue":
        return "border border-blue-200 hover:border-blue-300";
      default:
        return "border border-gray-200 hover:border-gray-300";
    }
  };

  const styles = getThemeStyles();

  return (
    <button
      onClick={onClick}
      className={`${styles.bgColor} ${styles.textColor} ${styles.borderColor} 
                py-2 px-4 rounded-lg flex items-center 
                justify-center transition-colors ${fullWidth ? "w-full" : ""}`}
    >
      {icon && <span className="mr-2">{icon}</span>}
      {text}
    </button>
  );
};

type Post = {
  id: string;
  content: string;
  imageUrl?: string;
  author: {
    walletAddress: string;
    username: string;
    avatarUrl?: string;
  };
  createdAt: string;
  status: "active" | "hidden" | "deleted" | "pending";
  reportCount: number;
  reports?: Array<{
    reason: string;
    reportedBy: string;
    createdAt: string;
  }>;
};

const ContentModeration: React.FC = () => {
  const [posts, setPosts] = useState<Post[]>([]);
  const [loading, setLoading] = useState(true);
  const [statusFilter, setStatusFilter] = useState("pending");
  const [currentPage, setCurrentPage] = useState(1);
  const [totalPages, setTotalPages] = useState(1);
  const [selectedPost, setSelectedPost] = useState<Post | null>(null);
  const [isModalOpen, setIsModalOpen] = useState(false);
  const [viewMode, setViewMode] = useState<"grid" | "table">("grid");
  const navigate = useNavigate();

  const fetchPosts = async () => {
    try {
      setLoading(true);
      const response = await adminService.getModerationPosts(
        currentPage,
        10,
        statusFilter
      );
      setPosts(response.data.posts);
      setTotalPages(Math.ceil(response.data.total / 10));
    } catch (error) {
      console.error("Error fetching posts for moderation:", error);
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    fetchPosts();
  }, [currentPage, statusFilter]);

  const handleStatusChange = async (
    postId: string,
    newStatus: "active" | "hidden" | "deleted"
  ) => {
    try {
      await adminService.updatePostStatus(postId, newStatus);
      // Update post in the list
      setPosts(
        posts.map((post) =>
          post.id === postId ? { ...post, status: newStatus } : post
        )
      );
      // Update selected post if open in modal
      if (selectedPost && selectedPost.id === postId) {
        setSelectedPost({ ...selectedPost, status: newStatus });
      }
    } catch (error) {
      console.error("Error updating post status:", error);
    }
  };

  const openPostModal = (post: Post) => {
    setSelectedPost(post);
    setIsModalOpen(true);
  };

  const closePostModal = () => {
    setIsModalOpen(false);
    setSelectedPost(null);
  };

  const formatDate = (dateString: string) => {
    return new Date(dateString).toLocaleDateString("vi-VN", {
      year: "numeric",
      month: "short",
      day: "numeric",
      hour: "2-digit",
      minute: "2-digit",
    });
  };

  const truncateContent = (content: string, maxLength = 100) => {
    if (content.length <= maxLength) return content;
    return content.substring(0, maxLength) + "...";
  };

  const truncateWalletAddress = (address: string) => {
    return `${address.substring(0, 6)}...${address.substring(
      address.length - 4
    )}`;
  };

  const columns = [
    {
      header: "Author",
      accessor: "author",
      cell: (value: any, item: Post) => (
        <div className="flex items-center">
          <img
            src={item.author.avatarUrl || "/default-avatar.png"}
            alt={item.author.username}
            className="w-8 h-8 rounded-full mr-2"
          />
          <div>
            <p className="text-sm font-medium">{item.author.username}</p>
            <p className="text-xs text-gray-500">
              {truncateWalletAddress(item.author.walletAddress)}
            </p>
          </div>
        </div>
      ),
    },
    {
      header: "Content",
      accessor: "content",
      cell: (value: string) => (
        <p className="line-clamp-2">{truncateContent(value)}</p>
      ),
    },
    {
      header: "Reports",
      accessor: "reportCount",
      cell: (value: number) =>
        value > 0 ? (
          <span className="text-xs bg-red-100 text-red-800 px-2 py-1 rounded-full">
            {value} reports
          </span>
        ) : (
          <span>-</span>
        ),
    },
    {
      header: "Status",
      accessor: "status",
      cell: (value: string) => (
        <StatusBadge
          text={value}
          type={
            value === "active"
              ? "success"
              : value === "hidden"
              ? "warning"
              : value === "deleted"
              ? "error"
              : value === "pending"
              ? "info"
              : "default"
          }
        />
      ),
    },
    {
      header: "Date",
      accessor: "createdAt",
      cell: (value: string) => (
        <span className="text-sm">{formatDate(value)}</span>
      ),
    },
    {
      header: "Actions",
      accessor: "id",
      cell: (value: string, item: Post) => (
        <div className="flex space-x-2">
          <button
            onClick={(e) => {
              e.stopPropagation();
              handleStatusChange(value, "active");
            }}
            className={`px-2 py-1 text-xs rounded flex items-center ${
              item.status === "active"
                ? "bg-green-500 text-white"
                : "bg-white text-green-600 border border-green-200 hover:bg-green-50"
            }`}
          >
            <svg
              className="w-3 h-3 mr-1"
              fill="none"
              stroke="currentColor"
              viewBox="0 0 24 24"
            >
              <path
                strokeLinecap="round"
                strokeLinejoin="round"
                strokeWidth="2"
                d="M5 13l4 4L19 7"
              />
            </svg>
            Approve
          </button>
          <button
            onClick={(e) => {
              e.stopPropagation();
              handleStatusChange(value, "hidden");
            }}
            className={`px-2 py-1 text-xs rounded flex items-center ${
              item.status === "hidden"
                ? "bg-yellow-500 text-white"
                : "bg-white text-yellow-600 border border-yellow-200 hover:bg-yellow-50"
            }`}
          >
            <svg
              className="w-3 h-3 mr-1"
              fill="none"
              stroke="currentColor"
              viewBox="0 0 24 24"
            >
              <path
                strokeLinecap="round"
                strokeLinejoin="round"
                strokeWidth="2"
                d="M13.875 18.825A10.05 10.05 0 0112 19c-4.478 0-8.268-2.943-9.543-7a9.97 9.97 0 011.563-3.029m5.858.908a3 3 0 114.243 4.243M9.878 9.878l4.242 4.242M9.88 9.88l-3.29-3.29m7.532 7.532l3.29 3.29M3 3l18 18"
              />
            </svg>
            Hide
          </button>
          <button
            onClick={(e) => {
              e.stopPropagation();
              handleStatusChange(value, "deleted");
            }}
            className={`px-2 py-1 text-xs rounded flex items-center ${
              item.status === "deleted"
                ? "bg-red-500 text-white"
                : "bg-white text-red-600 border border-red-200 hover:bg-red-50"
            }`}
          >
            <svg
              className="w-3 h-3 mr-1"
              fill="none"
              stroke="currentColor"
              viewBox="0 0 24 24"
            >
              <path
                strokeLinecap="round"
                strokeLinejoin="round"
                strokeWidth="2"
                d="M19 7l-.867 12.142A2 2 0 0116.138 21H7.862a2 2 0 01-1.995-1.858L5 7m5 4v6m4-6v6m1-10V4a1 1 0 00-1-1h-4a1 1 0 00-1 1v3M4 7h16"
              />
            </svg>
            Delete
          </button>
        </div>
      ),
    },
  ];

  // Loading state
  if (loading && posts.length === 0) {
    return (
      <PageLayout title="Content Moderation">
        <div className="flex justify-center items-center h-64">
          <div className="animate-spin rounded-full h-12 w-12 border-t-2 border-b-2 border-blue-500"></div>
        </div>
      </PageLayout>
    );
  }

  // Modal footer with action buttons
  const renderModalFooter = () => {
    if (!selectedPost) return null;

    return (
      <div className="flex justify-end space-x-3">
        <ThemedActionButton
          text="Approve"
          onClick={() => handleStatusChange(selectedPost.id, "active")}
          color="green"
          fullWidth={false}
          theme={selectedPost.status === "active" ? "dark" : "light"}
          icon={
            <svg
              className="w-4 h-4"
              fill="none"
              stroke="currentColor"
              viewBox="0 0 24 24"
              xmlns="http://www.w3.org/2000/svg"
            >
              <path
                strokeLinecap="round"
                strokeLinejoin="round"
                strokeWidth="2"
                d="M5 13l4 4L19 7"
              />
            </svg>
          }
        />
        <ThemedActionButton
          text="Hide"
          onClick={() => handleStatusChange(selectedPost.id, "hidden")}
          color="yellow"
          fullWidth={false}
          theme={selectedPost.status === "hidden" ? "dark" : "light"}
          icon={
            <svg
              className="w-4 h-4"
              fill="none"
              stroke="currentColor"
              viewBox="0 0 24 24"
              xmlns="http://www.w3.org/2000/svg"
            >
              <path
                strokeLinecap="round"
                strokeLinejoin="round"
                strokeWidth="2"
                d="M13.875 18.825A10.05 10.05 0 0112 19c-4.478 0-8.268-2.943-9.543-7a9.97 9.97 0 011.563-3.029m5.858.908a3 3 0 114.243 4.243M9.878 9.878l4.242 4.242M9.88 9.88l-3.29-3.29m7.532 7.532l3.29 3.29M3 3l18 18"
              />
            </svg>
          }
        />
        <ThemedActionButton
          text="Delete"
          onClick={() => handleStatusChange(selectedPost.id, "deleted")}
          color="red"
          fullWidth={false}
          theme={selectedPost.status === "deleted" ? "dark" : "light"}
          icon={
            <svg
              className="w-4 h-4"
              fill="none"
              stroke="currentColor"
              viewBox="0 0 24 24"
              xmlns="http://www.w3.org/2000/svg"
            >
              <path
                strokeLinecap="round"
                strokeLinejoin="round"
                strokeWidth="2"
                d="M19 7l-.867 12.142A2 2 0 0116.138 21H7.862a2 2 0 01-1.995-1.858L5 7m5 4v6m4-6v6m1-10V4a1 1 0 00-1-1h-4a1 1 0 00-1 1v3M4 7h16"
              />
            </svg>
          }
        />
        <ThemedActionButton
          text="Close"
          onClick={closePostModal}
          color="gray"
          fullWidth={false}
          theme="light"
          icon={
            <svg
              className="w-4 h-4"
              fill="none"
              stroke="currentColor"
              viewBox="0 0 24 24"
              xmlns="http://www.w3.org/2000/svg"
            >
              <path
                strokeLinecap="round"
                strokeLinejoin="round"
                strokeWidth="2"
                d="M6 18L18 6M6 6l12 12"
              />
            </svg>
          }
        />
      </div>
    );
  };

  return (
    <PageLayout
      title="Content Moderation"
      subtitle="Review and moderate user-generated content"
    >
      {/* Filter & Controls */}
      <DashboardCard title="Filters & Controls" className="mb-6">
        <div className="flex flex-col md:flex-row justify-between items-start md:items-center gap-4">
          <div className="flex items-center gap-4">
            <div>
              <label className="block text-sm font-medium text-gray-700 mb-1">
                Status Filter
              </label>
              <select
                className="px-4 py-2 border rounded-lg focus:outline-none focus:ring-2 focus:ring-blue-500 w-full"
                value={statusFilter}
                onChange={(e) => setStatusFilter(e.target.value)}
              >
                <option value="">All</option>
                <option value="pending">Pending Review</option>
                <option value="active">Active</option>
                <option value="hidden">Hidden</option>
                <option value="deleted">Deleted</option>
              </select>
            </div>
            <div>
              <label className="block text-sm font-medium text-gray-700 mb-1">
                View Mode
              </label>
              <div className="flex rounded-lg overflow-hidden">
                <button
                  onClick={() => setViewMode("grid")}
                  className={`px-4 py-2 ml-2 ${
                    viewMode === "grid"
                      ? "bg-blue-500 text-white"
                      : "bg-gray-100 text-gray-700 hover:bg-gray-200"
                  }`}
                >
                  Grid
                </button>
                <button
                  onClick={() => setViewMode("table")}
                  className={`px-4 py-2 ml-2 ${
                    viewMode === "table"
                      ? "bg-blue-500 text-white"
                      : "bg-gray-100 text-gray-700 hover:bg-gray-200"
                  }`}
                >
                  Table
                </button>
              </div>
            </div>
          </div>
          <ThemedActionButton
            text="Back to Dashboard"
            onClick={() => navigate("/admin")}
            color="blue"
            fullWidth={false}
            theme="light"
            icon={
              <svg
                className="w-4 h-4"
                fill="none"
                stroke="currentColor"
                viewBox="0 0 24 24"
                xmlns="http://www.w3.org/2000/svg"
              >
                <path
                  strokeLinecap="round"
                  strokeLinejoin="round"
                  strokeWidth="2"
                  d="M10 19l-7-7m0 0l7-7m-7 7h18"
                />
              </svg>
            }
          />
        </div>
      </DashboardCard>

      {/* Content Display */}
      <DashboardCard
        title={
          <div className="flex items-center justify-between w-full">
            <span>{`Content (${posts.length} items)`}</span>
            <ThemedActionButton
              text="Refresh"
              onClick={fetchPosts}
              color="blue"
              fullWidth={false}
              theme="light"
              icon={
                <svg
                  className="w-4 h-4"
                  fill="none"
                  stroke="currentColor"
                  viewBox="0 0 24 24"
                  xmlns="http://www.w3.org/2000/svg"
                >
                  <path
                    strokeLinecap="round"
                    strokeLinejoin="round"
                    strokeWidth="2"
                    d="M4 4v5h.582m15.356 2A8.001 8.001 0 004.582 9m0 0H9m11 11v-5h-.581m0 0a8.003 8.003 0 01-15.357-2m15.357 2H15"
                  />
                </svg>
              }
            />
          </div>
        }
      >
        {posts.length > 0 ? (
          viewMode === "grid" ? (
            // Grid View
            <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
              {posts.map((post) => (
                <div
                  key={post.id}
                  className="bg-white rounded-lg border border-gray-100 overflow-hidden hover:shadow-lg transition-shadow cursor-pointer"
                  onClick={() => openPostModal(post)}
                >
                  {post.imageUrl && (
                    <div className="h-48 overflow-hidden">
                      <img
                        src={post.imageUrl}
                        alt="Post"
                        className="w-full object-cover object-center h-full"
                      />
                    </div>
                  )}
                  <div className="p-4">
                    <div className="flex items-center mb-3">
                      <img
                        src={post.author.avatarUrl || "/default-avatar.png"}
                        alt={post.author.username}
                        className="w-8 h-8 rounded-full mr-2"
                      />
                      <div>
                        <p className="text-sm font-medium">
                          {post.author.username}
                        </p>
                        <p className="text-xs text-gray-500">
                          {truncateWalletAddress(post.author.walletAddress)}
                        </p>
                      </div>
                    </div>

                    <p className="text-sm line-clamp-3 mb-3">
                      {truncateContent(post.content)}
                    </p>

                    <div className="flex justify-between items-center">
                      <StatusBadge
                        text={post.status}
                        type={
                          post.status === "active"
                            ? "success"
                            : post.status === "hidden"
                            ? "warning"
                            : post.status === "deleted"
                            ? "error"
                            : post.status === "pending"
                            ? "info"
                            : "default"
                        }
                      />

                      {post.reportCount > 0 && (
                        <span className="text-xs bg-red-100 text-red-800 px-2 py-1 rounded-full">
                          {post.reportCount} reports
                        </span>
                      )}

                      <span className="text-xs text-gray-500">
                        {formatDate(post.createdAt)}
                      </span>
                    </div>
                  </div>
                </div>
              ))}
            </div>
          ) : (
            // Table View
            <DataTable
              columns={columns}
              data={posts}
              onRowClick={openPostModal}
            />
          )
        ) : (
          <div className="text-center py-12 bg-gray-50 rounded-lg">
            <p className="text-lg text-gray-500">
              No posts to moderate with the current filter
            </p>
          </div>
        )}
      </DashboardCard>

      {/* Pagination */}
      {totalPages > 1 && (
        <div className="flex justify-center my-8">
          <nav className="flex rounded-md shadow-sm -space-x-px">
            <button
              onClick={() => setCurrentPage((page) => Math.max(page - 1, 1))}
              disabled={currentPage === 1}
              className={`relative inline-flex items-center px-3 py-2 rounded-l-md border ${
                currentPage === 1
                  ? "border-gray-300 bg-gray-100 text-gray-400 cursor-not-allowed"
                  : "border-gray-300 bg-white text-gray-500 hover:bg-gray-50"
              }`}
            >
              <svg
                className="h-5 w-5"
                fill="none"
                stroke="currentColor"
                viewBox="0 0 24 24"
              >
                <path
                  strokeLinecap="round"
                  strokeLinejoin="round"
                  strokeWidth="2"
                  d="M15 19l-7-7 7-7"
                />
              </svg>
            </button>
            {[...Array(totalPages).keys()].map((page) => (
              <button
                key={page + 1}
                onClick={() => setCurrentPage(page + 1)}
                className={`relative inline-flex items-center px-4 py-2 border ${
                  currentPage === page + 1
                    ? "z-10 bg-blue-500 border-blue-500 text-white"
                    : "bg-white border-gray-300 text-gray-500 hover:bg-gray-50"
                } text-sm font-medium`}
              >
                {page + 1}
              </button>
            ))}
            <button
              onClick={() =>
                setCurrentPage((page) => Math.min(page + 1, totalPages))
              }
              disabled={currentPage === totalPages}
              className={`relative inline-flex items-center px-3 py-2 rounded-r-md border ${
                currentPage === totalPages
                  ? "border-gray-300 bg-gray-100 text-gray-400 cursor-not-allowed"
                  : "border-gray-300 bg-white text-gray-500 hover:bg-gray-50"
              }`}
            >
              <svg
                className="h-5 w-5"
                fill="none"
                stroke="currentColor"
                viewBox="0 0 24 24"
              >
                <path
                  strokeLinecap="round"
                  strokeLinejoin="round"
                  strokeWidth="2"
                  d="M9 5l7 7-7 7"
                />
              </svg>
            </button>
          </nav>
        </div>
      )}

      {/* Post Modal */}
      {isModalOpen && selectedPost && (
        <Modal
          title="Post Review"
          onClose={closePostModal}
          footer={renderModalFooter()}
        >
          {/* Author Info */}
          <div className="flex items-center mb-4 pb-4 border-b border-gray-100">
            <img
              src={selectedPost.author.avatarUrl || "/default-avatar.png"}
              alt={selectedPost.author.username}
              className="w-10 h-10 rounded-full mr-3"
            />
            <div>
              <p className="font-medium">{selectedPost.author.username}</p>
              <p className="text-sm text-gray-500">
                {selectedPost.author.walletAddress}
              </p>
            </div>
            <span className="ml-auto text-sm text-gray-500">
              {formatDate(selectedPost.createdAt)}
            </span>
          </div>

          {/* Post Content */}
          <div className="mb-6">
            <p className="text-gray-800 whitespace-pre-line mb-4">
              {selectedPost.content}
            </p>

            {selectedPost.imageUrl && (
              <div className="mt-3 mb-4">
                <img
                  src={selectedPost.imageUrl}
                  alt="Post content"
                  className="max-w-full rounded-lg max-h-96 object-contain mx-auto"
                />
              </div>
            )}

            <div className="flex items-center text-sm mt-2">
              <StatusBadge
                text={selectedPost.status}
                type={
                  selectedPost.status === "active"
                    ? "success"
                    : selectedPost.status === "hidden"
                    ? "warning"
                    : selectedPost.status === "deleted"
                    ? "error"
                    : selectedPost.status === "pending"
                    ? "info"
                    : "default"
                }
              />
            </div>
          </div>

          {/* Reports Section */}
          {selectedPost.reportCount > 0 && selectedPost.reports && (
            <div className="mb-6 border-t border-b border-gray-100 py-4">
              <h4 className="font-medium mb-3">
                Reports ({selectedPost.reportCount})
              </h4>
              <div className="space-y-3 max-h-48 overflow-y-auto pr-2">
                {selectedPost.reports.map((report, index) => (
                  <div key={index} className="p-3 bg-gray-50 rounded-lg">
                    <p className="text-sm text-gray-800 mb-1">
                      {report.reason}
                    </p>
                    <div className="flex justify-between items-center text-xs text-gray-500">
                      <span>
                        Reported by: {report.reportedBy.substring(0, 6)}...
                      </span>
                      <span>{formatDate(report.createdAt)}</span>
                    </div>
                  </div>
                ))}
              </div>
            </div>
          )}
        </Modal>
      )}
    </PageLayout>
  );
};

export default ContentModeration;
