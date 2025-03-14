const User = require("../models/User.mongoose");
const Post = require("../models/Post.mongoose");
const NFTCache = require("../models/NFTCache.mongoose");
const ipfsService = require("../services/ipfs.services");

// Search everything
exports.search = async (req, res) => {
  try {
    const { query, type, limit } = req.query;

    if (!query || query.length < 2) {
      return res.status(400).json({ error: "Search query too short" });
    }

    const resultLimit = parseInt(limit) || 10;

    // Prepare response object
    const results = {
      users: [],
      posts: [],
      nfts: [],
      tags: [],
    };

    // Filter by type if specified
    if (!type || type === "users") {
      // Search users
      const users = await User.find({
        $or: [
          { username: { $regex: query, $options: "i" } },
          { ensName: { $regex: query, $options: "i" } },
          { bio: { $regex: query, $options: "i" } },
        ],
        status: "active",
      })
        .select("walletAddress username ensName avatarURI bio isVerified")
        .limit(resultLimit);

      results.users = users.map((user) => ({
        walletAddress: user.walletAddress,
        username: user.username,
        ensName: user.ensName,
        avatarURI: user.avatarURI
          ? ipfsService.formatIPFSUrl(user.avatarURI)
          : null,
        bio: user.bio,
        isVerified: user.isVerified,
      }));
    }

    if (!type || type === "posts") {
      // Search posts
      const posts = await Post.find({
        $or: [
          { content: { $regex: query, $options: "i" } },
          { tags: { $regex: query, $options: "i" } },
        ],
        status: "active",
      })
        .sort({ createdAt: -1 })
        .limit(resultLimit);

      // Get authors
      const authorAddresses = [...new Set(posts.map((post) => post.author))];
      const authors = await User.find({
        walletAddress: { $in: authorAddresses },
      }).select("walletAddress username avatarURI isVerified");

      const authorsMap = {};
      authors.forEach((author) => {
        authorsMap[author.walletAddress] = author;
      });

      results.posts = await Promise.all(
        posts.map(async (post) => {
          const author = authorsMap[post.author];

          return {
            _id: post._id,
            author: post.author,
            authorDetails: author
              ? {
                  username: author.username,
                  avatarURI: author.avatarURI
                    ? ipfsService.formatIPFSUrl(author.avatarURI)
                    : null,
                  isVerified: author.isVerified,
                }
              : null,
            content: post.content,
            contentURI: post.contentURI,
            media: post.media.map((media) => ({
              ...media,
              uri: ipfsService.formatIPFSUrl(media.uri),
            })),
            tags: post.tags,
            likeCount: post.likeCount,
            commentCount: post.commentCount,
            createdAt: post.createdAt,
          };
        })
      );
    }

    if (!type || type === "nfts") {
      // Search NFTs
      const nfts = await NFTCache.find({
        $or: [
          { "metadata.name": { $regex: query, $options: "i" } },
          { "metadata.description": { $regex: query, $options: "i" } },
        ],
      })
        .sort({ mintedAt: -1 })
        .limit(resultLimit);

      results.nfts = nfts.map((nft) => ({
        tokenId: nft.tokenId,
        creator: nft.creator,
        owner: nft.owner,
        metadata: {
          name: nft.metadata.name,
          description: nft.metadata.description,
          image: nft.metadata.image
            ? ipfsService.formatIPFSUrl(nft.metadata.image)
            : null,
        },
        mediaType: nft.mediaType,
        forSale: nft.forSale,
        price: nft.price,
        mintedAt: nft.mintedAt,
      }));
    }

    if (!type || type === "tags") {
      // Search popular tags matching query
      const tagsAggregation = await Post.aggregate([
        {
          $match: { tags: { $regex: query, $options: "i" }, status: "active" },
        },
        { $unwind: "$tags" },
        { $match: { tags: { $regex: query, $options: "i" } } },
        { $group: { _id: "$tags", count: { $sum: 1 } } },
        { $sort: { count: -1 } },
        { $limit: resultLimit },
      ]);

      results.tags = tagsAggregation.map((tag) => ({
        name: tag._id,
        postCount: tag.count,
      }));
    }

    res.status(200).json(results);
  } catch (error) {
    console.error("Error searching:", error);
    res.status(500).json({ error: "Server error" });
  }
};

// Search users only
exports.searchUsers = async (req, res) => {
  try {
    const { query } = req.query;

    if (!query || query.length < 2) {
      return res.status(400).json({ error: "Search query too short" });
    }

    const users = await User.find({
      $or: [
        { username: { $regex: query, $options: "i" } },
        { ensName: { $regex: query, $options: "i" } },
        { bio: { $regex: query, $options: "i" } },
      ],
      status: "active",
    })
      .select(
        "walletAddress username ensName avatarURI bio followerCount isVerified"
      )
      .sort({ followerCount: -1 })
      .limit(20);

    const formattedUsers = users.map((user) => ({
      walletAddress: user.walletAddress,
      username: user.username,
      ensName: user.ensName,
      avatarURI: user.avatarURI
        ? ipfsService.formatIPFSUrl(user.avatarURI)
        : null,
      bio: user.bio,
      followerCount: user.followerCount,
      isVerified: user.isVerified,
    }));

    res.status(200).json({ users: formattedUsers });
  } catch (error) {
    console.error("Error searching users:", error);
    res.status(500).json({ error: "Server error" });
  }
};

// Search by tag
exports.searchByTag = async (req, res) => {
  try {
    const { tag } = req.params;
    const page = parseInt(req.query.page) || 1;
    const limit = parseInt(req.query.limit) || 20;
    const skip = (page - 1) * limit;

    // Search posts with this tag
    const posts = await Post.find({
      tags: tag,
      status: "active",
    })
      .sort({ createdAt: -1 })
      .skip(skip)
      .limit(limit);

    // Get authors
    const authorAddresses = [...new Set(posts.map((post) => post.author))];
    const authors = await User.find({
      walletAddress: { $in: authorAddresses },
    }).select("walletAddress username avatarURI isVerified");

    const authorsMap = {};
    authors.forEach((author) => {
      authorsMap[author.walletAddress] = author;
    });

    const formattedPosts = await Promise.all(
      posts.map(async (post) => {
        const author = authorsMap[post.author];

        let isLiked = false;
        let isSaved = false;

        if (req.user) {
          const address = req.user.address;

          isLiked = await Like.exists({
            user: address.toLowerCase(),
            postId: post._id,
          });

          isSaved = await SavedPost.exists({
            user: address.toLowerCase(),
            postId: post._id,
          });
        }

        return {
          _id: post._id,
          author: post.author,
          authorDetails: author
            ? {
                username: author.username,
                avatarURI: author.avatarURI
                  ? ipfsService.formatIPFSUrl(author.avatarURI)
                  : null,
                isVerified: author.isVerified,
              }
            : null,
          content: post.content,
          contentURI: post.contentURI,
          media: post.media.map((media) => ({
            ...media,
            uri: ipfsService.formatIPFSUrl(media.uri),
          })),
          tags: post.tags,
          likeCount: post.likeCount,
          commentCount: post.commentCount,
          saveCount: post.saveCount,
          isLiked,
          isSaved,
          createdAt: post.createdAt,
        };
      })
    );

    // Get total for pagination
    const total = await Post.countDocuments({
      tags: tag,
      status: "active",
    });

    res.status(200).json({
      tag,
      posts: formattedPosts,
      pagination: {
        total,
        page,
        limit,
        pages: Math.ceil(total / limit),
      },
    });
  } catch (error) {
    console.error("Error searching by tag:", error);
    res.status(500).json({ error: "Server error" });
  }
};
