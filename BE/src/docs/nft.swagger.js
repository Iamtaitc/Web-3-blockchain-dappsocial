/**
 * @swagger
 * components:
 *   schemas:
 *     NFT:
 *       type: object
 *       properties:
 *         tokenId:
 *           type: string
 *           description: Unique token ID of the NFT
 *         creator:
 *           type: string
 *           description: Wallet address of the creator
 *         owner:
 *           type: string
 *           description: Wallet address of the current owner
 *         metadata:
 *           type: object
 *           properties:
 *             name:
 *               type: string
 *               description: Name of the NFT
 *             description:
 *               type: string
 *               description: Description of the NFT
 *             image:
 *               type: string
 *               description: URL of the NFT image
 *         mediaType:
 *           type: string
 *           enum: [image, video, audio]
 *           description: Type of media
 *         forSale:
 *           type: boolean
 *           description: Whether the NFT is for sale
 *         price:
 *           type: string
 *           description: Price of the NFT (in DX tokens)
 *         royaltyPercent:
 *           type: number
 *           description: Royalty percentage for the creator
 *         viewCount:
 *           type: number
 *           description: Number of views for this NFT
 *         mintedAt:
 *           type: string
 *           format: date-time
 *           description: When the NFT was minted
 *     Error:
 *       type: object
 *       properties:
 *         success:
 *           type: boolean
 *           default: false
 *         message:
 *           type: string
 *           description: Error message
 *         errors:
 *           type: object
 *           description: Detailed error information
 *         timestamp:
 *           type: string
 *           format: date-time
 *           description: Time when the error occurred
 *   securitySchemes:
 *     bearerAuth:
 *       type: http
 *       scheme: bearer
 *       bearerFormat: JWT
 */

/**
 * @swagger
 * tags:
 *   name: NFTs
 *   description: API for managing NFTs
 */

/**
 * @swagger
 * /api/nfts:
 *   get:
 *     summary: Get all NFTs
 *     tags: [NFTs]
 *     parameters:
 *       - in: query
 *         name: page
 *         schema:
 *           type: integer
 *           default: 1
 *         description: Page number
 *       - in: query
 *         name: limit
 *         schema:
 *           type: integer
 *           default: 20
 *         description: Number of items per page
 *       - in: query
 *         name: creator
 *         schema:
 *           type: string
 *         description: Filter by creator wallet address
 *       - in: query
 *         name: owner
 *         schema:
 *           type: string
 *         description: Filter by owner wallet address
 *       - in: query
 *         name: forSale
 *         schema:
 *           type: string
 *           enum: ['true']
 *         description: Filter for NFTs that are for sale
 *       - in: query
 *         name: mediaType
 *         schema:
 *           type: string
 *           enum: [image, video, audio]
 *         description: Filter by media type
 *     responses:
 *       200:
 *         description: List of NFTs
 *         content:
 *           application/json:
 *             schema:
 *               type: object
 *               properties:
 *                 success:
 *                   type: boolean
 *                   default: true
 *                 message:
 *                   type: string
 *                 data:
 *                   type: object
 *                   properties:
 *                     nfts:
 *                       type: array
 *                       items:
 *                         $ref: '#/components/schemas/NFT'
 *                     pagination:
 *                       type: object
 *                       properties:
 *                         total:
 *                           type: integer
 *                         page:
 *                           type: integer
 *                         limit:
 *                           type: integer
 *                         pages:
 *                           type: integer
 *                 timestamp:
 *                   type: string
 *                   format: date-time
 *       500:
 *         description: Server error
 *         content:
 *           application/json:
 *             schema:
 *               $ref: '#/components/schemas/Error'
 */

/**
 * @swagger
 * /api/nfts/{tokenId}:
 *   get:
 *     summary: Get NFT details by token ID
 *     tags: [NFTs]
 *     parameters:
 *       - in: path
 *         name: tokenId
 *         required: true
 *         schema:
 *           type: string
 *         description: Token ID of the NFT
 *     responses:
 *       200:
 *         description: NFT details
 *         content:
 *           application/json:
 *             schema:
 *               type: object
 *               properties:
 *                 success:
 *                   type: boolean
 *                   default: true
 *                 message:
 *                   type: string
 *                 data:
 *                   type: object
 *                   properties:
 *                     nft:
 *                       $ref: '#/components/schemas/NFT'
 *                 timestamp:
 *                   type: string
 *                   format: date-time
 *       404:
 *         description: NFT not found
 *         content:
 *           application/json:
 *             schema:
 *               $ref: '#/components/schemas/Error'
 *       500:
 *         description: Server error
 *         content:
 *           application/json:
 *             schema:
 *               $ref: '#/components/schemas/Error'
 */

