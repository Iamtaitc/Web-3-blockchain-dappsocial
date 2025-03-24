"use strict";
const express = require('express');
const router = express.Router();

const postController = require("../../controllers/post.controller");

router.get("/post/user/:address", postController.getPostUser);
router.get("/post/:postId", postController.getIdPost);
router.post("/post/create", postController.createPost);

router.patch("/post/:postId/like", postController.likePost);
router.patch("/post/:postId/unlike", postController.unlikePost);
router.patch("/post/:postId/save", postController.savePost);
router.patch("/post/:postId/unsave", postController.unsavePost);
router.get("/post/save/posts", postController.getSavedPosts);
router.get("/post/all", postController.getAllPosts);
router.get("/post/trending", postController.getTrendingPosts);

module.exports = router;
