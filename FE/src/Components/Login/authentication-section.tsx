"use client";

import { ethers } from "ethers";
import { Button } from "../UI/buttonlogin";
import { Separator } from "../UI/separator";
import { useDispatch } from "react-redux";
import { setAuthData } from "../../store/slices/authSlice";
import type { AppDispatch } from "../../store";
import { authAPI } from "../../services/api";
import { store } from "../../store";
import dxContractABI from "../../abis/DXTokenABI.json"; // Import ABI từ file JSON

interface AuthenticationSectionProps {
  account: string;
  provider: any;
  isConnecting: boolean;
  onAuthenticated: () => void;
  onError: (message: string) => void;
  onConnectingChange: (isConnecting: boolean) => void;
}

export function AuthenticationSection({
  account,
  provider,
  isConnecting,
  onAuthenticated,
  onError,
  onConnectingChange,
}: AuthenticationSectionProps) {
  const dispatch = useDispatch<AppDispatch>();

  const authenticateUser = async () => {
    if (!account || !provider) return;

    try {
      onConnectingChange(true);
      // 1. Lấy nonce từ API
      console.log("Bước 1: Đang lấy nonce từ API cho địa chỉ:", account);
      const nonceResponse = await authAPI.connectWallet(account);
      console.log("Kết quả lấy nonce:", nonceResponse);
      console.log("ABI",dxContractABI);
      if (!nonceResponse.success) {
        throw new Error(nonceResponse.error || "Không thể lấy nonce từ server");
      }

      // 2. Lấy message từ response
      const message = nonceResponse.data.message;
      console.log("Bước 2: Tin nhắn cần ký:", message);

      // 3. Tạo provider ethers và lấy signer
      console.log("Bước 3: Đang lấy signer từ provider");
      const ethersProvider = new ethers.BrowserProvider(provider);
      const network = await ethersProvider.getNetwork();
      console.log("Mạng hiện tại:", network.name, network.chainId); // Kiểm tra mạng
      const signer = await ethersProvider.getSigner();
      console.log("Signer address:", await signer.getAddress());

      // 4. Yêu cầu chữ ký từ người dùng
      console.log("Bước 4: Đang yêu cầu chữ ký từ người dùng");
      const signature = await signer.signMessage(message);
      console.log("Chữ ký nhận được:", signature);

      // 5. Gửi chữ ký và địa chỉ ví lên API để xác thực
      console.log("Bước 5: Đang gửi chữ ký lên API", {
        walletAddress: account,
        signature,
      });

      const loginResponse = await authAPI.login(account, signature);
      console.log("Kết quả đăng nhập trực tiếp:", loginResponse);

      if (loginResponse.success && loginResponse.data) {
        console.log("Đăng nhập thành công, cập nhật Redux store");

       // 6. Lấy số dư ETH từ blockchain
        let ethBalance = "0";
        try {
          const balance = await ethersProvider.getBalance(account);
          console.log("Số dư ETH (raw):", balance.toString());
          ethBalance = ethers.formatEther(balance); // Chuyển từ wei sang ETH
          console.log("Số dư ETH (formatted):", ethBalance);
        } catch (balanceError) {
          console.error("Lỗi khi lấy số dư ETH:", balanceError.message);
          ethBalance = "0";
        }
      console.log("ETH",ethBalance);
      // debugger
        // Cập nhật auth data với số dư ETH
        const authData = {
          token: loginResponse.data.token,
          refreshToken: loginResponse.data.refreshToken,
          user: loginResponse.data.user,
          balance: {
            eth: ethBalance, // Lưu số dư ETH
          },
        };
localStorage.setItem("balance", JSON.stringify(authData.balance));
dispatch(setAuthData(authData));
//  debugger
        localStorage.setItem("token", authData.token);
        localStorage.setItem("refreshToken", authData.refreshToken);
        localStorage.setItem("user", JSON.stringify(authData.user));
        localStorage.setItem("balance", JSON.stringify(authData.balance));

        dispatch(setAuthData(authData));

        setTimeout(() => {
          const authState = store.getState().auth;
          console.log("Redux store sau khi dispatch:", {
            isAuthenticated: authState.isAuthenticated,
            token: authState.token,
            refreshToken: authState.refreshToken,
            user: authState.user,
            balance: authState.balance,
          });
        }, 100);

        onAuthenticated();
      } else {
        throw new Error(loginResponse.error || "Xác thực thất bại");
      }
    } catch (err: any) {
      console.error("Lỗi khi xác thực:", err);
      onError(err.message || "Không thể xác thực");
    } finally {
      onConnectingChange(false);
    }
  };

  return (
    <>
      <Separator className="my-4" />
      <div className="text-center">
        <p className="text-sm text-muted-foreground mb-3">Vui lòng ký tin nhắn để xác thực ví của bạn</p>
        <Button
          onClick={authenticateUser}
          disabled={isConnecting}
          className="text-white w-full"
        >
          {isConnecting ? "Đang ký..." : "Ký tin nhắn"}
        </Button>
      </div>
    </>
  );
}