"use client"

import { useState } from "react"
import { FaHeart } from "react-icons/fa"

const HeartButton = () => {
  const [isLiked, setIsLiked] = useState(false)

  const toggleLike = () => {
    setIsLiked(!isLiked)
  }

  return (
    <>
      <style >{`
        @keyframes heartBeat {
          0% { transform: translateZ(0) scale(1); }
          15% { transform: translateZ(15px) scale(1.3); }
          30% { transform: translateZ(10px) scale(1.15); }
          45% { transform: translateZ(20px) scale(1.25); }
          100% { transform: translateZ(20px) scale(1.2); }
        }
        
        @keyframes particleFly {
          0% {
            opacity: 1;
            transform: translateZ(0) scale(0);
          }
          100% {
            opacity: 0;
            transform: translate(var(--tx, 0), var(--ty, 0)) scale(1);
          }
        }
        
        .heart-beat {
          animation: heartBeat 0.5s cubic-bezier(0.175, 0.885, 0.32, 1.275);
        }
        
        .particle {
          position: absolute;
          width: 6px;
          height: 6px;
          border-radius: 50%;
          background-color: #ff3366;
          opacity: 0;
        }
        
        .liked .particle {
          animation: particleFly 0.7s ease-out forwards;
        }
        
        .particle-1 { top: 0; left: 50%; --tx: 0px; --ty: -30px; }
        .particle-2 { top: 25%; left: 100%; --tx: 30px; --ty: -15px; }
        .particle-3 { top: 75%; left: 100%; --tx: 30px; --ty: 15px; }
        .particle-4 { top: 100%; left: 50%; --tx: 0px; --ty: 30px; }
        .particle-5 { top: 75%; left: 0; --tx: -30px; --ty: 15px; }
        .particle-6 { top: 25%; left: 0; --tx: -30px; --ty: -15px; }
        
        .liked .particle-1 { animation-delay: 0.0s; }
        .liked .particle-2 { animation-delay: 0.05s; }
        .liked .particle-3 { animation-delay: 0.1s; }
        .liked .particle-4 { animation-delay: 0.15s; }
        .liked .particle-5 { animation-delay: 0.2s; }
        .liked .particle-6 { animation-delay: 0.25s; }
        
        /* Reset button styles completely */
        .heart-btn {
          appearance: none;
          -webkit-appearance: none;
          background: transparent;
          border: none !important;
          outline: none !important;
          box-shadow: none !important;
          padding: 10px;
          cursor: pointer;
          position: relative;
        }
        
        .heart-btn:focus, 
        .heart-btn:active,
        .heart-btn:focus-visible {
          border: none !important;
          outline: none !important;
          box-shadow: none !important;
        }
      `}</style>

      <button className="heart-btn" onClick={toggleLike} aria-label={isLiked ? "Unlike" : "Like"}>
        <div
          className="relative flex justify-center items-center"
          style={{ transformStyle: "preserve-3d", perspective: "1000px" }}
        >
          <FaHeart
            className={`text-2xl transition-all duration-300 ease-in-out ${
              isLiked ? "text-[#ff3366] heart-beat" : "text-gray-400"
            }`}
            style={{
              transform: isLiked ? "translateZ(20px) scale(1.2)" : "translateZ(0)",
              filter: isLiked
                ? "drop-shadow(0 8px 20px rgba(255, 51, 102, 0.5))"
                : "drop-shadow(0 0 0 rgba(255, 0, 0, 0))",
            }}
          />
          <div className="absolute w-full h-full pointer-events-none">
            {[...Array(6)].map((_, i) => (
              <div key={i} className={`particle particle-${i + 1}`} />
            ))}
          </div>
        </div>
      </button>
    </>
  )
}

export default HeartButton

