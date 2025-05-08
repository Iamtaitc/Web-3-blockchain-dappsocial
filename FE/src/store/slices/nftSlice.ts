import { createSlice, createAsyncThunk, PayloadAction } from "@reduxjs/toolkit";
import nftApi, { NFT, NFTResponse } from "../../services/nft.api";
import { toast } from "react-hot-toast";

interface NFTState {
  myNFTs: NFT[];
  marketplaceNFTs: NFT[];
  selectedNFT: NFT | null;
  loading: boolean;
  error: string | null;
}

const initialState: NFTState = {
  myNFTs: [],
  marketplaceNFTs: [],
  selectedNFT: null,
  loading: false,
  error: null,
};

// Hàm ánh xạ dữ liệu từ API
const mapNFTData = (nft: any): NFT => ({
  tokenId: nft.tokenId,
  name: nft.metadata?.name || "Untitled",
  description: nft.metadata?.description || "",
  imageUrl: nft.metadata?.image || nft.tokenURI || "",
  mediaType: nft.metadata?.mediaType || "image",
  royaltyPercent: nft.royaltyPercent || 0,
  price: nft.price ? parseFloat(nft.price) : undefined,
  owner: nft.owner || nft.creator || "",
  creator: nft.creator,
  txHash: nft.txHash || "",
  mintedAt: nft.mintedAt,
  listedAt: nft.listedAt,
  forSale: nft.forSale || false,
  postId: nft._id,
  metadata: nft.metadata,
});

export const fetchMyNFTs = createAsyncThunk(
  "nft/fetchMyNFTs",
  async (address: string, { rejectWithValue }) => {
    try {
      const response = await nftApi.getCreatorNFTs(address);
      if (response.success) {
        const mappedNFTs = response.data.nfts.map(mapNFTData);
        return mappedNFTs;
      }
      return rejectWithValue(response.message || "Không thể lấy NFT của bạn");
    } catch (error: any) {
      return rejectWithValue(error.message || "Đã xảy ra lỗi");
    }
  }
);

export const fetchMarketplaceNFTs = createAsyncThunk(
  "nft/fetchMarketplaceNFTs",
  async (_, { rejectWithValue }) => {
    try {
      const response = await nftApi.getMarketplaceNFTs();
      if (response.success) {
        const mappedNFTs = response.data.nfts.map(mapNFTData);
        return mappedNFTs;
      }
      return rejectWithValue(response.message || "Không thể lấy NFT marketplace");
    } catch (error: any) {
      return rejectWithValue(error.message || "Đã xảy ra lỗi");
    }
  }
);

export const fetchNFTById = createAsyncThunk(
  "nft/fetchNFTById",
  async (tokenId: string, { rejectWithValue }) => {
    try {
      const response = await nftApi.getNFTById(tokenId);
      if (response.success) {
        const nftData = response.data.nft; // Sửa đổi: Lấy đúng response.data.nft
        if (!nftData || !nftData.tokenId) {
          return rejectWithValue("Dữ liệu NFT không hợp lệ hoặc không tồn tại");
        }
        return mapNFTData(nftData);
      }
      return rejectWithValue(response.message || "Không thể lấy thông tin NFT");
    } catch (error: any) {
      return rejectWithValue(error.message || "Đã xảy ra lỗi");
    }
  }
);
export const listNFTForSale = createAsyncThunk(
  "nft/listNFTForSale",
  async ({ postId, tokenId, price }: { postId: string; tokenId: string; price: number }, { rejectWithValue, dispatch }) => {
    try {
      const response = await nftApi.listNFTFromPost(postId, tokenId, price);
      if (response.success) {
        toast.success("Đăng bán NFT thành công!");
        return { postId, tokenId, price };
      }
      return rejectWithValue(response.message || "Không thể đăng bán NFT");
    } catch (error: any) {
      toast.error(error.message || "Lỗi khi đăng bán NFT");
      return rejectWithValue(error.message || "Đã xảy ra lỗi");
    }
  }
);

export const unlistNFT = createAsyncThunk(
  "nft/unlistNFT",
  async (tokenId: string, { rejectWithValue, dispatch }) => {
    try {
      const response = await nftApi.unlistNFT(tokenId);
      if (response.success) {
        toast.success("Hủy đăng bán NFT thành công!");
        return tokenId;
      }
      return rejectWithValue(response.message || "Không thể hủy đăng bán NFT");
    } catch (error: any) {
      toast.error(error.message || "Lỗi khi hủy đăng bán NFT");
      return rejectWithValue(error.message || "Đã xảy ra lỗi");
    }
  }
);

export const buyNFT = createAsyncThunk(
  "nft/buyNFT",
  async (tokenId: string, { rejectWithValue }) => {
    try {
      const response = await nftApi.buyNFT(tokenId);
      if (response.success) {
        return response.data;
      }
      return rejectWithValue(response.message || "Không thể mua NFT");
    } catch (error: any) {
      toast.error(error.message || "Lỗi khi mua NFT");
      return rejectWithValue(error.message || "Đã xảy ra lỗi");
    }
  }
);

