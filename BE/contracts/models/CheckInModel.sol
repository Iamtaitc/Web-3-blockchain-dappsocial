// SPDX-License-Identifier: MIT
pragma solidity ^0.8.20;

library CheckInModel {
    struct CheckInInfo {
        uint256 lastCheckIn;
        uint256 consecutiveDays;
        uint256 totalCheckIns; 
        bool isPremium;
        uint256 premiumExpiry;
    }

    struct CheckInConfig {
        uint256 baseReward;
        uint256 premiumBonus;
        uint256 maxConsecutiveDays;
    }

    function initialize(CheckInInfo storage info) internal {
        info.lastCheckIn = 0;
        info.consecutiveDays = 0;
        info.totalCheckIns = 0;
        info.isPremium = false;
        info.premiumExpiry = 0;
    }

    function initiazeConfig(CheckInConfig storage config) internal {
        config.baseReward = 0.001 * 10**18;
        config.premiumBonus = 30;
        config.maxConsecutiveDays = 7;
    }
}