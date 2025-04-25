import instance from "./instance";

// Interface cho thông tin metadata của NFT
export interface NFTMetadata {
  name: string;
  description: string;
  royaltyPercent: number;
}

// Interface cho phản hồi từ API
export interface NFTResponse {
  success: boolean;
  status: number;
  message: string;
  data: any;
}

// Interface cho dữ liệu NFT
export interface NFT {
  tokenId: string;
  name: string;
  description: string;
  imageUrl: string;
  mediaType: string;
  royaltyPercent: number;
  price?: number;
  owner: string;
  creator: string;
  txHash: string;
  mintedAt: string;
  listedAt?: string;
  forSale: boolean;
  postId?: string;
}

// Service API cho NFT
const nftApi = {
  // Tạo NFT từ media của bài viết
  createNFTFromPostMedia: async (
    postId: string,
    mediaIndex: number,
    nftMetadata: NFTMetadata
  ): Promise<NFTResponse> => {
    try {
      const response = await instance.post(
        `/post/${postId}/media/${mediaIndex}/nft`,
        nftMetadata
      );
      return response.data;
    } catch (error: any) {
      console.error("Lỗi khi tạo NFT:", error);
      throw error.response?.data || {
        success: false,
        message: "Lỗi khi tạo NFT từ media",
      };
    }
  },

  // Đăng bán NFT
  listNFTForSale: async (
    postId: string,
    tokenId: string,
    price: number
  ): Promise<NFTResponse> => {
    try {
      const response = await instance.post(
        `/post/${postId}/nft/${tokenId}/list`,
        { price }
      );
      return response.data;
    } catch (error: any) {
      console.error("Lỗi khi đăng bán NFT:", error);
      throw error.response?.data || {
        success: false,
        message: "Lỗi khi đăng bán NFT",
      };
    }
  },

  // Lấy tất cả NFT
  getAllNFTs: async (): Promise<NFTResponse> => {
    try {
      const response = await instance.get("/nft/all");
      return response.data;
    } catch (error: any) {
      console.error("Lỗi khi lấy danh sách NFT:", error);
      throw error.response?.data || {
        success: false,
        message: "Lỗi khi lấy danh sách NFT",
      };
    }
  },

  // Lấy chi tiết NFT theo ID
  getNFTById: async (tokenId: string): Promise<NFTResponse> => {
    try {
      const response = await instance.get(`/nft/id/${tokenId}`);
      return response.data;
    } catch (error: any) {
      console.error("Lỗi khi lấy chi tiết NFT:", error);
      throw error.response?.data || {
        success: false,
        message: "Lỗi khi lấy chi tiết NFT",
      };
    }
  },

  // Hủy đăng bán NFT
  unlistNFT: async (tokenId: string): Promise<NFTResponse> => {
    try {
      const response = await instance.post(`/nft/${tokenId}/unlist`);
      return response.data;
    } catch (error: any) {
      console.error("Lỗi khi hủy đăng bán NFT:", error);
      throw error.response?.data || {
        success: false,
        message: "Lỗi khi hủy đăng bán NFT",
      };
    }
  },

  // Mua NFT
  buyNFT: async (tokenId: string): Promise<NFTResponse> => {
    try {
      const response = await instance.post(`/nft/${tokenId}/buy`);
      return response.data;
    } catch (error: any) {
      console.error("Lỗi khi mua NFT:", error);
      throw error.response?.data || {
        success: false,
        message: "Lỗi khi mua NFT",
      };
    }
  },

  // Xác nhận hoàn tất giao dịch mua NFT
  confirmPurchase: async (purchaseData: any): Promise<NFTResponse> => {
    try {
      const response = await instance.post("/nft/purchase-complete", purchaseData);
      return response.data;
    } catch (error: any) {
      console.error("Lỗi khi xác nhận giao dịch:", error);
      throw error.response?.data || {
        success: false,
        message: "Lỗi khi xác nhận giao dịch",
      };
    }
  },

  // Lấy danh sách NFT trên marketplace
  getMarketplaceNFTs: async (): Promise<NFTResponse> => {
    try {
      const response = await instance.get("/nft/marketplace");
      return response.data;
    } catch (error: any) {
      console.error("Lỗi khi lấy danh sách NFT marketplace:", error);
      throw error.response?.data || {
        success: false,
        message: "Lỗi khi lấy danh sách NFT marketplace",
      };
    }
  },

  // Lấy danh sách NFT của creator
  getCreatorNFTs: async (address: string): Promise<NFTResponse> => {
    try {
      const response = await instance.get(`/nft/creator/${address}`);
      return response.data;
    } catch (error: any) {
      console.error("Lỗi khi lấy danh sách NFT của creator:", error);
      throw error.response?.data || {
        success: false,
        message: "Lỗi khi lấy danh sách NFT của creator",
      };
    }
  },
};

export default nftApi;