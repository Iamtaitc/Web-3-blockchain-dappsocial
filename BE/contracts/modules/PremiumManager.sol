// SPDX-License-Identifier: MIT
pragma solidity ^0.8.20;

import "@openzeppelin/contracts/access/AccessControl.sol";
import "@openzeppelin/contracts/security/ReentrancyGuard.sol";
import "@openzeppelin/contracts/token/ERC20/IERC20.sol";
import "@openzeppelin/contracts/token/ERC20/utils/SafeERC20.sol";
import "../interfaces/IPremiumManager.sol";
import "../interfaces/ICheckInSystem.sol";
import "../models/PremiumModel.sol";

contract PremiumManager is IPremiumManager, AccessControl, ReentrancyGuard {
    using SafeERC20 for IERC20;
    using PremiumModel for PremiumModel.PremiumPricing;
    using PremiumModel for PremiumModel.PremiumSubscription;

    bytes32 public constant ADMIN_ROLE = keccak256("ADMIN_ROLE");

    IERC20 public paymentToken;

    PremiumModel.PremiumPricing public premiumPricing;

    mapping(address => PremiumModel.PremiumSubscription)
        public premiumSubsciption;

    uint256 private constant MONTHILY = 30 days;
    uint256 private constant YEARLY = 365 days;
    uint256 private constant HALF_YEARLY = 182 days;

    address public treasury;
    ICheckInSystem public checkInSystem;

    constructor(
        address _paymentToken,
        address _treasury,
        address _checkInSystem
    ) {
        _setupRole(DEFAULT_ADMIN_ROLE, msg.sender);
        _setupRole(ADMIN_ROLE, msg.sender);

        paymentToken = IERC20(_paymentToken);
        treasury = _treasury;
        checkInSystem = ICheckInSystem(_checkInSystem);

        premiumPricing.initializePricing();
    }

    function getPrice(uint256 _durationInDays) internal view returns (uint256) {
        if (_durationInDays == 30) {
            return premiumPricing.monthlyPrice;
        } else if (_durationInDays == 180) {
            return (premiumPricing.monthlyPrice * 180 * 80) / 100;
        } else if (_durationInDays == 365) {
            return premiumPricing.yearlyPrice;
        } else {
            return premiumPricing.dailyPrice * _durationInDays;
        }
    }

    function purchasePremium(
        uint256 _durationInDays
    ) external override nonReentrant {
        require(
            _durationInDays == 30 ||
                _durationInDays == 180 ||
                _durationInDays == 365,
            "Invalid duration"
        );
        address user = msg.sender;
        PremiumModel.PremiumSubscription
            storage subscription = premiumSubsciption[user];
        require(
            !subscription.isActive || block.timestamp >= subscription.endDate,
            "Already subscribed"
        );
        uint256 price = getPrice(_durationInDays);
        paymentToken.safeTransferFrom(user, treasury, price);

        if (subscription.startDate == 0) {
            subscription.initializeSubscription();
        }

        subscription.isActive = true;
        subscription.startDate = block.timestamp;
        subscription.endDate = block.timestamp + (_durationInDays * 1 days);
        subscription.totalSpent += price;
        subscription.lastRenewal = block.timestamp;

        checkInSystem.setPremiumStatus(user, true, _durationInDays);

        emit PremiumPurchased(user, _durationInDays, price);
    }

    function renewPremium(
        uint256 _durationInDays
    ) external override nonReentrant {
        require(
            _durationInDays == 30 ||
                _durationInDays == 180 ||
                _durationInDays == 365,
            "Invalid duration"
        );
        address user = msg.sender;
        PremiumModel.PremiumSubscription
            storage subscription = premiumSubsciption[user];

        require(subscription.startDate > 0, "No subscription to renew");

        uint256 price = getPrice(_durationInDays);

        paymentToken.safeTransferFrom(user, treasury, price);

        subscription.isActive = true;

        if (subscription.endDate > block.timestamp) {
            subscription.endDate += (_durationInDays * 1 days);
        } else {
            subscription.endDate = block.timestamp + (_durationInDays * 1 days);
        }

        subscription.totalSpent += price;
        subscription.lastRenewal = block.timestamp;

        checkInSystem.setPremiumStatus(user, true, _durationInDays);

        emit PremiumRenewed(user, _durationInDays, price);
    }

    function cancelPremium() external override nonReentrant {
        address user = msg.sender;
        PremiumModel.PremiumSubscription
            storage subscription = premiumSubsciption[user];

        require(subscription.isActive, "No active subscription");

        subscription.isActive = false;
        subscription.endDate = block.timestamp;

        checkInSystem.setPremiumStatus(user, false, 0);

        emit PremiumCancelled(user);
    }

    function setPremiumPrices(
        uint256 _dailyPrice,
        uint256 _monthlyPrice,
        uint256 _yearlyPrice
    ) external override {
        require(hasRole(ADMIN_ROLE, msg.sender), "Not admin");

        premiumPricing.dailyPrice = _dailyPrice;
        premiumPricing.monthlyPrice = _monthlyPrice;
        premiumPricing.yearlyPrice = _yearlyPrice;

        emit PremiumPriceChanged(_dailyPrice, _monthlyPrice, _yearlyPrice);
    }

    function getPremiumPrices()
        external
        view
        override
        returns (uint256 dailyPrice, uint256 monthlyPrice, uint256 yearlyPrice)
    {
        return (
            premiumPricing.dailyPrice,
            premiumPricing.monthlyPrice,
            premiumPricing.yearlyPrice
        );
    }

    function setTreasury(address _treasury) external {
        require(hasRole(ADMIN_ROLE, msg.sender), "Caller is not an admin");
        treasury = _treasury;
    }

    function getUserPremiumDetails(
        address _user
    )
        external
        view
        returns (
            bool isActive,
            uint256 startDate,
            uint256 endDate,
            uint256 totalSpent,
            uint256 lastRenewal
        )
    {
        PremiumModel.PremiumSubscription
            storage subscription = premiumSubsciption[_user];
        bool active = subscription.isActive &&
            block.timestamp <= subscription.endDate;

        return (
            active,
            subscription.startDate,
            subscription.endDate,
            subscription.totalSpent,
            subscription.lastRenewal
        );
    }

    function hasActivePremium(address _user) external view returns (bool) {
        PremiumModel.PremiumSubscription
            storage subscription = premiumSubsciption[_user];
        return subscription.isActive && block.timestamp <= subscription.endDate;
    }
}
