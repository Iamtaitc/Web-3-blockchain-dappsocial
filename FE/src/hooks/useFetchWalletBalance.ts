// useFetchWalletBalance.ts
"use client";

import { useState, useEffect } from "react";
import { useDispatch } from "react-redux"; // Chỉ dùng useDispatch, tránh useSelector trong hàm
import { ethers } from "ethers";
import { setAuthData } from "../store/slices/authSlice";
import type { AppDispatch, RootState } from "../store";
import type { User } from "../store/slices/authSlice";

// Interface cho auth state
interface AuthState {
  isAuthenticated: boolean;
  token: string | null;
  refreshToken: string | null;
  user: User | null;
  walletAddress: string | null;
  walletType: string | null;
  provider: any;
  error: string | null;
  balance: { eth: string } | null;
}

export function useFetchWalletBalance(walletAddress: string | null, provider: any) {
  const dispatch = useDispatch<AppDispatch>();
  const currentAuthState = useSelector((state: RootState) => state.auth); // Di chuyển ra top level
  const [loading, setLoading] = useState<boolean>(false);
  const [error, setError] = useState<string | null>(null);

  // Hàm lấy số dư (không gọi hook bên trong)
  const fetchBalance = async () => {
    if (!walletAddress || !provider) {
      return { eth: "0.00000" }; // Giá trị mặc định nếu không hợp lệ
    }

    try {
      const ethersProvider = new ethers.BrowserProvider(provider);
      const balanceWei = await ethersProvider.getBalance(walletAddress);
      return { eth: ethers.formatEther(balanceWei) };
    } catch (err: any) {
      console.error("Lỗi khi lấy số dư:", err);
      return { eth: "0.00000" }; // Giá trị mặc định nếu lỗi
    }
  };

  useEffect(() => {
    let isMounted = true;

    const updateBalance = async () => {
      setLoading(true);
      setError(null);

      const newBalance = await fetchBalance();
      console.log("Số dư ETH lấy được:", newBalance.eth);

      // Chỉ cập nhật nếu component vẫn mounted
      if (isMounted) {
        const updatedAuthData = {
          token: currentAuthState.token || "",
          refreshToken: currentAuthState.refreshToken || "",
          user: currentAuthState.user || null,
          balance: newBalance,
        };

        dispatch(setAuthData(updatedAuthData));
      }
    };

    updateBalance();

    return () => {
      isMounted = false; // Cleanup để tránh cập nhật state khi component unmount
    };
  }, [walletAddress, provider, dispatch, currentAuthState]); // Thêm currentAuthState vào dependency

  return { balance: currentAuthState.balance, loading, error };
}