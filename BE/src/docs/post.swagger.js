/**
 * @swagger
 * components:
 *   schemas:
 *     Post:
 *       type: object
 *       properties:
 *         id:
 *           type: string
 *           description: The post ID
 *         author:
 *           type: string
 *           description: Wallet address of the author
 *         content:
 *           type: string
 *           description: The post content
 *         contentURI:
 *           type: string
 *           description: The URI of the post content
 *         media:
 *           type: array
 *           items:
 *             type: object
 *             properties:
 *               uri:
 *                 type: string
 *               type:
 *                 type: string
 *           description: Media files attached to the post
 *         tags:
 *           type: array
 *           items:
 *             type: string
 *           description: Tags associated with the post
 *         mentions:
 *           type: array
 *           items:
 *             type: string
 *           description: Users mentioned in the post
 *         likeCount:
 *           type: integer
 *           description: Number of likes on the post
 *         commentCount:
 *           type: integer
 *           description: Number of comments on the post
 *         saveCount:
 *           type: integer
 *           description: Number of saves on the post
 *         viewCount:
 *           type: integer
 *           description: Number of views on the post
 *         trendingScore:
 *           type: number
 *           description: Trending score of the post
 *         isLiked:
 *           type: boolean
 *           description: Whether the current user has liked the post
 *         isSaved:
 *           type: boolean
 *           description: Whether the current user has saved the post
 *         createdAt:
 *           type: string
 *           format: date-time
 *           description: Post creation date and time
 *     ApiResponse:
 *       type: object
 *       properties:
 *         success:
 *           type: boolean
 *           description: Indicates if the request was successful
 *         data:
 *           type: object
 *           description: Response data
 *         message:
 *           type: string
 *           description: Response message
 *         status:
 *           type: integer
 *           description: HTTP status code
 *     PaginationResponse:
 *       type: object
 *       properties:
 *         posts:
 *           type: array
 *           items:
 *             $ref: '#/components/schemas/Post'
 *         pagination:
 *           type: object
 *           properties:
 *             total:
 *               type: integer
 *               description: Total number of posts
 *             page:
 *               type: integer
 *               description: Current page number
 *             limit:
 *               type: integer
 *               description: Number of posts per page
 *             pages:
 *               type: integer
 *               description: Total number of pages
 *   securitySchemes:
 *     bearerAuth:
 *       type: http
 *       scheme: bearer
 *       bearerFormat: JWT
 * 
 * tags:
 *   - name: Posts
 *     description: Operations related to posts
 */

/**
 * @swagger
 * /api/post/user/{address}:
 *   get:
 *     summary: Get posts by user address
 *     tags: [Posts]
 *     parameters:
 *       - name: address
 *         in: path
 *         required: true
 *         schema:
 *           type: string
 *         description: Wallet address of the user
 *     responses:
 *       200:
 *         description: List of posts by the user
 *         content:
 *           application/json:
 *             schema:
 *               $ref: '#/components/schemas/ApiResponse'
 *       500:
 *         description: Server error
 */

/**
 * @swagger
 * /api/post/{postId}:
 *   get:
 *     summary: Get post by ID
 *     tags: [Posts]
 *     parameters:
 *       - name: postId
 *         in: path
 *         required: true
 *         schema:
 *           type: string
 *         description: ID of the post
 *     responses:
 *       200:
 *         description: Post details
 *         content:
 *           application/json:
 *             schema:
 *               $ref: '#/components/schemas/ApiResponse'
 *       500:
 *         description: Server error
 */

/**
 * @swagger
 * /api/post/create:
 *   post:
 *     summary: Create a new post
 *     tags: [Posts]
 *     security:
 *       - bearerAuth: []
 *     requestBody:
 *       required: true
 *       content:
 *         multipart/form-data:
 *           schema:
 *             type: object
 *             properties:
 *               content:
 *                 type: string
 *                 description: Post content
 *               tags:
 *                 type: array
 *                 items:
 *                   type: string
 *                 description: Tags for the post
 *               mentions:
 *                 type: array
 *                 items:
 *                   type: string
 *                 description: User mentions in the post
 *               media:
 *                 type: array
 *                 items:
 *                   type: string
 *                   format: binary
 *                 description: Media files to upload
 *     responses:
 *       201:
 *         description: Post created successfully
 *         content:
 *           application/json:
 *             schema:
 *               $ref: '#/components/schemas/ApiResponse'
 *       400:
 *         description: Invalid request data
 *       500:
 *         description: Server error
 */

