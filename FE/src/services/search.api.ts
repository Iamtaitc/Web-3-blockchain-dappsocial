import instance from "./instance";

interface User {
  _id: string;
  username: string;
  displayName: string;
  avatar?: string;
  followersCount: number;
}

interface Post {
  _id: string;
  content: string;
  author: User;
  createdAt: string;
  media?: string[];
  nft?: string;
}

interface NFT {
  _id: string;
  name: string;
  description: string;
  media: string;
  forSale: boolean;
  price?: number;
  mediaType: string;
}

interface Tag {
  _id: string;
  name: string;
  postCount: number;
}

interface Pagination {
  total: number;
  page: number;
  limit: number;
}

interface SearchResponse {
  success: boolean;
  message: string;
  data: {
    results?: {
      users?: User[];
      posts?: Post[];
      nfts?: NFT[];
      tags?: Tag[];
    };
    users?: User[];
    posts?: Post[];
    nfts?: NFT[];
    tags?: Tag[];
    pagination?: Pagination;
  };
  timestamp: string;
}

export const SearchService = {
  search: async (
    query: string,
    type?: string,
    limit: number = 10,
    page: number = 1
  ): Promise<SearchResponse> => {
    try {
      const response = await instance.get("/search", {
        params: { query, type, limit, page },
      });
      console.log("search response:", response.data);
      return response.data;
    } catch (error: any) {
      console.error("search error:", error.message);
      throw error;
    }
  },

  searchUserForMention: async (
    keyword: string,
    limit: number = 5
  ): Promise<SearchResponse> => {
    try {
      const response = await instance.get("/search/mention", {
        params: { keyword, limit },
      });
      console.log("searchUserForMention response:", response.data);
      return response.data;
    } catch (error: any) {
      console.error("searchUserForMention error:", error.message);
      throw error;
    }
  },

  searchUsers: async (
    query: string,
    limit: number = 10,
    page: number = 1,
    sortBy: string = "followers"
  ): Promise<SearchResponse> => {
    try {
      const response = await instance.get("/search/users", {
        params: { query, limit, page, sortBy },
      });
      console.log("searchUsers response:", response.data);
      return response.data;
    } catch (error: any) {
      console.error("searchUsers error:", error.message);
      throw error;
    }
  },

  searchPosts: async (
    query?: string,
    limit: number = 10,
    page: number = 1,
    sortBy: string = "recent",
    withMedia?: boolean,
    hasNFT?: boolean
  ): Promise<SearchResponse> => {
    try {
      const response = await instance.get("/search/posts", {
        params: { query, limit, page, sortBy, withMedia, hasNFT },
      });
      console.log("searchPosts response:", response.data);
      return response.data;
    } catch (error: any) {
      console.error("searchPosts error:", error.message);
      throw error;
    }
  },

  searchNFTs: async (
    query?: string,
    limit: number = 10,
    page: number = 1,
    sortBy: string = "recent",
    forSale?: boolean,
    mediaType?: string,
    minPrice?: number,
    maxPrice?: number
  ): Promise<SearchResponse> => {
    try {
      const response = await instance.get("/search/nfts", {
        params: { query, limit, page, sortBy, forSale, mediaType, minPrice, maxPrice },
      });
      console.log("searchNFTs response:", response.data);
      return response.data;
    } catch (error: any) {
      console.error("searchNFTs error:", error.message);
      throw error;
    }
  },

  searchTags: async (
    query: string,
    limit: number = 20
  ): Promise<SearchResponse> => {
    try {
      const response = await instance.get("/search/tags", {
        params: { query, limit },
      });
      console.log("searchTags response:", response.data);
      return response.data;
    } catch (error: any) {
      console.error("searchTags error:", error.message);
      throw error;
    }
  },

  getTrendingTags: async (
    limit: number = 10
  ): Promise<SearchResponse> => {
    try {
      const response = await instance.get("/search/trending-tags", {
        params: { limit },
      });
      console.log("getTrendingTags response:", response.data);
      return response.data;
    } catch (error: any) {
      console.error("getTrendingTags error:", error.message);
      throw error;
    }
  },
};