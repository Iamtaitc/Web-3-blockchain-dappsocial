// SPDX-License-Identifier: MIT
pragma solidity ^0.8.20;

import "@openzeppelin/contracts/access/Ownable.sol";
import "@openzeppelin/contracts/utils/ReentrancyGuard.sol";
import "./DXToken.sol";
import "@openzeppelin/contracts/token/ERC20/utils/SafeERC20.sol";


contract Subscription is Ownable, ReentrancyGuard {
    DXToken public dxToken;

    using SafeERC20 for DXToken;

    
    // Subscription levels
    uint256 public constant LEVEL_STANDARD = 1; // x1
    uint256 public constant LEVEL_PLUS = 2;     // x2
    uint256 public constant LEVEL_PRO = 5;      // x5
    uint256 public constant LEVEL_ELITE = 10;   // x10
    
    // Subscription fees (per month)
    uint256 public feeStandard = 0;
    uint256 public feePlus = 50 * 10**18;     // 50 DX
    uint256 public feePro = 100 * 10**18;     // 100 DX
    uint256 public feeElite = 180 * 10**18;   // 180 DX
    
    // Recipient của fee
    address public feeRecipient;
    
    // Struct Sub
    struct SubscriptionInfo {
        uint256 level;
        uint256 expiration;
        uint256 startTime;
    }
    
    // Mapping
    mapping(address => SubscriptionInfo) public subscriptions;
    
    // Events
    event SubscriptionPurchased(address indexed user, uint256 level, uint256 months, uint256 expiration);
    
    constructor(address _dxToken, address _feeRecipient) Ownable(msg.sender) {
        dxToken = DXToken(_dxToken);
        feeRecipient = _feeRecipient;
    }
    
    // Mua subscription
    function purchaseSubscription(uint256 _level, uint256 _months) external nonReentrant {
        require(_level == LEVEL_STANDARD || _level == LEVEL_PLUS || 
                _level == LEVEL_PRO || _level == LEVEL_ELITE, "Invalid level");
        require(_months > 0 && _months <= 12, "Invalid duration");
        
        uint256 fee;
        if (_level == LEVEL_STANDARD) fee = feeStandard * _months;
        else if (_level == LEVEL_PLUS) fee = feePlus * _months;
        else if (_level == LEVEL_PRO) fee = feePro * _months;
        else if (_level == LEVEL_ELITE) fee = feeElite * _months;
        
        if (fee > 0) {
            dxToken.safeTransferFrom(msg.sender, feeRecipient, fee);
        }
        
        // Tính thời hạn
        uint256 expiration;
        if (subscriptions[msg.sender].expiration > block.timestamp) {
            // Gia hạn subscription hiện tại
            expiration = subscriptions[msg.sender].expiration + (_months * 30 days);
        } else {
            // Subscription mới
            expiration = block.timestamp + (_months * 30 days);
        }
        
        // Lưu thông tin subscription
        subscriptions[msg.sender] = SubscriptionInfo({
            level: _level,
            expiration: expiration,
            startTime: block.timestamp
        });
        
        emit SubscriptionPurchased(msg.sender, _level, _months, expiration);
    }
    
    // Lấy thông tin subscription
    function getSubscription(address _user) external view returns (uint256 level, uint256 expiration) {
        SubscriptionInfo memory sub = subscriptions[_user];
        
        if (sub.expiration < block.timestamp) {
            return (LEVEL_STANDARD, 0);
        }
        
        return (sub.level, sub.expiration);
    }
    
    // Lấy multiplier cho rewards
    function getMultiplier(address _user) external view returns (uint256) {
        SubscriptionInfo memory sub = subscriptions[_user];
        
        if (sub.expiration < block.timestamp) {
            return LEVEL_STANDARD;
        }
        
        return sub.level;
    }
    
    function setFees(uint256 _feePlus, uint256 _feePro, uint256 _feeElite) external onlyOwner {
        feePlus = _feePlus;
        feePro = _feePro;
        feeElite = _feeElite;
    }
    
    function setFeeRecipient(address _feeRecipient) external onlyOwner {
        require(_feeRecipient != address(0), "Invalid address");
        feeRecipient = _feeRecipient;
    }
}