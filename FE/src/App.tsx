import React from "react";
import Navbar from "./Components/Navbar";
// import Collections from "./pages/Collections"
import ProfileNFT from "./pages/ProfileNFT"
import QuestPage from "./pages/Quest";
import { BrowserRouter as Router, Routes, Route } from "react-router-dom";
import Dashboard from "./pages/Dashboard";

function App() {
  return (
    <Router>
      <Navbar />
      <main style={{ marginLeft: "200px", padding: "20px" }}>
        <Routes>
          <Route path="/" element={<h1>Home</h1>} />
          <Route path="/dashboard" element={<Dashboard/>} />
          <Route path="/farm" element={<h1>Farm</h1>} />
          <Route path="/add-nft" element={<h1>Add NFT</h1>} />
          <Route path="/premium" element={<h1>Premium</h1>} />
          <Route path="/quest" element={<QuestPage/>} />
          <Route path="/wallet" element={<h1>Wallet</h1>} />
          {/* <Route path="/collections" element={<Collections/>} /> */}
          <Route path="/profile" element={<ProfileNFT/>} />
        </Routes>
      </main>
    </Router>
  );
}

export default App;
