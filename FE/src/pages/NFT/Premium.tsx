
"use client"

import { useState, useEffect, useRef } from "react";
import { motion, AnimatePresence } from "framer-motion";
import { Crown, Rocket, Shield, TrendingUp, Check, Star, Zap, Award, Diamond, Gift, CreditCard, X } from "lucide-react";
import SubscriptionService from "../../services/subscriptionAPI";
import userApi from "../../services/user.api"; // Giả định tệp userApi nằm trong services/userApi

const Premium = () => {
  const [activePlan, setActivePlan] = useState<keyof typeof pricingTiers>("monthly");
  const [selectedMonths, setSelectedMonths] = useState<number>(1);
  const [error, setError] = useState<string | null>(null);
  const [successMessage, setSuccessMessage] = useState<string | null>(null);
  const [loading, setLoading] = useState<boolean>(false);
  const [userLevel, setUserLevel] = useState<number | null>(null); // Lưu level của người dùng
  const [isSubscriptionActive, setIsSubscriptionActive] = useState<boolean>(false); // Lưu trạng thái active của subscription
  const [showPurchaseModal, setShowPurchaseModal] = useState<boolean>(false); // State để hiển thị modal
  const [selectedTier, setSelectedTier] = useState<any>(null); // Gói đang được chọn để mua
  const [modalSelectedMonths, setModalSelectedMonths] = useState<number>(1); // Số tháng được chọn trong modal
  const pricingRef = useRef<HTMLElement>(null); // Tham chiếu đến Pricing Section

  // Lấy thông tin hồ sơ người dùng khi component mount
  useEffect(() => {
    const fetchUserProfile = async () => {
      try {
        const walletAddress = "0xd90cc9fca6563801a8505e8fc5c1194c011534c3"; // Cập nhật đúng ví của bạn
        const profile = await userApi.getUserProfile(walletAddress);
        setUserLevel(profile.subscription.level);
        setIsSubscriptionActive(profile.subscription.isActive && profile.subscription.expiration !== null);
      } catch (err: any) {
        console.error("Error fetching user profile:", err);
        setError("Failed to load user profile. Please try again.");
      }
    };

    fetchUserProfile();
  }, []);

  // Hàm cuộn đến Pricing Section
  const scrollToPricing = () => {
    if (pricingRef.current) {
      pricingRef.current.scrollIntoView({ behavior: "smooth" });
    }
  };

  // Utility function to validate transaction hash
  const isValidTxHash = (hash: string): boolean => {
    if (!hash) return false;
    const txHashRegex = /^0x([A-Fa-f0-9]{64})$/;
    return txHashRegex.test(hash);
  };

  const makePayment = async (paymentDetails: any) => {
    try {
      if (!window.ethereum) {
        throw new Error("Please install MetaMask or OKX wallet to continue.");
      }

      let accounts;
      try {
        accounts = await window.ethereum.request({ method: "eth_requestAccounts" });
      } catch (connectError: any) {
        throw new Error(`Failed to connect wallet: ${connectError.message}. Please check your MetaMask or OKX wallet.`);
      }

      if (!accounts || accounts.length === 0) {
        throw new Error("No wallet accounts found. Please connect your MetaMask or OKX wallet.");
      }

      const chainId = "0xaa36a7"; // Sepolia
      const currentChainId = await window.ethereum.request({ method: "eth_chainId" });
      if (currentChainId !== chainId) {
        try {
          await window.ethereum.request({
            method: "wallet_switchEthereumChain",
            params: [{ chainId }],
          });
        } catch (switchError: any) {
          if (switchError.code === 4902) {
            await window.ethereum.request({
              method: "wallet_addEthereumChain",
              params: [
                {
                  chainId,
                  chainName: "Sepolia Test Network",
                  rpcUrls: ["https://rpc.sepolia.org"],
                  nativeCurrency: { name: "SepoliaETH", symbol: "ETH", decimals: 18 },
                  blockExplorerUrls: ["https://sepolia.etherscan.io"],
                },
              ],
            });
          } else {
            throw new Error("Failed to switch to Sepolia network. Please check your MetaMask or OKX wallet.");
          }
        }
      }

      const { paymentId, transactionHash } = paymentDetails;
      if (!isValidTxHash(transactionHash)) {
        throw new Error(`Invalid transaction hash: ${transactionHash}`);
      }

      return { paymentId, transactionHash };
    } catch (error: any) {
      console.error("makePayment - Error:", error);
      throw new Error(error.message || "An error occurred while processing payment. Please try again.");
    }
  };

  const pricingTiers = {
    monthly: [
      {
        title: "Standard",
        level: 1,
        priceETH: "0.0001",
        period: "month",
        features: [
          "1.5x Reward Multiplier",
          "Access Basic Features",
          "12 Tokens Daily Claim Limit",
          "Up to 3 Posts/Day",
        ],
        popular: false,
        cta: "Get Started",
        color: "from-blue-500 to-blue-600", // Gradient cho Standard
        borderColor: "blue-500", // Màu viền cho Standard
      },
      {
        title: "Plus",
        level: 2,
        priceETH: "0.0002",
        period: "month",
        features: [
          "2x Reward Multiplier",
          "All Standard Features",
          "16 Tokens Daily Claim Limit",
          "Up to 10 Posts/Day",
          "Exclusive Content Access",
        ],
        popular: true,
        cta: "Get Started",
        color: "from-emerald-500 to-teal-600", // Gradient cho Plus
        borderColor: "emerald-500", // Màu viền cho Plus
      },
      {
        title: "Pro",
        level: 5,
        priceETH: "0.0005",
        period: "month",
        features: [
          "3x Reward Multiplier",
          "All Plus Features",
          "24 Tokens Daily Claim Limit",
          "Unlimited Posts",
          "Priority Support",
          "Premium Profile Badge",
        ],
        popular: false,
        cta: "Get Started",
        color: "from-purple-500 to-indigo-600", // Gradient cho Pro
        borderColor: "purple-500", // Màu viền cho Pro
      },
      {
        title: "Elite",
        level: 10,
        priceETH: "0.001",
        period: "month",
        features: [
          "5x Reward Multiplier",
          "All Pro Features",
          "40 Tokens Daily Claim Limit",
          "Exclusive NFTs Access",
          "VIP Events Access",
          "Dedicated Support Channel",
          "Special Profile Customization",
        ],
        popular: false,
        cta: "Get Started",
        color: "from-rose-500 to-rose-600", // Gradient cho Elite
        borderColor: "rose-500", // Màu viền cho Elite
      },
    ],
  };

  const calculateTotalPrice = (tier: any, months: number) => {
    const price = parseFloat(tier.priceETH);
    let total = price * months;
    if (months >= 6 && months < 12) total *= 0.95; // 5% discount
    else if (months === 12) total *= 0.85; // 15% discount
    return total.toFixed(4);
  };

  const handleUpgrade = async (tier: any, months: number) => {
    setError(null);
    setSuccessMessage(null);
    setLoading(true);

    try {
      console.log("handleUpgrade - Creating subscription request for tier:", tier);
      const response = await SubscriptionService.createSubscriptionRequest({
        level: tier.level,
        months: months,
      });
      console.log("handleUpgrade - Subscription request response:", response);

      if (response.success) {
        const paymentDetails = response.data;
        console.log("handleUpgrade - Payment details:", paymentDetails);

        const { paymentId, transactionHash } = await makePayment(paymentDetails);
        console.log("handleUpgrade - makePayment result:", { paymentId, transactionHash });

        if (!isValidTxHash(transactionHash)) {
          throw new Error(`Invalid transaction hash before confirm: ${transactionHash}`);
        }

        const confirmPayload = { paymentId, transactionHash };
        console.log("Calling /subscription/confirm with:", confirmPayload);
        const confirmResponse = await SubscriptionService.confirmPayment(confirmPayload);
        console.log("handleUpgrade - Confirm payment response:", confirmResponse);

        if (confirmResponse.success) {
          setSuccessMessage(`Subscription activated successfully! Level: ${tier.title}, Months: ${months}`);
          const walletAddress = "0xd90cc9fca6563801a8505e8fc5c1194c011534c3"; // Cập nhật đúng ví của bạn
          const profile = await userApi.getUserProfile(walletAddress);
          setUserLevel(profile.subscription.level);
          setIsSubscriptionActive(profile.subscription.isActive && profile.subscription.expiration !== null);
        } else {
          setError(confirmResponse.message || `Failed to confirm payment: ${JSON.stringify(confirmResponse)}`);
        }
      } else {
        setError(response.message || "Failed to create subscription request. Please try again.");
      }
    } catch (err: any) {
      console.error("handleUpgrade - Error during subscription process:", err);
      setError(err.response?.data?.message || err.message || `An error occurred while processing your request: ${JSON.stringify(err)}`);
    } finally {
      setLoading(false);
    }
  };

  const openPurchaseModal = (tier: any) => {
    setSelectedTier(tier);
    setModalSelectedMonths(1); // Mặc định chọn 1 tháng
    setShowPurchaseModal(true);
  };

  const confirmPurchase = () => {
    if (selectedTier) {
      handleUpgrade(selectedTier, modalSelectedMonths);
      setShowPurchaseModal(false);
    }
  };

  const testimonials = [
    {
      quote: "The Elite plan has given me access to exclusive NFTs and events that are worth every penny!",
      author: "Alex Chen",
      role: "Crypto Enthusiast",
    },
    {
      quote: "Upgrading to Pro was a game-changer. The priority support and unlimited posts are fantastic.",
      author: "Sarah Johnson",
      role: "Professional Trader",
    },
    {
      quote: "The Plus plan offers great value with exclusive content and a higher reward multiplier.",
      author: "Michael Rodriguez",
      role: "Digital Asset Manager",
    },
  ];

  return (
    <div className="min-h-screen bg-gray-50 text-white font-mono overflow-hidden">
      {/* Hero Section */}
      <section className="relative py-16 px-6">
        <div className="absolute inset-0 bg-[url('data:image/svg+xml;base64,PHN2ZyB3aWR0aD0iNjAiIGhlaWdodD0iNjAiIHZpZXdCb3g9IjAgMCA2MCA6MCIgeG1sbnM9Imh0dHA6Ly93d3cudzMub3JnLzIwMDAvc3ZnIj48ZyBmaWxsPSJub25lIiBmaWxsLXJ1bGU9ImV2ZW5vZGQiPjxnIGZpbGw9IiMwMDAiIGZpbGwtb3BhY2l0eT0iLjAyIj48cGF0aCBkPSJNMzYgMzRjMC0yLjIxLTEuNzktNC00LTRzLTQgMS43OS00IDQgMS43OSA0IDQgNCA0LTEuNzkgNC00eiIvPjwvZz48L2c+PC9zdmc+')] opacity-30 pointer-events-none"></div>
        <div className="absolute top-0 left-0 w-full h-64 bg-gradient-to-b from-emerald-50 to-transparent opacity-70"></div>
        <div className="absolute -top-24 -right-24 w-96 h-96 bg-emerald-200 rounded-full filter blur-3xl opacity-20"></div>
        <div className="absolute -bottom-24 -left-24 w-96 h-96 bg-blue-200 rounded-full filter blur-3xl opacity-20"></div>

        <div className="max-w-5xl mx-auto relative z-10">
          <motion.div
            className="text-center"
            initial={{ opacity: 0, y: 20 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ duration: 0.8 }}
          >
            <div className="inline-block mb-6 p-3 bg-white rounded-2xl shadow-md">
              <Crown className="h-12 w-12 text-amber-500" />
            </div>
            <h1 className="text-5xl md:text-6xl font-bold mb-6 bg-clip-text text-transparent bg-gradient-to-r from-emerald-500 via-teal-500 to-blue-500">
              Elevate Your Experience
            </h1>
            <p className="text-xl md:text-2xl text-gray-600 max-w-3xl mx-auto mb-10 leading-relaxed">
              Unlock premium features, boost your rewards, and gain access to exclusive benefits tailored for you.
            </p>
            <motion.button
              className="px-8 py-4 bg-gradient-to-r from-emerald-500 to-teal-500 text-white rounded-xl text-lg font-bold shadow-lg hover:shadow-xl transition-all duration-300"
              whileHover={{ scale: 1.05 }}
              whileTap={{ scale: 0.95 }}
              onClick={scrollToPricing}
            >
              Upgrade Now
            </motion.button>
          </motion.div>
        </div>
      </section>

      {/* Features Section */}
      <section className="py-16 px-6 bg-white">
        <div className="max-w-6xl mx-auto">
          <motion.div
            className="text-center mb-12"
            initial={{ opacity: 0, y: 20 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ duration: 0.5 }}
          >
            <div className="inline-block mb-4">
              <Star className="h-8 w-8 text-amber-500" />
            </div>
            <h2 className="text-4xl font-bold mb-4 text-gray-800">Premium Features</h2>
            <p className="text-xl text-gray-600 max-w-3xl mx-auto">
              Discover powerful tools to enhance your experience and maximize your rewards.
            </p>
          </motion.div>

          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-6">
            {[
              {
                icon: <Rocket className="w-6 h-6 text-white" />,
                title: "Reward Multiplier",
                description: "Boost your reward multiplier up to 5x with premium plans.",
              },
              {
                icon: <Shield className="w-6 h-6 text-white" />,
                title: "Priority Support",
                description: "Get faster support and dedicated channels with higher plans.",
              },
              {
                icon: <TrendingUp className="w-6 h-6 text-white" />,
                title: "Exclusive Content",
                description: "Access exclusive content, events, and NFTs with premium plans.",
              },
              {
                icon: <Diamond className="w-6 h-6 text-white" />,
                title: "Profile Customization",
                description: "Unlock premium badges and customization options for your profile.",
              },
            ].map((feature, index) => (
              <motion.div
                key={index}
                className="bg-white rounded-xl p-6 shadow-lg border border-gray-100 hover:shadow-xl transition-all duration-300 relative overflow-hidden group"
                initial={{ opacity: 0, y: 20 }}
                animate={{ opacity: 1, y: 0 }}
                transition={{ delay: 0.1 * index, duration: 0.5 }}
                whileHover={{ y: -5 }}
              >
                <div className="absolute -inset-1 bg-gradient-to-r from-emerald-500 via-teal-500 to-blue-500 rounded-xl blur-lg opacity-0 group-hover:opacity-20 transition-opacity duration-700"></div>
                <div className="bg-gradient-to-r from-emerald-500 to-teal-500 w-12 h-12 rounded-xl flex items-center justify-center mb-4 shadow-md">
                  {feature.icon}
                </div>
                <h3 className="text-lg font-bold mb-2 text-gray-800 group-hover:text-emerald-600 transition-colors">
                  {feature.title}
                </h3>
                <p className="text-gray-600 text-sm">{feature.description}</p>
              </motion.div>
            ))}
          </div>
        </div>
      </section>

      {/* Pricing Section */}
      <section ref={pricingRef} className="py-16 px-6 bg-gray-50 relative">
        <div className="max-w-6xl mx-auto">
          <motion.div
            className="text-center mb-10"
            initial={{ opacity: 0, y: 20 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ duration: 0.5 }}
          >
            <div className="inline-block mb-4">
              <Diamond className="h-8 w-8 text-amber-500" />
            </div>
            <h2 className="text-4xl font-bold mb-4 text-gray-800">Choose Your Plan</h2>
            <p className="text-xl text-gray-600 max-w-3xl mx-auto mb-6">
              Select the perfect premium plan to suit your needs and budget.
            </p>
          </motion.div>

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

          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-6 relative">
            {pricingTiers[activePlan].map((tier, index) => {
              const isLowerLevel = userLevel !== null && tier.level < userLevel;
              const isCurrentLevel = userLevel !== null && tier.level === userLevel && isSubscriptionActive;
              const isHigherLevel = userLevel !== null && tier.level > userLevel;

              let buttonText = tier.cta;
              let buttonClass = `bg-gradient-to-r ${tier.color} text-white hover:from-${tier.borderColor}-600 hover:to-${tier.borderColor === 'blue-500' ? 'blue-700' : tier.borderColor === 'emerald-500' ? 'teal-700' : tier.borderColor === 'purple-500' ? 'indigo-700' : 'rose-700'}`;
              let buttonDisabled = loading;
              let cardClass = `bg-white rounded-xl shadow-md border-2 border-${tier.borderColor}`; // Đảm bảo áp dụng viền cho tất cả thẻ

              if (isLowerLevel) {
                buttonText = "Not Available";
                buttonClass = "bg-gray-300 text-gray-600 cursor-not-allowed opacity-50";
                buttonDisabled = true;
              } else if (isCurrentLevel) {
                buttonText = "Active";
                buttonClass = `bg-gradient-to-r ${tier.color} text-white cursor-not-allowed`;
                buttonDisabled = true;
                cardClass = `bg-white rounded-xl shadow-lg border-2 border-${tier.borderColor} scale-105`; // Viền vẫn được áp dụng
              }

              return (
                <motion.div
                  key={index}
                  className={cardClass}
                  initial={{ opacity: 0, y: 20 }}
                  animate={{ opacity: 1, y: 0 }}
                  transition={{ delay: 0.1 * index, duration: 0.5 }}
                >
                  {tier.popular && (
                    <div className="absolute top-0 right-0 transform translate-x-1/2 -translate-y-1/2 bg-green-500 text-white px-3 py-1 rounded-bl-lg text-xs font-bold shadow-md">
                      Most Popular
                    </div>
                  )}
                  <div className="p-6 flex flex-col h-full">
                    <h3 className={`text-xl font-bold mb-2 uppercase bg-clip-text text-transparent bg-gradient-to-r ${tier.color}`}>
                      {tier.title}
                    </h3>
                    <div className="flex items-end gap-1 mb-4">
                      <span className="text-4xl font-bold text-gray-800">{calculateTotalPrice(tier, 1)}</span>
                      <span className="text-gray-500 text-sm">/ETH</span>
                    </div>

                    <ul className="space-y-2 mb-4 flex-grow">
                      {tier.features.map((feature, idx) => (
                        <li key={idx} className="flex items-start gap-2">
                          <Check className={`text-${tier.borderColor} mt-1 flex-shrink-0 h-4 w-4`} />
                          <span className="text-gray-600 text-sm">{feature}</span>
                        </li>
                      ))}
                    </ul>

                    <button
                      onClick={() => openPurchaseModal(tier)}
                      className={`w-full py-2 rounded-lg font-medium transition-all duration-300 text-sm ${buttonClass} flex items-center justify-center gap-2 mt-auto`}
                      disabled={buttonDisabled}
                    >
                      {buttonText}
                      <CreditCard className="h-4 w-4" />
                    </button>
                  </div>
                </motion.div>
              );
            })}
          </div>
        </div>

        {/* Purchase Modal */}
        <AnimatePresence>
          {showPurchaseModal && selectedTier && (
            <motion.div
              className="absolute inset-0 z-50 flex items-center justify-center"
              initial={{ opacity: 0 }}
              animate={{ opacity: 1 }}
              exit={{ opacity: 0 }}
              transition={{ duration: 0.3 }}
            >
              {/* Overlay chỉ che phủ nội dung chính, không che sidebar */}
              <motion.div
                className="absolute inset-0 bg-gray-500 bg-opacity-75 transition-opacity"
                initial={{ opacity: 0 }}
                animate={{ opacity: 1 }}
                exit={{ opacity: 0 }}
                transition={{ duration: 0.3 }}
                onClick={() => setShowPurchaseModal(false)}
              />
              <motion.div
                className={`relative bg-white dark:bg-gray-800 rounded-lg text-left overflow-hidden shadow-2xl sm:max-w-lg sm:w-full border-2 border-${selectedTier.borderColor}`}
                initial={{ scale: 0.9, opacity: 0 }}
                animate={{ scale: 1, opacity: 1 }}
                exit={{ scale: 0.9, opacity: 0 }}
                transition={{ duration: 0.3 }}
              >
                <div className="bg-white dark:bg-gray-800 px-4 pt-5 pb-4 sm:p-6 sm:pb-4">
                  <div className="sm:flex sm:items-start">
                    <div className="mt-3 text-center sm:mt-0 sm:ml-4 sm:text-left w-full">
                      <h3 className={`text-lg font-bold bg-clip-text text-transparent bg-gradient-to-r ${selectedTier.color}`}>
                        Purchase {selectedTier.title} Plan
                      </h3>
                      <div className="mt-4 space-y-4">
                        <div>
                          <label className="block text-sm font-medium text-gray-700 dark:text-gray-300">
                            Select Duration
                          </label>
                          <select
                            value={modalSelectedMonths}
                            onChange={(e) => setModalSelectedMonths(Number(e.target.value))}
                            className="mt-1 block w-full pl-3 pr-10 py-2 text-base border-gray-300 dark:border-gray-600 focus:outline-none focus:ring-emerald-500 focus:border-emerald-500 sm:text-sm rounded-md bg-white dark:bg-gray-800 text-gray-900 dark:text-white"
                          >
                            {[...Array(12)].map((_, i) => (
                              <option key={i + 1} value={i + 1}>
                                {i + 1} Month{i + 1 > 1 ? "s" : ""}{i + 1 >= 6 ? ` (${i + 1 === 12 ? "15%" : "5%"} Discount)` : ""}
                              </option>
                            ))}
                          </select>
                        </div>
                        <div>
                          <p className="text-sm font-medium text-gray-700 dark:text-gray-300">Total Price</p>
                          <p className="mt-1 text-xl font-bold text-gray-900 dark:text-white">
                            {calculateTotalPrice(selectedTier, modalSelectedMonths)} ETH
                          </p>
                        </div>
                      </div>
                    </div>
                  </div>
                </div>
                <div className="bg-gray-50 dark:bg-gray-700 px-4 py-3 sm:px-6 sm:flex sm:flex-row-reverse">
                  <button
                    type="button"
                    className={`w-full inline-flex justify-center rounded-md border border-transparent shadow-sm px-4 py-2 bg-gradient-to-r ${selectedTier.color} text-base font-medium text-white hover:from-${selectedTier.borderColor}-600 hover:to-${selectedTier.borderColor === 'blue-500' ? 'blue-700' : selectedTier.borderColor === 'emerald-500' ? 'teal-700' : selectedTier.borderColor === 'purple-500' ? 'indigo-700' : 'rose-700'} focus:outline-none focus:ring-2 focus:ring-offset-2 focus:ring-emerald-500 sm:ml-3 sm:w-auto sm:text-sm`}
                    onClick={confirmPurchase}
                    disabled={loading}
                  >
                    {loading ? (
                      <div className="flex items-center">
                        <div className="animate-spin mr-2 h-4 w-4 border-t-2 border-b-2 border-white"></div>
                        Processing...
                      </div>
                    ) : (
                      "Confirm Purchase"
                    )}
                  </button>
                  <button
                    type="button"
                    className="mt-3 w-full inline-flex justify-center rounded-md border border-gray-300 dark:border-gray-600 shadow-sm px-4 py-2 bg-white dark:bg-gray-800 text-base font-medium text-gray-700 dark:text-gray-200 hover:bg-gray-50 dark:hover:bg-gray-700 focus:outline-none focus:ring-2 focus:ring-offset-2 focus:ring-emerald-500 sm:mt-0 sm:ml-3 sm:w-auto sm:text-sm"
                    onClick={() => setShowPurchaseModal(false)}
                  >
                    <X className="h-4 w-4 mr-2" />
                    Cancel
                  </button>
                </div>
              </motion.div>
            </motion.div>
          )}
        </AnimatePresence>
      </section>

      {/* Testimonials Section */}
      <section className="py-16 px-6 bg-white">
        <div className="max-w-6xl mx-auto">
          <motion.div
            className="text-center mb-12"
            initial={{ opacity: 0, y: 20 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ duration: 0.5 }}
          >
            <div className="inline-block mb-4">
              <Award className="h-8 w-8 text-amber-500" />
            </div>
            <h2 className="text-4xl font-bold mb-4 text-gray-800">What Our Members Say</h2>
            <p className="text-xl text-gray-600 max-w-3xl mx-auto">
              Join thousands of satisfied premium members who have transformed their experience.
            </p>
          </motion.div>

          <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
            {testimonials.map((testimonial, index) => (
              <motion.div
                key={index}
                className="bg-white rounded-xl p-6 shadow-lg border border-gray-100 hover:shadow-xl transition-all duration-300"
                initial={{ opacity: 0, y: 20 }}
                animate={{ opacity: 1, y: 0 }}
                transition={{ delay: 0.1 * index, duration: 0.5 }}
                whileHover={{ y: -5 }}
              >
                <div className="mb-4 text-amber-500">
                  {[...Array(5)].map((_, i) => (
                    <Star key={i} className="inline-block h-5 w-5 fill-current" />
                  ))}
                </div>
                <p className="text-gray-600 mb-6 italic text-sm">"{testimonial.quote}"</p>
                <div className="flex items-center">
                  <div className="w-10 h-10 bg-gradient-to-r from-emerald-500 to-teal-500 rounded-full flex items-center justify-center text-white font-bold mr-3">
                    {testimonial.author.charAt(0)}
                  </div>
                  <div>
                    <p className="font-bold text-gray-800">{testimonial.author}</p>
                    <p className="text-sm text-gray-500">{testimonial.role}</p>
                  </div>
                </div>
              </motion.div>
            ))}
          </div>
        </div>
      </section>

      {/* CTA Section */}
      <section className="py-16 px-6 bg-gray-50">
        <motion.div
          className="max-w-4xl mx-auto bg-white p-12 rounded-2xl shadow-xl border border-gray-100 relative overflow-hidden"
          initial={{ opacity: 0, y: 20 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ duration: 0.5 }}
          whileHover={{ boxShadow: "0 25px 50px -12px rgba(0, 0, 0, 0.25)" }}
        >
          <div className="absolute -top-24 -right-24 w-64 h-64 bg-emerald-200 rounded-full filter blur-3xl opacity-20"></div>
          <div className="absolute -bottom-24 -left-24 w-64 h-64 bg-blue-200 rounded-full filter blur-3xl opacity-20"></div>

          <div className="relative z-10 text-center">
            <div className="inline-block mb-6">
              <div className="w-20 h-20 rounded-full bg-gradient-to-r from-emerald-500 to-teal-500 mx-auto flex items-center justify-center shadow-lg">
                <Gift className="text-white h-10 w-10" />
              </div>
            </div>
            <h2 className="text-4xl font-bold mb-6 text-gray-800">Ready to Upgrade?</h2>
            <p className="text-xl text-gray-600 mb-10">
              Join thousands of users who have already unlocked premium features and are experiencing the benefits.
            </p>
            <motion.button
              className="px-8 py-4 bg-gradient-to-r from-emerald-500 to-teal-500 text-white rounded-xl text-lg font-bold shadow-lg hover:shadow-xl transition-all duration-300"
              whileHover={{ scale: 1.05 }}
              whileTap={{ scale: 0.95 }}
              onClick={scrollToPricing}
            >
              Upgrade to Premium
            </motion.button>
          </div>
        </motion.div>
      </section>

      {/* FAQ Section */}
      <section className="py-16 px-6 bg-white">
        <div className="max-w-4xl mx-auto">
          <motion.div
            className="text-center mb-12"
            initial={{ opacity: 0, y: 20 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ duration: 0.5 }}
          >
            <div className="inline-block mb-4">
              <Zap className="h-8 w-8 text-amber-500" />
            </div>
            <h2 className="text-4xl font-bold mb-4 text-gray-800">Frequently Asked Questions</h2>
            <p className="text-xl text-gray-600 max-w-3xl mx-auto">
              Everything you need to know about our premium membership.
            </p>
          </motion.div>

          <div className="space-y-6">
            {[
              {
                question: "How does the reward multiplier work?",
                answer:
                  "The reward multiplier increases your daily token claims. For example, the Elite plan offers a 5x multiplier, meaning you earn 5 times more rewards compared to the Free plan.",
              },
              {
                question: "Can I upgrade or downgrade my plan later?",
                answer:
                  "Yes, you can upgrade or downgrade your plan at any time. Changes will be applied at the start of your next billing cycle.",
              },
              {
                question: "What payment methods are supported?",
                answer:
                  "You can pay with ETH. Choose your preferred method when selecting a plan.",
              },
              {
                question: "What are the benefits of longer subscriptions?",
                answer:
                  "Subscribing for 6-11 months gives you a 5% discount, and a 12-month subscription offers a 15% discount on the total price.",
              },
            ].map((faq, index) => (
              <motion.div
                key={index}
                className="bg-gray-50 rounded-xl p-6 shadow-md border border-gray-100 hover:shadow-lg transition-all duration-300"
                initial={{ opacity: 0, y: 20 }}
                animate={{ opacity: 1, y: 0 }}
                transition={{ delay: 0.1 * index, duration: 0.5 }}
              >
                <h3 className="text-xl font-bold mb-3 text-gray-800">{faq.question}</h3>
                <p className="text-gray-600">{faq.answer}</p>
              </motion.div>
            ))}
          </div>
        </div>
      </section>
    </div>
  );
};

export default Premium;
