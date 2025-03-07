import { Link } from "react-router-dom";
import "../../index.css";

const HomeNFT = () => {
  return (
    <div className="p-4">
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
