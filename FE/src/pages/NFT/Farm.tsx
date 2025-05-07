
"use client"

import { useState, useEffect } from "react";
import { FaCheckCircle, FaFire, FaBolt, FaChartLine, FaCalendarCheck, FaCoins, FaGamepad, FaGem, FaTrophy, FaArrowRight, FaHistory } from "react-icons/fa";
import { RewardPointsService } from "../../services/rewardPointsAPI";
import userApi from "../../services/user.api"; // Import userApi để lấy subscription.level
import { Link } from "react-router-dom";

// Định nghĩa kiểu cho Particle
interface Particle {
  id: number;
  x: number;
  y: number;
  size: number;
  speed: number;
  opacity: number;
  color?: "green" | "gold";
  angle?: number;
}

// Định nghĩa kiểu cho dữ liệu từ API /reward/info
interface CheckInHistory {
  date: string;
  streak: number;
  pointsEarned: number;
  tokensEarned: number;
}

interface ClaimHistory {
  amount: number;
  timestamp: string;
}

interface RewardInfo {
  checkIn: {
    currentStreak: number;
    history: CheckInHistory[];
    lastCheckIn: string;
    lastStreakUpdate: string;
  };
  claimHistory: ClaimHistory[];
  claimedTokens: number;
  pendingTokens: number;
  totalPoints: number;
  lastClaimTime: string;
}

// Định nghĩa kiểu cho lịch sử tổng hợp
interface CombinedHistory {
  type: "Check-In" | "Claim";
  time: string;
  streak?: number;
  pointsEarned?: number;
  tokensEarned?: number;
  amount?: number;
}

// Định nghĩa kiểu cho thông tin người dùng từ API /user/:address
interface UserProfile {
  walletAddress: string;
  subscription: {
    level: number;
    isActive: boolean;
    expiration: string | null;
  };
}

