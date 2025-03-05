// SPDX-License-Identifier: MIT
pragma solidity ^0.8.20;

import "@openzeppelin/contracts/access/AccessControl.sol";
import "@openzeppelin/contracts/token/ERC20/IERC20.sol";
import "@openzeppelin/contracts/token/ERC20/utils/SafeERC20.sol";
import "../interfaces/IRewardManager.sol";

contract  RewardManager is IRewardManager, AccessControl {
    using SafeERC20 for IERC20;

    bytes32 public constant POST_MANAGER_ROLE = keccak256("POST_MANAGER_ROLE");
    bytes32 public constant COMMENT_MANAGER_ROLE = keccak256("COMMENT_MANAGER_ROLE");
    bytes32 public constant CHECKIN_SYSTEM_ROLE = keccak256("CHECKIN_SYSTEM_ROLE");

    IERC20 public rewardToken;

    uint256 public postReward = 10 * 10**18;
    uint256 public commentReward = 0.001 * 10**18;
    uint256 public likeThreshold = 10;

    constructor(address _rewardToken) {
        _setupRole(DEFAULT_ADMIN_ROLE, msg.sender);
        rewardToken = IERC20(_rewardToken);
    }
    
    function setRewardToken(address _token) public override {
        require(hasRole(DEFAULT_ADMIN_ROLE, msg.sender), "Not admin");
        rewardToken = IERC20(_token);
    }
    function setRewardAmount(
        uint256 _postReward,
        uint256 _commentReward,
        uint256 _likeThreshold
    ) public override {
        require(hasRole(DEFAULT_ADMIN_ROLE, msg.sender), "Not admin");
        postReward = _postReward;
        commentReward = _commentReward;
        likeThreshold = _likeThreshold;
    }

    function distributeReward(
        address _recipient,
        uint256 _amount,
        string memory _reason
    ) public {
        require(
            hasRole(POST_MANAGER_ROLE, msg.sender) ||
                hasRole(COMMENT_MANAGER_ROLE, msg.sender) ||
                hasRole(DEFAULT_ADMIN_ROLE, msg.sender) ||
                hasRole(CHECKIN_SYSTEM_ROLE, msg.sender),
            "Not authorized"
        );

        if(address(rewardToken) != address(0) && _amount > 0){
            rewardToken.safeTransfer(_recipient, _amount);
            emit RewarDistributed(_recipient, _amount, _reason);
        }
    }
    function rewardPostCreation(address _author) public {
        require(hasRole(POST_MANAGER_ROLE, msg.sender), "Not authorized");
        distributeReward(_author, postReward, "Post Creation");
    }
    function rewardLikeThreshold(address _author) public {
        require(hasRole(POST_MANAGER_ROLE, msg.sender), "Not authorized");
        distributeReward(_author, postReward, "Post reached like threshold");
    }
    
    /**
     * @notice Distributes a comment creation reward
     * @param _author The comment author
     */
    function rewardCommentCreation(address _author) public {
        require(hasRole(COMMENT_MANAGER_ROLE, msg.sender), "Not authorized");
        distributeReward(_author, commentReward, "Comment creation");
    }

}