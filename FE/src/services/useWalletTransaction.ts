import { useState } from 'react';
import { ethers } from 'ethers';
import nftApi from './nft.api';
import { toast } from 'react-hot-toast';

interface TransactionResult {
  success: boolean;
  txHash?: string;
  error?: string;
}

interface PurchasePreparation {
  tokenId: string;
  seller: string;
  price: string;
  contractAddress: string;
  buyFunctionSignature: string;
  nftInfo: {
    name: string;
    imageUrl: string | null;
    description: string | null;
  };
}

const MARKETPLACE_ABI = [
  {
    "inputs": [
      {
        "internalType": "uint256",
        "name": "_tokenId",
        "type": "uint256"
      }
    ],
    "name": "buyNFT",
    "outputs": [],
    "stateMutability": "payable",
    "type": "function"
  },
  {
    "inputs": [
      {
        "internalType": "uint256",
        "name": "_tokenId",
        "type": "uint256"
      }
    ],
    "name": "listings",
    "outputs": [
      {
        "components": [
          {
            "internalType": "uint256",
            "name": "tokenId",
            "type": "uint256"
          },
          {
            "internalType": "address",
            "name": "seller",
            "type": "address"
          },
          {
            "internalType": "uint256",
            "name": "price",
            "type": "uint256"
          },
          {
            "internalType": "bool",
            "name": "active",
            "type": "bool"
          }
        ],
        "internalType": "struct Marketplace.Listing",
        "name": "",
        "type": "tuple"
      }
    ],
    "stateMutability": "view",
    "type": "function"
  }
];

