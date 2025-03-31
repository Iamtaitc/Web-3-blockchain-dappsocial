import { BrowserRouter } from "react-router-dom";
  import Navbar from "./Components/Navbar";
  import AppRoutes from "./routers/routes"
  import { ThemeProvider } from "./context/theme-context"

  const App = () => {
    return (
      <ThemeProvider>
      <BrowserRouter>
        <div className="flex w-screen min-h-screen bg-black">
          <div className="w-[200px] h-screen fixed">
            <Navbar />
          </div>
          <div className="flex-1 p-4 bg-black ml-[200px]">
            <AppRoutes />
          </div>
        </div>
      </BrowserRouter>
      </ThemeProvider>
    );
  };
  
  export default App;