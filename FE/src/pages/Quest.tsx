// pages/QuestPage.tsx
import React, { useState } from "react";
import QuestCard from "../Components/QuestCard";
import "../Style/Quest.css";

const QuestPage: React.FC = () => {
  const [quests, setQuests] = useState([
    { id: 1, title: "Follow X", icon: "https://taylorswift2048game.com/media/2023/10/X-Twitter-2.png", reward: "3.000 Dx", status: "start" },
    { id: 2, title: "Watching Youtube", icon: "https://static.vecteezy.com/system/resources/previews/024/983/592/non_2x/youtube-logo-transparent-free-png.png", reward: "3.000 Dx", status: "start" },
    { id: 3, title: "Watching Youtube", icon: "https://static.vecteezy.com/system/resources/previews/024/983/592/non_2x/youtube-logo-transparent-free-png.png", reward: "3.000 Dx", status: "start" },
    { id: 4, title: "Watching Youtube", icon: "https://static.vecteezy.com/system/resources/previews/024/983/592/non_2x/youtube-logo-transparent-free-png.png", reward: "3.000 Dx", status: "start" },
  ]);

  const handleQuestClick = (id: number) => {
    setQuests((prevQuests) =>
      prevQuests.map((quest) =>
        quest.id === id ? { ...quest, status: quest.status === "start" ? "claim" : "completed" } : quest
      )
    );
  };

  return (
    <div className="quest-container">
      <h2 className="quest-title">Task</h2>
      <div className="quest-list">
        {quests.map((quest) => (
          <QuestCard key={quest.id} {...quest} onClick={() => handleQuestClick(quest.id)} />
        ))}
      </div>
    </div>
  );
};

export default QuestPage;