/**
 * @swagger
 * /api/post/{postId}/like:
 *   patch:
 *     summary: Like a post
 *     tags: [Posts]
 *     security:
 *       - bearerAuth: []
 *     parameters:
 *       - name: postId
 *         in: path
 *         required: true
 *         schema:
 *           type: string
 *         description: ID of the post to like
 *     responses:
 *       200:
 *         description: Post liked successfully
 *         content:
 *           application/json:
 *             schema:
 *               $ref: '#/components/schemas/ApiResponse'
 *       404:
 *         description: Post not found
 *       500:
 *         description: Server error
 */

/**
 * @swagger
 * /api/post/{postId}/unlike:
 *   patch:
 *     summary: Unlike a post
 *     tags: [Posts]
 *     security:
 *       - bearerAuth: []
 *     parameters:
 *       - name: postId
 *         in: path
 *         required: true
 *         schema:
 *           type: string
 *         description: ID of the post to unlike
 *     responses:
 *       200:
 *         description: Post unliked successfully
 *         content:
 *           application/json:
 *             schema:
 *               $ref: '#/components/schemas/ApiResponse'
 *       404:
 *         description: Post not found or like not found
 *       500:
 *         description: Server error
 */

/**
 * @swagger
 * /api/post/{postId}/save:
 *   patch:
 *     summary: Save a post
 *     tags: [Posts]
 *     security:
 *       - bearerAuth: []
 *     parameters:
 *       - name: postId
 *         in: path
 *         required: true
 *         schema:
 *           type: string
 *         description: ID of the post to save
 *     responses:
 *       200:
 *         description: Post saved successfully
 *         content:
 *           application/json:
 *             schema:
 *               $ref: '#/components/schemas/ApiResponse'
 *       404:
 *         description: Post not found
 *       500:
 *         description: Server error
 */

/**
 * @swagger
 * /api/post/{postId}/unsave:
 *   patch:
 *     summary: Unsave a post
 *     tags: [Posts]
 *     security:
 *       - bearerAuth: []
 *     parameters:
 *       - name: postId
 *         in: path
 *         required: true
 *         schema:
 *           type: string
 *         description: ID of the post to unsave
 *     responses:
 *       200:
 *         description: Post unsaved successfully
 *         content:
 *           application/json:
 *             schema:
 *               $ref: '#/components/schemas/ApiResponse'
 *       404:
 *         description: Post not found or save not found
 *       500:
 *         description: Server error
 */

/**
 * @swagger
 * /api/post/save/posts:
 *   get:
 *     summary: Get saved posts
 *     tags: [Posts]
 *     security:
 *       - bearerAuth: []
 *     parameters:
 *       - name: page
 *         in: query
 *         schema:
 *           type: integer
 *           default: 1
 *         description: Page number
 *       - name: limit
 *         in: query
 *         schema:
 *           type: integer
 *           default: 20
 *         description: Number of posts per page
 *     responses:
 *       200:
 *         description: List of saved posts
 *         content:
 *           application/json:
 *             schema:
 *               $ref: '#/components/schemas/ApiResponse'
 *       500:
 *         description: Server error
 */

/**
 * @swagger
 * /api/post/all:
 *   get:
 *     summary: Get all posts
 *     tags: [Posts]
 *     parameters:
 *       - name: page
 *         in: query
 *         schema:
 *           type: integer
 *           default: 1
 *         description: Page number
 *       - name: limit
 *         in: query
 *         schema:
 *           type: integer
 *           default: 20
 *         description: Number of posts per page
 *     responses:
 *       200:
 *         description: List of all posts
 *         content:
 *           application/json:
 *             schema:
 *               $ref: '#/components/schemas/PaginationResponse'
 *       500:
 *         description: Server error
 */

/**
 * @swagger
 * /api/post/trending:
 *   get:
 *     summary: Get trending posts
 *     tags: [Posts]
 *     security:
 *       - bearerAuth: []
 *     parameters:
 *       - name: page
 *         in: query
 *         schema:
 *           type: integer
 *           default: 1
 *         description: Page number
 *       - name: limit
 *         in: query
 *         schema:
 *           type: integer
 *           default: 20
 *         description: Number of posts per page
 *     responses:
 *       200:
 *         description: List of trending posts
 *         content:
 *           application/json:
 *             schema:
 *               $ref: '#/components/schemas/PaginationResponse'
 *       500:
 *         description: Server error
 */