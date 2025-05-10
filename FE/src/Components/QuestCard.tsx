// components/QuestCard.tsx
import React from "react";
import "./QuestCard.css";

interface QuestCardProps {
  title: string;
  icon: string;
  reward: string;
  status: "start" | "claim" | "completed";
  onClick: () => void;
}

const QuestCard: React.FC<QuestCardProps> = ({ title, icon, reward, status, onClick }) => {
  return (
    <div className="quest-card">
      <img src={icon} alt={title} className="quest-icon" />
      <div className="quest-info">
        <h3 className="quest-title">{title}</h3>
        <p className="quest-reward">{reward}</p>
      </div>
      {status !== "completed" && (
        <button className={`quest-button ${status}`} onClick={onClick}>
          {status === "start" ? "Start" : "Claim"}
        </button>
      )}
    </div>
  );
};

export default QuestCard;
