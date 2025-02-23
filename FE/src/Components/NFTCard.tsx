// components/NFTCard.tsx
import React from "react";
import "./NFTCard.css"; // Import CSS riêng cho NFTCard

interface NFTCardProps {
  image: string;
  title: string;
  price: string;
}

const NFTCard: React.FC<NFTCardProps> = ({ image, title, price }) => {
  return (
    <div className="nft-card">
      <img src="https://images-wixmp-ed30a86b8c4ca887773594c2.wixmp.com/f/a231cd83-611d-4f2f-8b8d-fa9d6486b183/dj86cd3-72943b1e-a08d-4126-af88-0b630efa5991.png/v1/fill/w_894,h_894,q_70,strp/in_the_sky_by_avafleu_dj86cd3-pre.jpg?token=eyJ0eXAiOiJKV1QiLCJhbGciOiJIUzI1NiJ9.eyJzdWIiOiJ1cm46YXBwOjdlMGQxODg5ODIyNjQzNzNhNWYwZDQxNWVhMGQyNmUwIiwiaXNzIjoidXJuOmFwcDo3ZTBkMTg4OTgyMjY0MzczYTVmMGQ0MTVlYTBkMjZlMCIsIm9iaiI6W1t7InBhdGgiOiJcL2ZcL2EyMzFjZDgzLTYxMWQtNGYyZi04YjhkLWZhOWQ2NDg2YjE4M1wvZGo4NmNkMy03Mjk0M2IxZS1hMDhkLTQxMjYtYWY4OC0wYjYzMGVmYTU5OTEucG5nIiwiaGVpZ2h0IjoiPD05MDAiLCJ3aWR0aCI6Ijw9OTAwIn1dXSwiYXVkIjpbInVybjpzZXJ2aWNlOmltYWdlLndhdGVybWFyayJdLCJ3bWsiOnsicGF0aCI6Ilwvd21cL2EyMzFjZDgzLTYxMWQtNGYyZi04YjhkLWZhOWQ2NDg2YjE4M1wvYXZhZmxldS00LnBuZyIsIm9wYWNpdHkiOjk1LCJwcm9wb3J0aW9ucyI6MC40NSwiZ3Jhdml0eSI6ImNlbnRlciJ9fQ.XlFandYC34jjVv-GLnzRSWVqUKCAxW12DowdoVdwgNw" alt={title} className="nft-image" />
      <h3 className="nft-title">{title}</h3>
      <p className="nft-description">
        NFT Desirable. Refer users with your referral code to earn points.
      </p>
      <p className="nft-price">{price} ETH</p>
      <button className="buy-button">Buy NFT</button>
    </div>
  );
};

export default NFTCard;
