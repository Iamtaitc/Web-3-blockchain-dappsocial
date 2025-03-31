"use client"

import { useState } from "react"
import { motion } from "framer-motion"
import { Crown, Rocket, Shield, TrendingUp, Check, Star, Zap, Award, Diamond, Gift } from "lucide-react"

const Premium = () => {
  const [activePlan, setActivePlan] = useState("monthly")

  // Feature data
  const features = [
    {
      icon: <Rocket className="w-6 h-6 text-white" />,
      title: "Accelerated Mining",
      description: "Boost your mining speed by up to 10x with our premium acceleration technology.",
    },
    {
      icon: <Shield className="w-6 h-6 text-white" />,
      title: "Advanced Security",
      description: "Protect your digital assets with military-grade encryption and advanced security features.",
    },
    {
      icon: <TrendingUp className="w-6 h-6 text-white" />,
      title: "Market Analytics",
      description: "Access real-time market data and predictive analytics to optimize your trading strategy.",
    },
    {
      icon: <Diamond className="w-6 h-6 text-white" />,
      title: "Exclusive NFTs",
      description: "Get access to limited edition NFTs only available to premium members.",
    },
  ]

  // Pricing data
  const pricingTiers = {
    monthly: [
      {
        title: "Basic",
        price: "$9.99",
        period: "month",
        features: [
          "2x Mining Speed",
          "Basic Security Features",
          "Standard Analytics",
          "Access to Common NFTs",
          "Email Support",
        ],
        popular: false,
        cta: "Get Started",
        color: "from-blue-400 to-blue-500",
      },
      {
        title: "Pro",
        price: "$19.99",
        period: "month",
        features: [
          "5x Mining Speed",
          "Advanced Security Features",
          "Full Analytics Suite",
          "Access to Rare NFTs",
          "Priority Support",
          "Early Access to Features",
        ],
        popular: true,
        cta: "Get Started",
        color: "from-emerald-400 to-teal-500",
      },
      {
        title: "Enterprise",
        price: "$49.99",
        period: "month",
        features: [
          "10x Mining Speed",
          "Military-grade Security",
          "Custom Analytics Solutions",
          "Access to Legendary NFTs",
          "24/7 Dedicated Support",
          "Custom Branding Options",
          "API Access",
        ],
        popular: false,
        cta: "Contact Sales",
        color: "from-purple-400 to-indigo-500",
      },
    ],
    annual: [
      {
        title: "Basic",
        price: "$99.99",
        period: "year",
        features: [
          "2x Mining Speed",
          "Basic Security Features",
          "Standard Analytics",
          "Access to Common NFTs",
          "Email Support",
        ],
        popular: false,
        cta: "Get Started",
        color: "from-blue-400 to-blue-500",
      },
      {
        title: "Pro",
        price: "$199.99",
        period: "year",
        features: [
          "5x Mining Speed",
          "Advanced Security Features",
          "Full Analytics Suite",
          "Access to Rare NFTs",
          "Priority Support",
          "Early Access to Features",
        ],
        popular: true,
        cta: "Get Started",
        color: "from-emerald-400 to-teal-500",
      },
      {
        title: "Enterprise",
        price: "$499.99",
        period: "year",
        features: [
          "10x Mining Speed",
          "Military-grade Security",
          "Custom Analytics Solutions",
          "Access to Legendary NFTs",
          "24/7 Dedicated Support",
          "Custom Branding Options",
          "API Access",
        ],
        popular: false,
        cta: "Contact Sales",
        color: "from-purple-400 to-indigo-500",
      },
    ],
  }

  // Testimonials data
  const testimonials = [
    {
      quote:
        "Premium membership has completely transformed my mining experience. The speed boost alone is worth the price!",
      author: "Alex Chen",
      role: "Crypto Enthusiast",
    },
    {
      quote: "The exclusive NFTs and advanced analytics have given me a significant edge in the market.",
      author: "Sarah Johnson",
      role: "Professional Trader",
    },
    {
      quote: "The security features give me peace of mind knowing my assets are protected at all times.",
      author: "Michael Rodriguez",
      role: "Digital Asset Manager",
    },
  ]

  return (
    <div className="min-h-screen bg-gray-50 text-gray-800 font-mono overflow-hidden">
      {/* Hero Section */}
      <section className="relative py-20 px-6">
        {/* Background Elements */}
        <div className="absolute inset-0 bg-[url('data:image/svg+xml;base64,PHN2ZyB3aWR0aD0iNjAiIGhlaWdodD0iNjAiIHZpZXdCb3g9IjAgMCA2MCA2MCIgeG1sbnM9Imh0dHA6Ly93d3cudzMub3JnLzIwMDAvc3ZnIj48ZyBmaWxsPSJub25lIiBmaWxsLXJ1bGU9ImV2ZW5vZGQiPjxnIGZpbGw9IiMwMDAiIGZpbGwtb3BhY2l0eT0iLjAyIj48cGF0aCBkPSJNMzYgMzRjMC0yLjIxLTEuNzktNC00LTRzLTQgMS43OS00IDQgMS43OSA0IDQgNCA0LTEuNzkgNC00eiIvPjwvZz48L2c+PC9zdmc+')] opacity-30 pointer-events-none"></div>
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
              Unlock premium features, accelerate your mining, and gain access to exclusive benefits that will transform
              your digital asset journey.
            </p>
            <motion.button
              className="px-8 py-4 bg-gradient-to-r from-emerald-500 to-teal-500 text-white rounded-xl text-lg font-bold shadow-lg hover:shadow-xl transition-all duration-300 transform hover:scale-105"
              whileHover={{ scale: 1.05 }}
              whileTap={{ scale: 0.95 }}
            >
              Upgrade Now
            </motion.button>
          </motion.div>
        </div>
      </section>

      {/* Features Section */}
      <section className="py-20 px-6 bg-white">
        <div className="max-w-6xl mx-auto">
          <motion.div
            className="text-center mb-16"
            initial={{ opacity: 0, y: 20 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ duration: 0.5 }}
          >
            <div className="inline-block mb-4">
              <Star className="h-8 w-8 text-amber-500" />
            </div>
            <h2 className="text-4xl font-bold mb-4 text-gray-800">Premium Features</h2>
            <p className="text-xl text-gray-600 max-w-3xl mx-auto">
              Discover a suite of powerful tools designed to give you the competitive edge in the digital asset
              marketplace.
            </p>
          </motion.div>

          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-8">
            {features.map((feature, index) => (
              <motion.div
                key={index}
                className="bg-white rounded-xl p-6 shadow-lg border border-gray-100 hover:shadow-xl transition-all duration-300 relative overflow-hidden group"
                initial={{ opacity: 0, y: 20 }}
                animate={{ opacity: 1, y: 0 }}
                transition={{ delay: 0.1 * index, duration: 0.5 }}
                whileHover={{ y: -5 }}
              >
                <div className="absolute -inset-1 bg-gradient-to-r from-emerald-500 via-teal-500 to-blue-500 rounded-xl blur-lg opacity-0 group-hover:opacity-20 transition-opacity duration-700"></div>
                <div className="bg-gradient-to-r from-emerald-500 to-teal-500 w-14 h-14 rounded-xl flex items-center justify-center mb-5 shadow-md">
                  {feature.icon}
                </div>
                <h3 className="text-xl font-bold mb-3 text-gray-800 group-hover:text-emerald-600 transition-colors">
                  {feature.title}
                </h3>
                <p className="text-gray-600">{feature.description}</p>
              </motion.div>
            ))}
          </div>
        </div>
      </section>

      {/* Pricing Section */}
      <section className="py-20 px-6 bg-gray-50">
        <div className="max-w-6xl mx-auto">
          <motion.div
            className="text-center mb-12"
            initial={{ opacity: 0, y: 20 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ duration: 0.5 }}
          >
            <div className="inline-block mb-4">
              <Diamond className="h-8 w-8 text-amber-500" />
            </div>
            <h2 className="text-4xl font-bold mb-4 text-gray-800">Choose Your Plan</h2>
            <p className="text-xl text-gray-600 max-w-3xl mx-auto mb-8">
              Select the perfect premium plan that suits your needs and budget.
            </p>

            {/* Billing Toggle */}
            <div className="flex items-center justify-center mb-8">
              <button
                onClick={() => setActivePlan("monthly")}
                className={`px-6 py-2 rounded-l-lg text-sm font-medium transition-all duration-300 ${
                  activePlan === "monthly"
                    ? "bg-gradient-to-r from-emerald-500 to-teal-500 text-white shadow-md"
                    : "bg-white text-gray-600 border border-gray-200"
                }`}
              >
                Monthly
              </button>
              <button
                onClick={() => setActivePlan("annual")}
                className={`px-6 py-2 rounded-r-lg text-sm font-medium transition-all duration-300 ${
                  activePlan === "annual"
                    ? "bg-gradient-to-r from-emerald-500 to-teal-500 text-white shadow-md"
                    : "bg-white text-gray-600 border border-gray-200"
                }`}
              >
                Annual <span className="text-xs text-emerald-500 font-bold">Save 15%</span>
              </button>
            </div>
          </motion.div>

          <div className="grid grid-cols-1 md:grid-cols-3 gap-8">
            {pricingTiers[activePlan].map((tier, index) => (
              <motion.div
                key={index}
                className={`bg-white rounded-xl overflow-hidden shadow-lg border ${
                  tier.popular ? "border-emerald-200" : "border-gray-100"
                } relative`}
                initial={{ opacity: 0, y: 20 }}
                animate={{ opacity: 1, y: 0 }}
                transition={{ delay: 0.1 * index, duration: 0.5 }}
                whileHover={{
                  y: -5,
                  boxShadow: "0 20px 25px -5px rgba(0, 0, 0, 0.1), 0 10px 10px -5px rgba(0, 0, 0, 0.04)",
                }}
              >
                {tier.popular && (
                  <div className="absolute top-0 right-0 bg-gradient-to-r from-emerald-500 to-teal-500 text-white px-4 py-1 rounded-bl-lg text-sm font-bold shadow-md">
                    Most Popular
                  </div>
                )}
                <div className="p-8">
                  <h3 className="text-2xl font-bold mb-2 text-gray-800">{tier.title}</h3>
                  <div className="flex items-end gap-1 mb-6">
                    <span className="text-5xl font-bold text-gray-800">{tier.price}</span>
                    <span className="text-gray-500 mb-1">/{tier.period}</span>
                  </div>

                  <ul className="space-y-4 mb-8">
                    {tier.features.map((feature, idx) => (
                      <li key={idx} className="flex items-start gap-3">
                        <Check className={`text-emerald-500 mt-1 flex-shrink-0 ${idx < 2 ? "h-5 w-5" : "h-4 w-4"}`} />
                        <span className={`${idx < 2 ? "text-gray-800 font-medium" : "text-gray-600"}`}>{feature}</span>
                      </li>
                    ))}
                  </ul>

                  <button
                    className={`w-full py-3 rounded-lg font-medium transition-all duration-300 text-lg ${
                      tier.popular
                        ? "bg-gradient-to-r from-emerald-500 to-teal-500 text-white hover:shadow-lg"
                        : "bg-gray-100 text-gray-800 hover:bg-gray-200"
                    }`}
                  >
                    {tier.cta}
                  </button>
                </div>
              </motion.div>
            ))}
          </div>
        </div>
      </section>

      {/* Testimonials Section */}
      <section className="py-20 px-6 bg-white">
        <div className="max-w-6xl mx-auto">
          <motion.div
            className="text-center mb-16"
            initial={{ opacity: 0, y: 20 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ duration: 0.5 }}
          >
            <div className="inline-block mb-4">
              <Award className="h-8 w-8 text-amber-500" />
            </div>
            <h2 className="text-4xl font-bold mb-4 text-gray-800">What Our Members Say</h2>
            <p className="text-xl text-gray-600 max-w-3xl mx-auto">
              Join thousands of satisfied premium members who have transformed their digital asset experience.
            </p>
          </motion.div>

          <div className="grid grid-cols-1 md:grid-cols-3 gap-8">
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
                <p className="text-gray-600 mb-6 italic">"{testimonial.quote}"</p>
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
      <section className="py-20 px-6 bg-gray-50">
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
            >
              Upgrade to Premium
            </motion.button>
            <p className="mt-6 text-sm text-gray-500">No credit card required for 7-day free trial</p>
          </div>
        </motion.div>
      </section>

      {/* FAQ Section */}
      <section className="py-20 px-6 bg-white">
        <div className="max-w-4xl mx-auto">
          <motion.div
            className="text-center mb-16"
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
                question: "How does the mining speed boost work?",
                answer:
                  "Our premium technology optimizes your mining algorithms and provides dedicated server resources, resulting in up to 10x faster mining speeds compared to the standard plan.",
              },
              {
                question: "Can I upgrade or downgrade my plan later?",
                answer:
                  "Yes, you can upgrade or downgrade your plan at any time. Changes will be applied at the start of your next billing cycle.",
              },
              {
                question: "What happens after my free trial ends?",
                answer:
                  "After your 7-day free trial, you'll be automatically subscribed to the plan you selected. You can cancel anytime before the trial ends to avoid being charged.",
              },
              {
                question: "Are the exclusive NFTs really worth it?",
                answer:
                  "Our premium-exclusive NFTs are created by top digital artists and have historically increased in value by an average of 300% within the first year.",
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
  )
}

export default Premium

