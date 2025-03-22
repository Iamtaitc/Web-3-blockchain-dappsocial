  import { BrowserRouter } from "react-router-dom";
  import Navbar from "./components/Navbar";
  import AppRoutes from "./routers/routes"

  const App = () => {
    return (
      <BrowserRouter>
        <div className="flex min-h-screen bg-black">
          <Navbar />
          <div className="ml-[200px] flex-1 p-4 bg-black">
            <AppRoutes />
          </div>
        </div>
      </BrowserRouter>
    );
  };
  
  export default App;
  
