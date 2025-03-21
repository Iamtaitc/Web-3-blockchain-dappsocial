/**
 * @swagger
 * components:
 *   schemas:
 *     User:
 *       type: object
 *       required:
 *         - walletAddress
 *         - username
 *       properties:
 *         walletAddress:
 *           type: string
 *           description: Địa chỉ ví của người dùng
 *         username:
 *           type: string
 *           description: Tên người dùng
 *         ensName:
 *           type: string
 *           description: ENS name của người dùng
 *         bio:
 *           type: string
 *           description: Tiểu sử của người dùng
 *         avatarURI:
 *           type: string
 *           description: URI của avatar
 *         coverURI:
 *           type: string
 *           description: URI của ảnh bìa
 *         followerCount:
 *           type: integer
 *           description: Số lượng người theo dõi
 *         followingCount:
 *           type: integer
 *           description: Số lượng người đang theo dõi
 *         postCount:
 *           type: integer
 *           description: Số lượng bài đăng
 *         points:
 *           type: integer
 *           description: Điểm số của người dùng
 *         subscription:
 *           type: object
 *           properties:
 *             level:
 *               type: integer
 *               description: Cấp độ subscription
 *             isActive:
 *               type: boolean
 *               description: Trạng thái subscription
 *             expiration:
 *               type: string
 *               format: date-time
 *               description: Thời gian hết hạn subscription
 *         isVerified:
 *           type: boolean
 *           description: Trạng thái xác thực của người dùng
 *         isFollowing:
 *           type: boolean
 *           description: Người dùng hiện tại có đang theo dõi người dùng này không
 *         createdAt:
 *           type: string
 *           format: date-time
 *           description: Thời gian tạo tài khoản
 *       example:
 *         walletAddress: "0x1234567890abcdef1234567890abcdef12345678"
 *         username: "satoshi"
 *         ensName: "satoshi.eth"
 *         bio: "Blockchain enthusiast"
 *         avatarURI: "https://ipfs.io/ipfs/QmabC123"
 *         coverURI: "https://ipfs.io/ipfs/QmxyzABC"
 *         followerCount: 150
 *         followingCount: 75
 *         postCount: 42
 *         points: 1000
 *         subscription:
 *           level: 2
 *           isActive: true
 *           expiration: "2025-12-31T23:59:59Z"
 *         isVerified: true
 *         isFollowing: false
 *         createdAt: "2023-01-15T08:30:00Z"
 *
 *     UserUpdate:
 *       type: object
 *       properties:
 *         username:
 *           type: string
 *           description: Tên người dùng mới
 *         bio:
 *           type: string
 *           description: Tiểu sử mới
 *       example:
 *         username: "new_username"
 *         bio: "Updated bio information"
 *
 *     FollowerList:
 *       type: object
 *       properties:
 *         followers:
 *           type: array
 *           items:
 *             type: object
 *             properties:
 *               walletAddress:
 *                 type: string
 *               username:
 *                 type: string
 *               avatarURI:
 *                 type: string
 *               followedAt:
 *                 type: string
 *                 format: date-time
 *         pagination:
 *           type: object
 *           properties:
 *             total:
 *               type: integer
 *             page:
 *               type: integer
 *             limit:
 *               type: integer
 *             totalPages:
 *               type: integer
 *
 *     FollowingList:
 *       type: object
 *       properties:
 *         following:
 *           type: array
 *           items:
 *             type: object
 *             properties:
 *               walletAddress:
 *                 type: string
 *               username:
 *                 type: string
 *               avatarURI:
 *                 type: string
 *               followedAt:
 *                 type: string
 *                 format: date-time
 *         pagination:
 *           type: object
 *           properties:
 *             total:
 *               type: integer
 *             page:
 *               type: integer
 *             limit:
 *               type: integer
 *             totalPages:
 *               type: integer
 *
 *     Leaderboard:
 *       type: object
 *       properties:
 *         leaderboard:
 *           type: array
 *           items:
 *             type: object
 *             properties:
 *               walletAddress:
 *                 type: string
 *               username:
 *                 type: string
 *               avatarURI:
 *                 type: string
 *               points:
 *                 type: integer
 *               followerCount:
 *                 type: integer
 *               postCount:
 *                 type: integer
 *               subscriptionLevel:
 *                 type: integer
 *         pagination:
 *           type: object
 *           properties:
 *             total:
 *               type: integer
 *             page:
 *               type: integer
 *             limit:
 *               type: integer
 *             totalPages:
 *               type: integer
 *
 *   responses:
 *     Success:
 *       description: Thành công
 *       content:
 *         application/json:
 *           schema:
 *             type: object
 *             properties:
 *               success:
 *                 type: boolean
 *                 example: true
 *               message:
 *                 type: string
 *               data:
 *                 type: object
 *               timestamp:
 *                 type: string
 *                 format: date-time
 *
 *     BadRequest:
 *       description: Yêu cầu không hợp lệ
 *       content:
 *         application/json:
 *           schema:
 *             type: object
 *             properties:
 *               success:
 *                 type: boolean
 *                 example: false
 *               message:
 *                 type: string
 *               errors:
 *                 type: object
 *               timestamp:
 *                 type: string
 *                 format: date-time
 *
 *     NotFound:
 *       description: Không tìm thấy tài nguyên
 *       content:
 *         application/json:
 *           schema:
 *             type: object
 *             properties:
 *               success:
 *                 type: boolean
 *                 example: false
 *               message:
 *                 type: string
 *                 example: "Resource not found"
 *               timestamp:
 *                 type: string
 *                 format: date-time
 *
 *     ServerError:
 *       description: Lỗi server
 *       content:
 *         application/json:
 *           schema:
 *             type: object
 *             properties:
 *               success:
 *                 type: boolean
 *                 example: false
 *               message:
 *                 type: string
 *                 example: "Internal server error"
 *               errors:
 *                 type: object
 *               timestamp:
 *                 type: string
 *                 format: date-time
 */

