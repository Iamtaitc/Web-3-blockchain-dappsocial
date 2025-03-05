// SPDX-License-Identifier: MIT
pragma solidity ^0.8.20;

contract SocialNetwork {
    struct Post {
        uint id;
        address author;
        string content;
        uint256 tipAmount;
        uint256 timestamp;
    }

    uint public postCount = 0;
    mapping(uint => Post) public posts;

    event PostCreated(uint id, address author, string content, uint256 tipAmount, uint256 timestamp);

    function creatPost(string memory _content)  public {
        postCount ++;
        posts[postCount] = Post(postCount, msg.sender, _content, 0, block.timestamp);
        emit PostCreated(postCount, msg.sender, _content, 0, block.timestamp);

    }

}