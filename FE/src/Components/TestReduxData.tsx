import React from 'react'
import { useAppSelector } from '../hooks/useAppSelector'

export default function TestReduxData() {
  // Lấy toàn bộ state từ Redux store
  const { currentProfile, profiles, loading, error } = useAppSelector((state) => state.user)
  const { walletAddress, token } = useAppSelector((state) => state.auth)

  return (
    <div className="bg-white p-6 rounded-lg shadow-lg">
      <h2 className="text-2xl font-bold mb-4">Redux Store Data</h2>
      
      {/* Auth State */}
      <div className="mb-6">
        <h3 className="text-lg font-semibold mb-2">Auth State:</h3>
        <div className="bg-gray-50 p-4 rounded">
          <p><span className="font-medium">Wallet Address:</span> {walletAddress || 'Chưa đăng nhập'}</p>
          <p><span className="font-medium">Token:</span> {token ? '✓ Đã có token' : '✗ Chưa có token'}</p>
        </div>
      </div>

      {/* User State */}
      <div className="mb-6">
        <h3 className="text-lg font-semibold mb-2">User State:</h3>
        <div className="bg-gray-50 p-4 rounded">
          <p><span className="font-medium">Loading:</span> {loading ? 'Đang tải...' : 'Hoàn tất'}</p>
          <p><span className="font-medium">Error:</span> {error || 'Không có lỗi'}</p>
        </div>
      </div>

      {/* Current Profile */}
      <div className="mb-6">
        <h3 className="text-lg font-semibold mb-2">Current Profile:</h3>
        <div className="bg-gray-50 p-4 rounded">
          {currentProfile ? (
            <>
              <p><span className="font-medium">Username:</span> {currentProfile.username}</p>
              <p><span className="font-medium">Wallet:</span> {currentProfile.walletAddress}</p>
              <p><span className="font-medium">VIP Level:</span> {currentProfile.subscription.level}</p>
              <p><span className="font-medium">Followers:</span> {currentProfile.followerCount}</p>
              <p><span className="font-medium">Following:</span> {currentProfile.followingCount}</p>
              <p><span className="font-medium">Points:</span> {currentProfile.points}</p>
            </>
          ) : (
            <p>Chưa có profile được chọn</p>
          )}
        </div>
      </div>

      {/* Cached Profiles */}
      <div>
        <h3 className="text-lg font-semibold mb-2">Cached Profiles:</h3>
        <div className="bg-gray-50 p-4 rounded">
          {Object.keys(profiles).length > 0 ? (
            <div className="space-y-4">
              {Object.entries(profiles).map(([address, profile]) => (
                <div key={address} className="border-b pb-2">
                  <p><span className="font-medium">Username:</span> {profile.username}</p>
                  <p><span className="font-medium">Wallet:</span> {profile.walletAddress}</p>
                  <p><span className="font-medium">VIP Level:</span> {profile.subscription.level}</p>
                </div>
              ))}
            </div>
          ) : (
            <p>Chưa có profile nào trong cache</p>
          )}
        </div>
      </div>
    </div>
  )
}