export const purchaseComplete = createAsyncThunk(
  "nft/purchaseComplete",
  async ({ tokenId, txHash, buyer }: { tokenId: string; txHash: string; buyer: string }, { rejectWithValue }) => {
    try {
      const response = await nftApi.purchaseComplete(tokenId, txHash, buyer);
      if (response.success) {
        return response.data;
      }
      return rejectWithValue(response.message || "Không thể xác nhận giao dịch");
    } catch (error: any) {
      toast.error(error.message || "Lỗi khi xác nhận giao dịch");
      return rejectWithValue(error.message || "Đã xảy ra lỗi");
    }
  }
);

const nftSlice = createSlice({
  name: "nft",
  initialState,
  reducers: {
    setSelectedNFT: (state, action: PayloadAction<NFT | null>) => {
      state.selectedNFT = action.payload;
    },
    clearNFTs: (state) => {
      state.myNFTs = [];
      state.marketplaceNFTs = [];
    },
  },
  extraReducers: (builder) => {
    builder
      // Xử lý fetchMyNFTs
      .addCase(fetchMyNFTs.pending, (state) => {
        state.loading = true;
        state.error = null;
      })
      .addCase(fetchMyNFTs.fulfilled, (state, action) => {
        state.myNFTs = action.payload;
        state.loading = false;
      })
      .addCase(fetchMyNFTs.rejected, (state, action) => {
        state.loading = false;
        state.error = action.payload as string;
      })

      // Xử lý fetchMarketplaceNFTs
      .addCase(fetchMarketplaceNFTs.pending, (state) => {
        state.loading = true;
        state.error = null;
      })
      .addCase(fetchMarketplaceNFTs.fulfilled, (state, action) => {
        state.marketplaceNFTs = action.payload;
        state.loading = false;
      })
      .addCase(fetchMarketplaceNFTs.rejected, (state, action) => {
        state.loading = false;
        state.error = action.payload as string;
      })

      // Xử lý fetchNFTById
      .addCase(fetchNFTById.pending, (state) => {
        state.loading = true;
        state.error = null;
      })
      .addCase(fetchNFTById.fulfilled, (state, action) => {
        state.selectedNFT = action.payload;
        state.loading = false;
      })
      .addCase(fetchNFTById.rejected, (state, action) => {
        state.loading = false;
        state.error = action.payload as string;
      })

      // Xử lý listNFTForSale
      .addCase(listNFTForSale.fulfilled, (state, action) => {
        state.myNFTs = state.myNFTs.map(nft =>
          nft.tokenId === action.payload.tokenId
            ? { ...nft, forSale: true, price: action.payload.price }
            : nft
        );
        state.marketplaceNFTs = state.marketplaceNFTs.map(nft =>
          nft.tokenId === action.payload.tokenId
            ? { ...nft, forSale: true, price: action.payload.price }
            : nft
        );
      })

      // Xử lý unlistNFT
      .addCase(unlistNFT.fulfilled, (state, action) => {
        state.myNFTs = state.myNFTs.map(nft =>
          nft.tokenId === action.payload
            ? { ...nft, forSale: false, price: undefined }
            : nft
        );
        state.marketplaceNFTs = state.marketplaceNFTs.filter(
          nft => nft.tokenId !== action.payload
        );
      })

      // Xử lý buyNFT
      .addCase(buyNFT.pending, (state) => {
        state.loading = true;
        state.error = null;
      })
      .addCase(buyNFT.fulfilled, (state, action) => {
        state.loading = false;
        // Update the NFTs lists with the new owner
        state.myNFTs = state.myNFTs.map(nft =>
          nft.tokenId === action.payload.tokenId
            ? { ...nft, owner: action.payload.newOwner, forSale: false, price: undefined }
            : nft
        );
        // Add the purchased NFT to user's NFTs if it's not already there
        const existingNft = state.myNFTs.find(nft => nft.tokenId === action.payload.tokenId);
        if (!existingNft) {
          state.myNFTs.push({
            ...state.selectedNFT!,
            owner: action.payload.newOwner,
            forSale: false,
            price: undefined
          });
        }
        // Remove from marketplace
        state.marketplaceNFTs = state.marketplaceNFTs.filter(
          nft => nft.tokenId !== action.payload.tokenId
        );
      })
      .addCase(buyNFT.rejected, (state, action) => {
        state.loading = false;
        state.error = action.payload as string;
      })

      // Xử lý purchaseComplete
      .addCase(purchaseComplete.pending, (state) => {
        state.loading = true;
        state.error = null;
      })
      .addCase(purchaseComplete.fulfilled, (state, action) => {
        state.loading = false;
        // Update the NFTs lists with the new owner
        state.myNFTs = state.myNFTs.map(nft =>
          nft.tokenId === action.payload.tokenId
            ? { ...nft, owner: action.payload.newOwner, forSale: false, price: undefined }
            : nft
        );
        // Add the purchased NFT to user's NFTs if it's not already there
        const existingNft = state.myNFTs.find(nft => nft.tokenId === action.payload.tokenId);
        if (!existingNft && state.selectedNFT) {
          state.myNFTs.push({
            ...state.selectedNFT,
            owner: action.payload.newOwner,
            forSale: false,
            price: undefined
          });
        }
        // Remove from marketplace
        state.marketplaceNFTs = state.marketplaceNFTs.filter(
          nft => nft.tokenId !== action.payload.tokenId
        );
      })
      .addCase(purchaseComplete.rejected, (state, action) => {
        state.loading = false;
        state.error = action.payload as string;
      });
  },
});

export const { setSelectedNFT, clearNFTs } = nftSlice.actions;
export default nftSlice.reducer;