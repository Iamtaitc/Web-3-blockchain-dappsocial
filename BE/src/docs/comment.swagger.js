/**
 * @swagger
 * openapi: 3.0.0
 * info:
 *   title: Comments API
 *   description: API để quản lý bình luận và phản hồi
 *   version: 1.0.0
 * servers:
 *   - url: /api/v1
 *     description: Server API
 * tags:
 *   - name: Comments
 *     description: Quản lý bình luận và phản hồi
 */

/**
 * @swagger
 * components:
 *   schemas:
 *     User:
 *       type: object
 *       properties:
 *         username:
 *           type: string
 *           example: "user123"
 *         avatarURI:
 *           type: string
 *           example: "https://ipfs.io/ipfs/QmXyZ..."
 *         isVerified:
 *           type: boolean
 *           example: true
 *     
 *     CommentMedia:
 *       type: object
 *       properties:
 *         type:
 *           type: string
 *           enum: [image, video, audio]
 *           example: "image"
 *         uri:
 *           type: string
 *           example: "https://ipfs.io/ipfs/QmXyZ..."
 *         mimeType:
 *           type: string
 *           example: "image/jpeg"
 *     
 *     Comment:
 *       type: object
 *       properties:
 *         _id:
 *           type: string
 *           example: "60d21b4667d0d8992e610c85"
 *         postId:
 *           type: string
 *           example: "60d21b4667d0d8992e610c84"
 *         parentId:
 *           type: string
 *           nullable: true
 *           example: null
 *         depth:
 *           type: integer
 *           example: 0
 *         author:
 *           type: string
 *           example: "0x1234abcd..."
 *         authorDetails:
 *           $ref: '#/components/schemas/User'
 *         content:
 *           type: string
 *           example: "Đây là một bình luận"
 *         contentURI:
 *           type: string
 *           example: "ipfs://QmXyZ..."
 *         media:
 *           type: array
 *           items:
 *             $ref: '#/components/schemas/CommentMedia'
 *         stats:
 *           type: object
 *           properties:
 *             likeCount:
 *               type: integer
 *               example: 5
 *             replyCount:
 *               type: integer
 *               example: 2
 *         isLiked:
 *           type: boolean
 *           example: false
 *         hasReplies:
 *           type: boolean
 *           example: true
 *         createdAt:
 *           type: string
 *           format: date-time
 *           example: "2023-06-19T12:00:00.000Z"
 *         updatedAt:
 *           type: string
 *           format: date-time
 *           example: "2023-06-19T12:00:00.000Z"
 *     
 *     Pagination:
 *       type: object
 *       properties:
 *         total:
 *           type: integer
 *           example: 50
 *         page:
 *           type: integer
 *           example: 1
 *         limit:
 *           type: integer
 *           example: 20
 *         pages:
 *           type: integer
 *           example: 3
 *     
 *     ErrorResponse:
 *       type: object
 *       properties:
 *         success:
 *           type: boolean
 *           example: false
 *         message:
 *           type: string
 *           example: "Lỗi xảy ra"
 *         errors:
 *           type: object
 *           nullable: true
 *         timestamp:
 *           type: string
 *           format: date-time
 *
 *     SuccessResponse:
 *       type: object
 *       properties:
 *         success:
 *           type: boolean
 *           example: true
 *         message:
 *           type: string
 *           example: "Thao tác thành công"
 *         data:
 *           type: object
 *         timestamp:
 *           type: string
 *           format: date-time
 *
 *   securitySchemes:
 *     bearerAuth:
 *       type: http
 *       scheme: bearer
 *       bearerFormat: JWT
 */

/**
 * @swagger
 * security:
 *   - bearerAuth: []
 */

