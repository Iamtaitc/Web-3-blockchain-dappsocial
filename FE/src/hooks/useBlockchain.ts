import { ethers } from "ethers";
import { useCallback, useState } from "react";

// Interface cho Provider từ trình duyệt
declare global {
  interface Window {
    ethereum?: any;
  }
}

// Custom hook để quản lý các hàm blockchain
export const useBlockchain = () => {
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState<string | null>(null);

  // Hàm lấy provider từ trình duyệt (MetaMask)
  const getProvider = useCallback(async () => {
    try {
      if (!window.ethereum) {
        throw new Error("MetaMask không được cài đặt. Vui lòng cài đặt MetaMask để tiếp tục.");
      }
      setLoading(true);
      const provider = new ethers.BrowserProvider(window.ethereum);
      setLoading(false);
      return provider;
    } catch (error: any) {
      setError(error.message || "Lỗi khi lấy provider");
      setLoading(false);
      throw error;
    }
  }, []);

  // Hàm lấy signer từ tài khoản người dùng
  const getSigner = useCallback(async () => {
    try {
      const provider = await getProvider();
      setLoading(true);
      const signer = await provider.getSigner();
      setLoading(false);
      return signer;
    } catch (error: any) {
      setError(error.message || "Lỗi khi lấy signer");
      setLoading(false);
      throw error;
    }
  }, [getProvider]);

  // Hàm kiểm tra giao dịch
  const verifyTransaction = useCallback(async (transactionHash: string) => {
    try {
      setLoading(true);
      const provider = await getProvider();
      const txReceipt = await provider.getTransactionReceipt(transactionHash);

      if (!txReceipt) {
        setLoading(false);
        return {
          success: false,
          message: "Giao dịch không tồn tại hoặc chưa được xác nhận",
        };
      }

      setLoading(false);
      return {
        success: txReceipt.status === 1,
        message: txReceipt.status === 1 ? "Giao dịch thành công" : "Giao dịch thất bại",
        receipt: txReceipt,
      };
    } catch (error: any) {
      setError(error.message || "Lỗi khi kiểm tra giao dịch");
      setLoading(false);
      return {
        success: false,
        message: error.message || "Lỗi khi kiểm tra giao dịch",
        error,
      };
    }
  }, [getProvider]);

  // Hàm gửi giao dịch thanh toán
  const sendPayment = useCallback(async (recipientAddress: string, amount: string) => {
    try {
      if (!ethers.isAddress(recipientAddress)) {
        throw new Error("Địa chỉ nhận không hợp lệ");
      }

      setLoading(true);
      const signer = await getSigner();
      const tx = await signer.sendTransaction({
        to: recipientAddress,
        value: ethers.parseEther(amount),
      });

      console.log("Giao dịch đã được gửi:", tx.hash);
      setLoading(false);
      return {
        success: true,
        hash: tx.hash,
        transaction: tx,
      };
    } catch (error: any) {
      console.error("Lỗi khi gửi giao dịch:", error);

      if (error.code) {
        switch (error.code) {
          case 4001:
            setError("Người dùng từ chối giao dịch");
            break;
          case -32602:
            setError("Tham số giao dịch không hợp lệ");
            break;
          case -32603:
            setError("Lỗi nội bộ từ ví. Vui lòng kiểm tra số dư và thử lại.");
            break;
          default:
            setError(`Lỗi giao dịch: ${error.message}`);
        }
      } else {
        setError(error.message || "Không thể gửi giao dịch");
      }

      setLoading(false);
      return {
        success: false,
        message: error.message || "Không thể gửi giao dịch",
        error,
      };
    }
  }, [getSigner]);

  // Hàm lấy thông tin mạng hiện tại
  const getNetworkInfo = useCallback(async () => {
    try {
      setLoading(true);
      const provider = await getProvider();
      const network = await provider.getNetwork();
      setLoading(false);
      return {
        success: true,
        name: network.name,
        chainId: network.chainId,
      };
    } catch (error: any) {
      setError(error.message || "Không thể lấy thông tin mạng");
      setLoading(false);
      return {
        success: false,
        message: error.message || "Không thể lấy thông tin mạng",
        error,
      };
    }
  }, [getProvider]);

  // Hàm kiểm tra xem mạng có phù hợp không
  const checkNetwork = useCallback(async (requiredNetwork: string) => {
    try {
      setLoading(true);
      const networkInfo = await getNetworkInfo();

      if (!networkInfo.success) {
        setLoading(false);
        return networkInfo;
      }

      const isCorrectNetwork = networkInfo.name.toLowerCase() === requiredNetwork.toLowerCase();
      setLoading(false);
      return {
        success: isCorrectNetwork,
        message: isCorrectNetwork
          ? "Mạng hiện tại phù hợp"
          : `Vui lòng chuyển sang mạng ${requiredNetwork}. Hiện tại bạn đang ở mạng ${networkInfo.name}`,
        currentNetwork: networkInfo.name,
        requiredNetwork,
      };
    } catch (error: any) {
      setError(error.message || "Không thể kiểm tra mạng");
      setLoading(false);
      return {
        success: false,
        message: error.message || "Không thể kiểm tra mạng",
        error,
      };
    }
  }, [getNetworkInfo]);

  return {
    getProvider,
    getSigner,
    verifyTransaction,
    sendPayment,
    getNetworkInfo,
    checkNetwork,
    loading,
    error,
    setError,
  };
};