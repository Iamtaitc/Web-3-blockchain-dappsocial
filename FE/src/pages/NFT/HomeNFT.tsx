import { Link, useNavigate } from "react-router-dom";
import "../../index.css";
import { useState } from "react";

const HomeNFT = () => {
  const [isWalletModalOpen, setIsWalletModalOpen] = useState(false);
  const navigate = useNavigate(); 

  const handleConnectWallet = () => {
    setIsWalletModalOpen(true);
    navigate("/login"); // Điều hướng đến trang login
  };

  return (
    <div className="p-4">
      <h1 className="text-2xl font-bold">NFT Marketplace</h1>
      <button
        onClick={handleConnectWallet}
        className="px-4 py-2 bg-primary text-white rounded-md hover:bg-primary/90 transition-colors"
      >
        Connect Wallet
      </button>
      <h1 className="text-lime-500 font-bold">Trang NFT</h1>
      <Link to="/add-nft/create-nft" className="mt-4 inline-block">
        <button className="bg-gradient-to-r from-green-400 to-blue-500 hover:from-green-500 hover:to-blue-600 text-white font-semibold py-2 px-6 rounded-lg shadow-md transition-all duration-300">
          Tạo NFT
        </button>
      </Link>
    </div>
  );  
};

export default HomeNFT;
