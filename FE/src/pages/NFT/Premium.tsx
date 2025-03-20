"use client"
import { FaCrown, FaRocket, FaShieldAlt, FaChartLine, FaCheck } from "react-icons/fa"
import { motion } from "framer-motion"

// Feature Card Component
const FeatureCard = ({ icon, title, description, delay }) => {
  return (
    <motion.div
      className="bg-gradient-to-br from-gray-900 to-gray-950 p-6 rounded-xl border border-gray-800 hover:border-green-500 transition-all duration-300 relative overflow-hidden group"
      initial={{ opacity: 0, y: 20 }}
      animate={{ opacity: 1, y: 0 }}
      transition={{ delay, duration: 0.5 }}
      whileHover={{ scale: 1.03 }}
    >
      {/* Animated gradient background */}
      <div className="absolute -inset-1 bg-gradient-to-r from-green-500 via-blue-500 to-purple-600 rounded-xl blur-xl opacity-0 group-hover:opacity-20 transition-opacity duration-700" />

      <div className="bg-gradient-to-br from-green-500 to-blue-500 w-14 h-14 rounded-xl flex items-center justify-center mb-5 shadow-lg shadow-green-500/20">
        {icon}
      </div>
      <h3 className="text-xl font-bold mb-3 group-hover:text-green-400 transition-colors">{title}</h3>
      <p className="text-gray-400">{description}</p>
    </motion.div>
  )
}

// Pricing Card Component
const PricingCard = ({ title, price, features, popular, delay }) => {
  return (
    <motion.div
      className={`bg-gradient-to-br ${popular ? "from-green-900/20 to-gray-950" : "from-gray-900 to-gray-950"} 
        p-8 rounded-xl border ${popular ? "border-green-500/70" : "border-gray-800"} 
        relative hover:-translate-y-2 transition-all duration-300 shadow-lg ${popular ? "shadow-green-500/10" : "shadow-none"}`}
      initial={{ opacity: 0, y: 20 }}
      animate={{ opacity: 1, y: 0 }}
      transition={{ delay, duration: 0.5 }}
    >
      {popular && (
        <div className="absolute -top-3 left-1/2 transform -translate-x-1/2 bg-gradient-to-r from-green-500 to-emerald-400 text-black px-4 py-1 rounded-full text-sm font-bold shadow-lg shadow-green-500/20">
          Most Popular
        </div>
      )}
      <h3 className="text-2xl font-bold mb-2 mt-4">{title}</h3>
      <div className="flex items-end gap-1 mb-8">
        <span className="text-5xl font-bold bg-gradient-to-r from-green-500 via-blue-500 to-purple-600 bg-clip-text text-transparent">
          {price}
        </span>
        <span className="text-gray-400 mb-1 text-lg">/month</span>
      </div>

      <ul className="space-y-4 mb-8">
        {features.map((feature, index) => (
          <li key={index} className="flex items-start gap-3">
            <FaCheck className={`text-green-500 mt-1 flex-shrink-0 ${index < 2 ? "text-lg" : ""}`} />
            <span className={popular && index < 2 ? "text-white" : "text-gray-400"}>{feature}</span>
          </li>
        ))}
      </ul>

      <button
        className={`w-full py-4 rounded-lg font-medium transition-all duration-200 text-lg ${
          popular
            ? "bg-gradient-to-r from-green-500 to-emerald-400 text-black hover:from-green-400 hover:to-emerald-300 shadow-lg shadow-green-500/20"
            : "bg-gray-800 text-white hover:bg-gray-700"
        }`}
      >
        {popular ? "Get Started" : "Choose Plan"}
      </button>
    </motion.div>
  )
}

