// SPDX-License-Identifier: MIT
pragma solidity ^0.8.20;

interface IRewardManager {
    event RewarDistributed(address recipent, uint256 amount, string reason);

    function setRewardToken(address _token) external;

    function setRewardAmount(
        uint256 _postReward,
        uint256 _commentReward,
        uint256 _likethreshold
    ) external;

    function rewardCommentCreation(address _author) external;

    function distributeReward(
        address _recipient,
        uint256 _amount,
        string memory _reason
    ) external;

    function rewardLikeThreshold(address _author) external;

    function rewardPostCreation(address _author) external;
}
