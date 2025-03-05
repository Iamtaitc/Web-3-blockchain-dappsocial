// SPDX-License-Identifier: MIT
pragma solidity ^0.8.20;

import "../interfaces/IUserManager.sol";
import "../models/UserModel.sol";

contract SocialManager is IUserManager {

    using UserModel for UserModel.UserProfile;

    mapping(address => UserModel.UserProfile) public userProfiles;

    mapping(address => mapping(address => bool)) public userFollows;

    constructor() {
        
    }

    function followUser(address _user) public override {
        require(_user != msg.sender, "Can't follow");
        require(!userFollows[msg.sender][_user], 'Already following');
        userFollows[msg.sender][_user] = true;
        userProfiles[msg.sender].followingCount++;

        emit UserFollowed(msg.sender, _user);
    }

    function unFollowUser(address _user) public override{
        require(userFollows[msg.sender][_user],'Not following');
        userFollows[msg.sender][_user] = false;
        userProfiles[msg.sender].followingCount--;
        userProfiles[_user].followerCount--;
        emit UserUnFollowed(msg.sender,_user);
    }

    function updateProfile(
        string  memory _username,
        string  memory _isfsProfilePic,
        string  memory _bio
    ) public override {
        UserModel.UserProfile storage profile = userProfiles[msg.sender];
        if(profile.joinedTimestamp == 0){
            profile.initialize(_username, _isfsProfilePic, _bio);
        }else{
            profile.username = _username;
            profile.ipfsProfilePic = _isfsProfilePic;
            profile.bio = _bio;
        }
    }

    function getUserProfile(address _user) public view override returns(
        string memory username,
        string memory bio,
        string memory profilePic,
        uint256 reputation,
        bool verified,
        uint256 followerCount,
        uint256 followingCount,
        uint256 joinedAt
    ){
        UserModel.UserProfile storage profile = userProfiles[_user];
        return(
            profile.username,
            profile.bio,
            profile.ipfsProfilePic,
            profile.reputationScore,
            profile.isVerified,
            profile.followerCount,
            profile.followingCount,
            profile.joinedTimestamp
        );
    }
    function isFollowing(address _follower, address _following) public view override returns(bool){
        return userFollows[_follower][_following];
    }

}