/**
 * @swagger
 * /posts/{postId}/comments:
 *   get:
 *     tags:
 *       - Comments
 *     summary: Lấy danh sách bình luận của bài đăng
 *     parameters:
 *       - name: postId
 *         in: path
 *         required: true
 *         schema:
 *           type: string
 *         description: ID của bài đăng
 *       - name: page
 *         in: query
 *         schema:
 *           type: integer
 *           default: 1
 *         description: Trang hiện tại
 *       - name: limit
 *         in: query
 *         schema:
 *           type: integer
 *           default: 20
 *         description: Số lượng bình luận mỗi trang
 *       - name: sort
 *         in: query
 *         schema:
 *           type: string
 *           enum: [newest, oldest, popular]
 *           default: newest
 *         description: Sắp xếp bình luận
 *     responses:
 *       '200':
 *         description: Lấy danh sách bình luận thành công
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
 *                   example: "Lấy danh sách bình luận thành công"
 *                 data:
 *                   type: array
 *                   items:
 *                     $ref: '#/components/schemas/Comment'
 *                 pagination:
 *                   $ref: '#/components/schemas/Pagination'
 *                 timestamp:
 *                   type: string
 *                   format: date-time
 *       '404':
 *         description: Bài đăng không tồn tại
 *         content:
 *           application/json:
 *             schema:
 *               $ref: '#/components/schemas/ErrorResponse'
 *       '500':
 *         description: Lỗi server
 *         content:
 *           application/json:
 *             schema:
 *               $ref: '#/components/schemas/ErrorResponse'
 *
 *   post:
 *     tags:
 *       - Comments
 *     summary: Tạo bình luận mới cho bài đăng
 *     parameters:
 *       - name: postId
 *         in: path
 *         required: true
 *         schema:
 *           type: string
 *         description: ID của bài đăng
 *     requestBody:
 *       required: true
 *       content:
 *         multipart/form-data:
 *           schema:
 *             type: object
 *             properties:
 *               content:
 *                 type: string
 *                 description: Nội dung bình luận
 *                 example: "Đây là một bình luận mới"
 *               files:
 *                 type: array
 *                 items:
 *                   type: string
 *                   format: binary
 *                 description: Các file media đính kèm
 *     responses:
 *       '201':
 *         description: Tạo bình luận thành công
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
 *                   example: "Tạo bình luận thành công"
 *                 data:
 *                   $ref: '#/components/schemas/Comment'
 *                 timestamp:
 *                   type: string
 *                   format: date-time
 *       '400':
 *         description: Dữ liệu không hợp lệ
 *         content:
 *           application/json:
 *             schema:
 *               $ref: '#/components/schemas/ErrorResponse'
 *       '404':
 *         description: Bài đăng không tồn tại
 *         content:
 *           application/json:
 *             schema:
 *               $ref: '#/components/schemas/ErrorResponse'
 *       '500':
 *         description: Lỗi server
 *         content:
 *           application/json:
 *             schema:
 *               $ref: '#/components/schemas/ErrorResponse'
 */

/**
 * @swagger
 * /comments/{commentId}/replies:
 *   get:
 *     tags:
 *       - Comments
 *     summary: Lấy danh sách phản hồi cho một bình luận
 *     parameters:
 *       - name: commentId
 *         in: path
 *         required: true
 *         schema:
 *           type: string
 *         description: ID của bình luận
 *       - name: page
 *         in: query
 *         schema:
 *           type: integer
 *           default: 1
 *         description: Trang hiện tại
 *       - name: limit
 *         in: query
 *         schema:
 *           type: integer
 *           default: 10
 *         description: Số lượng phản hồi mỗi trang
 *     responses:
 *       '200':
 *         description: Lấy danh sách phản hồi thành công
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
 *                   example: "Lấy danh sách phản hồi thành công"
 *                 data:
 *                   type: array
 *                   items:
 *                     $ref: '#/components/schemas/Comment'
 *                 pagination:
 *                   $ref: '#/components/schemas/Pagination'
 *                 timestamp:
 *                   type: string
 *                   format: date-time
 *       '404':
 *         description: Bình luận không tồn tại
 *         content:
 *           application/json:
 *             schema:
 *               $ref: '#/components/schemas/ErrorResponse'
 *       '500':
 *         description: Lỗi server
 *         content:
 *           application/json:
 *             schema:
 *               $ref: '#/components/schemas/ErrorResponse'
 */

/**
 * @swagger
 * /comments/{commentId}/reply:
 *   post:
 *     tags:
 *       - Comments
 *     summary: Trả lời một bình luận
 *     parameters:
 *       - name: commentId
 *         in: path
 *         required: true
 *         schema:
 *           type: string
 *         description: ID của bình luận
 *     requestBody:
 *       required: true
 *       content:
 *         multipart/form-data:
 *           schema:
 *             type: object
 *             properties:
 *               content:
 *                 type: string
 *                 description: Nội dung phản hồi
 *                 example: "Đây là phản hồi cho bình luận"
 *               files:
 *                 type: array
 *                 items:
 *                   type: string
 *                   format: binary
 *                 description: Các file media đính kèm
 *     responses:
 *       '201':
 *         description: Trả lời bình luận thành công
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
 *                   example: "Trả lời bình luận thành công"
 *                 data:
 *                   $ref: '#/components/schemas/Comment'
 *                 timestamp:
 *                   type: string
 *                   format: date-time
 *       '400':
 *         description: Dữ liệu không hợp lệ hoặc vượt quá độ sâu reply
 *         content:
 *           application/json:
 *             schema:
 *               $ref: '#/components/schemas/ErrorResponse'
 *       '404':
 *         description: Bình luận không tồn tại
 *         content:
 *           application/json:
 *             schema:
 *               $ref: '#/components/schemas/ErrorResponse'
 *       '500':
 *         description: Lỗi server
 *         content:
 *           application/json:
 *             schema:
 *               $ref: '#/components/schemas/ErrorResponse'
 */

