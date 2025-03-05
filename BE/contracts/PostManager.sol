// SPDX-License-Identifier: MIT
pragma solidity ^0.8.20;

import "@openzeppelin/contracts/access/AccessControl.sol";
import "@openzeppelin/contracts/token/ERC20/IERC20.sol";
import "@openzeppelin/contracts/token/ERC20/utils/SafeERC20.sol";
import "@openzeppelin/contracts/security/ReentrancyGuard.sol";
import "@openzeppelin/contracts/utils/Counters.sol";
import "./libraries/PostLibrary.sol";
import "./utils/ArrayTools.sol";
import "./interfaces/IPostManager.sol";
import "./modules/CommentManager.sol";
import "./modules/SocialManager.sol";
import "./modules/ModerationManager.sol";
import "./modules/RewardManager.sol";
import "./modules/TrendingManager.sol";
import "./modules/CheckInSystem.sol";
import "./modules/PremiumManager.sol";

contract PostManager is IPostManager, AccessControl, ReentrancyGuard {
    using SafeERC20 for IERC20;
    using Counters for Counters.Counter;
    using PostLibrary for PostLibrary.Post;
    using ArrayTools for uint256[];

    // Roles
    bytes32 public constant MODERATOR_ROLE = keccak256("MODERATOR_ROLE");
    bytes32 public constant PREMIUM_MANAGER_ROLE =
        keccak256("PREMIUM_MANAGER_ROLE");

    // Counters
    Counters.Counter private _postIdCounter;

    // Post storage
    mapping(uint256 => PostLibrary.Post) public posts;

    // User post mappings
    mapping(address => uint256[]) public userPosts;
    mapping(address => uint256[]) public userDrafts;

    // Post categorization
    mapping(string => uint256[]) public categoryPosts;
    mapping(string => uint256[]) public tagPosts;

    // User interactions
    mapping(address => mapping(uint256 => bool)) public userLikes;
    mapping(address => uint256[]) public userBookmarks;
    mapping(uint256 => address[]) public postReaders;
    mapping(address => mapping(uint256 => bool)) public hasRead;

    // Module contracts
    CommentManager public commentManager;
    SocialManager public socialManager;
    ModerationManager public moderationManager;
    RewardManager public rewardManager;
    TrendingManager public trendingManager;
    CheckInSystem public checkInSystem;
    PremiumManager public premiumManager;

    // Events
    event PostCommentCountIncremented(uint256 postId, uint256 newCount);

    constructor(address _rewardToken) {
        _setupRole(DEFAULT_ADMIN_ROLE, msg.sender);

        // Initialize modules
        rewardManager = new RewardManager(_rewardToken);
        commentManager = new CommentManager();
        socialManager = new SocialManager();
        moderationManager = new ModerationManager();
        trendingManager = new TrendingManager();
        checkInSystem = new CheckInSystem(address(rewardManager));

        // Set treasury address for premium payments
        address treasury = msg.sender; // Or a dedicated treasury address

        // Initialize PremiumManager
        premiumManager = new PremiumManager(
            _rewardToken,
            treasury,
            address(checkInSystem)
        );

        // Set up roles
        _setupRole(MODERATOR_ROLE, msg.sender);
        _setupRole(PREMIUM_MANAGER_ROLE, msg.sender);

        // Grant roles to modules
        rewardManager.grantRole(
            rewardManager.POST_MANAGER_ROLE(),
            address(this)
        );
        rewardManager.grantRole(
            rewardManager.COMMENT_MANAGER_ROLE(),
            address(commentManager)
        );
        rewardManager.grantRole(
            rewardManager.CHECKIN_SYSTEM_ROLE(),
            address(checkInSystem)
        );

        trendingManager.grantRole(
            trendingManager.POST_MANAGER_ROLE(),
            address(this)
        );

        checkInSystem.grantRole(
            checkInSystem.PREMIUM_MANAGER_ROLE(),
            address(this)
        );
        checkInSystem.grantRole(
            checkInSystem.PREMIUM_MANAGER_ROLE(),
            address(premiumManager)
        );

        // Set module references
        commentManager.setPostManagerAddress(address(this));
        moderationManager.setPostManagerAddress(address(this));
        trendingManager.setPostManagerAddress(address(this));
    }

    // ============ Post Management Functions ============

    /**
     * @notice Creates a new post
     * @param _ipfsHash IPFS hash of the post content
     * @param _title Post title
     * @param _tags Post tags
     * @param _status Post status
     * @param _contentType Content type
     * @param _category Category
     * @param _location Location
     * @param _isAnonymous Whether post is anonymous
     * @param _isFeatured Whether post is featured
     * @param _isNFT Whether post is NFT
     * @return New post ID
     */
    function createPost(
        string memory _ipfsHash,
        string memory _title,
        string[] memory _tags,
        PostLibrary.PostStatus _status,
        PostLibrary.ContentType _contentType,
        string memory _category,
        string memory _location,
        bool _isAnonymous,
        bool _isFeatured,
        bool _isNFT
    ) public override nonReentrant returns (uint256) {
        _postIdCounter.increment();
        uint256 newPostId = _postIdCounter.current();

        PostLibrary.Post storage newPost = posts[newPostId];
        newPost.initialize(
            newPostId,
            _ipfsHash,
            _title,
            _tags,
            msg.sender,
            _status,
            _contentType,
            _category,
            _location,
            _isAnonymous,
            _isFeatured,
            _isNFT
        );

        if (_status == PostLibrary.PostStatus.Draft) {
            userDrafts[msg.sender].push(newPostId);
        } else if (_status == PostLibrary.PostStatus.Published) {
            userPosts[msg.sender].push(newPostId);
            categoryPosts[_category].push(newPostId);

            for (uint i = 0; i < _tags.length; i++) {
                tagPosts[_tags[i]].push(newPostId);
            }

            // Reward post creation if published and not anonymous
            if (!_isAnonymous) {
                rewardManager.rewardPostCreation(msg.sender);
            }
        }

        emit PostCreated(newPostId, _ipfsHash, msg.sender, block.timestamp);
        return newPostId;
    }

    /**
     * @notice Updates an existing post
     * @param _postId Post ID
     * @param _ipfsHash New IPFS hash
     * @param _title New title
     * @param _tags New tags
     * @param _category New category
     * @param _location New location
     * @param _status New status
     */
    function updatePost(
        uint256 _postId,
        string memory _ipfsHash,
        string memory _title,
        string[] memory _tags,
        string memory _category,
        string memory _location,
        PostLibrary.PostStatus _status
    ) public override {
        require(
            _postId > 0 && _postId <= _postIdCounter.current(),
            "Invalid post id"
        );

        PostLibrary.Post storage post = posts[_postId];
        require(
            post.author == msg.sender ||
                hasRole(DEFAULT_ADMIN_ROLE, msg.sender),
            "Not authorized"
        );

        // Update post details
        post.ipfsHash = _ipfsHash;
        post.title = _title;
        post.tags = _tags;
        post.category = _category;
        post.location = _location;

        // Handle status change from Draft to Published
        if (
            post.status == PostLibrary.PostStatus.Draft &&
            _status == PostLibrary.PostStatus.Published
        ) {
            userDrafts[msg.sender].removeValue(_postId);
            userPosts[msg.sender].push(_postId);
            categoryPosts[_category].push(_postId);

            for (uint i = 0; i < _tags.length; i++) {
                tagPosts[_tags[i]].push(_postId);
            }

            // Reward post creation when publishing from draft
            if (!post.isAnonymous) {
                rewardManager.rewardPostCreation(msg.sender);
            }
        }

        post.status = _status;
        emit PostUpdated(_postId, _ipfsHash);
        emit PostStatusChanged(_postId, _status);
    }

    /**
     * @notice Likes a post
     * @param _postId Post ID
     */
    function likePost(uint256 _postId) public override {
        require(
            _postId > 0 && _postId <= _postIdCounter.current(),
            "Invalid post id"
        );
        require(!userLikes[msg.sender][_postId], "Already liked");

        PostLibrary.Post storage post = posts[_postId];
        require(
            post.status == PostLibrary.PostStatus.Published,
            "Post not published"
        );

        post.likeCount++;
        userLikes[msg.sender][_postId] = true;

        // Check if post reached like threshold for rewards
        if (
            post.likeCount == rewardManager.likeThreshold() && !post.isAnonymous
        ) {
            rewardManager.rewardLikeThreshold(post.author);
        }

        // Update trending posts
        trendingManager.updateTrending(_postId, post.likeCount);

        emit PostLiked(_postId, msg.sender);
    }

    /**
     * @notice Unlikes a post
     * @param _postId Post ID
     */
    function unlikePost(uint256 _postId) public override {
        require(
            _postId > 0 && _postId <= _postIdCounter.current(),
            "Invalid post id"
        );
        require(userLikes[msg.sender][_postId], "Haven't liked");

        PostLibrary.Post storage post = posts[_postId];
        require(
            post.status == PostLibrary.PostStatus.Published,
            "Post not published"
        );

        post.likeCount--;
        userLikes[msg.sender][_postId] = false;

        emit PostUnliked(_postId, msg.sender);
    }

    /**
     * @notice Reposts content
     * @param _postId Post ID to repost
     */
    function repostContent(uint256 _postId) public override {
        require(
            _postId > 0 && _postId <= _postIdCounter.current(),
            "Invalid post id"
        );

        PostLibrary.Post storage originalPost = posts[_postId];
        require(
            originalPost.status == PostLibrary.PostStatus.Published,
            "Post not published"
        );

        originalPost.repostCount++;

        _postIdCounter.increment();
        uint256 newPostId = _postIdCounter.current();

        PostLibrary.Post storage newPost = posts[newPostId];
        newPost.initialize(
            newPostId,
            originalPost.ipfsHash,
            string(abi.encodePacked("Repost: ", originalPost.title)),
            originalPost.tags,
            msg.sender,
            PostLibrary.PostStatus.Published,
            originalPost.contentType,
            originalPost.category,
            originalPost.location,
            false,
            false,
            originalPost.isNFT
        );

        userPosts[msg.sender].push(newPostId);
        categoryPosts[originalPost.category].push(newPostId);

        for (uint i = 0; i < originalPost.tags.length; i++) {
            tagPosts[originalPost.tags[i]].push(newPostId);
        }

        emit PostReposted(_postId, msg.sender);
    }

    /**
     * @notice Bookmarks a post
     * @param _postId Post ID
     */
    function bookmarkPost(uint256 _postId) public override {
        require(
            _postId > 0 && _postId <= _postIdCounter.current(),
            "Invalid post id"
        );
        require(
            posts[_postId].status == PostLibrary.PostStatus.Published,
            "Post not published"
        );

        // Check if already bookmarked
        uint256[] storage bookmarks = userBookmarks[msg.sender];
        for (uint i = 0; i < bookmarks.length; i++) {
            if (bookmarks[i] == _postId) revert("Already bookmarked");
        }

        bookmarks.push(_postId);
        emit PostBookmarked(_postId, msg.sender);
    }

    /**
     * @notice Removes a bookmark
     * @param _postId Post ID
     */
    function removeBookmark(uint256 _postId) public override {
        userBookmarks[msg.sender].removeValue(_postId);
        emit PostUnbookmarked(_postId, msg.sender);
    }

    /**
     * @notice Marks a post as read
     * @param _postId Post ID
     */
    function markAsRead(uint256 _postId) public override {
        require(
            _postId > 0 && _postId <= _postIdCounter.current(),
            "Invalid post id"
        );
        require(!hasRead[msg.sender][_postId], "Already marked as read");

        hasRead[msg.sender][_postId] = true;
        postReaders[_postId].push(msg.sender);
        posts[_postId].viewCount++;
    }

    // ============ Premium and Check-In Functions ============

    /**
     * @notice User performs daily check-in
     */
    function dailyCheckIn() public {
        checkInSystem.checkIn();
    }

    /**
     * @notice Set premium status for a user
     * @param _user User address
     * @param _isPremium New premium status
     * @param _durationInDays Premium subscription duration in days
     */
    function setPremiumStatus(
        address _user,
        bool _isPremium,
        uint256 _durationInDays
    ) public {
        require(
            hasRole(DEFAULT_ADMIN_ROLE, msg.sender) ||
                hasRole(PREMIUM_MANAGER_ROLE, msg.sender),
            "Not authorized"
        );

        checkInSystem.setPremiumStatus(_user, _isPremium, _durationInDays);
    }

    /**
     * @notice Purchase premium subscription
     * @param _durationInDays Duration in days (30, 180, or 365)
     */
    function purchasePremium(uint256 _durationInDays) public {
        premiumManager.purchasePremium(_durationInDays);
    }

    /**
     * @notice Renew premium subscription
     * @param _durationInDays Duration in days (30, 180, or 365)
     */
    function renewPremium(uint256 _durationInDays) public {
        premiumManager.renewPremium(_durationInDays);
    }

    /**
     * @notice Cancel premium subscription
     */
    function cancelPremium() public {
        premiumManager.cancelPremium();
    }

    /**
     * @notice Configure check-in reward parameters
     * @param _baseReward Base reward amount
     * @param _premiumBonus Premium bonus percentage
     * @param _maxConsecutiveDays Maximum consecutive days for bonuses
     */
    function configureCheckInReward(
        uint256 _baseReward,
        uint256 _premiumBonus,
        uint256 _maxConsecutiveDays
    ) public {
        require(hasRole(DEFAULT_ADMIN_ROLE, msg.sender), "Not admin");

        checkInSystem.configureCheckInReward(
            _baseReward,
            _premiumBonus,
            _maxConsecutiveDays
        );
    }

    // ============ Interface Implementation Functions ============

    /**
     * @notice Gets post like count (used by TrendingManager)
     * @param _postId Post ID
     * @return Post like count
     */
    function getPostLikeCount(uint256 _postId) public view returns (uint256) {
        require(
            _postId > 0 && _postId <= _postIdCounter.current(),
            "Post doesn't exist"
        );
        return posts[_postId].likeCount;
    }

    /**
     * @notice Checks if post exists
     * @param _postId Post ID
     * @return Whether post exists
     */
    function postExists(uint256 _postId) public view returns (bool) {
        return _postId > 0 && _postId <= _postIdCounter.current();
    }

    /**
     * @notice Checks if post is published
     * @param _postId Post ID
     * @return Whether post is published
     */
    function isPostPublished(uint256 _postId) public view returns (bool) {
        if (!postExists(_postId)) return false;
        return posts[_postId].status == PostLibrary.PostStatus.Published;
    }

    /**
     * @notice Archives a post (moderator only)
     * @param _postId Post ID
     */
    function archivePost(uint256 _postId) public {
        require(
            hasRole(MODERATOR_ROLE, msg.sender) ||
                hasRole(DEFAULT_ADMIN_ROLE, msg.sender),
            "Not authorized"
        );
        require(postExists(_postId), "Post doesn't exist");

        posts[_postId].status = PostLibrary.PostStatus.Archived;
        emit PostStatusChanged(_postId, PostLibrary.PostStatus.Archived);
    }

    /**
     * @notice Sets post featured status
     * @param _postId Post ID
     * @param _featured Whether post is featured
     */
    function setPostFeaturedStatus(uint256 _postId, bool _featured) public {
        require(
            hasRole(MODERATOR_ROLE, msg.sender) ||
                hasRole(DEFAULT_ADMIN_ROLE, msg.sender),
            "Not authorized"
        );
        require(postExists(_postId), "Post doesn't exist");

        posts[_postId].isFeatured = _featured;
    }

    /**
     * @notice Increments post comment count (only called by CommentManager)
     * @param _postId Post ID
     */
    function incrementCommentCount(uint256 _postId) public {
        require(
            msg.sender == address(commentManager),
            "Only CommentManager can call this"
        );
        require(postExists(_postId), "Post doesn't exist");

        posts[_postId].commentCount++;
        emit PostCommentCountIncremented(_postId, posts[_postId].commentCount);
    }

    // ============ View Functions ============

    function getPostsByUser(
        address _user
    ) public view override returns (uint256[] memory) {
        return userPosts[_user];
    }

    function getDraftsByUser(
        address _user
    ) public view override returns (uint256[] memory) {
        require(
            _user == msg.sender || hasRole(DEFAULT_ADMIN_ROLE, msg.sender),
            "Not authorized"
        );
        return userDrafts[_user];
    }

    function getBookmarks(
        address _user
    ) public view override returns (uint256[] memory) {
        require(_user == msg.sender, "Not authorized");
        return userBookmarks[_user];
    }

    function getPostsByCategory(
        string memory _category
    ) public view override returns (uint256[] memory) {
        return categoryPosts[_category];
    }

    function getPostsByTag(
        string memory _tag
    ) public view override returns (uint256[] memory) {
        return tagPosts[_tag];
    }

    function getTrendingPosts()
        public
        view
        override
        returns (uint256[] memory)
    {
        return trendingManager.getTrendingPosts();
    }

    function getFeaturedPosts()
        public
        view
        override
        returns (uint256[] memory)
    {
        return moderationManager.getFeaturedPosts();
    }

    function hasUserLikedPost(
        address _user,
        uint256 _postId
    ) public view override returns (bool) {
        return userLikes[_user][_postId];
    }

    function getReadStatus(
        address _user,
        uint256 _postId
    ) public view override returns (bool) {
        return hasRead[_user][_postId];
    }

    /**
     * @notice Gets user premium status
     * @param _user User address
     * @return isPremium Whether user has premium
     * @return premiumExpiry When premium expires
     */
    function getUserPremiumStatus(
        address _user
    ) public view returns (bool isPremium, uint256 premiumExpiry) {
        (, , , isPremium, premiumExpiry) = checkInSystem.getUserCheckInInfo(
            _user
        );

        return (isPremium, premiumExpiry);
    }

    function getUserPremiumDetails(
        address _user
    )
        public
        view
        returns (
            bool isActive,
            uint256 startDate,
            uint256 endDate,
            uint256 totalSpent,
            uint256 lastRenewal
        )
    {
        return premiumManager.getUserPremiumDetails(_user);
    }

    function getUserCheckInInfo(
        address _user
    )
        public
        view
        returns (
            uint256 lastCheckIn,
            uint256 consecutiveDays,
            uint256 totalCheckIns,
            bool isPremium,
            uint256 premiumExpiry
        )
    {
        return checkInSystem.getUserCheckInInfo(_user);
    }

    /**
     * @notice Checks if user can check in today
     * @param _user User address
     * @return Whether user can check in today
     */
    function canCheckInToday(address _user) public view returns (bool) {
        return checkInSystem.canCheckInToday(_user);
    }
}