const useWalletTransaction = () => {
  const [isProcessing, setIsProcessing] = useState<boolean>(false);
  const [currentTxHash, setCurrentTxHash] = useState<string | null>(null);

  const checkWalletConnection = async (): Promise<boolean> => {
    try {
      if (typeof window.ethereum === 'undefined') {
        toast.error('Vui lòng cài đặt MetaMask để thực hiện giao dịch');
        return false;
      }

      const accounts = await window.ethereum.request({ method: 'eth_requestAccounts' });
      if (!accounts || accounts.length === 0) {
        toast.error('Vui lòng kết nối ví MetaMask');
        return false;
      }

      const chainId = await window.ethereum.request({ method: 'eth_chainId' });
      const requiredChainId = '0x66eee'; // Arbitrum Sepolia

      if (chainId !== requiredChainId) {
        try {
          await window.ethereum.request({
            method: 'wallet_switchEthereumChain',
            params: [{ chainId: requiredChainId }],
          });
        } catch (switchError: any) {
          if (switchError.code === 4902) {
            try {
              await window.ethereum.request({
                method: 'wallet_addEthereumChain',
                params: [{
                  chainId: requiredChainId,
                  chainName: 'Arbitrum Sepolia',
                  nativeCurrency: {
                    name: 'ETH',
                    symbol: 'ETH',
                    decimals: 18
                  },
                  rpcUrls: ['https://sepolia-rollup.arbitrum.io/rpc'],
                  blockExplorerUrls: ['https://sepolia.arbiscan.io']
                }]
              });
            } catch (addError) {
              toast.error('Không thể thêm mạng Arbitrum Sepolia');
              return false;
            }
          } else {
            toast.error('Vui lòng chuyển sang mạng Arbitrum Sepolia');
            return false;
          }
        }
      }

      return true;
    } catch (error: any) {
      console.error('Lỗi khi kiểm tra kết nối ví:', error);
      if (error.code === 4001) {
        toast.error('Bạn đã từ chối kết nối ví');
      } else if (error.code === -32002) {
        toast.error('Vui lòng kiểm tra MetaMask');
      } else {
        toast.error(error.message || 'Không thể kết nối đến ví');
      }
      return false;
    }
  };

  const checkNFTListing = async (
    contract: ethers.Contract,
    tokenId: string
  ): Promise<boolean> => {
    try {
      const listing = await contract.listings(tokenId);
      return listing && listing.active;
    } catch (error) {
      console.error('Lỗi khi kiểm tra listing:', error);
      return false;
    }
  };

  const preparePurchase = async (tokenId: string): Promise<PurchasePreparation | null> => {
    try {
      const response = await nftApi.buyNFT(tokenId);
      
      if (!response.success || !response.data || !response.data.data) {
        throw new Error(response.message || 'Không thể chuẩn bị thông tin mua NFT');
      }
      
      return response.data.data as PurchasePreparation;
    } catch (error: any) {
      console.error('Lỗi khi chuẩn bị thông tin mua NFT:', error);
      toast.error(error.message || 'Không thể chuẩn bị thông tin giao dịch');
      return null;
    }
  };

  const executePurchase = async (
    tokenId: string, 
    buyerAddress: string,
    token: string
  ): Promise<TransactionResult> => {
    setIsProcessing(true);
    setCurrentTxHash(null);

    try {
      const isConnected = await checkWalletConnection();
      if (!isConnected) {
        return { success: false, error: 'Kết nối ví thất bại' };
      }

      const purchaseInfo = await preparePurchase(tokenId);
      if (!purchaseInfo) {
        return { success: false, error: 'Không thể lấy thông tin giao dịch' };
      }

      const accounts = await window.ethereum.request({ method: 'eth_requestAccounts' });
      const connectedAddress = accounts[0].toLowerCase();
      
      if (connectedAddress !== buyerAddress.toLowerCase()) {
        return { 
          success: false, 
          error: 'Địa chỉ ví không khớp với tài khoản' 
        };
      }

      const provider = new ethers.BrowserProvider(window.ethereum);
      const signer = await provider.getSigner();

      // Kiểm tra số dư
      const balance = await provider.getBalance(connectedAddress);
      const price = ethers.parseEther(purchaseInfo.price);
      const estimatedGas = ethers.parseEther("0.01"); // Dự tính phí gas
      
      if (balance < (price + estimatedGas)) {
        return {
          success: false,
          error: 'Số dư ETH không đủ để thực hiện giao dịch'
        };
      }

      const contract = new ethers.Contract(
        purchaseInfo.contractAddress,
        MARKETPLACE_ABI,
        signer
      );

      // Kiểm tra NFT còn được bán không
      const isListed = await checkNFTListing(contract, tokenId);
      if (!isListed) {
        return {
          success: false,
          error: 'NFT này không còn được bán'
        };
      }

      toast.loading('Đang xử lý giao dịch...', { id: 'transaction' });

      // Thực hiện giao dịch với gas limit cao hơn cho Arbitrum
      const tx = await contract.buyNFT(
        ethers.getBigInt(tokenId), // Chuyển tokenId sang BigInt
        { 
          value: price,
          gasLimit: 1000000
        }
      );

      setCurrentTxHash(tx.hash);
      toast.loading('Đang chờ xác nhận...', { id: 'transaction' });

      // Chờ nhiều block xác nhận hơn
      const receipt = await tx.wait(3);

      if (receipt.status === 0) {
        throw new Error('Giao dịch thất bại trên blockchain');
      }

      toast.dismiss('transaction');
      toast.success('Giao dịch thành công!');

      // Cập nhật backend
      const updateResult = await nftApi.purchaseComplete(
        tokenId,
        tx.hash,
        buyerAddress
      );

      if (!updateResult.success) {
        throw new Error('Không thể cập nhật thông tin trên hệ thống');
      }

      return {
        success: true,
        txHash: tx.hash
      };
    } catch (error: any) {
      console.error('Lỗi khi thực hiện giao dịch:', error);
      
      let errorMessage = 'Đã xảy ra lỗi khi thực hiện giao dịch';
      
      if (error.code) {
        switch (error.code) {
          case 4001:
            errorMessage = 'Giao dịch đã bị từ chối';
            break;
          case -32603:
            errorMessage = 'Lỗi nội bộ MetaMask';
            break;
          case 'INSUFFICIENT_FUNDS':
            errorMessage = 'Số dư ETH không đủ';
            break;
          case 'UNPREDICTABLE_GAS_LIMIT':
            errorMessage = 'Không thể ước tính phí gas';
            break;
          case 'ACTION_REJECTED':
            errorMessage = 'Bạn đã từ chối ký giao dịch';
            break;
          case 'CALL_EXCEPTION':
            errorMessage = 'Smart contract từ chối giao dịch, vui lòng kiểm tra lại điều kiện mua';
            break;
        }
      }
      
      toast.dismiss('transaction');
      toast.error(errorMessage);
      
      return {
        success: false,
        error: errorMessage
      };
    } finally {
      setIsProcessing(false);
    }
  };

  return {
    executePurchase,
    isProcessing,
    currentTxHash
  };
};

declare global {
  interface Window {
    ethereum: any;
  }
}

export default useWalletTransaction;

