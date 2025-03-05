// SPDX-License-Identifier: MIT
pragma solidity ^0.8.20;


library PremiumModel {
    struct PremiumPricing {
        uint256 dailyPrice;
        uint256 monthlyPrice;
        uint256 yearlyPrice;
    }
    struct PremiumSubscription {
        bool isActive;
        uint256 startDate;
        uint256 endDate;
        uint256 totalSpent;
        uint256 lastRenewal;
    }

    function initializePricing(PremiumPricing storage pricing) internal {
        pricing.dailyPrice = 1 ether;
        pricing.monthlyPrice = 20 ether;
        pricing.yearlyPrice = 200 ether;
    }
    function initializeSubscription(PremiumSubscription storage subscription) internal {
        subscription.isActive = false;
        subscription.startDate = 0;
        subscription.endDate = 0;
        subscription.totalSpent = 0;
        subscription.lastRenewal = 0;
    }
    
}