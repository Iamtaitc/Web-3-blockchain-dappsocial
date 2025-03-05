// SPDX-License-Identifier: MIT
pragma solidity ^0.8.20;

interface ICheckInSystem {

    event UserCheckedIn(address user, uint256 timestamp, uint256 rewardAmount);
    event ConsecutiveCheckInReward(address user, uint256 ddays, uint256 bonusAmount);
    event PremiumStatusChanged(address user, bool isPremium, uint256 expiryTime);
    event CheckInRewardConfigured(uint256 baseReward, uint256 premiumBonus, uint256 maxConsecutiveDays);

    function checkIn() external;

    function setPremiumStatus(address _user, bool _isPremium, uint256 _durationInDays) external;

    function configureCheckInReward(
        uint256 _baseReward,
        uint256 _premiumBonus,
        uint256 _maxConsecutiveDays
    ) external;

    function getUserCheckInInfo(address _user) external view returns (
        uint256 lastChekcIn,
        uint256 consecutiveDays,
        uint256 totalCheckIns,
        bool isPremium,
        uint256 premiumExpiry
    );
}