import { ethers } from "ethers";

// Interface cho Provider từ trình duyệt
declare global {
  interface Window {
    ethereum?: any;
  }
}

// Hàm lấy provider từ trình duyệt (MetaMask)
export const getProvider = async () => {
  if (!window.ethereum) {
    throw new Error("MetaMask không được cài đặt. Vui lòng cài đặt MetaMask để tiếp tục.");
  }

  return new ethers.BrowserProvider(window.ethereum);
};

// Hàm lấy signer từ tài khoản người dùng
export const getSigner = async () => {
  const provider = await getProvider();
  return provider.getSigner();
};

// Hàm kiểm tra giao dịch
export const verifyTransaction = async (transactionHash: string) => {
  try {
    const provider = await getProvider();
    const txReceipt = await provider.getTransactionReceipt(transactionHash);

    if (!txReceipt) {
      return {
        success: false,
        message: "Giao dịch không tồn tại hoặc chưa được xác nhận",
      };
    }

    return {
      success: txReceipt.status === 1,
      message: txReceipt.status === 1 ? "Giao dịch thành công" : "Giao dịch thất bại",
      receipt: txReceipt,
    };
  } catch (error: any) {
    return {
      success: false,
      message: error.message || "Lỗi khi kiểm tra giao dịch",
      error,
    };
  }
};

// Hàm gửi giao dịch thanh toán
export const sendPayment = async (recipientAddress: string, amount: string) => {
  try {
    if (!ethers.isAddress(recipientAddress)) {
      throw new Error("Địa chỉ nhận không hợp lệ");
    }

    const signer = await getSigner();
    const tx = await signer.sendTransaction({
      to: recipientAddress,
      value: ethers.parseEther(amount),
    });

    console.log("Giao dịch đã được gửi:", tx.hash);
    return {
      success: true,
      hash: tx.hash,
      transaction: tx,
    };
  } catch (error: any) {
    console.error("Lỗi khi gửi giao dịch:", error);

    // Xử lý lỗi từ MetaMask
    if (error.code) {
      switch (error.code) {
        case 4001:
          return { success: false, message: "Người dùng từ chối giao dịch", error };
        case -32602:
          return { success: false, message: "Tham số giao dịch không hợp lệ", error };
        case -32603:
          return { success: false, message: "Lỗi nội bộ từ ví. Vui lòng kiểm tra số dư và thử lại.", error };
        default:
          return { success: false, message: `Lỗi giao dịch: ${error.message}`, error };
      }
    }

    return {
      success: false,
      message: error.message || "Không thể gửi giao dịch",
      error,
    };
  }
};

// Hàm lấy thông tin mạng hiện tại
export const getNetworkInfo = async () => {
  try {
    const provider = await getProvider();
    const network = await provider.getNetwork();

    return {
      success: true,
      name: network.name,
      chainId: network.chainId,
    };
  } catch (error: any) {
    return {
      success: false,
      message: error.message || "Không thể lấy thông tin mạng",
      error,
    };
  }
};

// Hàm kiểm tra xem mạng có phù hợp không
export const checkNetwork = async (requiredNetwork: string) => {
  try {
    const networkInfo = await getNetworkInfo();

    if (!networkInfo.success) {
      return networkInfo;
    }

    const isCorrectNetwork = networkInfo.name.toLowerCase() === requiredNetwork.toLowerCase();

    return {
      success: isCorrectNetwork,
      message: isCorrectNetwork
        ? "Mạng hiện tại phù hợp"
        : `Vui lòng chuyển sang mạng ${requiredNetwork}. Hiện tại bạn đang ở mạng ${networkInfo.name}`,
      currentNetwork: networkInfo.name,
      requiredNetwork,
    };
  } catch (error: any) {
    return {
      success: false,
      message: error.message || "Không thể kiểm tra mạng",
      error,
    };
  }
};