/**
 * @swagger
 * /api/nfts/mint:
 *   post:
 *     summary: Mint a new NFT
 *     tags: [NFTs]
 *     security:
 *       - bearerAuth: []
 *     requestBody:
 *       required: true
 *       content:
 *         multipart/form-data:
 *           schema:
 *             type: object
 *             required:
 *               - name
 *               - description
 *               - media
 *             properties:
 *               name:
 *                 type: string
 *                 description: Name of the NFT
 *               description:
 *                 type: string
 *                 description: Description of the NFT
 *               media:
 *                 type: string
 *                 format: binary
 *                 description: NFT media file (image, video, or audio)
 *               royaltyPercent:
 *                 type: number
 *                 description: Royalty percentage (0-10)
 *                 default: 0
 *     responses:
 *       201:
 *         description: NFT minted successfully
 *         content:
 *           application/json:
 *             schema:
 *               type: object
 *               properties:
 *                 success:
 *                   type: boolean
 *                   default: true
 *                 message:
 *                   type: string
 *                 data:
 *                   type: object
 *                   properties:
 *                     message:
 *                       type: string
 *                     nft:
 *                       type: object
 *                       properties:
 *                         tokenId:
 *                           type: string
 *                         name:
 *                           type: string
 *                         description:
 *                           type: string
 *                         imageUrl:
 *                           type: string
 *                         mediaType:
 *                           type: string
 *                         royaltyPercent:
 *                           type: number
 *                         txHash:
 *                           type: string
 *                 timestamp:
 *                   type: string
 *                   format: date-time
 *       400:
 *         description: Invalid input
 *         content:
 *           application/json:
 *             schema:
 *               $ref: '#/components/schemas/Error'
 *       401:
 *         description: Unauthorized
 *         content:
 *           application/json:
 *             schema:
 *               $ref: '#/components/schemas/Error'
 *       500:
 *         description: Server error
 *         content:
 *           application/json:
 *             schema:
 *               $ref: '#/components/schemas/Error'
 */

/**
 * @swagger
 * /api/nfts/{tokenId}/list:
 *   post:
 *     summary: List NFT for sale
 *     tags: [NFTs]
 *     security:
 *       - bearerAuth: []
 *     parameters:
 *       - in: path
 *         name: tokenId
 *         required: true
 *         schema:
 *           type: string
 *         description: Token ID of the NFT
 *     requestBody:
 *       required: true
 *       content:
 *         application/json:
 *           schema:
 *             type: object
 *             required:
 *               - price
 *             properties:
 *               price:
 *                 type: string
 *                 description: Price in DX tokens
 *     responses:
 *       200:
 *         description: NFT listed for sale
 *         content:
 *           application/json:
 *             schema:
 *               type: object
 *               properties:
 *                 success:
 *                   type: boolean
 *                   default: true
 *                 message:
 *                   type: string
 *                 data:
 *                   type: object
 *                   properties:
 *                     tokenId:
 *                       type: string
 *                     price:
 *                       type: string
 *                     txHash:
 *                       type: string
 *                 timestamp:
 *                   type: string
 *                   format: date-time
 *       400:
 *         description: Invalid input or NFT already for sale
 *         content:
 *           application/json:
 *             schema:
 *               $ref: '#/components/schemas/Error'
 *       401:
 *         description: Unauthorized
 *         content:
 *           application/json:
 *             schema:
 *               $ref: '#/components/schemas/Error'
 *       403:
 *         description: Not the owner
 *         content:
 *           application/json:
 *             schema:
 *               $ref: '#/components/schemas/Error'
 *       404:
 *         description: NFT not found
 *         content:
 *           application/json:
 *             schema:
 *               $ref: '#/components/schemas/Error'
 *       500:
 *         description: Server error
 *         content:
 *           application/json:
 *             schema:
 *               $ref: '#/components/schemas/Error'
 */

/**
 * @swagger
 * /api/nfts/{tokenId}/unlist:
 *   post:
 *     summary: Remove NFT from sale
 *     tags: [NFTs]
 *     security:
 *       - bearerAuth: []
 *     parameters:
 *       - in: path
 *         name: tokenId
 *         required: true
 *         schema:
 *           type: string
 *         description: Token ID of the NFT
 *     responses:
 *       200:
 *         description: NFT removed from sale
 *         content:
 *           application/json:
 *             schema:
 *               type: object
 *               properties:
 *                 success:
 *                   type: boolean
 *                   default: true
 *                 message:
 *                   type: string
 *                 data:
 *                   type: object
 *                   properties:
 *                     tokenId:
 *                       type: string
 *                     txHash:
 *                       type: string
 *                 timestamp:
 *                   type: string
 *                   format: date-time
 *       400:
 *         description: NFT not for sale
 *         content:
 *           application/json:
 *             schema:
 *               $ref: '#/components/schemas/Error'
 *       401:
 *         description: Unauthorized
 *         content:
 *           application/json:
 *             schema:
 *               $ref: '#/components/schemas/Error'
 *       403:
 *         description: Not the owner
 *         content:
 *           application/json:
 *             schema:
 *               $ref: '#/components/schemas/Error'
 *       404:
 *         description: NFT not found
 *         content:
 *           application/json:
 *             schema:
 *               $ref: '#/components/schemas/Error'
 *       500:
 *         description: Server error
 *         content:
 *           application/json:
 *             schema:
 *               $ref: '#/components/schemas/Error'
 */

