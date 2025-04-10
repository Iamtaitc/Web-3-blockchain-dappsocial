import React, { useEffect, useState } from 'react';
import { useNavigate } from 'react-router-dom';
import adminService from '../../../api/services/admin.service';

type SystemConfig = {
  dailyPointsCap: number;
  referralBonus: number;
  postRewardPoints: number;
  commentRewardPoints: number;
  likeRewardPoints: number;
  newUserBonusTokens: number;
  minWithdrawAmount: number;
  maxTokensPerDay: number;
  platformFeePercentage: number;
  maintenanceMode: boolean;
  systemAnnouncement: string;
};

const SystemSettings: React.FC = () => {
  const [config, setConfig] = useState<SystemConfig>({
    dailyPointsCap: 100,
    referralBonus: 10,
    postRewardPoints: 5,
    commentRewardPoints: 2,
    likeRewardPoints: 1,
    newUserBonusTokens: 5,
    minWithdrawAmount: 10,
    maxTokensPerDay: 50,
    platformFeePercentage: 2.5,
    maintenanceMode: false,
    systemAnnouncement: '',
  });
  
  const [loading, setLoading] = useState(true);
  const [saving, setSaving] = useState(false);
  const [successMessage, setSuccessMessage] = useState('');
  const [errorMessage, setErrorMessage] = useState('');
  const [isBlockchainSyncing, setIsBlockchainSyncing] = useState(false);
  const navigate = useNavigate();

  useEffect(() => {
    const fetchSystemConfig = async () => {
      try {
        setLoading(true);
        // In a real scenario, we would get this from the API
        // const response = await adminService.getSystemConfig();
        // setConfig(response.data.config);
        
        // For demonstration, we'll use the default values
        setConfig({
          dailyPointsCap: 100,
          referralBonus: 10,
          postRewardPoints: 5,
          commentRewardPoints: 2,
          likeRewardPoints: 1,
          newUserBonusTokens: 5,
          minWithdrawAmount: 10,
          maxTokensPerDay: 50,
          platformFeePercentage: 2.5,
          maintenanceMode: false,
          systemAnnouncement: 'Welcome to DappSocial!',
        });
      } catch (error) {
        console.error('Error fetching system config:', error);
      } finally {
        setLoading(false);
      }
    };

    fetchSystemConfig();
  }, []);

  const handleInputChange = (e: React.ChangeEvent<HTMLInputElement | HTMLTextAreaElement>) => {
    const { name, value, type } = e.target;
    
    if (type === 'checkbox') {
      setConfig({
        ...config,
        // @ts-ignore
        [name]: e.target.checked
      });
    } else if (type === 'number') {
      setConfig({
        ...config,
        [name]: parseFloat(value)
      });
    } else {
      setConfig({
        ...config,
        [name]: value
      });
    }
  };

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setSuccessMessage('');
    setErrorMessage('');
    
    try {
      setSaving(true);
      await adminService.updateSystemConfig(config);
      setSuccessMessage('System settings updated successfully');
    } catch (error: any) {
      console.error('Error updating system config:', error);
      setErrorMessage(error.message || 'Failed to update system settings');
    } finally {
      setSaving(false);
    }
  };

  const handleForceBlockchainSync = async () => {
    if (!window.confirm('Are you sure you want to force blockchain synchronization? This may take some time.')) {
      return;
    }
    
    try {
      setIsBlockchainSyncing(true);
      await adminService.forceBlockchainSync();
      alert('Blockchain synchronization completed successfully');
    } catch (error) {
      console.error('Error syncing blockchain:', error);
      alert('Failed to sync blockchain. Please check the logs for details.');
    } finally {
      setIsBlockchainSyncing(false);
    }
  };

  const handleSystemAnnouncement = async () => {
    if (!config.systemAnnouncement.trim()) {
      alert('Please enter an announcement message');
      return;
    }
    
    if (!window.confirm('This will send a notification to all users. Continue?')) {
      return;
    }
    
    try {
      setSaving(true);
      await adminService.createSystemAnnouncement('System Announcement', config.systemAnnouncement);
      setSuccessMessage('Announcement sent successfully to all users');
    } catch (error) {
      console.error('Error sending announcement:', error);
      setErrorMessage('Failed to send announcement');
    } finally {
      setSaving(false);
    }
  };

  if (loading) {
    return (
      <div className="flex justify-center items-center h-screen">
        <div className="animate-spin rounded-full h-12 w-12 border-t-2 border-b-2 border-blue-500"></div>
      </div>
    );
  }

  return (
    <div className="container mx-auto px-4 py-8">
      <div className="flex justify-between items-center mb-8">
        <h1 className="text-3xl font-bold">System Settings</h1>
        <button 
          onClick={() => navigate('/admin')} 
          className="bg-gray-200 hover:bg-gray-300 text-gray-800 px-4 py-2 rounded"
        >
          Back to Dashboard
        </button>
      </div>
      
      {successMessage && (
        <div className="mb-6 bg-green-100 border border-green-400 text-green-700 px-4 py-3 rounded">
          {successMessage}
        </div>
      )}
      
      {errorMessage && (
        <div className="mb-6 bg-red-100 border border-red-400 text-red-700 px-4 py-3 rounded">
          {errorMessage}
        </div>
      )}
      
      <div className="grid grid-cols-1 lg:grid-cols-3 gap-8">
        {/* Main Settings Form */}
        <div className="lg:col-span-2">
          <div className="bg-white rounded-lg shadow-md p-6">
            <h2 className="text-xl font-semibold mb-6">Platform Configuration</h2>
            
            <form onSubmit={handleSubmit}>
              <div className="grid grid-cols-1 md:grid-cols-2 gap-6 mb-6">
                <div>
                  <h3 className="text-lg font-medium mb-4">Rewards Settings</h3>
                  
                  <div className="mb-4">
                    <label htmlFor="dailyPointsCap" className="block text-sm font-medium text-gray-700 mb-1">
                      Daily Points Cap
                    </label>
                    <input
                      type="number"
                      id="dailyPointsCap"
                      name="dailyPointsCap"
                      value={config.dailyPointsCap}
                      onChange={handleInputChange}
                      min="0"
                      className="w-full p-2 border border-gray-300 rounded-md focus:outline-none focus:ring-2 focus:ring-blue-500"
                    />
                  </div>
                  
                  <div className="mb-4">
                    <label htmlFor="referralBonus" className="block text-sm font-medium text-gray-700 mb-1">
                      Referral Bonus (Points)
                    </label>
                    <input
                      type="number"
                      id="referralBonus"
                      name="referralBonus"
                      value={config.referralBonus}
                      onChange={handleInputChange}
                      min="0"
                      className="w-full p-2 border border-gray-300 rounded-md focus:outline-none focus:ring-2 focus:ring-blue-500"
                    />
                  </div>
                  
                  <div className="mb-4">
                    <label htmlFor="postRewardPoints" className="block text-sm font-medium text-gray-700 mb-1">
                      Post Reward (Points)
                    </label>
                    <input
                      type="number"
                      id="postRewardPoints"
                      name="postRewardPoints"
                      value={config.postRewardPoints}
                      onChange={handleInputChange}
                      min="0"
                      className="w-full p-2 border border-gray-300 rounded-md focus:outline-none focus:ring-2 focus:ring-blue-500"
                    />
                  </div>
                  
                  <div className="mb-4">
                    <label htmlFor="commentRewardPoints" className="block text-sm font-medium text-gray-700 mb-1">
                      Comment Reward (Points)
                    </label>
                    <input
                      type="number"
                      id="commentRewardPoints"
                      name="commentRewardPoints"
                      value={config.commentRewardPoints}
                      onChange={handleInputChange}
                      min="0"
                      className="w-full p-2 border border-gray-300 rounded-md focus:outline-none focus:ring-2 focus:ring-blue-500"
                    />
                  </div>
                  
                  <div className="mb-4">
                    <label htmlFor="likeRewardPoints" className="block text-sm font-medium text-gray-700 mb-1">
                      Like Reward (Points)
                    </label>
                    <input
                      type="number"
                      id="likeRewardPoints"
                      name="likeRewardPoints"
                      value={config.likeRewardPoints}
                      onChange={handleInputChange}
                      min="0"
                      className="w-full p-2 border border-gray-300 rounded-md focus:outline-none focus:ring-2 focus:ring-blue-500"
                    />
                  </div>
                </div>
                
                <div>
                  <h3 className="text-lg font-medium mb-4">Token Settings</h3>
                  
                  <div className="mb-4">
                    <label htmlFor="newUserBonusTokens" className="block text-sm font-medium text-gray-700 mb-1">
                      New User Bonus (DX)
                    </label>
                    <input
                      type="number"
                      id="newUserBonusTokens"
                      name="newUserBonusTokens"
                      value={config.newUserBonusTokens}
                      onChange={handleInputChange}
                      min="0"
                      step="0.1"
                      className="w-full p-2 border border-gray-300 rounded-md focus:outline-none focus:ring-2 focus:ring-blue-500"
                    />
                  </div>
                  
                  <div className="mb-4">
                    <label htmlFor="minWithdrawAmount" className="block text-sm font-medium text-gray-700 mb-1">
                      Minimum Withdrawal (DX)
                    </label>
                    <input
                      type="number"
                      id="minWithdrawAmount"
                      name="minWithdrawAmount"
                      value={config.minWithdrawAmount}
                      onChange={handleInputChange}
                      min="0"
                      step="0.1"
                      className="w-full p-2 border border-gray-300 rounded-md focus:outline-none focus:ring-2 focus:ring-blue-500"
                    />
                  </div>
                  
                  <div className="mb-4">
                    <label htmlFor="maxTokensPerDay" className="block text-sm font-medium text-gray-700 mb-1">
                      Max Tokens Per Day
                    </label>
                    <input
                      type="number"
                      id="maxTokensPerDay"
                      name="maxTokensPerDay"
                      value={config.maxTokensPerDay}
                      onChange={handleInputChange}
                      min="0"
                      className="w-full p-2 border border-gray-300 rounded-md focus:outline-none focus:ring-2 focus:ring-blue-500"
                    />
                  </div>
                  
                  <div className="mb-4">
                    <label htmlFor="platformFeePercentage" className="block text-sm font-medium text-gray-700 mb-1">
                      Platform Fee (%)
                    </label>
                    <input
                      type="number"
                      id="platformFeePercentage"
                      name="platformFeePercentage"
                      value={config.platformFeePercentage}
                      onChange={handleInputChange}
                      min="0"
                      max="100"
                      step="0.1"
                      className="w-full p-2 border border-gray-300 rounded-md focus:outline-none focus:ring-2 focus:ring-blue-500"
                    />
                  </div>
                  
                  <div className="mb-4">
                    <div className="flex items-center">
                      <input
                        type="checkbox"
                        id="maintenanceMode"
                        name="maintenanceMode"
                        checked={config.maintenanceMode}
                        onChange={handleInputChange}
                        className="h-4 w-4 text-blue-600 focus:ring-blue-500 border-gray-300 rounded"
                      />
                      <label htmlFor="maintenanceMode" className="ml-2 block text-sm text-gray-900">
                        Maintenance Mode
                      </label>
                    </div>
                    <p className="text-xs text-gray-500 mt-1">
                      When enabled, only admins can access the platform.
                    </p>
                  </div>
                </div>
              </div>
              
              <div className="border-t border-gray-200 pt-6">
                <h3 className="text-lg font-medium mb-4">System Announcement</h3>
                <div className="mb-4">
                  <textarea
                    id="systemAnnouncement"
                    name="systemAnnouncement"
                    value={config.systemAnnouncement}
                    onChange={handleInputChange}
                    rows={3}
                    placeholder="Enter announcement text visible to all users"
                    className="w-full p-2 border border-gray-300 rounded-md focus:outline-none focus:ring-2 focus:ring-blue-500"
                  ></textarea>
                  <div className="mt-2 flex justify-end">
                    <button
                      type="button"
                      onClick={handleSystemAnnouncement}
                      className="px-4 py-2 bg-yellow-500 text-white rounded hover:bg-yellow-600"
                      disabled={saving}
                    >
                      Send Announcement
                    </button>
                  </div>
                </div>
              </div>
              
              <div className="border-t border-gray-200 pt-6 flex justify-end">
                <button
                  type="submit"
                  className={`px-6 py-2 rounded-md text-white font-medium ${
                    saving 
                      ? 'bg-blue-400 cursor-not-allowed' 
                      : 'bg-blue-500 hover:bg-blue-600'
                  }`}
                  disabled={saving}
                >
                  {saving ? 'Saving...' : 'Save Settings'}
                </button>
              </div>
            </form>
          </div>
        </div>
        
        {/* Advanced Operations */}
        <div>
          <div className="bg-white rounded-lg shadow-md p-6 mb-6">
            <h2 className="text-xl font-semibold mb-4">Advanced Operations</h2>
            
            <div className="space-y-4">
              <div>
                <h3 className="text-base font-medium mb-2">Blockchain Operations</h3>
                <button
                  onClick={handleForceBlockchainSync}
                  className={`w-full px-4 py-2 rounded-md text-white font-medium ${
                    isBlockchainSyncing 
                      ? 'bg-indigo-400 cursor-not-allowed' 
                      : 'bg-indigo-500 hover:bg-indigo-600'
                  }`}
                  disabled={isBlockchainSyncing}
                >
                  {isBlockchainSyncing ? 'Syncing...' : 'Force Blockchain Sync'}
                </button>
                <p className="text-xs text-gray-500 mt-1">
                  Synchronizes all blockchain data. Use this if there are discrepancies.
                </p>
              </div>
              
              <div className="pt-4 border-t border-gray-200">
                <h3 className="text-base font-medium mb-2">System Logs</h3>
                <button
                  onClick={() => navigate('/admin/logs')}
                  className="w-full px-4 py-2 bg-gray-700 text-white rounded hover:bg-gray-800"
                >
                  View System Logs
                </button>
                <p className="text-xs text-gray-500 mt-1">
                  Access detailed system logs for troubleshooting.
                </p>
              </div>
              
              <div className="pt-4 border-t border-gray-200">
                <h3 className="text-base font-medium mb-2">Database Operations</h3>
                <button
                  onClick={() => window.alert('This feature would be implemented in a production environment')}
                  className="w-full px-4 py-2 bg-orange-500 text-white rounded hover:bg-orange-600 mb-2"
                >
                  Backup Database
                </button>
                <button
                  onClick={() => window.alert('This feature would be implemented in a production environment')}
                  className="w-full px-4 py-2 bg-red-500 text-white rounded hover:bg-red-600"
                >
                  Clear Cache
                </button>
              </div>
            </div>
          </div>
          
          <div className="bg-white rounded-lg shadow-md p-6">
            <h2 className="text-xl font-semibold mb-4">System Information</h2>
            <div className="space-y-3">
              <div>
                <span className="text-sm text-gray-500">Server Status:</span>
                <div className="flex items-center mt-1">
                  <div className="h-3 w-3 rounded-full bg-green-500 mr-2"></div>
                  <span className="text-sm font-medium">Operational</span>
                </div>
              </div>
              <div>
                <span className="text-sm text-gray-500">Version:</span>
                <p className="text-sm font-medium">1.0.0</p>
              </div>
              <div>
                <span className="text-sm text-gray-500">Last Updated:</span>
                <p className="text-sm font-medium">{new Date().toLocaleDateString()}</p>
              </div>
              <div>
                <span className="text-sm text-gray-500">Node Status:</span>
                <div className="flex items-center mt-1">
                  <div className="h-3 w-3 rounded-full bg-green-500 mr-2"></div>
                  <span className="text-sm font-medium">Connected</span>
                </div>
              </div>
              <div>
                <span className="text-sm text-gray-500">Current Block:</span>
                <p className="text-sm font-medium">12,345,678</p>
              </div>
            </div>
          </div>
        </div>
      </div>
    </div>
  );
};

export default SystemSettings;