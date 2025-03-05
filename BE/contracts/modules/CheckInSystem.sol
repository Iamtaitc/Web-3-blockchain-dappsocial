// SPDX-License-Identifier: MIT
pragma solidity ^0.8.20;

import "@openzeppelin/contracts/access/AccessControl.sol";
import "@openzeppelin/contracts/security/ReentrancyGuard.sol";
import "../interfaces/ICheckInSystem.sol";
import "../interfaces/IRewardManager.sol";
import "../models/CheckInModel.sol";

contract CheckInSystem is ICheckInSystem, AccessControl, ReentrancyGuard {
    using CheckInModel for CheckInModel.CheckInInfo;
    using CheckInModel for CheckInModel.CheckInConfig;

    bytes32 public constant ADMIN_ROLE = keccak256("ADMIN_ROLE");
    bytes32 public constant PREMIUM_MANAGER_ROLE =
        keccak256("PREMIUM_MANAGER_ROLE");

    mapping(address => CheckInModel.CheckInInfo) public userCheckIns;
    CheckInModel.CheckInConfig public checkInConfig;

    IRewardManager public rewardManager;

    uint256 private constant ONE_DAY = 24 hours;

    constructor(address _rewardManager) {
        _setupRole(DEFAULT_ADMIN_ROLE, msg.sender);
        _setupRole(ADMIN_ROLE, msg.sender);
        _setupRole(PREMIUM_MANAGER_ROLE, msg.sender);

        rewardManager = IRewardManager(_rewardManager);
        checkInConfig.initiazeConfig();
    }

    function checkIn() external override nonReentrant {
        address user = msg.sender;

        CheckInModel.CheckInInfo storage info = userCheckIns[user];
        if (info.totalCheckIns == 0) {
            info.initialize();
        }

        uint256 currentDay = block.timestamp / ONE_DAY;
        uint256 lastCheckInDay = info.lastCheckIn / ONE_DAY;
        require(currentDay > lastCheckInDay, "Already checked in today");

        if (currentDay == lastCheckInDay + 1) {
            info.consecutiveDays++;
        } else {
            info.consecutiveDays = 1;
        }

        info.lastCheckIn = block.timestamp;
        info.totalCheckIns++;

        uint256 reward = calculateReward(info);

        rewardManager.distributeReward(user, reward, "Daily check-in reward");
        emit UserCheckedIn(user, block.timestamp, reward);
    }

    function calculateReward(
        CheckInModel.CheckInInfo storage info
    ) private view returns (uint256) {
        uint256 reward = checkInConfig.baseReward;
        if (info.isPremium && block.timestamp < info.premiumExpiry) {
            reward += checkInConfig.premiumBonus / 100;
        }
        return reward;
    }

    function setPremiumStatus(
        address _user,
        bool _isPremium,
        uint256 _durationInDays
    ) external override {
        require(
            hasRole(DEFAULT_ADMIN_ROLE, msg.sender) ||
                hasRole(PREMIUM_MANAGER_ROLE, msg.sender),
            "Not authorized"
        );

        CheckInModel.CheckInInfo storage info = userCheckIns[_user];

        if (info.totalCheckIns == 0) {
            info.initialize();
        }

        info.isPremium = _isPremium;

        if (_isPremium && _durationInDays > 0) {
            uint256 newExpiry = block.timestamp + (_durationInDays * ONE_DAY);
            if (info.isPremium && info.premiumExpiry > block.timestamp) {
                info.premiumExpiry = info.premiumExpiry > newExpiry
                    ? info.premiumExpiry
                    : newExpiry;
            } else {
                info.premiumExpiry = newExpiry;
            }
        }else {
            info.premiumExpiry = 0;
        }
        emit PremiumStatusChanged(_user, info.isPremium, info.premiumExpiry);
    }
    function configureCheckInReward(
        uint256 _baseReward,
        uint256 _premiumBonus,
        uint256 _maxConsecutiveDays
    ) external override {
        require(hasRole(DEFAULT_ADMIN_ROLE, msg.sender), "Not Admin");

        checkInConfig.baseReward = _baseReward;
        checkInConfig.premiumBonus = _premiumBonus;
        checkInConfig.maxConsecutiveDays = _maxConsecutiveDays;

        emit CheckInRewardConfigured(
            _baseReward,
            _premiumBonus,
            _maxConsecutiveDays
        );
    }

    function addConsecutiveDays(address _user, uint256 _days) external {
        require(hasRole(DEFAULT_ADMIN_ROLE, msg.sender), "Not Admin");
        require(_days > 0, "Days must be positive");

        CheckInModel.CheckInInfo storage info = userCheckIns[_user];
        info.consecutiveDays += _days; 
    }
    function getUserCheckInInfo(address _user) external view override returns(
        uint256 lastCheckIn,
        uint256 consecutiveDays,
        uint256 totalCheckIns,
        bool isPremium,
        uint256 premiumExpiry
    ){
        CheckInModel.CheckInInfo storage info = userCheckIns[_user];
        return (
            info.lastCheckIn,
            info.consecutiveDays,
            info.totalCheckIns,
            info.isPremium,
            info.premiumExpiry
        );
    }
    function canCheckInToday(address _user)
        external view returns(bool){
            CheckInModel.CheckInInfo storage info = userCheckIns[_user];
            uint256 currentDay = block.timestamp / ONE_DAY;
            uint256 lastCheckInDay = info.lastCheckIn / ONE_DAY;
            return currentDay > lastCheckInDay;
        }
    
}