const Farm = () => {
  const [claimed, setClaimed] = useState(false);
  const [activeTab, setActiveTab] = useState("farming");
  const [farmingProgress, setFarmingProgress] = useState(0);
  const [showReward, setShowReward] = useState(false);
  const [particles, setParticles] = useState<Particle[]>([]);
  const [userPoints, setUserPoints] = useState({
    points: 0,
    todayPoints: 0,
    checkInStreak: 0,
    pendingTokens: 0,
    totalPoints: 0,
  });
  const [userLevel, setUserLevel] = useState<number | null>(null); // Lưu subscription.level
  const [nextCheckInTime, setNextCheckInTime] = useState<string | null>(null);
  const [timeToNextCheckIn, setTimeToNextCheckIn] = useState<string>("");
  const [nextClaimTime, setNextClaimTime] = useState<Date | null>(null);
  const [timeToNextClaim, setTimeToNextClaim] = useState<string>("");
  const [error, setError] = useState<string | null>(null);
  const [successMessage, setSuccessMessage] = useState<string | null>(null);
  const [rewardInfo, setRewardInfo] = useState<RewardInfo | null>(null);
  const [combinedHistory, setCombinedHistory] = useState<CombinedHistory[]>([]);

  // Fetch user profile để lấy subscription.level
  useEffect(() => {
    const fetchUserProfile = async () => {
      try {
        const walletAddress = "0x3bab9682ed569c6e25e228efb7e61b100bdaf2d3"; // Thay bằng địa chỉ thực tế
        const profile: UserProfile = await userApi.getUserProfile(walletAddress);
        setUserLevel(profile.subscription.level);
      } catch (err: any) {
        console.error("Error fetching user profile:", err);
        setError("Failed to load user profile. Please try again.");
      }
    };

    fetchUserProfile();
  }, []);

  // Fetch user points and check-in streak on mount
  useEffect(() => {
    const fetchUserPoints = async () => {
      try {
        const response = await RewardPointsService.getUserPoints();
        if (response.success) {
          setUserPoints({
            points: response.data.points,
            todayPoints: response.data.todayPoints,
            checkInStreak: response.data.checkInStreak,
            pendingTokens: response.data.pendingTokens,
            totalPoints: response.data.totalPoints,
          });

          const lastCheckIn = response.data.lastCheckIn;
          const timestamp = response.timestamp;
          if (lastCheckIn) {
            const lastCheckInDate = new Date(lastCheckIn);
            const currentTime = new Date(timestamp);

            const nextCheckIn = new Date(lastCheckInDate);
            nextCheckIn.setHours(nextCheckIn.getHours() + 24);

            if (currentTime < nextCheckIn) {
              setClaimed(true);
              setNextCheckInTime(nextCheckIn.toISOString());
            } else {
              setClaimed(false);
              setNextCheckInTime(null);
            }
          }
        } else {
          setError("Failed to load points info. Please try again.");
        }
      } catch (err: any) {
        setError("Server connection error. Please try again later.");
      }
    };

    fetchUserPoints();
  }, []);

  // Fetch user rewards and combine history
  useEffect(() => {
    const fetchUserRewards = async () => {
      try {
        const response = await RewardPointsService.getUserRewards();
        if (response.success) {
          setRewardInfo(response.data);

          if (response.data.lastClaimTime) {
            const lastClaimTime = new Date(response.data.lastClaimTime);
            const nextClaim = new Date(lastClaimTime);
            nextClaim.setHours(nextClaim.getHours() + 8);
            setNextClaimTime(nextClaim);
            localStorage.setItem("nextClaimTime", nextClaim.toISOString());
          } else {
            const savedNextClaimTime = localStorage.getItem("nextClaimTime");
            if (savedNextClaimTime) {
              const nextClaim = new Date(savedNextClaimTime);
              const now = new Date();
              if (nextClaim > now) {
                setNextClaimTime(nextClaim);
              } else {
                localStorage.removeItem("nextClaimTime");
                setFarmingProgress(100);
                setShowReward(true);
              }
            }
          }

          const checkInHistory: CombinedHistory[] = Array.isArray(response.data.checkIn?.history)
            ? response.data.checkIn.history.map((entry: CheckInHistory) => ({
                type: "Check-In" as const,
                time: entry.date,
                streak: entry.streak,
                pointsEarned: entry.pointsEarned,
                tokensEarned: entry.tokensEarned,
              }))
            : [];

          const claimHistory: CombinedHistory[] = Array.isArray(response.data.claimHistory)
            ? response.data.claimHistory.map((entry: ClaimHistory) => ({
                type: "Claim" as const,
                time: entry.timestamp,
                amount: entry.amount,
              }))
            : [];

          const combinedHistory = [...checkInHistory, ...claimHistory].sort(
            (a, b) => new Date(b.time).getTime() - new Date(a.time).getTime()
          );
          setCombinedHistory(combinedHistory);
        } else {
          setError("Failed to load rewards info. Please try again.");
        }
      } catch (err: any) {
        setError("Server connection error. Please try again later.");
      }
    };

    fetchUserRewards();
  }, []);

  // Update time to next claim and farming progress
  useEffect(() => {
    const interval = setInterval(() => {
      if (nextClaimTime) {
        const now = new Date();
        const timeDiff = nextClaimTime.getTime() - now.getTime();
        const totalClaimDuration = 8 * 60 * 60 * 1000;

        if (timeDiff <= 0) {
          setTimeToNextClaim("");
          setNextClaimTime(null);
          setFarmingProgress(100);
          setShowReward(true);
          localStorage.removeItem("nextClaimTime");
        } else {
          const hours = Math.floor(timeDiff / (1000 * 60 * 60));
          const minutes = Math.floor((timeDiff % (1000 * 60 * 60)) / (1000 * 60));
          const seconds = Math.floor((timeDiff % (1000 * 60)) / 1000);
          setTimeToNextClaim(`${hours}h ${minutes}m ${seconds}s`);

          const progress = ((totalClaimDuration - timeDiff) / totalClaimDuration) * 100;
          setFarmingProgress(progress);
        }
      } else {
        const savedNextClaimTime = localStorage.getItem("nextClaimTime");
        if (!savedNextClaimTime && farmingProgress < 100) {
          setFarmingProgress(0);
        }
      }
    }, 1000);

    return () => clearInterval(interval);
  }, [nextClaimTime, farmingProgress]);

  // Update time to next check-in
  useEffect(() => {
    const interval = setInterval(() => {
      if (nextCheckInTime) {
        const now = new Date();
        const nextCheckIn = new Date(nextCheckInTime);
        const timeDiff = nextCheckIn.getTime() - now.getTime();
        if (timeDiff <= 0) {
          setClaimed(false);
          setNextCheckInTime(null);
          setTimeToNextCheckIn("");
        } else {
          const hours = Math.floor(timeDiff / (1000 * 60 * 60));
          const minutes = Math.floor((timeDiff % (1000 * 60 * 60)) / (1000 * 60));
          const seconds = Math.floor((timeDiff % (1000 * 60)) / 1000);
          setTimeToNextCheckIn(`${hours}h ${minutes}m ${seconds}s`);
        }
      }
    }, 1000);

    return () => clearInterval(interval);
  }, [nextCheckInTime]);

  // Generate random particles for background effect
  useEffect(() => {
    const newParticles: Particle[] = Array.from({ length: 20 }, (_, i) => ({
      id: i,
      x: Math.random() * 100,
      y: Math.random() * 100,
      size: Math.random() * 3 + 1,
      speed: Math.random() * 1 + 0.5,
      opacity: Math.random() * 0.3 + 0.1,
    }));
    setParticles(newParticles);

    const interval = setInterval(() => {
      setParticles((prev) =>
        prev.map((p) => ({
          ...p,
          y: (p.y + p.speed) % 100,
          opacity: Math.random() * 0.3 + 0.1,
        })),
      );
    }, 100);

    return () => clearInterval(interval);
  }, []);

  const handleCheckIn = async () => {
    try {
      setError(null);
      setSuccessMessage(null);

      const response = await RewardPointsService.checkIn();
      if (response.success) {
        setClaimed(true);
        setSuccessMessage("Check-in successful! You received your reward.");

        const pointsResponse = await RewardPointsService.getUserPoints();
        if (pointsResponse.success) {
          setUserPoints({
            points: pointsResponse.data.points,
            todayPoints: pointsResponse.data.todayPoints,
            checkInStreak: pointsResponse.data.checkInStreak,
            pendingTokens: pointsResponse.data.pendingTokens,
            totalPoints: pointsResponse.data.totalPoints,
          });

          const lastCheckInDate = new Date(pointsResponse.data.lastCheckIn);
          const nextCheckIn = new Date(lastCheckInDate);
          nextCheckIn.setHours(nextCheckIn.getHours() + 24);
          setNextCheckInTime(nextCheckIn.toISOString());
        }
      } else {
        setError(response.message || "Failed to check-in. Please try again.");
      }
    } catch (err: any) {
      setError("Error during check-in. Please try again later.");
    }
  };

  const handleClaimReward = async () => {
    try {
      setError(null);
      setSuccessMessage(null);

      const response = await RewardPointsService.claimTokens();
      if (response.success) {
        const claimedAmount = response.data.amount || 40;

        setFarmingProgress(0);
        setShowReward(false);
        const newNextClaimTime = new Date();
        newNextClaimTime.setHours(newNextClaimTime.getHours() + 8);
        setNextClaimTime(newNextClaimTime);
        localStorage.setItem("nextClaimTime", newNextClaimTime.toISOString());

        // Cập nhật userPoints và rewardInfo
        const pointsResponse = await RewardPointsService.getUserPoints();
        if (pointsResponse.success) {
          setUserPoints({
            points: pointsResponse.data.points,
            todayPoints: pointsResponse.data.todayPoints,
            checkInStreak: pointsResponse.data.checkInStreak,
            pendingTokens: pointsResponse.data.pendingTokens,
            totalPoints: pointsResponse.data.totalPoints,
          });
        }

        const rewardsResponse = await RewardPointsService.getUserRewards();
        if (rewardsResponse.success) {
          setRewardInfo(rewardsResponse.data);

          const checkInHistory: CombinedHistory[] = Array.isArray(rewardsResponse.data.checkIn?.history)
            ? rewardsResponse.data.checkIn.history.map((entry: CheckInHistory) => ({
                type: "Check-In" as const,
                time: entry.date,
                streak: entry.streak,
                pointsEarned: entry.pointsEarned,
                tokensEarned: entry.tokensEarned,
              }))
            : [];

          const claimHistory: CombinedHistory[] = Array.isArray(rewardsResponse.data.claimHistory)
            ? rewardsResponse.data.claimHistory.map((entry: ClaimHistory) => ({
                type: "Claim" as const,
                time: entry.timestamp,
                amount: entry.amount,
              }))
            : [];

          const combinedHistory = [...checkInHistory, ...claimHistory].sort(
            (a, b) => new Date(b.time).getTime() - new Date(a.time).getTime()
          );
          setCombinedHistory(combinedHistory);
        }

        setSuccessMessage(`Reward claimed successfully! +${claimedAmount} Dx added to your balance.`);
      } else {
        if (response.error?.nextClaimTime) {
          const newNextClaimTime = new Date(response.error.nextClaimTime);
          setNextClaimTime(newNextClaimTime);
          localStorage.setItem("nextClaimTime", newNextClaimTime.toISOString());
          setError("Not enough time to claim. Please wait.");
        } else {
          setError(response.message || "Failed to claim reward. Please try again.");
        }
      }
    } catch (err: any) {
      setError("Error claiming reward. Please try again later.");
    }
  };

  // Tính toán thông số Farming Stats dựa trên subscription.level
  const getFarmingStats = () => {
    if (userLevel === null) {
      return {
        currentRate: "1000 Dx/h",
        activeBoosters: "None",
        nextLevel: "Standard (Level 1)",
        progressToNextLevel: 0,
      };
    }

    let currentRate = "1000 Dx/h";
    let activeBoosters = "None";
    let nextLevel = "";
    let progressToNextLevel = 65; // Giả định tiến trình, có thể điều chỉnh sau

    if (userLevel >= 1 && userLevel < 2) {
      currentRate = "1000 Dx/h"; // Standard
      activeBoosters = "None";
      nextLevel = "Plus (Level 2)";
    } else if (userLevel >= 2 && userLevel < 5) {
      currentRate = "2000 Dx/h"; // Plus
      activeBoosters = "2x Speed";
      nextLevel = "Pro (Level 5)";
    } else if (userLevel >= 5 && userLevel < 10) {
      currentRate = "3000 Dx/h"; // Pro
      activeBoosters = "2x Speed";
      nextLevel = "Elite (Level 10)";
    } else if (userLevel >= 10) {
      currentRate = "4000 Dx/h"; // Elite
      activeBoosters = "3x Rewards";
      nextLevel = "Max Level Reached";
      progressToNextLevel = 100; // Đã đạt level tối đa
    }

    return { currentRate, activeBoosters, nextLevel, progressToNextLevel };
  };

  // Tính toán phần thưởng check-in dựa trên subscription.level
  const getCheckInReward = () => {
    if (userLevel === null) return 10; // Mặc định nếu chưa có level
    if (userLevel >= 1 && userLevel < 2) return 10; // Standard
    if (userLevel >= 2 && userLevel < 5) return 20; // Plus
    if (userLevel >= 5 && userLevel < 10) return 30; // Pro
    return 40; // Elite
  };

  // Tính toán pendingTokens dựa trên subscription.level
  const getPendingTokens = () => {
    if (userLevel === null) return userPoints.pendingTokens;
    if (userLevel >= 1 && userLevel < 2) return userPoints.pendingTokens; // Standard
    if (userLevel >= 2 && userLevel < 5) return userPoints.pendingTokens * 1.5; // Plus
    if (userLevel >= 5 && userLevel < 10) return userPoints.pendingTokens * 2; // Pro
    return userPoints.pendingTokens * 2.5; // Elite
  };

  const farmingStats = getFarmingStats();
  const checkInReward = getCheckInReward();
  const adjustedPendingTokens = getPendingTokens();

  return (
    <div className="w-full font-sans bg-gradient-to-br from-gray-50 to-white text-gray-800 min-h-screen relative overflow-hidden">
      <div className="absolute inset-0 overflow-hidden pointer-events-none">
        {particles.map((particle) => (
          <div
            key={particle.id}
            className={`absolute rounded-full ${particle.color === "green" ? "bg-emerald-500" : "bg-amber-400"}`}
            style={{
              left: `${particle.x}%`,
              top: `${particle.y}%`,
              width: `${particle.size}px`,
              height: `${particle.size}px`,
              opacity: particle.opacity,
              transform: particle.angle ? `rotate(${particle.angle}deg)` : "none",
              transition: "opacity 0.3s ease",
            }}
          />
        ))}
      </div>

      <div className="absolute inset-0 bg-[url('data:image/svg+xml;base64,PHN2ZyB3aWR0aD0iNjAiIGhlaWdodD0iNjAiIHZpZXdCb3g9IjAgMCA2MCA2MCIgeG1sbnM9Imh0dHA6Ly93d3cudzMub3JnLzIwMDAvc3ZnIj48ZyBmaWxsPSJub25lIiBmaWxsLXJ1bGU9ImV2ZW5vZGQiPjxnIGZpbGw9IiMwMDAiIGZpbGwtb3BhY2l0eT0iLjAyIj48cGF0aCBkPSJNMzYgMzRjMC0yLjIxLTEuNzktNC00LTRzLTQgMS43OS00IDQgMS43OSA0IDQgNCA0LTEuNzkgNC00eiIvPjwvZz48L2c+PC9zdmc+')] opacity-30 pointer-events-none"></div>

      <div className="relative bg-gradient-to-r from-emerald-500 to-teal-600 pt-8 pb-16 px-6 md:px-10 rounded-b-[40px] shadow-lg">
        <div className="max-w-7xl mx-auto">
          <div className="flex flex-col md:flex-row justify-between items-start md:items-center gap-4">
            <h1 className="text-3xl md:text-4xl font-bold text-white tracking-tight">Farming Dashboard</h1>
            <div className="flex items-center bg-white/20 backdrop-blur-sm px-6 py-3 rounded-xl border border-white/30 shadow-lg">
              <div className="text-2xl md:text-3xl font-bold text-white">
                {userPoints.totalPoints.toLocaleString()} <span className="text-white/80">Points</span>
              </div>
            </div>
          </div>

          <div className="flex mt-8 bg-gradient-to-br from-white/5 to-white/10 backdrop-blur-lg rounded-2xl p-2.5 max-w-md border border-white/10 shadow-xl">
            <button
              onClick={() => setActiveTab("farming")}
              className={`flex-1 py-3 px-6 mx-1 rounded-xl transition-all duration-300 text-white font-medium text-sm tracking-wide relative overflow-hidden group ${
                activeTab === "farming" ? "bg-gradient-to-r from-emerald-600 to-teal-600 shadow-lg" : "bg-transparent hover:scale-105"
              }`}
            >
              <span className="relative z-10">Farming</span>
              <div
                className={`absolute inset-0 bg-gradient-to-r from-emerald-500/20 to-teal-500/20 opacity-0 group-hover:opacity-100 transition-opacity duration-300 ${
                  activeTab === "farming" ? "opacity-100" : ""
                }`}
              ></div>
            </button>
            <button
              onClick={() => setActiveTab("games")}
              className={`flex-1 py-3 px-6 mx-1 rounded-xl transition-all duration-300 text-white font-medium text-sm tracking-wide relative overflow-hidden group ${
                activeTab === "games" ? "bg-gradient-to-r from-emerald-600 to-teal-600 shadow-lg" : "bg-transparent hover:scale-105"
              }`}
            >
              <span className="relative z-10">Games</span>
              <div
                className={`absolute inset-0 bg-gradient-to-r from-emerald-500/20 to-teal-500/20 opacity-0 group-hover:opacity-100 transition-opacity duration-300 ${
                  activeTab === "games" ? "opacity-100" : ""
                }`}
              ></div>
            </button>
            <button
              onClick={() => setActiveTab("history")}
              className={`flex-1 py-3 px-6 mx-1 rounded-xl transition-all duration-300 text-white font-medium text-sm tracking-wide relative overflow-hidden group ${
                activeTab === "history" ? "bg-gradient-to-r from-emerald-600 to-teal-600 shadow-lg" : "bg-transparent hover:scale-105"
              }`}
            >
              <span className="relative z-10">History</span>
              <div
                className={`absolute inset-0 bg-gradient-to-r from-emerald-500/20 to-teal-500/20 opacity-0 group-hover:opacity-100 transition-opacity duration-300 ${
                  activeTab === "history" ? "opacity-100" : ""
                }`}
              ></div>
            </button>
          </div>
        </div>

        <div className="absolute bottom-0 left-0 right-0 h-8 overflow-hidden">
          <svg
            xmlns="http://www.w3.org/2000/svg"
            viewBox="0 0 1200 120"
            preserveAspectRatio="none"
            className="absolute bottom-0 w-full h-20 text-white"
          >
            <path
              d="M0,0V46.29c47.79,22.2,103.59,32.17,158,28,70.36-5.37,136.33-33.31,206.8-37.5C438.64,32.43,512.34,53.67,583,72.05c69.27,18,138.3,24.88,209.4,13.08,36.15-6,69.85-17.84,104.45-29.34C989.49,25,1113-14.29,1200,52.47V0Z"
              fill="currentColor"
              opacity=".25"
            ></path>
            <path
              d="M0,0V15.81C13,36.92,27.64,56.86,47.69,72.05,99.41,111.27,165,111,224.58,91.58c31.15-10.15,60.09-26.07,89.67-39.8,40.92-19,84.73-46,130.83-49.67,36.26-2.85,70.9,9.42,98.6,31.56,31.77,25.39,62.32,62,103.63,73,40.44,10.79,81.35-6.69,119.13-24.28s75.16-39,116.92-43.05c59.73-5.85,113.28,22.88,168.9,38.84,30.2,8.66,59,6.17,87.09-7.5,22.43-10.89,48-26.93,60.65-49.24V0Z"
              fill="currentColor"
              opacity=".5"
            ></path>
            <path
              d="M0,0V5.63C149.93,59,314.09,71.32,475.83,42.57c43-7.64,84.23-20.12,127.61-26.46,59-8.63,112.48,12.24,165.56,35.4C827.93,77.22,886,95.24,951.2,90c86.53-7,172.46-45.71,248.8-84.81V0Z"
              fill="currentColor"
            ></path>
          </svg>
        </div>
      </div>

      <div className="relative z-10 max-w-7xl mx-auto px-6 -mt-10">
        {successMessage && (
          <div className="mb-6 bg-green-100 text-green-700 p-4 rounded-lg shadow-md flex justify-between items-center">
            <span>{successMessage}</span>
            <button onClick={() => setSuccessMessage(null)} className="text-green-700 hover:text-green-900">
              ✕
            </button>
          </div>
        )}
        {error && (
          <div className="mb-6 bg-red-100 text-red-700 p-4 rounded-lg shadow-md flex justify-between items-center">
            <span>{error}</span>
            <button onClick={() => setError(null)} className="text-red-700 hover:text-red-900">
              ✕
            </button>
          </div>
        )}

        <div className="space-y-6">
          {activeTab === "farming" && (
            <>
              <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
                <div className="bg-white rounded-2xl p-6 border border-gray-100 shadow-xl transition-all duration-300 hover:shadow-2xl group">
                  <h3 className="font-bold text-xl mb-4 flex items-center text-gray-800">
                    <FaFire className="mr-2 text-amber-500" /> Active Farming
                  </h3>

                  <div className="flex items-center mb-6">
                    <div className="flex items-center gap-2 bg-amber-50 px-4 py-2 rounded-lg border border-amber-100 shadow-sm">
                      <FaCoins className="text-amber-500 text-xl" />
                      <span className="font-bold text-gray-800 text-lg">{adjustedPendingTokens} Dx</span>
                    </div>
                  </div>

                  <div className="flex justify-center my-8">
                    <div className="w-28 h-28 bg-gradient-to-br from-emerald-50 to-emerald-100 rounded-full flex items-center justify-center relative shadow-lg group-hover:shadow-emerald-100/50 transition-all duration-500">
                      <div className="absolute inset-0 rounded-full bg-emerald-500 opacity-10 animate-ping"></div>
                      <div className="absolute inset-0 rounded-full bg-gradient-to-br from-emerald-500/20 to-teal-500/20 animate-pulse"></div>
                      <FaFire className="text-emerald-500 text-5xl" />
                    </div>
                  </div>

                  <div className="mb-3 bg-gray-100 rounded-full h-5 overflow-hidden shadow-inner">
                    <div
                      className="h-full bg-gradient-to-r from-emerald-500 to-teal-400 transition-all duration-300 relative"
                      style={{ width: `${farmingProgress}%` }}
                    >
                      <div className="absolute inset-0 bg-white/20 overflow-hidden flex">
                        <div className="w-full h-full bg-stripes-white opacity-20"></div>
                      </div>
                    </div>
                  </div>

                  {farmingProgress < 100 ? (
                    <div className="bg-gray-50 rounded-lg p-3 text-center font-bold mb-4 text-gray-700 shadow-sm border border-gray-100">
                      {timeToNextClaim || "Farming in progress..."}
                    </div>
                  ) : (
                    <button
                      onClick={handleClaimReward}
                      className="w-full py-3 rounded-xl text-sm font-medium bg-gradient-to-r from-emerald-500 to-teal-500 text-white hover:from-emerald-600 hover:to-teal-600 transition-all duration-300 transform hover:scale-[1.02] active:scale-95 shadow-lg"
                    >
                      Claim Reward
                    </button>
                  )}
                </div>

                <div className="bg-white rounded-2xl p-6 border border-gray-100 shadow-xl transition-all duration-300 hover:shadow-2xl">
                  <h3 className="font-bold text-xl mb-4 flex items-center text-gray-800">
                    <FaBolt className="mr-2 text-amber-500" /> Boosters
                  </h3>

                  <div className="grid grid-cols-2 gap-4 mb-6">
                    <div className="bg-gradient-to-br from-gray-50 to-white rounded-xl p-4 text-center transition-all duration-300 hover:shadow-lg cursor-pointer transform hover:scale-[1.02] border border-gray-100">
                      <div className="flex justify-center mb-3">
                        <div className="w-14 h-14 bg-amber-50 rounded-full flex items-center justify-center shadow-md border border-amber-100">
                          <FaBolt className="text-amber-500 text-xl" />
                        </div>
                      </div>
                      <p className="font-bold text-gray-800">2x Speed</p>
                      <p className="text-sm text-emerald-600 mb-3">{userLevel && userLevel >= 2 ? "Active" : "1 hour"}</p>
                      <button
                        className={`w-full py-2 rounded-lg text-sm font-medium transition-colors shadow-md ${
                          userLevel && userLevel >= 2 ? "bg-green-500 text-white cursor-not-allowed" : "bg-gradient-to-r from-emerald-500 to-teal-500 text-white hover:from-emerald-600 hover:to-teal-600"
                        }`}
                        disabled={userLevel && userLevel >= 2}
                      >
                        {userLevel && userLevel >= 2 ? "Active" : "Activate"}
                      </button>
                    </div>

                    <div className="bg-gradient-to-br from-gray-50 to-white rounded-xl p-4 text-center transition-all duration-300 hover:shadow-lg cursor-pointer transform hover:scale-[1.02] border border-gray-100">
                      <div className="flex justify-center mb-3">
                        <div className="w-14 h-14 bg-purple-50 rounded-full flex items-center justify-center shadow-md border border-purple-100">
                          <FaBolt className="text-purple-500 text-xl" />
                        </div>
                      </div>
                      <p className="font-bold text-gray-800">3x Rewards</p>
                      <p className="text-sm text-emerald-600 mb-3">{userLevel && userLevel >= 10 ? "Active" : "30 mins"}</p>
                      <button
                        className={`w-full py-2 rounded-lg text-sm font-medium transition-colors shadow-md ${
                          userLevel && userLevel >= 10 ? "bg-green-500 text-white cursor-not-allowed" : "bg-gradient-to-r from-emerald-500 to-teal-500 text-white hover:from-emerald-600 hover:to-teal-600"
                        }`}
                        disabled={userLevel && userLevel >= 10}
                      >
                        {userLevel && userLevel >= 10 ? "Active" : "Activate"}
                      </button>
                    </div>
                  </div>

                  <div className="bg-gradient-to-br from-gray-50 to-white rounded-xl p-5 transition-all duration-300 hover:shadow-lg cursor-pointer transform hover:scale-[1.01] border border-gray-100">
                    <div className="flex items-center">
                      <div className="w-14 h-14 bg-blue-50 rounded-full flex items-center justify-center mr-4 shadow-md border border-blue-100">
                        <FaChartLine className="text-blue-500 text-xl" />
                      </div>
                      <div>
                        <p className="font-bold text-gray-800">Premium Booster Pack</p>
                        <p className="text-sm text-gray-500">Unlock all boosters for 24 hours</p>
                      </div>
                      <button className="ml-auto px-4 py-2 rounded-lg text-sm font-medium bg-gradient-to-r from-emerald-500 to-teal-500 text-white hover:from-emerald-600 hover:to-teal-600 transition-colors shadow-md">
                        Buy
                      </button>
                    </div>
                  </div>
                </div>

                <div className="bg-white rounded-2xl p-6 border border-gray-100 shadow-xl transition-all duration-300 hover:shadow-2xl">
                  <h3 className="font-bold text-xl mb-4 flex items-center text-gray-800">
                    <FaCalendarCheck className="mr-2 text-emerald-500" /> Daily Check In
                  </h3>

                  <div className="flex justify-between items-center mb-6">
                    <div>
                      <p className="text-gray-500 text-sm">Next Check In</p>
                      <p className="font-bold text-gray-800">
                        {timeToNextCheckIn || (nextCheckInTime ? new Date(nextCheckInTime).toLocaleTimeString([], { hour: "2-digit", minute: "2-digit" }) : "Now")}
                      </p>
                    </div>
                    <div className="text-center">
                      <p className="text-gray-500 text-sm">Current Streak</p>
                      <div className="flex items-center">
                        <div className="bg-emerald-50 border border-emerald-100 rounded-lg px-3 py-1 shadow-sm">
                          <p className="font-bold text-xl text-emerald-600">Day {userPoints.checkInStreak}</p>
                        </div>
                        <div className="w-8 h-8 bg-emerald-500 rounded-full flex items-center justify-center ml-2 shadow-md">
                          <FaCheckCircle className="text-white" />
                        </div>
                      </div>
                    </div>
                  </div>

                  <button
                    onClick={handleCheckIn}
                    className={`w-full py-3 rounded-xl text-sm font-medium transition-all duration-300 transform hover:scale-[1.02] active:scale-95 shadow-lg ${
                      claimed ? "bg-gray-200 text-gray-500" : "bg-gradient-to-r from-emerald-500 to-teal-500 hover:from-emerald-600 hover:to-teal-600 text-white"
                    }`}
                    disabled={claimed}
                  >
                    {claimed ? "Claimed Today" : "Claim Daily Reward"}
                  </button>

                  <div className="mt-4 bg-gradient-to-br from-gray-50 to-white rounded-xl p-4 border border-gray-100 shadow-sm">
                    <p className="text-sm text-center mb-3 text-gray-600">Today's Points</p>
                    <div className="flex items-center justify-center gap-3 bg-amber-50 p-3 rounded-lg border border-amber-100">
                      <FaCoins className="text-amber-500 text-xl" />
                      <span className="font-bold text-gray-800 text-lg">{checkInReward} Points</span>
                    </div>
                  </div>
                </div>
              </div>

              <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
                <div className="md:col-start-3">
                  <div className="bg-white rounded-2xl p-6 border border-gray-100 shadow-xl transition-all duration-300 hover:shadow-2xl">
                    <h3 className="font-bold text-xl mb-4 flex items-center text-gray-800">
                      <FaChartLine className="mr-2 text-blue-500" /> Farming Stats
                    </h3>

                    <div className="space-y-4">
                      <div className="flex justify-between items-center bg-gradient-to-br from-gray-50 to-white p-3 rounded-lg border border-gray-100">
                        <p className="text-gray-500">Total Points:</p>
                        <p className="font-bold text-gray-800">{userPoints.totalPoints.toLocaleString()} Points</p>
                      </div>
                      <div className="flex justify-between items-center bg-gradient-to-br from-gray-50 to-white p-3 rounded-lg border border-gray-100">
                        <p className="text-gray-500">Current Rate:</p>
                        <p className="font-bold text-gray-800">{farmingStats.currentRate}</p>
                      </div>
                      <div className="flex justify-between items-center bg-gradient-to-br from-gray-50 to-white p-3 rounded-lg border border-gray-100">
                        <p className="text-gray-500">Active Boosters:</p>
                        <p className="font-bold text-emerald-500">{farmingStats.activeBoosters}</p>
                      </div>
                      <div className="flex justify-between items-center bg-gradient-to-br from-gray-50 to-white p-3 rounded-lg border border-gray-100">
                        <p className="text-gray-500">Next Level:</p>
                        <p className="font-bold text-gray-800">{farmingStats.nextLevel}</p>
                      </div>
                    </div>

                    <div className="mt-6 bg-gradient-to-br from-gray-50 to-white rounded-xl p-4 border border-gray-100 shadow-sm">
                      <p className="text-sm mb-3 text-gray-600">Progress to Next Level</p>
                      <div className="bg-gray-200 rounded-full h-3 overflow-hidden shadow-inner">
                        <div
                          className="h-full bg-gradient-to-r from-blue-500 to-indigo-500 relative"
                          style={{ width: `${farmingStats.progressToNextLevel}%` }}
                        >
                          <div className="absolute inset-0 bg-white/20 overflow-hidden flex">
                            <div className="w-full h-full bg-stripes-white opacity-20"></div>
                          </div>
                        </div>
                      </div>
                      <div className="flex justify-between items-center mt-2">
                        <p className="text-xs text-gray-500">0%</p>
                        <p className="text-xs font-medium text-blue-500">{farmingStats.progressToNextLevel}%</p>
                        <p className="text-xs text-gray-500">100%</p>
                      </div>
                    </div>
                  </div>
                </div>
              </div>
            </>
          )}

          {activeTab === "games" && (
            <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
              <div className="bg-white rounded-2xl overflow-hidden border border-gray-100 shadow-xl transition-all duration-300 hover:shadow-2xl group">
                <div className="h-48 bg-gradient-to-r from-blue-500 to-indigo-600 relative overflow-hidden">
                  <div className="absolute inset-0 flex items-center justify-center">
                    <FaGamepad className="text-white text-7xl opacity-20" />
                  </div>
                  <div className="absolute inset-0 bg-[url('data:image/svg+xml;base64,PHN2ZyB3aWR0aD0iNjAiIGhlaWdodD0iNjAiIHZpZXdCb3g9IjAgMCA2MCA6MCIgeG1sbnM9Imh0dHA6Ly93d3cudzMub3JnLzIwMDAvc3ZnIj48ZyBmaWxsPSJub25lIiBmaWxsLXJ1bGU9ImV2ZW5vZGQiPjxnIGZpbGw9IiNmZmYiIGZpbGwtb3BhY2l0eT0iLjEiPjxwYXRoIGQ9Ik0zNiAzNGMwLTIuMjEtMS43OS00LTQtNHMtNCAxLjc5LTQgNCAxLjc5IDQgNCA0IDQtMS43OSA0LTR6Ii8+PC9nPjwvZz48L3N2Zz4=')] opacity-20"></div>
                  <div className="absolute bottom-0 left-0 right-0 bg-gradient-to-t from-black/50 to-transparent h-24"></div>
                  <div className="absolute bottom-4 left-6">
                    <div className="bg-white/20 backdrop-blur-sm px-3 py-1 rounded-full text-xs text-white font-medium inline-flex items-center">
                      <span className="w-2 h-2 bg-green-400 rounded-full mr-1"></span>
                      Live Now
                    </div>
                  </div>
                </div>
                <div className="p-6">
                  <h3 className="font-bold text-xl mb-2 text-gray-800">Pixel Miner</h3>
                  <p className="text-gray-500 mb-6">Mine pixels to earn Dx tokens and rare NFTs</p>
                  <div className="flex justify-between items-center">
                    <div>
                      <p className="text-sm text-gray-500">Current Score</p>
                      <p className="font-bold text-gray-800">41 pezz</p>
                    </div>
                    <Link to="/DropGame">
                      <button className="px-6 py-2 rounded-lg text-sm font-medium bg-gradient-to-r from-emerald-500 to-teal-500 text-white hover:from-emerald-600 hover:to-teal-600 transition-all duration-300 transform hover:scale-105 active:scale-95 shadow-md">
                        Play Now
                      </button>
                    </Link>
                  </div>
                </div>
              </div>

              <div className="bg-white rounded-2xl p-6 border border-gray-100 shadow-xl transition-all duration-300 hover:shadow-2xl">
                <h3 className="font-bold text-xl mb-6 text-gray-800">More Games</h3>

                <div className="space-y-4">
                  <div className="bg-gradient-to-br from-gray-50 to-white rounded-xl p-4 flex justify-between items-center transition-all duration-300 hover:shadow-lg cursor-pointer border border-gray-100">
                    <div className="flex items-center">
                      <div className="w-12 h-12 bg-amber-50 rounded-full flex items-center justify-center mr-4 shadow-md border border-amber-100">
                        <FaCoins className="text-amber-500" />
                      </div>
                      <div>
                        <h4 className="font-bold text-gray-800">Coin Flip</h4>
                        <p className="text-gray-500 text-xs">Win up to 2x your bet</p>
                      </div>
                    </div>
                    <button className="px-4 py-2 rounded-lg text-sm font-medium bg-gradient-to-r from-gray-700 to-gray-800 text-white hover:from-gray-800 hover:to-gray-900 transition-colors shadow-md">
                      Play
                    </button>
                  </div>

                  <div className="bg-gradient-to-br from-gray-50 to-white rounded-xl p-4 flex justify-between items-center transition-all duration-300 hover:shadow-lg cursor-pointer border border-gray-100">
                    <div className="flex items-center">
                      <div className="w-12 h-12 bg-purple-50 rounded-full flex items-center justify-center mr-4 shadow-md border border-purple-100">
                        <FaGem className="text-purple-500" />
                      </div>
                      <div>
                        <h4 className="font-bold text-gray-800">Gem Hunter</h4>
                        <p className="text-gray-500 text-xs">Find hidden gems for rewards</p>
                      </div>
                    </div>
                    <button className="px-4 py-2 rounded-lg text-sm font-medium bg-gradient-to-r from-gray-700 to-gray-800 text-white hover:from-gray-800 hover:to-gray-900 transition-colors shadow-md">
                      Play
                    </button>
                  </div>

                  <div className="bg-gradient-to-br from-gray-50 to-white rounded-xl p-4 flex justify-between items-center transition-all duration-300 hover:shadow-lg cursor-pointer border border-gray-100">
                    <div className="flex items-center">
                      <div className="w-12 h-12 bg-amber-50 rounded-full flex items-center justify-center mr-4 shadow-md border border-amber-100">
                        <FaTrophy className="text-amber-500" />
                      </div>
                      <div>
                        <h4 className="font-bold text-gray-800">Tournament</h4>
                        <p className="text-gray-500 text-xs">Compete for massive prizes</p>
                      </div>
                    </div>
                    <button className="px-4 py-2 rounded-lg text-sm font-medium bg-gradient-to-r from-gray-700 to-gray-800 text-white hover:from-gray-800 hover:to-gray-900 transition-colors shadow-md">
                      Join
                    </button>
                  </div>
                </div>
              </div>
            </div>
          )}

          {activeTab === "history" && (
            <div className="grid grid-cols-1 gap-6">
              <div className="bg-white rounded-2xl p-6 border border-gray-100 shadow-xl transition-all duration-300 hover:shadow-2xl">
                <h3 className="font-bold text-xl mb-4 flex items-center text-gray-800">
                  <FaHistory className="mr-2 text-blue-500" /> Farming History
                </h3>

                {combinedHistory.length > 0 ? (
                  <div className="overflow-x-auto">
                    <table className="w-full text-left">
                      <thead>
                        <tr className="bg-gray-50">
                          <th className="p-3 text-sm font-semibold text-gray-600">Time</th>
                          <th className="p-3 text-sm font-semibold text-gray-600">Type</th>
                          <th className="p-3 text-sm font-semibold text-gray-600">Streak</th>
                          <th className="p-3 text-sm font-semibold text-gray-600">Points</th>
                          <th className="p-3 text-sm font-semibold text-gray-600">Tokens</th>
                          <th className="p-3 text-sm font-semibold text-gray-600">Amount</th>
                        </tr>
                      </thead>
                      <tbody>
                        {combinedHistory.map((entry, index) => (
                          <tr key={`${entry.type}-${entry.time}-${index}`} className="border-t border-gray-100 hover:bg-gray-50">
                            <td className="p-3 text-sm text-gray-800">
                              {new Date(entry.time).toLocaleString([], {
                                year: "numeric",
                                month: "2-digit",
                                day: "2-digit",
                                hour: "2-digit",
                                minute: "2-digit",
                              })}
                            </td>
                            <td className="p-3 text-sm text-gray-800">{entry.type}</td>
                            <td className="p-3 text-sm text-gray-800">{entry.type === "Check-In" ? entry.streak : "-"}</td>
                            <td className="p-3 text-sm text-gray-800">{entry.type === "Check-In" ? entry.pointsEarned : "-"}</td>
                            <td className="p-3 text-sm text-gray-800">{entry.type === "Check-In" ? entry.tokensEarned : "-"}</td>
                            <td className="p-3 text-sm text-gray-800">{entry.type === "Claim" ? `${entry.amount} Dx` : "-"}</td>
                          </tr>
                        ))}
                      </tbody>
                    </table>
                  </div>
                ) : (
                  <p className="text-gray-500 text-center">No farming history available.</p>
                )}
              </div>
            </div>
          )}
        </div>
      </div>
    </div>
  );
};

export default Farm;
