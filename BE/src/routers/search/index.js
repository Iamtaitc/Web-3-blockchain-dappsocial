const express = require('express');
const router = express.Router();
const SearchController = require('../../controllers/search.controller');

// Định nghĩa các route tìm kiếm
router.get('/search', SearchController.search);
router.get('/search/users', SearchController.searchUsers);
router.get('/search/posts', SearchController.searchPosts);
router.get('/search/nfts', SearchController.searchNFTs);
router.get('/search/tags', SearchController.searchTags);
router.get('/search/trending-tags', SearchController.getTrendingTags);

module.exports = router;