/**
 * @swagger
 * /api/user/{id}:
 *   get:
 *     summary: Lấy thông tin profile của người dùng
 *     tags: [Users]
 *     parameters:
 *       - in: path
 *         name: id
 *         schema:
 *           type: string
 *         required: true
 *         description: Địa chỉ ví của người dùng
 *     responses:
 *       200:
 *         description: Thành công
 *         content:
 *           application/json:
 *             schema:
 *               type: object
 *               properties:
 *                 success:
 *                   type: boolean
 *                   example: true
 *                 message:
 *                   type: string
 *                   example: "User profile retrieved successfully"
 *                 data:
 *                   $ref: '#/components/schemas/User'
 *                 timestamp:
 *                   type: string
 *                   format: date-time
 *       404:
 *         $ref: '#/components/responses/NotFound'
 *       500:
 *         $ref: '#/components/responses/ServerError'
 */

/**
 * @swagger
 * /api/user/update:
 *   patch:
 *     summary: Cập nhật thông tin profile của người dùng
 *     tags: [Users]
 *     security:
 *       - bearerAuth: []
 *     requestBody:
 *       required: true
 *       content:
 *         multipart/form-data:
 *           schema:
 *             type: object
 *             properties:
 *               username:
 *                 type: string
 *               bio:
 *                 type: string
 *               avatar:
 *                 type: string
 *                 format: binary
 *               cover:
 *                 type: string
 *                 format: binary
 *     responses:
 *       200:
 *         description: Profile đã được cập nhật thành công
 *         content:
 *           application/json:
 *             schema:
 *               type: object
 *               properties:
 *                 success:
 *                   type: boolean
 *                   example: true
 *                 message:
 *                   type: string
 *                   example: "Profile updated successfully"
 *                 data:
 *                   $ref: '#/components/schemas/User'
 *                 timestamp:
 *                   type: string
 *                   format: date-time
 *       400:
 *         $ref: '#/components/responses/BadRequest'
 *       401:
 *         description: Không được ủy quyền
 *       500:
 *         $ref: '#/components/responses/ServerError'
 */

/**
 * @swagger
 * /api/user/follower/{id}:
 *   post:
 *     summary: Follow một người dùng
 *     tags: [Users]
 *     security:
 *       - bearerAuth: []
 *     parameters:
 *       - in: path
 *         name: id
 *         schema:
 *           type: string
 *         required: true
 *         description: Địa chỉ ví của người dùng muốn follow
 *     responses:
 *       200:
 *         description: Đã follow thành công
 *         content:
 *           application/json:
 *             schema:
 *               type: object
 *               properties:
 *                 success:
 *                   type: boolean
 *                   example: true
 *                 message:
 *                   type: string
 *                   example: "Following user successfully"
 *                 data:
 *                   type: object
 *                   properties:
 *                     follower:
 *                       type: string
 *                     following:
 *                       type: string
 *                 timestamp:
 *                   type: string
 *                   format: date-time
 *       400:
 *         $ref: '#/components/responses/BadRequest'
 *       401:
 *         description: Không được ủy quyền
 *       404:
 *         $ref: '#/components/responses/NotFound'
 *       500:
 *         $ref: '#/components/responses/ServerError'
 */

