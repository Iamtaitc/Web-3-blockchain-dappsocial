// SPDX-License-Identifier: MIT
pragma solidity ^0.8.20;

library UserModel {
    struct UserProfile {
        string username;
        // string email;
        string bio;
        // string avatar;
        string ipfsProfilePic;
        uint reputationScore;
        bool isVerified;
        uint256 followerCount;
        uint256 followingCount;
        // uint256 postCount;
        uint256 joinedTimestamp;
    }

    function initialize(
        UserProfile storage _profile,
        string memory _username,
        string memory _bio,
        string memory _ipfsProfilePic
    ) internal {
        _profile.username = _username;
        _profile.bio = _bio;
        _profile.ipfsProfilePic = _ipfsProfilePic;
        _profile.reputationScore = 0;
        _profile.followerCount = 0;
        _profile.followingCount = 0;
        _profile.joinedTimestamp = block.timestamp;
        _profile.isVerified = false;
    }
}
