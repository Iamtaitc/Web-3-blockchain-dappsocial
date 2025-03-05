pragma solidity ^0.8.20;

import "@openzeppelin/contracts/access/AccessControl.sol";
import "../libraries/PostLibrary.sol";

contract TrendingManager is AccessControl {
    bytes32 public constant POST_MANAGER_ROLE = keccak256("POST_MANAGER_ROLE");

    uint256[] public trendingPosts;
    address public postManagerAddress;

    mapping(uint256 => PostLibrary.Post) private _postsReference;

    constructor() {
        _setupRole(DEFAULT_ADMIN_ROLE, msg.sender);
    }

    function setPostManagerAddress(address _postManagerAddress) external {
        require(hasRole(DEFAULT_ADMIN_ROLE, msg.sender), "Not admin");
        postManagerAddress = _postManagerAddress;
    }

    function updateTrending(uint256 _postId, uint256 _likeCount) public {
        require(hasRole(DEFAULT_ADMIN_ROLE, msg.sender), "Not authorized");

        if(trendingPosts.length < 10){
            trendingPosts.push(_postId);
        }else{
            uint256 minLikes = type(uint256).max;
            uint256 minIndex = 0;
            for(uint256 i = 0; i < trendingPosts.length; i++){
                if(_postsReference[trendingPosts[i]].likeCount < minLikes){
                    minLikes = _postsReference[trendingPosts[i]].likeCount;
                    minIndex = i;
                }
            }
            if(_likeCount > minLikes){
                trendingPosts[minIndex] = _postId;
            }
        }
    }

    function getTrendingPosts() public view returns(uint256[] memory){
        return trendingPosts;
    }
    function getPostLikeCount(uint256 _postId) internal view returns (uint256) {
        // Call a view function on PostManager to get like count
        // We'll define this interface
        IPostLikeCounter postManager = IPostLikeCounter(postManagerAddress);
        return postManager.getPostLikeCount(_postId);
    }
}
interface IPostLikeCounter {
    function getPostLikeCount(uint256 _postId) external view returns (uint256);
}