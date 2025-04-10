import React, { useEffect, useState } from 'react';
import { useNavigate } from 'react-router-dom';
import adminService from '../../../api/services/admin.service';

// Import các component tái sử dụng
import PageLayout from '../../../Components/PageLayout';
import DashboardCard from '../../../Components/DashboardCard';
import ActionButton from '../../../Components/ActionButton';
import StatusBadge from '../../../Components/StatusBadge';
import DataTable from '../../../Components/DataTable';
import Modal from '../../../Components/Modal';

type Task = {
  id: string;
  name: string;
  description: string;
  type: 'daily' | 'weekly' | 'onetime' | 'achievement';
  rewardPoints: number;
  rewardTokens: number;
  requirements: {
    action?: string;
    count?: number;
    target?: string;
  };
  isActive: boolean;
  createdAt: string;
  updatedAt: string;
  completionCount: number;
};

const TaskManagement: React.FC = () => {
  const [tasks, setTasks] = useState<Task[]>([]);
  const [loading, setLoading] = useState(true);
  const [selectedTask, setSelectedTask] = useState<Task | null>(null);
  const [isModalOpen, setIsModalOpen] = useState(false);
  const [isCreateMode, setIsCreateMode] = useState(false);
  const [taskTypeFilter, setTaskTypeFilter] = useState('');
  const navigate = useNavigate();

  // Form state for create/edit
  const [formData, setFormData] = useState({
    name: '',
    description: '',
    type: 'daily',
    rewardPoints: 0,
    rewardTokens: 0,
    requirementAction: '',
    requirementCount: 1,
    requirementTarget: '',
    isActive: true
  });

  const fetchTasks = async () => {
    try {
      setLoading(true);
      const response = await adminService.getAllTasks();
      setTasks(response.data.tasks);
    } catch (error) {
      console.error('Error fetching tasks:', error);
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    fetchTasks();
  }, []);

  const openCreateModal = () => {
    setIsCreateMode(true);
    setFormData({
      name: '',
      description: '',
      type: 'daily',
      rewardPoints: 0,
      rewardTokens: 0,
      requirementAction: '',
      requirementCount: 1,
      requirementTarget: '',
      isActive: true
    });
    setIsModalOpen(true);
  };

  const openEditModal = (task: Task) => {
    setIsCreateMode(false);
    setSelectedTask(task);
    setFormData({
      name: task.name,
      description: task.description,
      type: task.type,
      rewardPoints: task.rewardPoints,
      rewardTokens: task.rewardTokens,
      requirementAction: task.requirements.action || '',
      requirementCount: task.requirements.count || 1,
      requirementTarget: task.requirements.target || '',
      isActive: task.isActive
    });
    setIsModalOpen(true);
  };

  const closeModal = () => {
    setIsModalOpen(false);
    setSelectedTask(null);
    setIsCreateMode(false);
  };

  const handleInputChange = (e: React.ChangeEvent<HTMLInputElement | HTMLTextAreaElement | HTMLSelectElement>) => {
    const { name, value, type } = e.target;

    if (type === 'number') {
      setFormData({
        ...formData,
        [name]: parseFloat(value)
      });
    } else if (type === 'checkbox') {
      setFormData({
        ...formData,
        // @ts-ignore
        [name]: e.target.checked
      });
    } else {
      setFormData({
        ...formData,
        [name]: value
      });
    }
  };

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    
    const taskData = {
      name: formData.name,
      description: formData.description,
      type: formData.type,
      rewardPoints: formData.rewardPoints,
      rewardTokens: formData.rewardTokens,
      requirements: {
        action: formData.requirementAction,
        count: formData.requirementCount,
        target: formData.requirementTarget
      },
      isActive: formData.isActive
    };
    
    try {
      if (isCreateMode) {
        // Create new task
        const response = await adminService.createTask(taskData);
        setTasks([...tasks, response.data.task]);
      } else if (selectedTask) {
        // Update existing task
        const response = await adminService.updateTask(selectedTask.id, taskData);
        setTasks(tasks.map(task => 
          task.id === selectedTask.id ? response.data.task : task
        ));
      }
      
      closeModal();
    } catch (error) {
      console.error('Error saving task:', error);
    }
  };

  const handleDeleteTask = async (taskId: string) => {
    if (!window.confirm('Are you sure you want to delete this task?')) return;
    
    try {
      await adminService.deleteTask(taskId);
      setTasks(tasks.filter(task => task.id !== taskId));
    } catch (error) {
      console.error('Error deleting task:', error);
    }
  };

  const handleResetDailyTasks = async () => {
    if (!window.confirm('Are you sure you want to reset all daily tasks? This will clear all user progress.')) return;
    
    try {
      await adminService.resetDailyTasks();
      alert('Daily tasks have been reset successfully');
    } catch (error) {
      console.error('Error resetting daily tasks:', error);
    }
  };

  const toggleTaskStatus = async (taskId: string, isActive: boolean) => {
    try {
      const response = await adminService.updateTask(taskId, { isActive });
      setTasks(tasks.map(task => 
        task.id === taskId ? { ...task, isActive } : task
      ));
    } catch (error) {
      console.error('Error toggling task status:', error);
    }
  };

  const filteredTasks = taskTypeFilter 
    ? tasks.filter(task => task.type === taskTypeFilter)
    : tasks;

  const getTaskTypeLabel = (type: string) => {
    switch(type) {
      case 'daily': return 'Daily';
      case 'weekly': return 'Weekly';
      case 'onetime': return 'One-time';
      case 'achievement': return 'Achievement';
      default: return type;
    }
  };

  // Định nghĩa columns cho DataTable
  const columns = [
    { 
      header: 'Task', 
      accessor: 'name',
      cell: (value: string, task: Task) => (
        <div className="flex flex-col">
          <span className="text-sm font-medium text-gray-900">{task.name}</span>
          <span className="text-xs text-gray-500">{task.description}</span>
        </div>
      )
    },
    { 
      header: 'Type', 
      accessor: 'type',
      cell: (value: string) => {
        let type: 'info' | 'success' | 'warning' | 'default';
        switch(value) {
          case 'daily': type = 'info'; break;
          case 'weekly': type = 'default'; break;
          case 'onetime': type = 'success'; break;
          case 'achievement': type = 'warning'; break;
          default: type = 'default';
        }
        
        return <StatusBadge text={getTaskTypeLabel(value)} type={type} />;
      }
    },
    { 
      header: 'Rewards', 
      accessor: 'rewards',
      cell: (value: any, task: Task) => (
        <div className="flex flex-col">
          {task.rewardPoints > 0 && (
            <span className="text-xs">🏆 {task.rewardPoints} points</span>
          )}
          {task.rewardTokens > 0 && (
            <span className="text-xs">💰 {task.rewardTokens} DX tokens</span>
          )}
        </div>
      )
    },
    { 
      header: 'Requirements', 
      accessor: 'requirements',
      cell: (value: any, task: Task) => (
        <span className="text-sm text-gray-500">
          {task.requirements.action && (
            <span>
              {task.requirements.action} {task.requirements.count} {task.requirements.target}
            </span>
          )}
        </span>
      )
    },
    { 
      header: 'Status', 
      accessor: 'isActive',
      cell: (value: boolean) => (
        <StatusBadge 
          text={value ? 'Active' : 'Inactive'} 
          type={value ? 'success' : 'error'} 
        />
      )
    },
    { 
      header: 'Completions', 
      accessor: 'completionCount',
      cell: (value: number) => (
        <span className="text-sm text-gray-500">{value}</span>
      )
    },
    { 
      header: 'Actions', 
      accessor: 'actions',
      cell: (value: any, task: Task) => (
        <div className="flex space-x-3">
          <button
            onClick={() => openEditModal(task)}
            className="text-indigo-600 hover:text-indigo-900"
          >
            Edit
          </button>
          <button
            onClick={() => toggleTaskStatus(task.id, !task.isActive)}
            className={`${task.isActive ? 'text-yellow-600 hover:text-yellow-900' : 'text-green-600 hover:text-green-900'}`}
          >
            {task.isActive ? 'Disable' : 'Enable'}
          </button>
          <button
            onClick={() => handleDeleteTask(task.id)}
            className="text-red-600 hover:text-red-900"
          >
            Delete
          </button>
        </div>
      )
    }
  ];

  if (loading && tasks.length === 0) {
    return (
      <div className="flex justify-center items-center h-screen">
        <div className="animate-spin rounded-full h-12 w-12 border-t-2 border-b-2 border-blue-500"></div>
      </div>
    );
  }

  return (
    <PageLayout 
      title="Task Management" 
      subtitle="Create and manage user tasks and rewards"
    >
      {/* Actions section */}
      <div className="flex justify-end items-center mb-8 space-x-4">
        <ActionButton 
          text="Reset Daily Tasks" 
          color="yellow" 
          onClick={handleResetDailyTasks}
          fullWidth={false}
        />
        <ActionButton 
          text="Create New Task" 
          color="blue" 
          onClick={openCreateModal}
          fullWidth={false}
        />
        <ActionButton 
          text="Back to Dashboard" 
          color="indigo" 
          onClick={() => navigate('/admin')}
          fullWidth={false}
        />
      </div>

      {/* Filter */}
      <div className="mb-8">
        <DashboardCard title="Filter Tasks">
          <div className="flex items-center justify-end">
            <select
              className="px-4 py-2 border rounded-lg focus:outline-none focus:ring-2 focus:ring-blue-500"
              value={taskTypeFilter}
              onChange={e => setTaskTypeFilter(e.target.value)}
            >
              <option value="">All Types</option>
              <option value="daily">Daily</option>
              <option value="weekly">Weekly</option>
              <option value="onetime">One-time</option>
              <option value="achievement">Achievement</option>
            </select>
          </div>
        </DashboardCard>
      </div>

      {/* Tasks Table */}
      <DashboardCard title="Task List">
        <DataTable 
          columns={columns}
          data={filteredTasks}
        />
      </DashboardCard>

      {/* Create/Edit Task Modal */}
      {isModalOpen && (
        <Modal
          title={isCreateMode ? 'Create New Task' : 'Edit Task'}
          onClose={closeModal}
          footer={
            <div className="flex justify-end space-x-3">
              <button 
                type="button"
                onClick={closeModal} 
                className="px-4 py-2 bg-gray-200 text-gray-800 rounded hover:bg-gray-300"
              >
                Cancel
              </button>
              <ActionButton 
                text={isCreateMode ? 'Create Task' : 'Update Task'} 
                color="blue" 
                onClick={() => {
                  const form = document.getElementById('taskForm') as HTMLFormElement;
                  if (form) form.dispatchEvent(new Event('submit', { cancelable: true, bubbles: true }));
                }}
                fullWidth={false}
              />
            </div>
          }
        >
          <form id="taskForm" onSubmit={handleSubmit}>
            <div className="space-y-4">
              {/* Task Name */}
              <div>
                <label htmlFor="name" className="block text-sm font-medium text-gray-700">
                  Task Name
                </label>
                <input
                  type="text"
                  id="name"
                  name="name"
                  value={formData.name}
                  onChange={handleInputChange}
                  required
                  className="mt-1 block w-full border border-gray-300 rounded-md shadow-sm py-2 px-3 focus:outline-none focus:ring-blue-500 focus:border-blue-500 sm:text-sm"
                />
              </div>
              
              {/* Task Description */}
              <div>
                <label htmlFor="description" className="block text-sm font-medium text-gray-700">
                  Description
                </label>
                <textarea
                  id="description"
                  name="description"
                  value={formData.description}
                  onChange={handleInputChange}
                  rows={3}
                  className="mt-1 block w-full border border-gray-300 rounded-md shadow-sm py-2 px-3 focus:outline-none focus:ring-blue-500 focus:border-blue-500 sm:text-sm"
                />
              </div>
              
              {/* Task Type */}
              <div>
                <label htmlFor="type" className="block text-sm font-medium text-gray-700">
                  Task Type
                </label>
                <select
                  id="type"
                  name="type"
                  value={formData.type}
                  onChange={handleInputChange}
                  className="mt-1 block w-full border border-gray-300 rounded-md shadow-sm py-2 px-3 focus:outline-none focus:ring-blue-500 focus:border-blue-500 sm:text-sm"
                >
                  <option value="daily">Daily</option>
                  <option value="weekly">Weekly</option>
                  <option value="onetime">One-time</option>
                  <option value="achievement">Achievement</option>
                </select>
              </div>
              
              {/* Rewards */}
              <div className="grid grid-cols-2 gap-4">
                <div>
                  <label htmlFor="rewardPoints" className="block text-sm font-medium text-gray-700">
                    Reward Points
                  </label>
                  <input
                    type="number"
                    id="rewardPoints"
                    name="rewardPoints"
                    value={formData.rewardPoints}
                    onChange={handleInputChange}
                    min="0"
                    className="mt-1 block w-full border border-gray-300 rounded-md shadow-sm py-2 px-3 focus:outline-none focus:ring-blue-500 focus:border-blue-500 sm:text-sm"
                  />
                </div>
                <div>
                  <label htmlFor="rewardTokens" className="block text-sm font-medium text-gray-700">
                    Reward DX Tokens
                  </label>
                  <input
                    type="number"
                    id="rewardTokens"
                    name="rewardTokens"
                    value={formData.rewardTokens}
                    onChange={handleInputChange}
                    min="0"
                    step="0.01"
                    className="mt-1 block w-full border border-gray-300 rounded-md shadow-sm py-2 px-3 focus:outline-none focus:ring-blue-500 focus:border-blue-500 sm:text-sm"
                  />
                </div>
              </div>
              
              {/* Requirements */}
              <div>
                <h4 className="text-sm font-medium text-gray-700 mb-2">Requirements</h4>
                <div className="grid grid-cols-3 gap-2">
                  <div>
                    <label htmlFor="requirementAction" className="block text-xs text-gray-500">
                      Action
                    </label>
                    <input
                      type="text"
                      id="requirementAction"
                      name="requirementAction"
                      value={formData.requirementAction}
                      onChange={handleInputChange}
                      placeholder="e.g. post, like, comment"
                      className="mt-1 block w-full border border-gray-300 rounded-md shadow-sm py-2 px-3 focus:outline-none focus:ring-blue-500 focus:border-blue-500 sm:text-sm"
                    />
                  </div>
                  <div>
                    <label htmlFor="requirementCount" className="block text-xs text-gray-500">
                      Count
                    </label>
                    <input
                      type="number"
                      id="requirementCount"
                      name="requirementCount"
                      value={formData.requirementCount}
                      onChange={handleInputChange}
                      min="1"
                      className="mt-1 block w-full border border-gray-300 rounded-md shadow-sm py-2 px-3 focus:outline-none focus:ring-blue-500 focus:border-blue-500 sm:text-sm"
                    />
                  </div>
                  <div>
                    <label htmlFor="requirementTarget" className="block text-xs text-gray-500">
                      Target (optional)
                    </label>
                    <input
                      type="text"
                      id="requirementTarget"
                      name="requirementTarget"
                      value={formData.requirementTarget}
                      onChange={handleInputChange}
                      placeholder="e.g. users, posts"
                      className="mt-1 block w-full border border-gray-300 rounded-md shadow-sm py-2 px-3 focus:outline-none focus:ring-blue-500 focus:border-blue-500 sm:text-sm"
                    />
                  </div>
                </div>
              </div>
              
              {/* Active Status */}
              <div className="flex w-auto items-center ">
                <input
                  type="checkbox"
                  id="isActive"
                  name="isActive"
                  checked={formData.isActive}
                  onChange={handleInputChange}
                  className="h-4 w-4 text-blue-600  rounded"
                />
                <label htmlFor="isActive" className="ml-2 block text-sm text-gray-900">
                  Active
                </label>
              </div>
            </div>
          </form>
        </Modal>
      )}
    </PageLayout>
  );
};


export default TaskManagement;