// Main Premium Page Component
const Premium = () => {
  const features = [
    {
      icon: <FaRocket className="w-6 h-6 text-white" />,
      title: "Faster Mining",
      description: "Increase your mining speed by up to 5x with premium acceleration technology.",
    },
    {
      icon: <FaShieldAlt className="w-6 h-6 text-white" />,
      title: "Enhanced Security",
      description: "Get advanced security features to protect your NFTs and digital assets.",
    },
    {
      icon: <FaChartLine className="w-6 h-6 text-white" />,
      title: "Advanced Analytics",
      description: "Access detailed analytics and insights to optimize your trading strategy.",
    },
    {
      icon: <FaCrown className="w-6 h-6 text-white" />,
      title: "Exclusive NFTs",
      description: "Get access to limited edition NFTs only available to premium members.",
    },
  ]

  const pricingTiers = [
    {
      title: "Basic",
      price: "$9.99",
      features: [
        "Basic mining speed boost (2x)",
        "Standard security features",
        "Basic analytics dashboard",
        "Access to common NFTs",
        "Email support",
      ],
      popular: false,
    },
    {
      title: "Pro",
      price: "$19.99",
      features: [
        "Advanced mining speed boost (5x)",
        "Enhanced security features",
        "Full analytics suite",
        "Access to rare NFTs",
        "Priority support",
        "Early access to new features",
      ],
      popular: true,
    },
    {
      title: "Enterprise",
      price: "$49.99",
      features: [
        "Maximum mining speed boost (10x)",
        "Military-grade security",
        "Custom analytics solutions",
        "Access to legendary NFTs",
        "24/7 dedicated support",
        "Custom branding options",
        "API access",
      ],
      popular: false,
    },
  ]

  return (
    <div className="min-h-screen bg-black text-white">
      {/* Hero Section */}
      <div className="h-screen relative overflow-hidden bg-gradient-to-b from-black to-gray-900 flex items-center justify-center">
        <div className="absolute inset-0 z-0 opacity-20">
          <div className="absolute inset-0 bg-[radial-gradient(circle,rgba(34,197,94,0.15)_0%,rgba(0,0,0,0)_70%)]"></div>
          <div className="h-full w-full bg-[linear-gradient(rgba(22,27,34,0.5)_1px,transparent_1px),linear-gradient(90deg,rgba(22,27,34,0.5)_1px,transparent_1px)] bg-[size:50px_50px]"></div>
        </div>

        {/* Hero Content */}
        <div className="relative z-10 flex flex-col items-center justify-center text-center px-6 max-w-5xl mx-auto">
          <motion.div initial={{ opacity: 0, y: 20 }} animate={{ opacity: 1, y: 0 }} transition={{ duration: 0.8 }}>
            <div className="mb-6">
              <FaCrown className="text-green-400 text-5xl mx-auto" />
            </div>
            <h1 className="text-5xl md:text-7xl font-bold mb-6">
              Elevate Your{" "}
              <span className="bg-gradient-to-r from-green-500 via-blue-500 to-purple-600 bg-clip-text text-transparent">
                NFT Experience
              </span>
            </h1>
            <p className="text-xl md:text-2xl text-gray-300 max-w-3xl mx-auto mb-10 leading-relaxed">
              Access exclusive tools, supercharged mining capabilities, and premium benefits that will transform your
              digital asset journey.
            </p>
            <motion.button
              className="bg-gradient-to-r from-green-500 to-emerald-400 text-black px-10 py-5 rounded-lg text-xl font-bold
              hover:from-green-400 hover:to-emerald-300 transition-all shadow-xl shadow-green-500/20"
              whileHover={{ scale: 1.05 }}
              whileTap={{ scale: 0.95 }}
            >
              Upgrade Now
            </motion.button>
          </motion.div>
        </div>
      </div>

      {/* Features Section */}
      <div className="py-24 px-6 max-w-7xl mx-auto">
        <motion.div
          className="text-center mb-20"
          initial={{ opacity: 0, y: 20 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ duration: 0.5 }}
        >
          <h2 className="text-4xl md:text-5xl font-bold mb-6">Premium Features</h2>
          <p className="text-xl text-gray-300 max-w-3xl mx-auto">
            Discover a suite of powerful tools designed to give you the competitive edge in the NFT marketplace.
          </p>
        </motion.div>

        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-8">
          {features.map((feature, index) => (
            <FeatureCard
              key={index}
              icon={feature.icon}
              title={feature.title}
              description={feature.description}
              delay={0.2 * index}
            />
          ))}
        </div>
      </div>

      {/* Pricing Section */}
      <div className="py-20 px-4 max-w-7xl mx-auto">
        <motion.div
          className="text-center mb-16"
          initial={{ opacity: 0, y: 20 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ duration: 0.5 }}
        >
          <h2 className="text-4xl font-bold mb-4">Choose Your Plan</h2>
          <p className="text-xl text-gray-400 max-w-3xl mx-auto">
            Select the perfect premium plan that suits your needs and budget.
          </p>
        </motion.div>

        <div className="grid grid-cols-1 md:grid-cols-3 gap-8">
          {pricingTiers.map((tier, index) => (
            <PricingCard
              key={index}
              title={tier.title}
              price={tier.price}
              features={tier.features}
              popular={tier.popular}
              delay={0.2 * index}
            />
          ))}
        </div>
      </div>

      {/* CTA Section */}
      <div className="py-24 px-6 bg-gradient-to-b from-black to-gray-950">
        <motion.div
          className="max-w-4xl mx-auto bg-gradient-to-b from-gray-900 to-black p-12 rounded-2xl border border-green-500/20 text-center shadow-2xl"
          initial={{ opacity: 0, y: 20 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ duration: 0.5 }}
          whileHover={{ boxShadow: "0 0 30px rgba(34, 197, 94, 0.2)" }}
        >
          <div className="mb-6">
            <div className="w-20 h-20 rounded-full bg-gradient-to-r from-green-500 to-blue-500 mx-auto flex items-center justify-center">
              <FaRocket className="text-white text-3xl" />
            </div>
          </div>
          <h2 className="text-4xl font-bold mb-6">Ready to Upgrade?</h2>
          <p className="text-xl text-gray-300 mb-10">
            Join thousands of users who have already unlocked premium features and are experiencing the benefits.
          </p>
          <motion.button
            className="bg-gradient-to-r from-green-500 to-emerald-400 text-black px-10 py-5 rounded-lg text-xl font-bold
            hover:from-green-400 hover:to-emerald-300 transition-all duration-300 shadow-xl shadow-green-500/20"
            whileHover={{ scale: 1.05 }}
            whileTap={{ scale: 0.95 }}
          >
            Upgrade to Premium
          </motion.button>
        </motion.div>
      </div>
    </div>
  )
}

export default Premium

