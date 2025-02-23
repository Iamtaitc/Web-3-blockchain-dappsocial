import React from "react";
import { BrowserRouter as Router } from "react-router-dom";
import Navbar from "./components/Navbar";
import AppRoutes from "./routers/routes"; // Import file routes.tsx
import "./index.css"

function App() {
  return (
    <Router>
      <div className="bg-black"></div>
      <Navbar />
      <main style={{ marginLeft: "200px", padding: "20px" }}>
        <AppRoutes /> {/* Gọi toàn bộ routes từ file routes.tsx */}
      </main>
    </Router>

  );
}

export default App;
