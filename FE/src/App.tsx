import { BrowserRouter } from "react-router-dom";
  import Navbar from "./components/Navbar";
  import AppRoutes from "./routers/routes"

  const App = () => {
    return (
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
    );
  };
  
  export default App;