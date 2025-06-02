// src/App.tsx
import { Provider } from "react-redux";
import { BrowserRouter, useLocation } from "react-router-dom";
import Navbar from "./components/Navbar";
import AppRoutes from "./routers/routes";
import AdminRoutes from "./routers/admin-routes";
import { ThemeProvider } from "./context/theme-context";
import { store } from "./store";
import { useAuthCheck } from "./hooks/useAuthCheck";
import { Toaster } from "react-hot-toast";
import { LoginModalProvider, useLoginModal } from "./components/Login/login-modal-provider";
import { useEffect } from "react";

// Layout wrapper component cho user routes (có Navbar)
const MainLayout = ({ children }) => {
  return (
    <div className="flex w-screen min-h-screen bg-white">
      <div className="w-[200px] min-h-screen fixed top-0 left-0 bg-gray-50 shadow-md">
        <Navbar />
      </div>
      <div className="flex-1 p-4 bg-white ml-[200px] min-h-screen overflow-x-hidden flex flex-col">
        <div className="flex-1">{children}</div>
      </div>
    </div>
  );
};

// Router component để tách biệt user và admin routes
const AppRouter = () => {
  const location = useLocation();
  const isAdminRoute = location.pathname.startsWith("/admin") || location.pathname === "/check-admin";

  return isAdminRoute ? <AdminRoutes /> : <MainLayout><AppRoutes /></MainLayout>;
};

// Component chính
const AppContent = () => {
  const { isChecking, isAuthenticated } = useAuthCheck(); // Lấy cả isAuthenticated
  const { openLoginModal } = useLoginModal(); // Sử dụng useLoginModal để mở modal

  // Mở modal nếu chưa đăng nhập và đã hoàn thành kiểm tra
  useEffect(() => {
    if (!isChecking && !isAuthenticated) {
      openLoginModal({
        requireSignature: true,
        actionMessage: "Vui lòng kết nối và xác thực ví để tiếp tục.",
      });
    }
  }, [isChecking, isAuthenticated, openLoginModal]);

  if (isChecking) {
    return (
      <div className="flex items-center justify-center min-h-screen bg-gray-100">
        <div className="text-center">
          <h2 className="text-xl font-semibold text-gray-700 mb-2">Đang kiểm tra xác thực...</h2>
          <p className="text-gray-500">Vui lòng đợi trong giây lát...</p>
        </div>
      </div>
    );
  }

 return null;
};

const App = () => {
  return (
    <Provider store={store}>
      <BrowserRouter>
        <LoginModalProvider> {/* Bao bọc toàn bộ ứng dụng */}
          <AppRouter />
          <AppContent /> {/* Đảm bảo AppContent được render bên trong LoginModalProvider */}
          <Toaster
            position="top-right"
            toastOptions={{
              duration: 3000,
              style: {
                background: "#363636",
                color: "#fff",
                borderRadius: "8px",
              },
            }}
          />
        </LoginModalProvider>
      </BrowserRouter>
    </Provider>
  );
};

export default App;