/**
 * @swagger
 * /api/user/unfollower/{id}:
 *   post:
 *     summary: Unfollow một người dùng
 *     tags: [Users]
 *     security:
 *       - bearerAuth: []
 *     parameters:
 *       - in: path
 *         name: id
 *         schema:
 *           type: string
 *         required: true
 *         description: Địa chỉ ví của người dùng muốn unfollow
 *     responses:
 *       200:
 *         description: Đã unfollow thành công
 *         content:
 *           application/json:
 *             schema:
 *               type: object
 *               properties:
 *                 success:
 *                   type: boolean
 *                   example: true
 *                 message:
 *                   type: string
 *                   example: "Unfollowed successfully"
 *                 data:
 *                   type: object
 *                   properties:
 *                     follower:
 *                       type: string
 *                     following:
 *                       type: string
 *                 timestamp:
 *                   type: string
 *                   format: date-time
 *       401:
 *         description: Không được ủy quyền
 *       404:
 *         $ref: '#/components/responses/NotFound'
 *       500:
 *         $ref: '#/components/responses/ServerError'
 */

/**
 * @swagger
 * /api/user/following:
 *   get:
 *     summary: Lấy danh sách người dùng đang theo dõi
 *     tags: [Users]
 *     security:
 *       - bearerAuth: []
 *     parameters:
 *       - in: query
 *         name: page
 *         schema:
 *           type: integer
 *           default: 1
 *         description: Số trang
 *       - in: query
 *         name: limit
 *         schema:
 *           type: integer
 *           default: 20
 *         description: Số lượng item trên một trang
 *     responses:
 *       200:
 *         description: Danh sách người dùng đang theo dõi
 *         content:
 *           application/json:
 *             schema:
 *               type: object
 *               properties:
 *                 success:
 *                   type: boolean
 *                   example: true
 *                 message:
 *                   type: string
 *                   example: "Following list retrieved successfully"
 *                 data:
 *                   $ref: '#/components/schemas/FollowingList'
 *                 timestamp:
 *                   type: string
 *                   format: date-time
 *       401:
 *         description: Không được ủy quyền
 *       500:
 *         $ref: '#/components/responses/ServerError'
 */

/**
 * @swagger
 * /api/user/followers:
 *   get:
 *     summary: Lấy danh sách người theo dõi
 *     tags: [Users]
 *     security:
 *       - bearerAuth: []
 *     parameters:
 *       - in: query
 *         name: page
 *         schema:
 *           type: integer
 *           default: 1
 *         description: Số trang
 *       - in: query
 *         name: limit
 *         schema:
 *           type: integer
 *           default: 20
 *         description: Số lượng item trên một trang
 *     responses:
 *       200:
 *         description: Danh sách người theo dõi
 *         content:
 *           application/json:
 *             schema:
 *               type: object
 *               properties:
 *                 success:
 *                   type: boolean
 *                   example: true
 *                 message:
 *                   type: string
 *                   example: "Followers retrieved successfully"
 *                 data:
 *                   $ref: '#/components/schemas/FollowerList'
 *                 timestamp:
 *                   type: string
 *                   format: date-time
 *       401:
 *         description: Không được ủy quyền
 *       500:
 *         $ref: '#/components/responses/ServerError'
 */

/**
 * @swagger
 * /api/user/leaderboard:
 *   get:
 *     summary: Lấy bảng xếp hạng người dùng
 *     tags: [Users]
 *     parameters:
 *       - in: query
 *         name: page
 *         schema:
 *           type: integer
 *           default: 1
 *         description: Số trang
 *       - in: query
 *         name: limit
 *         schema:
 *           type: integer
 *           default: 20
 *         description: Số lượng item trên một trang
 *     responses:
 *       200:
 *         description: Bảng xếp hạng người dùng
 *         content:
 *           application/json:
 *             schema:
 *               $ref: '#/components/schemas/Leaderboard'
 *       500:
 *         $ref: '#/components/responses/ServerError'
 */
