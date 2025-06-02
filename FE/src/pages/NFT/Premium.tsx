"use client"

import { useState, useEffect } from "react"
import { useNavigate } from "react-router-dom"
import { useSelector, useDispatch } from "react-redux"
import { Loader2, CheckCircle, Info, Wallet, Clock, Shield, Zap, Diamond, Star } from "lucide-react"
import { ethers } from "ethers"

import {
  Button,
  Card,
  CardContent,
  CardDescription,
  CardFooter,
  CardHeader,
  CardTitle,
  Tabs,
  TabsContent,
  TabsList,
  TabsTrigger,
  Alert,
  AlertDescription,
  AlertTitle,
  Separator,
} from "../../components/subscription/premium-ui-components"

import SubscriptionBadge from "../../components/subscription/subscription-badge"
import TransactionError from "../../components/subscription/transaction-error"
import CurrentSubscription from "../../components/subscription/current-subscription"

import SubscriptionService from "../../services/subscriptionAPI"

import { useBlockchain } from "../../hooks/useBlockchain"
import { fetchUserProfile } from "../../store/slices/userSlice"
import { useLoginModal } from "../../components/Login/login-modal-provider" // Thêm import này

export default function Premium() {
  const navigate = useNavigate()
  const dispatch = useDispatch()
  const { isAuthenticated, walletAddress, token, user } = useSelector((state) => state.auth)
  const { currentProfile, loading: profileLading } = useSelector((state) => state.user)
  const { openLoginModal } = useLoginModal() // Thêm useLoginModal để mở modal

  // Sử dụng hook blockchain
  const {
    getProvider,
    getSigner,
    verifyTransaction,
    sendPayment,
    checkNetwork,
    loading: blockchainLoading,
    error: blockchainError,
    setError: setBlockchainError,
  } = useBlockchain();

  // Lấy level subscription từ currentProfile nếu có
  const userSubscriptionLevel = currentProfile?.subscription?.level || 1

  const [selectedPlan, setSelectedPlan] = useState<number>(5) // Default to Pro plan
  const [months, setMonths] = useState<number>(1)
  const [loading, setLoading] = useState<boolean>(false)
  const [error, setError] = useState<any>(null)
  const [success, setSuccess] = useState<boolean>(false)
  const [paymentStep, setPaymentStep] = useState<number>(1)
  const [paymentData, setPaymentData] = useState<any>(null)
  const [fetchingProfile, setFetchingProfile] = useState<boolean>(false)
  const [subscriptionPlans, setSubscriptionPlans] = useState<any>({
    1: {
      name: "Standard",
      pricePerMonth: 0,
      currency: "ETH",
      benefits: [
        "Reward multiplier 1.5x",
        "Truy cập tính năng cơ bản",
        "Giới hạn claim token hàng ngày: 12 tokens",
        "Tối đa 3 bài đăng mỗi ngày",
      ],
      icon: Shield,
      color: "blue",
    },
    2: {
      name: "Plus",
      pricePerMonth: 0.000002,
      currency: "ETH",
      benefits: [
        "Reward multiplier 2x",
        "Tất cả tính năng Standard",
        "Giới hạn claim token hàng ngày: 16 tokens",
        "Tối đa 10 bài đăng mỗi ngày",
        "Truy cập nội dung độc quyền",
      ],
      icon: Zap,
      color: "purple",
    },
    5: {
      name: "Pro",
      pricePerMonth: 0.00001,
      currency: "ETH",
      benefits: [
        "Reward multiplier 3x",
        "Tất cả tính năng Plus",
        "Giới hạn claim token hàng ngày: 24 tokens",
        "Không giới hạn bài đăng",
        "Hỗ trợ ưu tiên",
        "Huy hiệu Premium",
      ],
      icon: Star,
      color: "amber",
    },
    10: {
      name: "Elite",
      pricePerMonth: 0.0001,
      currency: "ETH",
      benefits: [
        "Reward multiplier 5x",
        "Tất cả tính năng Pro",
        "Giới hạn claim token hàng ngày: 40 tokens",
        "Truy cập NFT độc quyền",
        "Tham gia sự kiện VIP",
        "Kênh hỗ trợ riêng",
        "Tính năng hồ sơ tùy chỉnh",
      ],
      icon: Diamond,
      color: "rose",
    },
  })

  // Thêm state để hiển thị thông tin gói hiện tại
  const [showCurrentPlan, setShowCurrentPlan] = useState<boolean>(false)

  // Thêm useEffect để fetch profile khi component mount
  useEffect(() => {
  if (!isAuthenticated || !walletAddress) {
    openLoginModal({
      requireSignature: true,
      actionMessage: "Vui lòng kết nối và xác thực ví để truy cập trang Premium.",
      onSuccess: () => {
        // Sau khi đăng nhập thành công, fetch profile
        dispatch(fetchUserProfile(walletAddress));
      },
    });
    return;
  }

    // Fetch profile khi component mount
    const fetchProfile = async () => {
      try {
        setFetchingProfile(true)
        await dispatch(fetchUserProfile(walletAddress))
        setFetchingProfile(false)
      } catch (error) {
        console.error("Lỗi khi lấy thông tin profile:", error)
        setFetchingProfile(false)
      }
    }

    fetchProfile()
  }, [isAuthenticated, walletAddress, navigate, dispatch, openLoginModal])

  // useEffect để kiểm tra và hiển thị gói hiện tại sau khi fetch profile
  useEffect(() => {
    if (userSubscriptionLevel > 1) {
      setShowCurrentPlan(true)
    }
  }, [userSubscriptionLevel])

  // Hàm tạo yêu cầu subscription
  const createSubscriptionRequest = async () => {
    try {
      setLoading(true);
      setError(null);
      setPaymentStep(1);

      if (!token) {
        setError("Bạn cần đăng nhập để mua gói Premium");
        openLoginModal({
          requireSignature: true,
          actionMessage: "Vui lòng kết nối và xác thực ví để mua gói Premium.",
          onSuccess: () => {
            // Thử lại sau khi đăng nhập thành công
            createSubscriptionRequest();
          },
        });
        return;
      }

      const response = await SubscriptionService.createSubscriptionRequest({
        level: selectedPlan,
        months: months,
      });

      if (!response.success) {
        throw new Error(response.message || "Không thể tạo yêu cầu đăng ký");
      }

      if (!response.data || !response.data.recipientAddress) {
        throw new Error("API không trả về địa chỉ nhận thanh toán");
      }

      if (!ethers.isAddress(response.data.recipientAddress)) {
        throw new Error("Địa chỉ nhận thanh toán không hợp lệ");
      }

      // Override network thành arbitrum-sepolia nếu cần
      const updatedPaymentData = {
        ...response.data,
        network: "arbitrum-sepolia",
      };

      setPaymentData(updatedPaymentData);
      setPaymentStep(2);
    } catch (error) {
      console.error("Lỗi khi tạo yêu cầu đăng ký:", error);
      setError(error);
    } finally {
      setLoading(false);
    }
  };

  // Hàm xử lý thanh toán
  const processPayment = async () => {
    if (!paymentData) return;

    try {
      setLoading(true);
      setError(null);

      if (!paymentData.recipientAddress) {
        throw new Error("Không có địa chỉ nhận thanh toán");
      }

      // Kiểm tra mạng bằng hook
      const networkCheck = await checkNetwork(paymentData.network);
      if (!networkCheck.success) {
        setError(networkCheck.message);
        return;
      }

      // Gửi giao dịch thanh toán bằng hook
      const paymentResult = await sendPayment(
        paymentData.recipientAddress,
        paymentData.totalPrice.toString()
      );

      if (!paymentResult.success) {
        throw new Error(paymentResult.message || "Thanh toán thất bại");
      }

      setPaymentStep(3);

      let txStatus = await verifyTransaction(paymentResult.hash);
      let attempts = 0;
      const maxAttempts = 30;

      while (!txStatus.success && attempts < maxAttempts) {
        await new Promise((resolve) => setTimeout(resolve, 5000));
        txStatus = await verifyTransaction(paymentResult.hash);
        attempts++;
      }

      if (!txStatus.success) {
        throw new Error("Giao dịch không được xác nhận sau nhiều lần thử");
      }

      const confirmData = await SubscriptionService.confirmPayment(
        paymentData.paymentId,
        paymentResult.hash
      );

      if (!confirmData.success) {
        throw new Error(confirmData.message || "Không thể xác nhận thanh toán");
      }

      const subscriptionData = {
        level: confirmData.data.level,
        name: confirmData.data.subscriptionName,
        benefits: confirmData.data.subscriptionBenefits,
        expiration: confirmData.data.expiration,
      };

      localStorage.setItem("subscription", JSON.stringify(subscriptionData));

      await dispatch(fetchUserProfile(walletAddress));

      setSuccess(true);
      setPaymentStep(4);
    } catch (error) {
      console.error("Lỗi khi xử lý thanh toán:", error);
      setError(error);
    } finally {
      setLoading(false);
    }
  };

  const calculateTotalPrice = () => {
    const plan = subscriptionPlans[selectedPlan]
    if (!plan) return 0
    return (plan.pricePerMonth * months).toFixed(8)
  }

  const getPlanColor = (level: number) => {
    switch (level) {
      case 1:
        return "blue"
      case 2:
        return "purple"
      case 5:
        return "amber"
      case 10:
        return "rose"
      default:
        return "gray"
    }
  }

  const renderPlanIcon = (level: number) => {
    switch (level) {
      case 1:
        return <Shield className="h-5 w-5 mr-2 text-blue-500" />
      case 2:
        return <Zap className="h-5 w-5 mr-2 text-purple-500" />
      case 5:
        return <Star className="h-5 w-5 mr-2 text-amber-500" />
      case 10:
        return <Diamond className="h-5 w-5 mr-2 text-rose-500" />
      default:
        return null
    }
  }

  const renderBenefitList = (benefits: string[], level: number) => {
    const iconColor = getPlanColor(level)

    return (
      <ul className="space-y-2">
        {benefits.map((benefit, index) => (
          <li key={index} className="flex items-start">
            <CheckCircle className={`h-5 w-5 mr-2 shrink-0 text-${iconColor}-500`} />
            <span>{benefit}</span>
          </li>
        ))}
      </ul>
    )
  }

  return (
    <div className="w-full min-h-screen bg-gray-50">
      <div className="w-full max-w-screen-2xl mx-auto px-4 py-8">
        {/* Header section - Moved to top */}
        <div className="text-center mb-8">
          <h1 className="text-3xl md:text-4xl font-bold mb-2">Nâng cấp tài khoản của bạn</h1>
          <p className="text-gray-600 text-lg mb-6 max-w-3xl mx-auto">
            Mở khóa các tính năng cao cấp và tăng cường trải nghiệm của bạn với các gói Premium
          </p>

          {/* Hiển thị loading khi đang fetch profile */}
          {fetchingProfile && (
            <div className="flex justify-center items-center mb-6">
              <Loader2 className="h-6 w-6 animate-spin text-gray-500 mr-2" />
              <span className="text-gray-500">Đang tải thông tin gói Premium...</span>
            </div>
          )}

          {/* Hiển thị thông tin gói hiện tại nếu người dùng đã có subscription */}
          {showCurrentPlan && userSubscriptionLevel > 1 && !fetchingProfile && (
            <div className="max-w-md mx-auto mb-8">
              <CurrentSubscription
                level={userSubscriptionLevel}
                expiration={currentProfile?.subscription?.expiration}
                username={currentProfile?.username}
              />
            </div>
          )}

          {/* Payment steps indicator */}
          <div className="flex items-center justify-center max-w-md mx-auto mt-8">
            <div className={`flex flex-col items-center ${paymentStep >= 1 ? "text-blue-600" : "text-gray-400"}`}>
              <div
                className={`w-12 h-12 rounded-full flex items-center justify-center ${paymentStep >= 1 ? "bg-blue-100" : "bg-gray-100"}`}
              >
                <span className="text-lg font-medium">1</span>
              </div>
              <span className="text-sm mt-2">Chọn gói</span>
            </div>
            <div className={`w-16 h-0.5 mx-2 ${paymentStep >= 2 ? "bg-blue-500" : "bg-gray-200"}`}></div>
            <div className={`flex flex-col items-center ${paymentStep >= 2 ? "text-blue-600" : "text-gray-400"}`}>
              <div
                className={`w-12 h-12 rounded-full flex items-center justify-center ${paymentStep >= 2 ? "bg-blue-100" : "bg-gray-100"}`}
              >
                <span className="text-lg font-medium">2</span>
              </div>
              <span className="text-sm mt-2">Thanh toán</span>
            </div>
            <div className={`w-16 h-0.5 mx-2 ${paymentStep >= 3 ? "bg-blue-500" : "bg-gray-200"}`}></div>
            <div className={`flex flex-col items-center ${paymentStep >= 3 ? "text-blue-600" : "text-gray-400"}`}>
              <div
                className={`w-12 h-12 rounded-full flex items-center justify-center ${paymentStep >= 3 ? "bg-blue-100" : "bg-gray-100"}`}
              >
                <span className="text-lg font-medium">3</span>
              </div>
              <span className="text-sm mt-2">Xác nhận</span>
            </div>
          </div>
        </div>

        {error && <TransactionError error={error} />}

        {success && (
          <Alert className="mb-6 bg-green-50 border-green-200 max-w-3xl mx-auto">
            <CheckCircle className="h-4 w-4 text-green-600" />
            <AlertTitle className="text-green-600">Thành công!</AlertTitle>
            <AlertDescription>
              Gói Premium của bạn đã được kích hoạt thành công! Hãy tận hưởng các quyền lợi Premium.
            </AlertDescription>
          </Alert>
        )}

        {/* Main content */}
        <div className="max-w-5xl mx-auto">
          {paymentStep === 1 && (
            <div className="bg-white rounded-xl shadow-sm border border-gray-100 overflow-hidden">
              <div className="p-6 border-b border-gray-100">
                <h2 className="text-xl font-semibold">Chọn gói Premium</h2>
                <p className="text-gray-500 text-sm mt-1">Chọn gói phù hợp với nhu cầu của bạn</p>
              </div>

              <div className="p-6">
                <Tabs defaultValue={selectedPlan.toString()} onValueChange={(value) => setSelectedPlan(Number(value))}>
                  <TabsList className="grid grid-cols-4 mb-6">
                    <TabsTrigger value="1">Standard</TabsTrigger>
                    <TabsTrigger value="2">Plus</TabsTrigger>
                    <TabsTrigger value="5">Pro</TabsTrigger>
                    <TabsTrigger value="10">Elite</TabsTrigger>
                  </TabsList>

                  <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
                    {/* Plan details */}
                    <div>
                      {Object.entries(subscriptionPlans).map(([level, plan]) => (
                        <TabsContent key={level} value={level}>
                          <Card className={`border-${getPlanColor(Number(level))}-200 shadow-sm`}>
                            <CardHeader
                              className={`bg-gradient-to-r from-${getPlanColor(Number(level))}-50 to-white pb-3`}
                            >
                              <div className="flex justify-between items-center">
                                <div className="flex items-center">
                                  {renderPlanIcon(Number(level))}
                                  <CardTitle className="text-xl">{plan.name}</CardTitle>
                                </div>
                                <SubscriptionBadge level={Number(level)} />
                              </div>
                              <CardDescription>
                                {plan.pricePerMonth > 0
                                  ? `${plan.pricePerMonth} ${plan.currency} mỗi tháng`
                                  : "Gói miễn phí"}
                              </CardDescription>
                            </CardHeader>
                            <CardContent>{renderBenefitList(plan.benefits, Number(level))}</CardContent>
                          </Card>
                        </TabsContent>
                      ))}
                    </div>

                    {/* Subscription details */}
                    <Card>
                      <CardHeader>
                        <CardTitle>Thông tin đăng ký</CardTitle>
                        <CardDescription>Xem lại chi tiết gói Premium của bạn</CardDescription>
                      </CardHeader>
                      <CardContent>
                        <div className="space-y-4">
                          <div>
                            <h3 className="font-medium mb-2">Gói đã chọn</h3>
                            <div className="flex items-center p-3 bg-gray-50 rounded-lg">
                              {renderPlanIcon(selectedPlan)}
                              <SubscriptionBadge level={selectedPlan} size="md" />
                              <span className="ml-2">
                                {subscriptionPlans[selectedPlan]?.pricePerMonth}{" "}
                                {subscriptionPlans[selectedPlan]?.currency}
                                /tháng
                              </span>
                            </div>
                          </div>

                          <div>
                            <h3 className="font-medium mb-2">Thời hạn đăng ký</h3>
                            <div className="grid grid-cols-4 gap-2">
                              {[1, 3, 6, 12].map((m) => (
                                <button
                                  key={m}
                                  type="button"
                                  onClick={() => setMonths(m)}
                                  className={`py-2 px-3 rounded-md text-center transition-colors ${
                                    months === m
                                      ? `bg-${getPlanColor(selectedPlan)}-100 border border-${getPlanColor(
                                          selectedPlan,
                                        )}-300 text-${getPlanColor(selectedPlan)}-700`
                                      : "bg-gray-50 border border-gray-200 hover:bg-gray-100"
                                  }`}
                                >
                                  {m} tháng
                                </button>
                              ))}
                            </div>

                            <div className="mt-2 flex items-center text-sm text-gray-500">
                              <Clock className="w-4 h-4 mr-1" />
                              <span>Thời hạn dài hơn = giá trị tốt hơn</span>
                            </div>
                          </div>

                          <Separator />

                          <div className="pt-2">
                            <div className="flex justify-between font-medium">
                              <span>Tổng tiền:</span>
                              <span className="text-lg font-semibold">
                                {calculateTotalPrice()} {subscriptionPlans[selectedPlan]?.currency}
                              </span>
                            </div>
                            <p className="text-sm text-gray-500 mt-1">
                              Thanh toán một lần cho toàn bộ thời hạn đăng ký
                            </p>
                          </div>
                        </div>
                      </CardContent>
                      <CardFooter>
                        <Button
                          className={`w-full ${
                            selectedPlan === 1
                              ? "bg-blue-600 hover:bg-blue-700"
                              : selectedPlan === 2
                                ? "bg-purple-600 hover:bg-purple-700"
                                : selectedPlan === 5
                                  ? "bg-orange-400 hover:bg-orange-600"
                                  : "bg-rose-600 hover:bg-rose-700"
                          }`}
                          onClick={createSubscriptionRequest}
                          disabled={
                            loading || selectedPlan === 1 || userSubscriptionLevel >= selectedPlan || fetchingProfile
                          }
                        >
                          {loading || fetchingProfile ? (
                            <>
                              <Loader2 className="mr-2 h-4 w-4 animate-spin" />
                              Đang xử lý...
                            </>
                          ) : selectedPlan === 1 ? (
                            "Gói miễn phí - Không cần thanh toán"
                          ) : userSubscriptionLevel >= selectedPlan ? (
                            "Bạn đã có gói cao hơn hoặc tương đương"
                          ) : (
                            "Tiếp tục thanh toán"
                          )}
                        </Button>
                      </CardFooter>
                    </Card>
                  </div>
                </Tabs>
              </div>
            </div>
          )}

          {paymentStep === 2 && paymentData && (
            <div className="bg-white rounded-xl shadow-sm border border-gray-100 overflow-hidden">
              <div className="p-6 border-b border-gray-100">
                <h2 className="text-xl font-semibold">Hoàn tất thanh toán</h2>
                <p className="text-gray-500 text-sm mt-1">Gửi thanh toán để kích hoạt gói Premium</p>
              </div>

              <div className="p-6">
                <Alert className="mb-4 bg-blue-50 border-blue-100">
                  <Info className="h-4 w-4 text-blue-600" />
                  <AlertTitle className="text-blue-700">Thông tin thanh toán</AlertTitle>
                  <AlertDescription className="text-blue-600">
                    Bạn sẽ được yêu cầu xác nhận giao dịch trong ví của mình để hoàn tất thanh toán.
                  </AlertDescription>
                </Alert>

                <div className="space-y-4">
                  <div className="bg-gray-50 p-4 rounded-lg">
                    <div className="grid grid-cols-2 gap-3">
                      <div className="text-sm font-medium text-gray-500">Gói:</div>
                      <div className="font-medium">{paymentData.subscriptionName}</div>

                      <div className="text-sm font-medium text-gray-500">Thời hạn:</div>
                      <div>
                        {paymentData.months} {paymentData.months === 1 ? "tháng" : "tháng"}
                      </div>

                      <div className="text-sm font-medium text-gray-500">Số tiền:</div>
                      <div className="font-medium">
                        {paymentData.totalPrice} {paymentData.currency}
                      </div>

                      <div className="text-sm font-medium text-gray-500">Địa chỉ nhận:</div>
                      <div className="truncate text-xs">{paymentData.recipientAddress}</div>

                      <div className="text-sm font-medium text-gray-500">Mạng:</div>
                      <div>{paymentData.network}</div>
                    </div>
                  </div>

                  <div className="flex items-center p-3 bg-gray-50 rounded-lg">
                    <Wallet className="h-5 w-5 text-gray-500 mr-2" />
                    <span className="text-sm">Thanh toán bằng ví MetaMask của bạn</span>
                  </div>
                </div>

                <div className="flex flex-col space-y-2 mt-6">
                  <Button
                    className={`w-full ${
                      selectedPlan === 2
                        ? "bg-purple-600 hover:bg-purple-700"
                        : selectedPlan === 5
                          ? "bg-amber-600 hover:bg-amber-700"
                          : selectedPlan === 10
                            ? "bg-rose-600 hover:bg-rose-700"
                            : "bg-blue-600 hover:bg-blue-700"
                    }`}
                    onClick={processPayment}
                    disabled={loading}
                  >
                    {loading ? (
                      <>
                        <Loader2 className="mr-2 h-4 w-4 animate-spin" />
                        Đang xử lý thanh toán...
                      </>
                    ) : (
                      "Thanh toán ngay"
                    )}
                  </Button>
                  <Button variant="outline" className="w-full" onClick={() => setPaymentStep(1)}>
                    Quay lại
                  </Button>
                </div>
              </div>
            </div>
          )}

          {paymentStep === 3 && (
            <div className="bg-white rounded-xl shadow-sm border border-gray-100 overflow-hidden">
              <div className="p-6 border-b border-gray-100">
                <h2 className="text-xl font-semibold">Đang xử lý thanh toán</h2>
                <p className="text-gray-500 text-sm mt-1">Giao dịch của bạn đang được xử lý</p>
              </div>

              <div className="p-6 flex flex-col items-center justify-center py-8">
                <div className="relative">
                  <div className="w-20 h-20 border border-blue-200 rounded-full flex items-center justify-center bg-blue-50">
                    <Loader2 className="h-10 w-10 animate-spin text-blue-600" />
                  </div>
                  <div className="absolute -top-1 -right-1 bg-blue-100 rounded-full p-1">
                    <Wallet className="h-4 w-4 text-blue-600" />
                  </div>
                </div>
                <h3 className="text-xl font-medium mt-6 mb-2">Đang xác nhận giao dịch</h3>
                <p className="text-center text-gray-600 max-w-md">
                  Vui lòng đợi trong khi chúng tôi xác nhận giao dịch của bạn trên blockchain. Quá trình này có thể mất
                  vài phút.
                </p>
                <div className="w-full max-w-md bg-gray-100 h-2 rounded-full mt-6 overflow-hidden">
                  <div className="bg-blue-500 h-full animate-pulse" style={{ width: "60%" }}></div>
                </div>
                <p className="text-sm text-gray-500 mt-2">Đang xác nhận giao dịch...</p>
              </div>
            </div>
          )}

          {paymentStep === 4 && (
            <div className="bg-white rounded-xl shadow-sm border border-gray-100 overflow-hidden">
              <div className="p-6 border-b border-gray-100">
                <h2 className="text-xl font-semibold">Gói Premium đã được kích hoạt!</h2>
                <p className="text-gray-500 text-sm mt-1">Gói Premium của bạn đã được kích hoạt thành công</p>
              </div>

              <div className="p-6 flex flex-col items-center justify-center py-8">
                <div className="w-20 h-20 bg-green-100 rounded-full flex items-center justify-center mb-6">
                  <CheckCircle className="h-10 w-10 text-green-500" />
                </div>
                <h3 className="text-xl font-medium mb-2">Cảm ơn bạn!</h3>
                <p className="text-center text-gray-600 mb-6">
                  Gói {subscriptionPlans[selectedPlan]?.name} của bạn đã được kích hoạt. Hãy tận hưởng các quyền lợi
                  Premium!
                </p>
                <div className="bg-gray-50 p-4 rounded-lg w-full max-w-md mb-6">
                  <div className="flex justify-between items-center mb-2">
                    <span className="text-sm text-gray-500">Gói đăng ký:</span>
                    <SubscriptionBadge level={selectedPlan} />
                  </div>
                  <div className="flex justify-between items-center">
                    <span className="text-sm text-gray-500">Thời hạn:</span>
                    <span>{months} tháng</span>
                  </div>
                </div>
                <Button
                  className={`w-full max-w-md ${
                    selectedPlan === 2
                      ? "bg-purple-600 hover:bg-purple-700"
                      : selectedPlan === 5
                        ? "bg-amber-600 hover:bg-amber-700"
                        : selectedPlan === 10
                          ? "bg-rose-600 hover:bg-rose-700"
                          : "bg-blue-600 hover:bg-blue-700"
                  }`}
                  onClick={() => navigate("/Dashboard")}
                >
                  Đi đến Dashboard
                </Button>
              </div>
            </div>
          )}
        </div>
      </div>
    </div>
  )
}