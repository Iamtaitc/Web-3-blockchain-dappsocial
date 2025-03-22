/**
 * @swagger
 * tags:
 *   name: Wallet Authentication
 *   description: API for wallet-based authentication
 */

/**
 * @swagger
 * components:
 *   schemas:
 *     ConnectRequest:
 *       type: object
 *       required:
 *         - walletAddress
 *       properties:
 *         walletAddress:
 *           type: string
 *           description: Wallet address of the user
 *           example: "0xABC123..."
 *     ConnectResponse:
 *       type: object
 *       properties:
 *         message:
 *           type: string
 *           description: Message to be signed
 *           example: "Sign this message to authenticate: 83729a..."
 *         nonce:
 *           type: string
 *           description: Nonce for the authentication request
 *           example: "83729a..."
 *     VerifyRequest:
 *       type: object
 *       required:
 *         - walletAddress
 *         - signature
 *       properties:
 *         walletAddress:
 *           type: string
 *           description: Wallet address of the user
 *           example: "0xABC123..."
 *         signature:
 *           type: string
 *           description: Signature of the message
 *           example: "0x5d12a..."
 *     VerifyResponse:
 *       type: object
 *       properties:
 *         accessToken:
 *           type: string
 *           description: JWT access token
 *           example: "eyJhbGciOiJIUzI1NiIsInR5..."
 *         refreshToken:
 *           type: string
 *           description: JWT refresh token
 *           example: "eyJhbGciOiJIUzI1NiIsInR5..."
 *         user:
 *           type: object
 *           properties:
 *             walletAddress:
 *               type: string
 *               example: "0xabc123..."
 *             username:
 *               type: string
 *               example: "cryptouser"
 *             avatarURI:
 *               type: string
 *               example: "https://example.com/avatars/user.png"
 *     RefreshRequest:
 *       type: object
 *       required:
 *         - refreshToken
 *       properties:
 *         refreshToken:
 *           type: string
 *           description: JWT refresh token
 *           example: "eyJhbGciOiJIUzI1NiIsInR5..."
 *     RefreshResponse:
 *       type: object
 *       properties:
 *         accessToken:
 *           type: string
 *           description: New JWT access token
 *           example: "eyJhbGciOiJIUzI1NiIsInR5..."
 *         refreshToken:
 *           type: string
 *           description: New JWT refresh token
 *           example: "eyJhbGciOiJIUzI1NiIsInR5..."
 *     LogoutRequest:
 *       type: object
 *       required:
 *         - refreshToken
 *       properties:
 *         refreshToken:
 *           type: string
 *           description: JWT refresh token
 *           example: "eyJhbGciOiJIUzI1NiIsInR5..."
 *     SuccessResponse:
 *       type: object
 *       properties:
 *         success:
 *           type: boolean
 *           example: true
 *         message:
 *           type: string
 *           example: "Logout successfully"
 *     ErrorResponse:
 *       type: object
 *       properties:
 *         success:
 *           type: boolean
 *           example: false
 *         message:
 *           type: string
 *           example: "Error message"
 *         errors:
 *           type: object
 *           example: {}
 */

/**
 * @swagger
 * /auth/connect:
 *   post:
 *     summary: Connect wallet and get a nonce
 *     tags: [Wallet Authentication]
 *     requestBody:
 *       required: true
 *       content:
 *         application/json:
 *           schema:
 *             $ref: '#/components/schemas/ConnectRequest'
 *     responses:
 *       200:
 *         description: Nonce generated successfully
 *         content:
 *           application/json:
 *             schema:
 *               $ref: '#/components/schemas/ConnectResponse'
 *       400:
 *         description: Bad request
 *         content:
 *           application/json:
 *             schema:
 *               $ref: '#/components/schemas/ErrorResponse'
 *       500:
 *         description: Server error
 *         content:
 *           application/json:
 *             schema:
 *               $ref: '#/components/schemas/ErrorResponse'
 */

/**
 * @swagger
 * /auth/verify:
 *   post:
 *     summary: Verify wallet signature
 *     tags: [Wallet Authentication]
 *     requestBody:
 *       required: true
 *       content:
 *         application/json:
 *           schema:
 *             $ref: '#/components/schemas/VerifyRequest'
 *     responses:
 *       200:
 *         description: Signature verified successfully
 *         content:
 *           application/json:
 *             schema:
 *               $ref: '#/components/schemas/VerifyResponse'
 *       400:
 *         description: Bad request
 *         content:
 *           application/json:
 *             schema:
 *               $ref: '#/components/schemas/ErrorResponse'
 *       401:
 *         description: Unauthorized
 *         content:
 *           application/json:
 *             schema:
 *               $ref: '#/components/schemas/ErrorResponse'
 *       404:
 *         description: User not found
 *         content:
 *           application/json:
 *             schema:
 *               $ref: '#/components/schemas/ErrorResponse'
 *       500:
 *         description: Server error
 *         content:
 *           application/json:
 *             schema:
 *               $ref: '#/components/schemas/ErrorResponse'
 */

/**
 * @swagger
 * /auth/refresh:
 *   post:
 *     summary: Refresh access token
 *     tags: [Wallet Authentication]
 *     requestBody:
 *       required: true
 *       content:
 *         application/json:
 *           schema:
 *             $ref: '#/components/schemas/RefreshRequest'
 *     responses:
 *       200:
 *         description: Token refreshed successfully
 *         content:
 *           application/json:
 *             schema:
 *               $ref: '#/components/schemas/RefreshResponse'
 *       400:
 *         description: Bad request
 *         content:
 *           application/json:
 *             schema:
 *               $ref: '#/components/schemas/ErrorResponse'
 *       401:
 *         description: Unauthorized
 *         content:
 *           application/json:
 *             schema:
 *               $ref: '#/components/schemas/ErrorResponse'
 *       500:
 *         description: Server error
 *         content:
 *           application/json:
 *             schema:
 *               $ref: '#/components/schemas/ErrorResponse'
 */

/**
 * @swagger
 * /auth/logout:
 *   post:
 *     summary: Logout user
 *     tags: [Wallet Authentication]
 *     requestBody:
 *       required: true
 *       content:
 *         application/json:
 *           schema:
 *             $ref: '#/components/schemas/LogoutRequest'
 *     responses:
 *       200:
 *         description: Logged out successfully
 *         content:
 *           application/json:
 *             schema:
 *               $ref: '#/components/schemas/SuccessResponse'
 *       400:
 *         description: Bad request
 *         content:
 *           application/json:
 *             schema:
 *               $ref: '#/components/schemas/ErrorResponse'
 *       500:
 *         description: Server error
 *         content:
 *           application/json:
 *             schema:
 *               $ref: '#/components/schemas/ErrorResponse'
 */

module.exports = {}; // You can export something if needed, or just leave it empty