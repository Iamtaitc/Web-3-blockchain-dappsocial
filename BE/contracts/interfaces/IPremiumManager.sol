// SPDX-License-Identifier: MIT
pragma solidity ^0.8.20;

interface IPremiumManager {
    event PremiumPurchased(address user, uint256 durationInDays, uint256 price);
    event PremiumRenewed(address user, uint256 durationInDays, uint256 price);
    event PremiumCancelled(address user);
    event PremiumPriceChanged(
        uint256 newDailyPrice,
        uint256 newMonthlyPrice,
        uint256 newYearlyPrice
    );

    function purchasePremium(uint256 _durationInDays) external;

    function renewPremium(uint256 _durationInDays) external;

    function cancelPremium() external;

    function setPremiumPrices(
        uint256 _dailyPrice,
        uint256 _monthlyPrice,
        uint256 _yearlyPrice
    ) external;

    function getPremiumPrices()
        external
        view
        returns (uint256 dailyPrice, uint256 monthlyPrice, uint256 yearlyPrice);
}
