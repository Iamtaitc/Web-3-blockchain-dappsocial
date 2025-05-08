import { ethers } from 'ethers';
import nftApi from './nft.api';
import { toast } from 'react-hot-toast';

interface TransactionResult {
  success: boolean;
  txHash?: string;
  error?: string;
}

const useWalletTransaction = () => {
  const executePurchase = async (
    tokenId: string,
    walletAddress: string,
    token: string
  ): Promise<TransactionResult> => {
    try {
      if (!window.ethereum) {
        throw new Error('Vui lòng cài đặt MetaMask!');
      }

      const provider = new ethers.BrowserProvider(window.ethereum);
      const signer = await provider.getSigner();

      const network = await provider.getNetwork();
      console.log('Mạng hiện tại:', network.name, network.chainId);

      console.log('Gọi API buyNFT với tokenId:', tokenId);
      const prepareResponse = await nftApi.buyNFT(tokenId);
      console.log('Response từ buyNFT:', prepareResponse);

      if (!prepareResponse.success || !prepareResponse.data) {
        throw new Error(prepareResponse.message || 'Không thể chuẩn bị giao dịch');
      }

      const { contractAddress, price } = prepareResponse.data.data;
      if (!contractAddress || !price) {
        throw new Error(`Thông tin giao dịch không hợp lệ: contractAddress=${contractAddress}, price=${price}`);
      }

      if (!ethers.isAddress(contractAddress)) {
        throw new Error(`Địa chỉ contract không hợp lệ: ${contractAddress}`);
      }

      const code = await provider.getCode(contractAddress);
      if (code === '0x') {
        throw new Error(`Không tìm thấy smart contract tại địa chỉ: ${contractAddress}`);
      }

      const marketplaceContract = new ethers.Contract(
        contractAddress,
        [
          {
            "inputs": [{"internalType": "uint256", "name": "_tokenId", "type": "uint256"}],
            "name": "buyNFT",
            "outputs": [],
            "stateMutability": "nonpayable",
            "type": "function"
          },
          {
            "inputs": [],
            "name": "dxToken",
            "outputs": [{"internalType": "contract DXToken", "name": "", "type": "address"}],
            "stateMutability": "view",
            "type": "function"
          },
          {
            "inputs": [{"internalType": "uint256", "name": "", "type": "uint256"}],
            "name": "listings",
            "outputs": [
              {"internalType": "uint256", "name": "tokenId", "type": "uint256"},
              {"internalType": "address", "name": "seller", "type": "address"},
              {"internalType": "uint256", "name": "price", "type": "uint256"},
              {"internalType": "bool", "name": "active", "type": "bool"}
            ],
            "stateMutability": "view",
            "type": "function"
          }
        ],
        signer
      );

      const priceInWei = ethers.parseEther(price.toString());

      // Kiểm tra trạng thái listing
      const listing = await marketplaceContract.listings(tokenId);
      console.log('Thông tin listing:', listing);
      if (!listing.active) {
        throw new Error('NFT không được đăng bán');
      }

      // Phê duyệt token DX
      const dxTokenAddress = await marketplaceContract.dxToken();
      const dxTokenContract = new ethers.Contract(
        dxTokenAddress,
        [
          {
            "constant": false,
            "inputs": [
              {"name": "spender", "type": "address"},
              {"name": "amount", "type": "uint256"}
            ],
            "name": "approve",
            "outputs": [{"name": "", "type": "bool"}],
            "type": "function"
          }
        ],
        signer
      );
      const approvalTx = await dxTokenContract.approve(contractAddress, priceInWei);
      await approvalTx.wait();
      console.log('Phê duyệt token DX thành công');

      // Mô phỏng giao dịch
      await marketplaceContract.callStatic.buyNFT(tokenId);
      console.log('Mô phỏng giao dịch thành công');

      // Thực hiện giao dịch
      const gasEstimate = await marketplaceContract.estimateGas.buyNFT(tokenId);
      console.log('Gas ước lượng:', gasEstimate.toString());

      const transaction = await marketplaceContract.buyNFT(tokenId, {
        gasLimit: gasEstimate.mul(2),
      });

      toast.loading('Đang xử lý giao dịch...');
      const txHash = transaction.hash;

      const receipt = await transaction.wait();
      if (receipt.status !== 1) {
        throw new Error('Giao dịch không thành công');
      }

      const confirmResponse = await nftApi.purchaseComplete(tokenId, txHash, walletAddress);
      if (!confirmResponse.success) {
        throw new Error(confirmResponse.message || 'Không thể xác nhận giao dịch');
      }

      return { success: true, txHash };
    } catch (error: any) {
      console.error('Lỗi khi thực hiện giao dịch:', error);
      toast.error(error.message || 'Đã xảy ra lỗi khi thực hiện giao dịch');
      return { success: false, error: error.message || 'Lỗi giao dịch' };
    }
  };

  return { executePurchase };
};

export default useWalletTransaction;