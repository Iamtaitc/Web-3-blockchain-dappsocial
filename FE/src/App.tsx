<<<<<<< HEAD
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
=======
import { BrowserRouter } from "react-router-dom";
  import Navbar from "./components/Navbar"
  import AppRoutes from "./routers/routes"
  import { ThemeProvider } from "./context/theme-context"

  const App = () => {
    return (
      <ThemeProvider>
      <BrowserRouter>
        <div className="flex w-screen min-h-screen bg-white">
          <div className="w-[200px] h-screen fixed">
            <Navbar />
          </div>
          <div className="flex-1 p-4 bg-white ml-[200px]">
            <AppRoutes />
          </div>
>>>>>>> dcc8202b7339744fcb2d537ffeb783b9681195c2
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
<<<<<<< HEAD
    </ThemeProvider>
  );
};

export default App;
=======
      </ThemeProvider>
    );
  };
  
  export default App; 
>>>>>>> dcc8202b7339744fcb2d537ffeb783b9681195c2
