// pages/Profile.tsx
import React from "react";
import NFTCard from "../components/NFTCard";
import "../styles/ProfileNFT.css"; // Import CSS riêng cho Profile

interface NFTItem {
  image: string;
  title: string;
  price: string;
}

const ProfileNFT: React.FC = () => {
  const nfts: NFTItem[] = [
    { image: "/nft1.jpg", title: "NFT Name", price: "0.39341" },
    { image: "/nft2.jpg", title: "NFT Name", price: "0.39341" },
    { image: "/nft3.jpg", title: "NFT Name", price: "0.39341" },
    { image: "/nft4.jpg", title: "NFT Name", price: "0.39341" },
    { image: "/nft2.jpg", title: "NFT Name", price: "0.39341" },
    { image: "/nft3.jpg", title: "NFT Name", price: "0.39341" },
    { image: "/nft4.jpg", title: "NFT Name", price: "0.39341" },
    { image: "/nft2.jpg", title: "NFT Name", price: "0.39341" },
  ];

  return (
    <div className="profile-container">
      {/* Profile Header */}
      <div className="profile-header">
        <img src="https://a.deviantart.net/avatars-big/s/p/spiraloso.png?9" alt="Logo" className="profile-logo" />
        <div>
          <h1 className="profile-name">Nin0912</h1>
          <p className="profile-stats">
            Followers: 14k | Favorites: 982 | Products: 82 | Sold: 102
          </p>
          <p className="profile-description">
            Web-3-blockchain-dappsocial is an advanced decentralized
            application (DApp) platform that allows users to easily create,
            list, and trade NFTs securely.
          </p>
        </div>
      </div>

      {/* NFT Card List */}
      <div className="nft-list">
        {nfts.map((nft, index) => (
          <NFTCard key={index} image={nft.image} title={nft.title} price={nft.price} />
        ))}
      </div>
      
    </div>
  );
};

export default ProfileNFT;
