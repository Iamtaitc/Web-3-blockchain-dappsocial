import { Provider } from "react-redux";
import { BrowserRouter } from "react-router-dom";
import Navbar from "./components/Navbar";
import AppRoutes from "./routers/routes";
import { ThemeProvider } from "./context/theme-context";
import { store } from "./store";
import { useAuthCheck } from "./hooks/useAuthCheck";

// Component con để sử dụng hooks
const AppContent = () => {
  const { isChecking } = useAuthCheck();

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

  return (
    <ThemeProvider>
      <div className="flex w-full min-h-screen bg-white">
        {/* Navbar cố định bên trái */}
        <div className="w-[200px] min-h-screen fixed top-0 left-0 bg-gray-50 shadow-md">
          <Navbar />
        </div>
        {/* Nội dung chính */}
        <div className="flex-1 p-4 bg-white ml-[200px] overflow-x-hidden">
          <AppRoutes />
        </div>
      </div>
    </ThemeProvider>
  );
};

const App = () => {
  return (
    <Provider store={store}>
      <BrowserRouter>
        <AppContent />
      </BrowserRouter>
    </Provider>
  );
};

export default App;