import { BrowserRouter, useLocation } from "react-router-dom";
import Navbar from "./Components/Navbar";
import AppRoutes from "./routers/routes"
import { ThemeProvider } from "./context/theme-context"

const MainLayout = () => {
  const location = useLocation();
  const isAdminPage = location.pathname.startsWith('/admin');

  return (
    <div className="flex w-screen min-h-screen bg-black">
      {!isAdminPage && (
        <div className="w-[200px] h-screen fixed">
          <Navbar />
        </div>
      )}
      <div className={`flex-1 ${!isAdminPage ? 'p-4 ml-[200px]' : ''} bg-black`}>
        <AppRoutes />
      </div>
    </div>
  );
};

const App = () => {
  return (
    <ThemeProvider>
      <BrowserRouter>
        <MainLayout />
      </BrowserRouter>
    </ThemeProvider>
  );
};

export default App;