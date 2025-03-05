// SPDX-License-Identifier: MIT
pragma solidity ^0.8.20;

interface IUserManager {
    event UserFollowed(address follower, address followed);
    event UserUnFollowed(address follower, address followed);

    // event UserVerificationChanged(address user, bool verified);

    function followUser(address _user) external;

    function unFollowUser(address _user) external;

    function updateProfile(
        string memory _username,
        string memory _bio,
        string memory _isfsProfilePic
    ) external;

    function getUserProfile(
        address _user
    )
        external
        view
        returns (
            string memory username,
            string memory bio,
            string memory profilePic,
            uint256 reputation,
            bool verified,
            uint256 followerCount,
            uint256 followingCount,
            uint256 joinedAt
        );

    function isFollowing(
        address _follower,
        address _followed
    ) external view returns (bool);
}
