import instance from "./instance";

interface SubscriptionRequestPayload {
  level: number;
  months: number;
}

interface SubscriptionResponse {
  success: boolean;
  message?: string;
  status?: number;
  data?: any;
}

interface ConfirmPaymentResponse {
  success: boolean;
  message?: string;
  data?: any;
}

export const SubscriptionService = {
  createSubscriptionRequest: async (payload: SubscriptionRequestPayload): Promise<SubscriptionResponse> => {
    try {
      const response = await instance.post("/subscription/buy", payload);
      return {
        success: response.data.success,
        message: response.data.message || "Request successful",
        status: response.status,
        data: response.data.data,
      };
    } catch (error: any) {
      console.error("Error creating subscription request:", error);
      throw error;
    }
  },

  confirmPayment: async (paymentId: string, transactionHash: string): Promise<ConfirmPaymentResponse> => {
    try {
      const response = await instance.post("/subscription/confirm", {
        paymentId,
        transactionHash,
      });
      return {
        success: response.data.success,
        message: response.data.message || "Xác nhận thanh toán thành công",
        data: response.data.data,
      };
    } catch (error: any) {
      console.error("Error confirming payment:", error);
      throw error;
    }
  },
};
export default SubscriptionService;