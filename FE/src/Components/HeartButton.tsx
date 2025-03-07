import React, { useState } from 'react';
import { FaHeart } from 'react-icons/fa';

const HeartButton = () => {
  const [isLiked, setIsLiked] = useState(false);
  
  const toggleLike = () => {
    setIsLiked(!isLiked);
  };
  
  return (
    <button
      onClick={toggleLike}
      className={`
        relative
        transform 
        transition-all 
        duration-300
        rounded-full
        p-3
        focus:outline-none
        overflow-hidden
        shadow-lg
        ${isLiked 
          ? 'bg-gradient-to-br from-pink-500 to-red-600 scale-110' 
          : 'bg-gradient-to-br from-gray-100 to-gray-300 hover:scale-105'
        }
        before:absolute
        before:inset-0
        before:rounded-full
        before:bg-gradient-to-tr
        before:from-white/30
        before:to-transparent
        before:opacity-40
        hover:shadow-xl
      `}
    >
      <FaHeart 
        className={`
          text-xl
          transform
          transition-all
          duration-300
          ${isLiked 
            ? 'text-white scale-110 animate-pulse' 
            : 'text-gray-500'
          }
        `} 
      />
      
      {/* 3D effect elements */}
      <span className={`
        absolute 
        inset-0 
        rounded-full
        bg-gradient-to-t
        ${isLiked 
          ? 'from-red-700/70 to-transparent' 
          : 'from-gray-400/30 to-transparent'
        }
        opacity-40
        bottom-1
      `}></span>
      
      {/* Highlight effect */}
      <span className="
        absolute 
        top-1 
        left-1 
        right-1 
        h-1/3 
        bg-white/20 
        rounded-t-full
      "></span>
    </button>
  );
};

export default HeartButton;