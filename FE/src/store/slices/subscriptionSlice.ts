import { createSlice, type PayloadAction } from "@reduxjs/toolkit";

// Định nghĩa kiểu dữ liệu cho subscription
interface Subscription {
  level: number;
  name: string;
  benefits: string[];
  expiration: string;
}

// Định nghĩa kiểu dữ liệu cho state
interface SubscriptionState {
  subscription: Subscription | null;
  isLoading: boolean;
  error: string | null;
}

// State ban đầu
const initialState: SubscriptionState = {
  subscription: localStorage.getItem("subscription") ? JSON.parse(localStorage.getItem("subscription")!) : null,
  isLoading: false,
  error: null,
};

// Tạo slice
const subscriptionSlice = createSlice({
  name: "subscription",
  initialState,
  reducers: {
    setSubscription: (state, action: PayloadAction<Subscription>) => {
      state.subscription = action.payload;
      state.isLoading = false;
      state.error = null;
      localStorage.setItem("subscription", JSON.stringify(action.payload));
    },
    clearSubscription: (state) => {
      state.subscription = null;
      state.isLoading = false;
      state.error = null;
      localStorage.removeItem("subscription");
    },
    setLoading: (state, action: PayloadAction<boolean>) => {
      state.isLoading = action.payload;
    },
    setError: (state, action: PayloadAction<string | null>) => {
      state.error = action.payload;
      state.isLoading = false;
    },
  },
});

export const { setSubscription, clearSubscription, setLoading, setError } = subscriptionSlice.actions;

export default subscriptionSlice.reducer;