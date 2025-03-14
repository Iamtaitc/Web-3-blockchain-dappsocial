import React from "react";
import { Routes, Route } from "react-router-dom";
// import Collections from "../pages/Collections";
import ProfileNFT from "../pages/ProfileNFT";
import Home from "../pages/home";

const AppRoutes = () => {
  return (
    <Routes>
      <Route path="/" element={<Home></Home>} />
      <Route path="/find-nft" element={<h1>Find NFT</h1>} />
      <Route path="/farm" element={<h1>Farm</h1>} />
      <Route path="/add-nft" element={<h1>Add NFT</h1>} />
      <Route path="/premium" element={<h1>Premium</h1>} />
      <Route path="/quest" element={<h1>Quest</h1>} />
      <Route path="/wallet" element={<h1>Wallet</h1>} />
      {/* <Route path="/collections" element={<Collections/>} /> */}
      <Route path="/profile" element={<ProfileNFT />} />
    </Routes>
  );
};

export default AppRoutes;
