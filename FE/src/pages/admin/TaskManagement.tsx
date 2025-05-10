"use client";

import React, { useState, useEffect } from "react";
import {
  Plus,
  Edit,
  Trash2,
  RefreshCw,
  Award,
  Filter,
  ChevronDown,
  X,
  Save,
  AlertCircle,
  CheckCircle,
} from "lucide-react";
import AdminApi from "../../services/AdminApi";
import postApi from "../../services/post.api";

// Định nghĩa interface Task khớp với BE
interface Task {
  _id: string;
  name: string;
  description: string;
  type: "daily" | "weekly" | "special" | "event";
  rewardPoints: number;
  rewardTokens: number;
  requirements: {
    action: "like" | "comment" | "follow";
    count: number;
  };
  isActive: boolean;
}

// Định nghĩa interface Post
interface Post {
  _id: string;
  content: string;
  title?: string;
}

const TaskManagement = () => {
  const [tasks, setTasks] = useState<Task[]>([]);
  const [posts, setPosts] = useState<Post[]>([]);
  const [selectedPostId, setSelectedPostId] = useState<string>("");
  const [typeFilter, setTypeFilter] = useState<string>("all");
  const [showTaskModal, setShowTaskModal] = useState(false);
  const [showDeleteModal, setShowDeleteModal] = useState(false);
  const [showResetModal, setShowResetModal] = useState(false);
  const [currentTask, setCurrentTask] = useState<Task | null>(null);
  const [isEditing, setIsEditing] = useState(false);
  const [isLoading, setIsLoading] = useState(false);
  const [error, setError] = useState<string | null>(null);
  const [success, setSuccess] = useState<string | null>(null);

  const fetchTasks = async () => {
    setIsLoading(true);
    setError(null);
    try {
      const response = await AdminApi.getAllTasks();
      if (response.success) {
        let filteredTasks = response.data.tasks;
        if (typeFilter !== "all") {
          filteredTasks = filteredTasks.filter((task: Task) => task.type === typeFilter);
        }
        setTasks(filteredTasks);
      } else {
        setError(response.message || "Failed to fetch tasks");
      }
    } catch (err) {
      console.error("Error fetching tasks:", err);
      setError("Failed to fetch tasks");
    } finally {
      setIsLoading(false);
    }
  };

  const fetchPosts = async () => {
    try {
      const response = await postApi.getAllPosts();
      if (response.success) {
        setPosts(response.data.posts || []);
      } else {
        setError("Failed to fetch posts");
      }
    } catch (err) {
      console.error("Error fetching posts:", err);
      setError("Failed to fetch posts");
    }
  };

  useEffect(() => {
    fetchTasks();
    fetchPosts();
  }, [typeFilter]);

  const handleTaskModal = (task: Task | null = null) => {
    setCurrentTask(
      task || {
        _id: "",
        name: "",
        description: "",
        type: "daily",
        rewardPoints: 0,
        rewardTokens: 0,
        requirements: { action: "like", count: 1 },
        isActive: true,
      }
    );
    setIsEditing(!!task);
    setSelectedPostId("");
    setShowTaskModal(true);
    setError(null);
  };

  // Cập nhật hàm handlePostSelection
  const handlePostSelection = async (postId: string) => {
    setSelectedPostId(postId);
    if (!postId || !currentTask) return;

    try {
      const response = await postApi.getPostById(postId);
      console.log("Response from getPostById:", response); // Debug response

      if (response.success && response.data) {
        const post = response.data;
        console.log("Post data:", post); // Debug post data

        // Kiểm tra xem post có _id hay không, nếu không thì thử lấy từ selectedPostId
        const postIdToUse = post._id || post.id || postId; // Thử các trường khác nhau
        if (!postIdToUse) {
          setError("Post ID not found in response");
          return;
        }

        const postTitle = post.title || post.content?.substring(0, 30) || "Post";
        const postUrl = `/post/${postIdToUse}`;
        const postLink = `[${postTitle}](${postUrl}) `;
        setCurrentTask({
          ...currentTask,
          description: postLink + (currentTask.description || ""),
        });
      } else {
        setError("Failed to fetch post details");
      }
    } catch (err) {
      console.error("Error fetching post by ID:", err);
      setError("Failed to fetch post details");
    }
  };

  const handleDeleteModal = (task: Task) => {
    setCurrentTask(task);
    setShowDeleteModal(true);
    setError(null);
  };

  const handleResetModal = () => {
    setShowResetModal(true);
    setError(null);
  };

  const handleSaveTask = async () => {
    if (!currentTask) return;

    setIsLoading(true);
    setError(null);

    try {
      const taskData = {
        name: currentTask.name,
        description: currentTask.description,
        type: currentTask.type,
        rewardPoints: currentTask.rewardPoints,
        rewardTokens: currentTask.rewardTokens,
        requirements: currentTask.requirements,
        isActive: currentTask.isActive,
      };

      if (isEditing) {
        await AdminApi.updateTask(currentTask._id, taskData);
        setSuccess(`Task "${currentTask.name}" updated successfully`);
      } else {
        await AdminApi.createTask(taskData);
        setSuccess(`Task "${currentTask.name}" created successfully`);
      }
      fetchTasks();
      setShowTaskModal(false);
      setTimeout(() => setSuccess(null), 3000);
    } catch (err: any) {
      setError(err.message || "Failed to save task");
    } finally {
      setIsLoading(false);
    }
  };

  const handleDeleteTask = async () => {
    if (!currentTask) return;

    setIsLoading(true);
    setError(null);

    try {
      await AdminApi.deleteTask(currentTask._id);
      setSuccess(`Task "${currentTask.name}" deleted successfully`);
      fetchTasks();
      setShowDeleteModal(false);
      setTimeout(() => setSuccess(null), 3000);
    } catch (err: any) {
      setError(err.message || "Failed to delete task");
    } finally {
      setIsLoading(false);
    }
  };

  const handleResetTasks = async () => {
    setIsLoading(true);
    setError(null);

    try {
      await AdminApi.resetDailyTasks();
      setSuccess("Daily tasks reset successfully");
      fetchTasks();
      setShowResetModal(false);
      setTimeout(() => setSuccess(null), 3000);
    } catch (err: any) {
      setError(err.message || "Failed to reset daily tasks");
    } finally {
      setIsLoading(false);
    }
  };

  const handleTypeFilterChange = (e: React.ChangeEvent<HTMLSelectElement>) => {
    setTypeFilter(e.target.value);
  };

  const getTaskTypeBadgeColor = (type: string) => {
    switch (type) {
      case "daily":
        return "bg-blue-100 text-blue-800 dark:bg-blue-900 dark:text-blue-300";
      case "weekly":
        return "bg-purple-100 text-purple-800 dark:bg-purple-900 dark:text-purple-300";
      case "special":
        return "bg-amber-100 text-amber-800 dark:bg-amber-900 dark:text-amber-300";
      default:
        return "bg-gray-100 text-gray-800 dark:bg-gray-700 dark:text-gray-300";
    }
  };

  const getTaskStatusBadgeColor = (isActive: boolean) => {
    return isActive
      ? "bg-green-100 text-green-800 dark:bg-green-900 dark:text-green-300"
      : "bg-gray-100 text-gray-800 dark:bg-gray-700 dark:text-gray-300";
  };

  return (
    <div className="space-y-6">
      <div className="flex justify-between items-center">
        <h1 className="text-2xl font-bold text-gray-900 dark:text-white">Task Management</h1>
        <div className="flex items-center space-x-2">
          <button
            onClick={() => handleTaskModal()}
            className="inline-flex items-center px-4 py-2 border border-transparent rounded-md shadow-sm text-sm font-medium text-white bg-emerald-600 hover:bg-emerald-700 focus:outline-none focus:ring-2 focus:ring-offset-2 focus:ring-emerald-500"
            disabled={isLoading}
          >
            <Plus className="h-4 w-4 mr-2" />
            Create Task
          </button>
          <button
            onClick={handleResetModal}
            className="inline-flex items-center px-4 py-2 border border-gray-300 dark:border-gray-600 rounded-md shadow-sm text-sm font-medium text-gray-700 dark:text-gray-200 bg-white dark:bg-gray-800 hover:bg-gray-50 dark:hover:bg-gray-700 focus:outline-none focus:ring-2 focus:ring-offset-2 focus:ring-emerald-500"
            disabled={isLoading}
          >
            <RefreshCw className="h-4 w-4 mr-2" />
            Reset Daily Tasks
          </button>
        </div>
      </div>

      {error && (
        <div className="rounded-md bg-red-50 dark:bg-red-900/30 p-4">
          <div className="flex">
            <div className="flex-shrink-0">
              <AlertCircle className="h-5 w-5 text-red-400 dark:text-red-500" aria-hidden="true" />
            </div>
            <div className="ml-3">
              <h3 className="text-sm font-medium text-red-800 dark:text-red-300">{error}</h3>
            </div>
          </div>
        </div>
      )}

      {success && (
        <div className="rounded-md bg-green-50 dark:bg-green-900/30 p-4">
          <div className="flex">
            <div className="flex-shrink-0">
              <CheckCircle className="h-5 w-5 text-green-400 dark:text-green-500" aria-hidden="true" />
            </div>
            <div className="ml-3">
              <h3 className="text-sm font-medium text-green-800 dark:text-green-300">{success}</h3>
            </div>
          </div>
        </div>
      )}

      <div className="flex items-center space-x-2">
        <div className="relative">
          <div className="absolute inset-y-0 left-0 flex items-center pl-3 pointer-events-none">
            <Filter className="w-4 h-4 text-gray-500 dark:text-gray-400" />
          </div>
          <select
            className="bg-white dark:bg-gray-800 border border-gray-300 dark:border-gray-700 text-gray-900 dark:text-white text-sm rounded-lg focus:ring-emerald-500 focus:border-emerald-500 block w-full pl-10 p-2.5 pr-8"
            value={typeFilter}
            onChange={handleTypeFilterChange}
          >
            <option value="all">All Types</option>
            <option value="daily">Daily</option>
            <option value="weekly">Weekly</option>
            <option value="special">Special</option>
          </select>
          <div className="absolute inset-y-0 right-0 flex items-center pr-3 pointer-events-none">
            <ChevronDown className="w-4 h-4 text-gray-500 dark:text-gray-400" />
          </div>
        </div>
      </div>

      <div className="bg-white dark:bg-gray-800 shadow rounded-lg overflow-hidden">
        {isLoading && tasks.length === 0 ? (
          <div className="flex items-center justify-center h-64">
            <div className="animate-spin rounded-full h-12 w-12 border-t-2 border-b-2 border-emerald-500"></div>
          </div>
        ) : tasks.length === 0 ? (
          <div className="flex flex-col items-center justify-center h-64 text-gray-500 dark:text-gray-400">
            <AlertCircle className="h-12 w-12 mb-4" />
            <p className="text-center">No tasks found</p>
            <p className="text-center text-sm mt-2">Try adjusting your filter or create a new task</p>
          </div>
        ) : (
          <table className="min-w-full divide-y divide-gray-200 dark:divide-gray-700">
            <thead className="bg-gray-50 dark:bg-gray-700">
              <tr>
                <th
                  scope="col"
                  className="px-6 py-3 text-left text-xs font-medium text-gray-500 dark:text-gray-400 uppercase tracking-wider"
                >
                  Task
                </th>
                <th
                  scope="col"
                  className="px-6 py-3 text-left text-xs font-medium text-gray-500 dark:text-gray-400 uppercase tracking-wider"
                >
                  Type
                </th>
                <th
                  scope="col"
                  className="px-6 py-3 text-left text-xs font-medium text-gray-500 dark:text-gray-400 uppercase tracking-wider"
                >
                  Rewards
                </th>
                <th
                  scope="col"
                  className="px-6 py-3 text-left text-xs font-medium text-gray-500 dark:text-gray-400 uppercase tracking-wider"
                >
                  Requirements
                </th>
                <th
                  scope="col"
                  className="px-6 py-3 text-left text-xs font-medium text-gray-500 dark:text-gray-400 uppercase tracking-wider"
                >
                  Status
                </th>
                <th scope="col" className="px-6 py-3 text-right">
                  <span className="sr-only">Actions</span>
                </th>
              </tr>
            </thead>
            <tbody className="bg-white dark:bg-gray-800 divide-y divide-gray-200 dark:divide-gray-700">
              {tasks.map((task) => (
                <tr key={task._id} className="hover:bg-gray-50 dark:hover:bg-gray-700">
                  <td className="px-6 py-4">
                    <div className="flex flex-col">
                      <div className="text-sm font-medium text-gray-900 dark:text-white">{task.name}</div>
                      <div className="text-sm text-gray-500 dark:text-gray-400">{task.description}</div>
                    </div>
                  </td>
                  <td className="px-6 py-4 whitespace-nowrap">
                    <span
                      className={`px-2 inline-flex text-xs leading-5 font-semibold rounded-full ${getTaskTypeBadgeColor(
                        task.type
                      )}`}
                    >
                      {task.type.charAt(0).toUpperCase() + task.type.slice(1)}
                    </span>
                  </td>
                  <td className="px-6 py-4 whitespace-nowrap">
                    <div className="flex flex-col">
                      <div className="flex items-center text-sm text-gray-900 dark:text-white">
                        <Award className="h-4 w-4 text-amber-500 mr-1" />
                        {task.rewardPoints} Points
                      </div>
                      <div className="flex items-center text-sm text-gray-500 dark:text-gray-400">
                        <Award className="h-4 w-4 text-emerald-500 mr-1" />
                        {task.rewardTokens} DX
                      </div>
                    </div>
                  </td>
                  <td className="px-6 py-4">
                    <div className="text-sm text-gray-500 dark:text-gray-400">
                      {task.requirements.action}: {task.requirements.count}
                    </div>
                  </td>
                  <td className="px-6 py-4 whitespace-nowrap">
                    <span
                      className={`px-2 inline-flex text-xs leading-5 font-semibold rounded-full ${getTaskStatusBadgeColor(
                        task.isActive
                      )}`}
                    >
                      {task.isActive ? "Active" : "Inactive"}
                    </span>
                  </td>
                  <td className="px-6 py-4 whitespace-nowrap text-right text-sm font-medium">
                    <button
                      onClick={() => handleTaskModal(task)}
                      className="text-emerald-600 dark:text-emerald-500 hover:text-emerald-900 dark:hover:text-emerald-400 mr-3"
                      disabled={isLoading}
                    >
                      <Edit className="h-4 w-4" />
                    </button>
                    <button
                      onClick={() => handleDeleteModal(task)}
                      className="text-red-600 dark:text-red-500 hover:text-red-900 dark:hover:text-red-400"
                      disabled={isLoading}
                    >
                      <Trash2 className="h-4 w-4" />
                    </button>
                  </td>
                </tr>
              ))}
            </tbody>
          </table>
        )}
      </div>

      {showTaskModal && currentTask && (
        <div className="fixed inset-0 z-50 overflow-y-auto">
          <div className="flex items-center justify-center min-h-screen pt-4 px-4 pb-20 text-center sm:block sm:p-0">
            <span className="hidden sm:inline-block sm:align-middle sm:h-screen" aria-hidden="true">
              ​
            </span>
            <div className="inline-block align-bottom bg-white dark:bg-gray-800 rounded-lg text-left overflow-hidden shadow-xl transform transition-all sm:my-8 sm:align-middle sm:max-w-lg sm:w-full">
              <div className="bg-white dark:bg-gray-800 px-4 pt-5 pb-4 sm:p-6 sm:pb-4">
                <div className="sm:flex sm:items-start">
                  <div className="mt-3 text-center sm:mt-0 sm:ml-4 sm:text-left w-full">
                    <h3 className="text-lg leading-6 font-medium text-gray-900 dark:text-white">
                      {isEditing ? "Edit Task" : "Create Task"}
                    </h3>
                    <div className="mt-4 space-y-4">
                      <div>
                        <label htmlFor="name" className="block text-sm font-medium text-gray-700 dark:text-gray-300">
                          Task Name
                        </label>
                        <input
                          type="text"
                          name="name"
                          id="name"
                          className="mt-1 block w-full border border-gray-300 dark:border-gray-700 rounded-md shadow-sm py-2 px-3 focus:outline-none focus:ring-emerald-500 focus:border-emerald-500 sm:text-sm bg-white dark:bg-gray-800 text-gray-900 dark:text-white"
                          value={currentTask.name}
                          onChange={(e) => setCurrentTask({ ...currentTask, name: e.target.value })}
                          required
                        />
                      </div>
                      <div>
                        <label htmlFor="post" className="block text-sm font-medium text-gray-700 dark:text-gray-300">
                          Select Post
                        </label>
                        <select
                          name="post"
                          id="post"
                          className="mt-1 block w-full border border-gray-300 dark:border-gray-700 rounded-md shadow-sm py-2 px-3 focus:outline-none focus:ring-emerald-500 focus:border-emerald-500 sm:text-sm bg-white dark:bg-gray-800 text-gray-900 dark:text-white"
                          value={selectedPostId}
                          onChange={(e) => handlePostSelection(e.target.value)}
                        >
                          <option value="">Select a post</option>
                          {posts.map((post) => (
                            <option key={post._id} value={post._id}>
                              {post.title || post.content?.substring(0, 30) || "Untitled Post"}
                            </option>
                          ))}
                        </select>
                      </div>
                      <div>
                        <label
                          htmlFor="description"
                          className="block text-sm font-medium text-gray-700 dark:text-gray-300"
                        >
                          Description
                        </label>
                        <textarea
                          name="description"
                          id="description"
                          rows={3}
                          className="mt-1 block w-full border border-gray-300 dark:border-gray-700 rounded-md shadow-sm py-2 px-3 focus:outline-none focus:ring-emerald-500 focus:border-emerald-500 sm:text-sm bg-white dark:bg-gray-800 text-gray-900 dark:text-white"
                          value={currentTask.description}
                          onChange={(e) => setCurrentTask({ ...currentTask, description: e.target.value })}
                        />
                      </div>
                      <div>
                        <label htmlFor="type" className="block text-sm font-medium text-gray-700 dark:text-gray-300">
                          Task Type
                        </label>
                        <select
                          name="type"
                          id="type"
                          className="mt-1 block w-full border border-gray-300 dark:border-gray-700 rounded-md shadow-sm py-2 px-3 focus:outline-none focus:ring-emerald-500 focus:border-emerald-500 sm:text-sm bg-white dark:bg-gray-800 text-gray-900 dark:text-white"
                          value={currentTask.type}
                          onChange={(e) =>
                            setCurrentTask({ ...currentTask, type: e.target.value as "daily" | "weekly" | "special" })
                          }
                        >
                          <option value="daily">Daily</option>
                          <option value="weekly">Weekly</option>
                          <option value="special">Special</option>
                          <option value="event">Event</option>
                        </select>
                      </div>
                      <div className="grid grid-cols-2 gap-4">
                        <div>
                          <label
                            htmlFor="rewardPoints"
                            className="block text-sm font-medium text-gray-700 dark:text-gray-300"
                          >
                            Points Reward
                          </label>
                          <input
                            type="number"
                            name="rewardPoints"
                            id="rewardPoints"
                            className="mt-1 block w-full border border-gray-300 dark:border-gray-700 rounded-md shadow-sm py-2 px-3 focus:outline-none focus:ring-emerald-500 focus:border-emerald-500 sm:text-sm bg-white dark:bg-gray-800 text-gray-900 dark:text-white"
                            value={currentTask.rewardPoints}
                            onChange={(e) =>
                              setCurrentTask({ ...currentTask, rewardPoints: Number.parseInt(e.target.value) || 0 })
                            }
                            min="0"
                          />
                        </div>
                        <div>
                          <label
                            htmlFor="rewardTokens"
                            className="block text-sm font-medium text-gray-700 dark:text-gray-300"
                          >
                            Token Reward (DX)
                          </label>
                          <input
                            type="number"
                            name="rewardTokens"
                            id="rewardTokens"
                            className="mt-1 block w-full border border-gray-300 dark:border-gray-700 rounded-md shadow-sm py-2 px-3 focus:outline-none focus:ring-emerald-500 focus:border-emerald-500 sm:text-sm bg-white dark:bg-gray-800 text-gray-900 dark:text-white"
                            value={currentTask.rewardTokens}
                            onChange={(e) =>
                              setCurrentTask({ ...currentTask, rewardTokens: Number.parseFloat(e.target.value) || 0 })
                            }
                            min="0"
                            step="0.01"
                          />
                        </div>
                      </div>
                      <div>
                        <label
                          htmlFor="requirements-action"
                          className="block text-sm font-medium text-gray-700 dark:text-gray-300"
                        >
                          Requirement Action
                        </label>
                        <select
                          name="requirements-action"
                          id="requirements-action"
                          className="mt-1 block w-full border border-gray-300 dark:border-gray-700 rounded-md shadow-sm py-2 px-3 focus:outline-none focus:ring-emerald-500 focus:border-emerald-500 sm:text-sm bg-white dark:bg-gray-800 text-gray-900 dark:text-white"
                          value={currentTask.requirements.action}
                          onChange={(e) =>
                            setCurrentTask({
                              ...currentTask,
                              requirements: {
                                ...currentTask.requirements,
                                action: e.target.value as "like" | "comment" | "follow",
                              },
                            })
                          }
                        >
                          <option value="like">Like</option>
                          <option value="comment">Comment</option>
                          <option value="follow">Follow</option>
                        </select>
                      </div>
                      <div>
                        <label
                          htmlFor="requirements-count"
                          className="block text-sm font-medium text-gray-700 dark:text-gray-300"
                        >
                          Requirement Count
                        </label>
                        <input
                          type="number"
                          name="requirements-count"
                          id="requirements-count"
                          className="mt-1 block w-full border border-gray-300 dark:border-gray-700 rounded-md shadow-sm py-2 px-3 focus:outline-none focus:ring-emerald-500 focus:border-emerald-500 sm:text-sm bg-white dark:bg-gray-800 text-gray-900 dark:text-white"
                          value={currentTask.requirements.count}
                          onChange={(e) =>
                            setCurrentTask({
                              ...currentTask,
                              requirements: {
                                ...currentTask.requirements,
                                count: Number.parseInt(e.target.value) || 1,
                              },
                            })
                          }
                          min="1"
                        />
                      </div>
                      <div>
                        <label
                          htmlFor="isActive"
                          className="block text-sm font-medium text-gray-700 dark:text-gray-300"
                        >
                          Status
                        </label>
                        <select
                          name="isActive"
                          id="isActive"
                          className="mt-1 block w-full border border-gray-300 dark:border-gray-700 rounded-md shadow-sm py-2 px-3 focus:outline-none focus:ring-emerald-500 focus:border-emerald-500 sm:text-sm bg-white dark:bg-gray-800 text-gray-900 dark:text-white"
                          value={currentTask.isActive.toString()}
                          onChange={(e) =>
                            setCurrentTask({ ...currentTask, isActive: e.target.value === "true" })
                          }
                        >
                          <option value="true">Active</option>
                          <option value="false">Inactive</option>
                        </select>
                      </div>
                    </div>
                  </div>
                </div>
              </div>
              <div className="bg-gray-50 dark:bg-gray-700 px-4 py-3 sm:px-6 sm:flex sm:flex-row-reverse">
                <button
                  type="button"
                  className="w-full inline-flex justify-center rounded-md border border-transparent shadow-sm px-4 py-2 bg-emerald-600 text-base font-medium text-white hover:bg-emerald-700 focus:outline-none focus:ring-2 focus:ring-offset-2 focus:ring-emerald-500 sm:ml-3 sm:w-auto sm:text-sm"
                  onClick={handleSaveTask}
                  disabled={isLoading}
                >
                  {isLoading ? (
                    <div className="flex items-center">
                      <div className="animate-spin mr-2 h-4 w-4 border-t-2 border-b-2 border-white"></div>
                      Saving...
                    </div>
                  ) : (
                    <>
                      <Save className="h-4 w-4 mr-2" />
                      {isEditing ? "Update Task" : "Create Task"}
                    </>
                  )}
                </button>
                <button
                  type="button"
                  className="mt-3 w-full inline-flex justify-center rounded-md border border-gray-300 dark:border-gray-600 shadow-sm px-4 py-2 bg-white dark:bg-gray-800 text-base font-medium text-gray-700 dark:text-gray-200 hover:bg-gray-50 dark:hover:bg-gray-700 focus:outline-none focus:ring-2 focus:ring-offset-2 focus:ring-emerald-500 sm:mt-0 sm:ml-3 sm:w-auto sm:text-sm"
                  onClick={() => setShowTaskModal(false)}
                >
                  <X className="h-4 w-4 mr-2" />
                  Cancel
                </button>
              </div>
            </div>
          </div>
        </div>
      )}

      {showDeleteModal && currentTask && (
        <div className="fixed inset-0 z-50 overflow-y-auto">
          <div className="flex items-center justify-center min-h-screen pt-4 px-4 pb-20 text-center sm:block sm:p-0">
            <span className="hidden sm:inline-block sm:align-middle sm:h-screen" aria-hidden="true">
              ​
            </span>
            <div className="inline-block align-bottom bg-white dark:bg-gray-800 rounded-lg text-left overflow-hidden shadow-xl transform transition-all sm:my-8 sm:align-middle sm:max-w-lg sm:w-full">
              <div className="bg-white dark:bg-gray-800 px-4 pt-5 pb-4 sm:p-6 sm:pb-4">
                <div className="sm:flex sm:items-start">
                  <div className="mx-auto flex-shrink-0 flex items-center justify-center h-12 w-12 rounded-full bg-red-100 dark:bg-red-900 sm:mx-0 sm:h-10 sm:w-10">
                    <Trash2 className="h-6 w-6 text-red-600 dark:text-red-400" />
                  </div>
                  <div className="mt-3 text-center sm:mt-0 sm:ml-4 sm:text-left">
                    <h3 className="text-lg leading-6 font-medium text-gray-900 dark:text-white">Delete Task</h3>
                    <div className="mt-2">
                      <p className="text-sm text-gray-500 dark:text-gray-400">
                        Are you sure you want to delete the task "{currentTask.name}"? This action cannot be undone.
                      </p>
                    </div>
                  </div>
                </div>
              </div>
              <div className="bg-gray-50 dark:bg-gray-700 px-4 py-3 sm:px-6 sm:flex sm:flex-row-reverse">
                <button
                  type="button"
                  className="w-full inline-flex justify-center rounded-md border border-transparent shadow-sm px-4 py-2 bg-red-600 text-base font-medium text-white hover:bg-red-700 focus:outline-none focus:ring-2 focus:ring-offset-2 focus:ring-red-500 sm:ml-3 sm:w-auto sm:text-sm"
                  onClick={handleDeleteTask}
                  disabled={isLoading}
                >
                  {isLoading ? (
                    <div className="flex items-center">
                      <div className="animate-spin mr-2 h-4 w-4 border-t-2 border-b-2 border-white"></div>
                      Deleting...
                    </div>
                  ) : (
                    "Delete"
                  )}
                </button>
                <button
                  type="button"
                  className="mt-3 w-full inline-flex justify-center rounded-md border border-gray-300 dark:border-gray-600 shadow-sm px-4 py-2 bg-white dark:bg-gray-800 text-base font-medium text-gray-700 dark:text-gray-200 hover:bg-gray-50 dark:hover:bg-gray-700 focus:outline-none focus:ring-2 focus:ring-offset-2 focus:ring-emerald-500 sm:mt-0 sm:ml-3 sm:w-auto sm:text-sm"
                  onClick={() => setShowDeleteModal(false)}
                >
                  Cancel
                </button>
              </div>
            </div>
          </div>
        </div>
      )}

      {showResetModal && (
        <div className="fixed inset-0 z-50 overflow-y-auto">
          <div className="flex items-center justify-center min-h-screen pt-4 px-4 pb-20 text-center sm:block sm:p-0">
            <span className="hidden sm:inline-block sm:align-middle sm:h-screen" aria-hidden="true">
              ​
            </span>
            <div className="inline-block align-bottom bg-white dark:bg-gray-800 rounded-lg text-left overflow-hidden shadow-xl transform transition-all sm:my-8 sm:align-middle sm:max-w-lg sm:w-full">
              <div className="bg-white dark:bg-gray-800 px-4 pt-5 pb-4 sm:p-6 sm:pb-4">
                <div className="sm:flex sm:items-start">
                  <div className="mx-auto flex-shrink-0 flex items-center justify-center h-12 w-12 rounded-full bg-yellow-100 dark:bg-yellow-900 sm:mx-0 sm:h-10 sm:w-10">
                    <RefreshCw className="h-6 w-6 text-yellow-600 dark:text-yellow-400" />
                  </div>
                  <div className="mt-3 text-center sm:mt-0 sm:ml-4 sm:text-left">
                    <h3 className="text-lg leading-6 font-medium text-gray-900 dark:text-white">Reset Daily Tasks</h3>
                    <div className="mt-2">
                      <p className="text-sm text-gray-500 dark:text-gray-400">
                        Are you sure you want to reset all daily tasks? This will clear the completion status for all
                        users.
                      </p>
                    </div>
                  </div>
                </div>
              </div>
              <div className="bg-gray-50 dark:bg-gray-700 px-4 py-3 sm:px-6 sm:flex sm:flex-row-reverse">
                <button
                  type="button"
                  className="w-full inline-flex justify-center rounded-md border border-transparent shadow-sm px-4 py-2 bg-yellow-600 text-base font-medium text-white hover:bg-yellow-700 focus:outline-none focus:ring-2 focus:ring-offset-2 focus:ring-yellow-500 sm:ml-3 sm:w-auto sm:text-sm"
                  onClick={handleResetTasks}
                  disabled={isLoading}
                >
                  {isLoading ? (
                    <div className="flex items-center">
                      <div className="animate-spin mr-2 h-4 w-4 border-t-2 border-b-2 border-white"></div>
                      Resetting...
                    </div>
                  ) : (
                    "Reset Tasks"
                  )}
                </button>
                <button
                  type="button"
                  className="mt-3 w-full inline-flex justify-center rounded-md border border-gray-300 dark:border-gray-600 shadow-sm px-4 py-2 bg-white dark:bg-gray-800 text-base font-medium text-gray-700 dark:text-gray-200 hover:bg-gray-50 dark:hover:bg-gray-700 focus:outline-none focus:ring-2 focus:ring-offset-2 focus:ring-emerald-500 sm:mt-0 sm:ml-3 sm:w-auto sm:text-sm"
                  onClick={() => setShowResetModal(false)}
                >
                  Cancel
                </button>
              </div>
            </div>
          </div>
        </div>
      )}
    </div>
  );
};

export default TaskManagement;