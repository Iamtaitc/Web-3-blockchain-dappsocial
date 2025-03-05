// SPDX-License-Identifier: MIT
pragma solidity ^0.8.20;

import "../libraries/PostLibrary.sol";

interface IPostModeration {
    function changePostStatus(uint256 _postId, PostLibrary.PostStatus _status) external;
    function setPostFeatured(uint256 _postId, bool _isFeatured) external;
    function banPost(uint256 _postId, string calldata _reason) external;
    function restorePost(uint256 _postId) external;
}