/**
 * @swagger
 * /api/nfts/{tokenId}/buy:
 *   post:
 *     summary: Buy an NFT
 *     tags: [NFTs]
 *     security:
 *       - bearerAuth: []
 *     parameters:
 *       - in: path
 *         name: tokenId
 *         required: true
 *         schema:
 *           type: string
 *         description: Token ID of the NFT
 *     responses:
 *       200:
 *         description: NFT purchased successfully
 *         content:
 *           application/json:
 *             schema:
 *               type: object
 *               properties:
 *                 success:
 *                   type: boolean
 *                   default: true
 *                 message:
 *                   type: string
 *                 data:
 *                   type: object
 *                   properties:
 *                     tokenId:
 *                       type: string
 *                     name:
 *                       type: string
 *                     previousOwner:
 *                       type: string
 *                     newOwner:
 *                       type: string
 *                     price:
 *                       type: string
 *                     txHash:
 *                       type: string
 *                 timestamp:
 *                   type: string
 *                   format: date-time
 *       400:
 *         description: NFT not for sale, cannot buy own NFT, or insufficient funds
 *         content:
 *           application/json:
 *             schema:
 *               $ref: '#/components/schemas/Error'
 *       401:
 *         description: Unauthorized
 *         content:
 *           application/json:
 *             schema:
 *               $ref: '#/components/schemas/Error'
 *       404:
 *         description: NFT not found
 *         content:
 *           application/json:
 *             schema:
 *               $ref: '#/components/schemas/Error'
 *       500:
 *         description: Server error
 *         content:
 *           application/json:
 *             schema:
 *               $ref: '#/components/schemas/Error'
 */

/**
 * @swagger
 * /api/nfts/marketplace:
 *   get:
 *     summary: Get NFTs available on the marketplace
 *     tags: [NFTs]
 *     parameters:
 *       - in: query
 *         name: page
 *         schema:
 *           type: integer
 *           default: 1
 *         description: Page number
 *       - in: query
 *         name: limit
 *         schema:
 *           type: integer
 *           default: 20
 *         description: Number of items per page
 *       - in: query
 *         name: minPrice
 *         schema:
 *           type: string
 *         description: Minimum price filter
 *       - in: query
 *         name: maxPrice
 *         schema:
 *           type: string
 *         description: Maximum price filter
 *       - in: query
 *         name: mediaType
 *         schema:
 *           type: string
 *           enum: [image, video, audio]
 *         description: Filter by media type
 *     responses:
 *       200:
 *         description: List of marketplace NFTs
 *         content:
 *           application/json:
 *             schema:
 *               type: object
 *               properties:
 *                 success:
 *                   type: boolean
 *                   default: true
 *                 message:
 *                   type: string
 *                 data:
 *                   type: object
 *                   properties:
 *                     nfts:
 *                       type: array
 *                       items:
 *                         $ref: '#/components/schemas/NFT'
 *                     pagination:
 *                       type: object
 *                       properties:
 *                         total:
 *                           type: integer
 *                         page:
 *                           type: integer
 *                         limit:
 *                           type: integer
 *                         pages:
 *                           type: integer
 *                 timestamp:
 *                   type: string
 *                   format: date-time
 *       500:
 *         description: Server error
 *         content:
 *           application/json:
 *             schema:
 *               $ref: '#/components/schemas/Error'
 */

/**
 * @swagger
 * /api/nfts/creator/{address}:
 *   get:
 *     summary: Get NFTs created by a specific address
 *     tags: [NFTs]
 *     parameters:
 *       - in: path
 *         name: address
 *         required: true
 *         schema:
 *           type: string
 *         description: Creator's wallet address
 *       - in: query
 *         name: page
 *         schema:
 *           type: integer
 *           default: 1
 *         description: Page number
 *       - in: query
 *         name: limit
 *         schema:
 *           type: integer
 *           default: 20
 *         description: Number of items per page
 *     responses:
 *       200:
 *         description: List of creator's NFTs
 *         content:
 *           application/json:
 *             schema:
 *               type: object
 *               properties:
 *                 success:
 *                   type: boolean
 *                   default: true
 *                 message:
 *                   type: string
 *                 data:
 *                   type: object
 *                   properties:
 *                     creator:
 *                       type: object
 *                       properties:
 *                         walletAddress:
 *                           type: string
 *                         username:
 *                           type: string
 *                         avatarURI:
 *                           type: string
 *                         isVerified:
 *                           type: boolean
 *                     nfts:
 *                       type: array
 *                       items:
 *                         $ref: '#/components/schemas/NFT'
 *                     pagination:
 *                       type: object
 *                       properties:
 *                         total:
 *                           type: integer
 *                         page:
 *                           type: integer
 *                         limit:
 *                           type: integer
 *                         pages:
 *                           type: integer
 *                 timestamp:
 *                   type: string
 *                   format: date-time
 *       404:
 *         description: Creator not found
 *         content:
 *           application/json:
 *             schema:
 *               $ref: '#/components/schemas/Error'
 *       500:
 *         description: Server error
 *         content:
 *           application/json:
 *             schema:
 *               $ref: '#/components/schemas/Error'
 */