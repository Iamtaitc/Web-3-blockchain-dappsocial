// src/routes/AppRoutes.tsx
import { Routes, Route } from "react-router-dom";
// import Collections from "../pages/Collections";
import ProfileNFT from "../pages/Profileuser";
import Home from "../pages/Home/home";
import CreateNFT from "../pages/NFT/CreateNFT";
import Dashboard from "../pages/Dashboard";
import WalletLogin from "../components/Login";
import Quest from "../pages/Quest";
import NFTDetail from "../pages/NFTDetail";
import NTFview from "../pages/NFT/nft-view";
import Premium from "../pages/NFT/Premium";
import Wallet from "../pages/NFT/Wallet";
import Farm from "../pages/NFT/Farm";
import SnakeGame from "../pages/game/SnakeGame";
import DropGame from "../pages/game/DropGame";
import Settings from "../pages/Settings";
import Profileuser from "../pages/Profileuser";
import PostDetail from "../pages/PostDetail";
import TaskDetail from "../pages/TaskDetail";
import Notification from "../pages/Notification";
import NFTCreator from "../components/NFT/NFTCreator";

const AppRoutes = () => {
  return (
    <Routes>
      <Route path="/" element={<Home />} />
      <Route path="/Dashboard" element={<Dashboard />} />
      <Route path="/farm" element={<Farm />} />
      <Route path="/add-nft" element={<CreateNFT />} />
      <Route path="/add-nft/nft-view" element={<NTFview />} />
      <Route path="/login" element={<WalletLogin />} />
      {/* <Route path="/collections" element={<Collections/>} /> */}
      <Route path="/user/:address" element={<Profileuser />} />
      <Route path="/nft" element={<NFTDetail />} />
      <Route path="/post/:postId" element={<PostDetail />} />
      <Route path="/post/:postId/create-nft" element={<NFTCreator />} />
      <Route path="/premium" element={<Premium />} />
      <Route path="/quest" element={<Quest />} />
      <Route path="/task/:taskId" element={<TaskDetail />} />
      <Route path="/wallet" element={<Wallet />} />
      <Route path="/profile" element={<ProfileNFT />} />
      <Route path="/create" element={<CreateNFT />} />
      <Route path="/nft" element={<NFTDetail />} />
      <Route path="/SnakeGame" element={<SnakeGame />} />
      <Route path="/DropGame" element={<DropGame />} />
      <Route path="/Setting" element={<Settings />} />
      <Route path="/notifications" element={<Notification />} />
    </Routes>
  );
};

export default AppRoutes;