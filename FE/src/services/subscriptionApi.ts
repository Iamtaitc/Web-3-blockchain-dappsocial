import instance from "./instance";

// Types
interface SubscriptionRequestPayload {
  level: number;
  months: number;
}

interface ConfirmPaymentPayload {
  paymentId: string;
  transactionHash: string;
}

interface SubscriptionResponse {
  success: boolean;
  message: string;
  status: number;
  data: {
    paymentId: string;
    totalPrice: number;
    currency: string;
    recipient: string;
    network: string;
    level: number;
    months: number;
    transactionHash?: string;
  };
}

interface ConfirmPaymentResponse {
  success: boolean;
  message: string;
  status: number;
  data: {
    user: string;
    level: number;
    months: number;
    subscriptionTransactionHash: string;
  };
}

const SubscriptionService = {
  // Gọi API để tạo yêu cầu subscription
  createSubscriptionRequest: async (payload: SubscriptionRequestPayload): Promise<SubscriptionResponse> => {
    try {
      const response = await instance.post("/subscription/buy", payload);
      return {
        success: response.data.success,
        message: response.data.message,
        status: response.status,
        data: response.data.data,
      };
    } catch (error: any) {
      console.error("Error creating subscription request:", error);
      throw error;
    }
  },

  // Gọi API để xác nhận thanh toán
  confirmPayment: async (payload: ConfirmPaymentPayload): Promise<ConfirmPaymentResponse> => {
    try {
      const response = await instance.post("/subscription/confirm", payload);
      return {
        success: response.data.success,
        message: response.data.message,
        status: response.status,
        data: response.data.data,
      };
    } catch (error: any) {
      console.error("Error confirming payment:", error);
      throw error;
    }
  },
};

export default SubscriptionService;