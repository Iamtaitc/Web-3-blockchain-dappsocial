import Instance from "./instance";
import { sendPayment, verifyTransaction, checkNetwork } from "./blockchain-services";
import { ethers } from "ethers";
// Định nghĩa các interface cho response
export interface PaymentRequestResponse {
  success: boolean;
  status: number;
  message: string;
  data: {
    paymentId: string;
    recipientAddress: string; // Đảm bảo tên trường này khớp với backend
    totalPrice: number;
    currency: string;
    network: string;
    level: number;
    months: number;
    subscriptionName: string;
    subscriptionBenefits: string[];
  };
}

export interface ConfirmPaymentResponse {
  success: boolean;
  status: number;
  message: string;
  data: {
    user: string;
    level: number;
    months: number;
    subscriptionTransactionHash: string;
    subscriptionName: string;
    subscriptionBenefits: string[];
    expiration: string;
  };
}

// Đối tượng chứa các hàm liên quan đến subscription
const SubscriptionService = {
  // Hàm tạo yêu cầu thanh toán Subscription
  createSubscriptionRequest: async (level: number, months: number): Promise<PaymentRequestResponse> => {
    try {
      // Lấy token từ localStorage
      const token = localStorage.getItem("token");
      if (!token) {
        throw new Error("Không tìm thấy token xác thực");
      }

      console.log("Gửi yêu cầu tạo subscription với level:", level, "months:", months);

      const response = await Instance.post(
        "/subscription/buy",
        { level, months },
        {
          headers: {
            Authorization: `Bearer ${token}`,
          },
        }
      );

      console.log("Phản hồi API subscription/buy:", response.data);

      // Kiểm tra dữ liệu trả về
      if (!response.data.success) {
        throw new Error(response.data.message || "Không thể tạo yêu cầu thanh toán");
      }

      // Kiểm tra và gán địa chỉ mặc định nếu không có recipientAddress
      if (!response.data.data || !response.data.data.recipientAddress) {
        console.warn("API không trả về địa chỉ nhận thanh toán, gán địa chỉ mặc định để test:", response.data);
        response.data.data = response.data.data || {};
        response.data.data.recipientAddress = "0xfedaa286fa1e15b3b0f746128825d9a84b2abecb"; // Địa chỉ test
      }

      // Kiểm tra tính hợp lệ của địa chỉ
      if (!ethers.isAddress(response.data.data.recipientAddress)) {
        throw new Error(`Địa chỉ nhận thanh toán không hợp lệ: ${response.data.data.recipientAddress}`);
      }

      return response.data;
    } catch (error: any) {
      console.error("Lỗi khi gọi API subscription/buy:", error);

      // Xử lý lỗi chi tiết hơn
      if (error.response) {
        // Lỗi từ server
        console.error("Lỗi server:", error.response.status, error.response.data);
        throw new Error(error.response.data?.message || `Lỗi server: ${error.response.status}`);
      } else if (error.request) {
        // Không nhận được phản hồi
        console.error("Không nhận được phản hồi từ server");
        throw new Error("Không thể kết nối đến server. Vui lòng kiểm tra kết nối mạng.");
      }

      throw new Error(error.message || "Không thể tạo yêu cầu thanh toán");
    }
  },

  // Hàm xác nhận thanh toán và kích hoạt Subscription
  confirmPayment: async (paymentId: string, transactionHash: string): Promise<ConfirmPaymentResponse> => {
    try {
      // Lấy token từ localStorage
      const token = localStorage.getItem("token");
      if (!token) {
        throw new Error("Không tìm thấy token xác thực");
      }

      console.log("Gửi yêu cầu xác nhận thanh toán với paymentId:", paymentId, "transactionHash:", transactionHash);

      const response = await Instance.post(
        "/subscription/confirm",
        { paymentId, transactionHash },
        {
          headers: {
            Authorization: `Bearer ${token}`,
          },
        }
      );

      console.log("Phản hồi API subscription/confirm:", response.data);

      // Kiểm tra dữ liệu trả về
      if (!response.data.success) {
        throw new Error(response.data.message || "Không thể xác nhận thanh toán");
      }

      return response.data;
    } catch (error: any) {
      console.error("Lỗi khi gọi API subscription/confirm:", error);

      // Xử lý lỗi chi tiết hơn
      if (error.response) {
        // Lỗi từ server
        console.error("Lỗi server:", error.response.status, error.response.data);
        throw new Error(error.response.data?.message || `Lỗi server: ${error.response.status}`);
      } else if (error.request) {
        // Không nhận được phản hồi
        console.error("Không nhận được phản hồi từ server");
        throw new Error("Không thể kết nối đến server. Vui lòng kiểm tra kết nối mạng.");
      }

      throw new Error(error.message || "Không thể xác nhận thanh toán");
    }
  },

  // Hàm xử lý thanh toán trực tiếp từ frontend
  processPayment: async (recipientAddress: string, amount: string, network: string): Promise<any> => {
    try {
      // Kiểm tra mạng
      const networkCheck = await checkNetwork(network);
      if (!networkCheck.success) {
        console.warn(networkCheck.message);
        // Vẫn tiếp tục nhưng cảnh báo người dùng
      }

      // Gửi giao dịch
      const paymentResult = await sendPayment(recipientAddress, amount);
      if (!paymentResult.success) {
        throw new Error(paymentResult.message || "Không thể gửi giao dịch");
      }

      return {
        success: true,
        transactionHash: paymentResult.hash,
        message: "Giao dịch đã được gửi thành công",
      };
    } catch (error: any) {
      console.error("Lỗi khi xử lý thanh toán:");
      throw new Error(error.message || "Không thể xử lý thanh toán");
    }
  },

  // Hàm kiểm tra trạng thái giao dịch
  checkTransactionStatus: async (transactionHash: string): Promise<any> => {
    try {
      const result = await verifyTransaction(transactionHash);
      return result;
    } catch (error: any) {
      console.error("Lỗi khi kiểm tra trạng thái giao dịch:", error);
      throw new Error(error.message || "Không thể kiểm tra trạng thái giao dịch");
    }
  },
};

export default SubscriptionService;