/**
 * @swagger
 * /comments/{commentId}:
 *   patch:
 *     tags:
 *       - Comments
 *     summary: Cập nhật bình luận
 *     parameters:
 *       - name: commentId
 *         in: path
 *         required: true
 *         schema:
 *           type: string
 *         description: ID của bình luận
 *     requestBody:
 *       required: true
 *       content:
 *         application/json:
 *           schema:
 *             type: object
 *             properties:
 *               content:
 *                 type: string
 *                 description: Nội dung bình luận mới
 *                 example: "Nội dung bình luận đã cập nhật"
 *     responses:
 *       '200':
 *         description: Cập nhật bình luận thành công
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
 *                   example: "Cập nhật bình luận thành công"
 *                 data:
 *                   type: object
 *                   properties:
 *                     _id:
 *                       type: string
 *                       example: "60d21b4667d0d8992e610c85"
 *                     content:
 *                       type: string
 *                       example: "Nội dung bình luận đã cập nhật"
 *                     contentURI:
 *                       type: string
 *                       example: "ipfs://QmXyZ..."
 *                     updatedAt:
 *                       type: string
 *                       format: date-time
 *                 timestamp:
 *                   type: string
 *                   format: date-time
 *       '400':
 *         description: Dữ liệu không hợp lệ hoặc quá thời gian chỉnh sửa
 *         content:
 *           application/json:
 *             schema:
 *               $ref: '#/components/schemas/ErrorResponse'
 *       '403':
 *         description: Không có quyền chỉnh sửa
 *         content:
 *           application/json:
 *             schema:
 *               $ref: '#/components/schemas/ErrorResponse'
 *       '404':
 *         description: Bình luận không tồn tại
 *         content:
 *           application/json:
 *             schema:
 *               $ref: '#/components/schemas/ErrorResponse'
 *       '500':
 *         description: Lỗi server
 *         content:
 *           application/json:
 *             schema:
 *               $ref: '#/components/schemas/ErrorResponse'
 *
 *   delete:
 *     tags:
 *       - Comments
 *     summary: Xóa bình luận
 *     parameters:
 *       - name: commentId
 *         in: path
 *         required: true
 *         schema:
 *           type: string
 *         description: ID của bình luận
 *     responses:
 *       '200':
 *         description: Xóa bình luận thành công
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
 *                   example: "Xóa bình luận thành công"
 *                 data:
 *                   type: object
 *                   properties:
 *                     commentId:
 *                       type: string
 *                       example: "60d21b4667d0d8992e610c85"
 *                 timestamp:
 *                   type: string
 *                   format: date-time
 *       '403':
 *         description: Không có quyền xóa
 *         content:
 *           application/json:
 *             schema:
 *               $ref: '#/components/schemas/ErrorResponse'
 *       '404':
 *         description: Bình luận không tồn tại
 *         content:
 *           application/json:
 *             schema:
 *               $ref: '#/components/schemas/ErrorResponse'
 *       '500':
 *         description: Lỗi server
 *         content:
 *           application/json:
 *             schema:
 *               $ref: '#/components/schemas/ErrorResponse'
 */

/**
 * @swagger
 * /comments/{commentId}/like:
 *   post:
 *     tags:
 *       - Comments
 *     summary: Thích bình luận
 *     parameters:
 *       - name: commentId
 *         in: path
 *         required: true
 *         schema:
 *           type: string
 *         description: ID của bình luận
 *     responses:
 *       '200':
 *         description: Thích bình luận thành công
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
 *                   example: "Đã thích bình luận"
 *                 data:
 *                   type: object
 *                   properties:
 *                     commentId:
 *                       type: string
 *                       example: "60d21b4667d0d8992e610c85"
 *                 timestamp:
 *                   type: string
 *                   format: date-time
 *       '400':
 *         description: Đã thích bình luận này rồi
 *         content:
 *           application/json:
 *             schema:
 *               $ref: '#/components/schemas/ErrorResponse'
 *       '404':
 *         description: Bình luận không tồn tại
 *         content:
 *           application/json:
 *             schema:
 *               $ref: '#/components/schemas/ErrorResponse'
 *       '500':
 *         description: Lỗi server
 *         content:
 *           application/json:
 *             schema:
 *               $ref: '#/components/schemas/ErrorResponse'
 */

/**
 * @swagger
 * /comments/{commentId}/unlike:
 *   post:
 *     tags:
 *       - Comments
 *     summary: Bỏ thích bình luận
 *     parameters:
 *       - name: commentId
 *         in: path
 *         required: true
 *         schema:
 *           type: string
 *         description: ID của bình luận
 *     responses:
 *       '200':
 *         description: Bỏ thích bình luận thành công
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
 *                   example: "Đã bỏ thích bình luận"
 *                 data:
 *                   type: object
 *                   properties:
 *                     commentId:
 *                       type: string
 *                       example: "60d21b4667d0d8992e610c85"
 *                 timestamp:
 *                   type: string
 *                   format: date-time
 *       '400':
 *         description: Chưa thích bình luận này
 *         content:
 *           application/json:
 *             schema:
 *               $ref: '#/components/schemas/ErrorResponse'
 *       '404':
 *         description: Bình luận không tồn tại
 *         content:
 *           application/json:
 *             schema:
 *               $ref: '#/components/schemas/ErrorResponse'
 *       '500':
 *         description: Lỗi server
 *         content:
 *           application/json:
 *             schema:
 *               $ref: '#/components/schemas/ErrorResponse'
 */