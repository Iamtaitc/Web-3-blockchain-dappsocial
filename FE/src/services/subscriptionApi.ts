import Instance from "./instance";

// Định nghĩa các interface cho response
interface PaymentRequestResponse {
  success: boolean;
  status: number;
  message: string;
  data: {
    paymentId: string;
    recipientAddress: string;
    totalPrice: number;
    currency: string;
    network: string;
    level: number;
    months: number;
    subscriptionName: string;
    subscriptionBenefits: string[];
  };
}

interface ConfirmPaymentResponse {
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

// Hàm tạo yêu cầu thanh toán Subscription
export const createSubscriptionRequest = async (
  walletAddress: string,
  level: number,
  months: number
): Promise<PaymentRequestResponse> => {
  try {
    const response = await Instance.post(
      "/subscription/buy",
      { level, months },
      {
        headers: {
          Authorization: `Bearer ${localStorage.getItem("token")}`,
        },
      }
    );
    return response.data;
  } catch (error: any) {
    throw new Error(error.response?.data?.message || "Không thể tạo yêu cầu thanh toán");
  }
};

// Hàm xác nhận thanh toán và kích hoạt Subscription
export const confirmPayment = async (
  paymentId: string,
  transactionHash: string
): Promise<ConfirmPaymentResponse> => {
  try {
    const response = await Instance.post(
      "/subscription/confirm",
      { paymentId, transactionHash },
      {
        headers: {
          Authorization: `Bearer ${localStorage.getItem("token")}`,
        },
      }
    );
    return response.data;
  } catch (error: any) {
    throw new Error(error.response?.data?.message || "Không thể xác nhận thanh toán");
  }
};