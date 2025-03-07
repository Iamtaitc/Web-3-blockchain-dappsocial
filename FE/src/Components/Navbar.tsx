import React from "react";
import { Link } from "react-router-dom";
import "./Navbar.css";
import { FaHome, FaSearch, FaLeaf, FaPlus, FaCrown, FaQuestion, FaWallet, FaBars } from "react-icons/fa";

const Navbar: React.FC = () => {
  return (
    <nav className="navbar">
      <div className="logo">
        <img src="https://images-wixmp-ed30a86b8c4ca887773594c2.wixmp.com/f/17fff740-d526-4b77-a49f-093d9ac45b2e/dj8ebp0-271148db-4795-4189-bdd0-d8bdb4320bbd.png?token=eyJ0eXAiOiJKV1QiLCJhbGciOiJIUzI1NiJ9.eyJzdWIiOiJ1cm46YXBwOjdlMGQxODg5ODIyNjQzNzNhNWYwZDQxNWVhMGQyNmUwIiwiaXNzIjoidXJuOmFwcDo3ZTBkMTg4OTgyMjY0MzczYTVmMGQ0MTVlYTBkMjZlMCIsIm9iaiI6W1t7InBhdGgiOiJcL2ZcLzE3ZmZmNzQwLWQ1MjYtNGI3Ny1hNDlmLTA5M2Q5YWM0NWIyZVwvZGo4ZWJwMC0yNzExNDhkYi00Nzk1LTQxODktYmRkMC1kOGJkYjQzMjBiYmQucG5nIn1dXSwiYXVkIjpbInVybjpzZXJ2aWNlOmZpbGUuZG93bmxvYWQiXX0._nIe5Pg1XwHlGtpTzgptwlgPVcAr5i0ZABGlubB9inQ" alt="" />
      </div>
      <ul className="nav-links">
        <li><Link to="/"><FaHome /><span>Home</span></Link></li>
        <li><Link to="/dashboard"><FaSearch /><span>Dashboard</span></Link></li>
        <li><Link to="/farm"><FaLeaf /><span>Farm</span></Link></li>
        <li><Link to="/add-nft"><FaPlus /><span>Add NFT</span></Link></li>
        <li><Link to="/premium"><FaCrown /><span>Premium</span></Link></li>
        <li><Link to="/quest"><FaQuestion /><span>Quest</span></Link></li>
        <li><Link to="/wallet"><FaWallet /><span>Wallet</span></Link></li>
      </ul>
      <div className="menu">
        <FaBars />
        <span>Menu</span>
      </div>
    </nav>
  );
};

export default Navbar;
