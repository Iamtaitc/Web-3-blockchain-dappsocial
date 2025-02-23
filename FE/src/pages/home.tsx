import "../styles/home.css";
import newImage from "../assets/pngtree-background-beautiful-wallpaper-image-picture-image_15491298.jpg";

const Home = () => {
  return (
    <div className="container">
    <div className="left-panel">
      <div className="post">
        <div className="user-info">
          <img
            src={newImage}
            alt="avatar"
            className="avatar"
          />
          <div>
            <p className="username">ning.0308</p>
            <p className="time">22 giờ</p>
          </div>
        </div>
        <p className="post-title">
          Cảnh thiên nhiên thơ mộng
        </p>
        <img src={newImage} alt="background" className="post-image" />
        <img src={newImage} alt="background" className="post-image" />
        <div className="actions">
          <span>22k ❤️</span> 
          <span>26 💬</span>
          <button className="buy-nft">Buy NFT</button>
        </div>
      </div>
    </div>
    <div className="right-panel">
      <div className="balance">
        <p className="balance-amount">189.331.433 Dx</p>
        <p className="checkin">Check In - Day 14</p>
        <button className="claim">Claim</button>
        <p className="farming">Farming 400 Dx/h</p>
        <button className="claim">Claim</button>
      </div>
      <div className="referrals">
        <p>Total Referrals: 3</p>
        <button className="invite">Invite Friends now</button>
      </div>
    </div>
  </div>
  );
};

export default Home;
