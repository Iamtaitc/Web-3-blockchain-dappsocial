// src/App.tsx
import React from "react";
import { Provider } from "react-redux";
import { BrowserRouter, useLocation } from "react-router-dom";
import { Toaster } from "react-hot-toast";

import Navbar from "./components/Navbar";
import AppRoutes from "./routers/routes";
import AdminRoutes from "./routers/admin-routes";
import { ThemeProvider } from "./context/theme-context";
import { store } from "./store";
import { useAuthCheck } from "./hooks/useAuthCheck";

// Layout wrapper component cho user routes (có Navbar)
const MainLayout: React.FC<{ children: React.ReactNode }> = ({ children }) => {
  return (
    <div className="flex w-screen min-h-screen bg-white">
      <div className="fixed top-0 left-0 w-[200px] h-screen bg-gray-50 shadow-md z-10 overflow-y-auto">
        <Navbar />
      </div>
      <div className="flex-1 p-4 ml-[200px] bg-white min-h-screen">
        {children}
      </div>
    </div>
  );
};

// Router component để tách biệt user và admin routes
const AppRouter: React.FC = () => {
  const location = useLocation();
  const isAdminRoute =
    location.pathname.startsWith("/admin") ||
    location.pathname === "/check-admin";

  return isAdminRoute ? (
    <AdminRoutes />
  ) : (
    <MainLayout>
      <AppRoutes />
    </MainLayout>
  );
};

// Component chính, kiểm tra xác thực trước khi render router
const AppContent: React.FC = () => {
  const { isChecking } = useAuthCheck();

  if (isChecking) {
    return (
      <div className="flex items-center justify-center min-h-screen bg-gray-100">
        <div className="text-center">
          <h2 className="text-xl font-semibold text-gray-700 mb-2">
            Đang kiểm tra xác thực...
          </h2>
          <p className="text-gray-500">Vui lòng đợi trong giây lát...</p>
        </div>
      </div>
    );
  }

  return <AppRouter />;
};

const App: React.FC = () => {
  return (
    <Provider store={store}>
      <ThemeProvider>
        <BrowserRouter>
          <AppContent />
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
        </BrowserRouter>
      </ThemeProvider>
    </Provider>
  );
};

export default App;
