import React from "react"
import { CheckCircle, CreditCard, Package, Loader2 } from "lucide-react"

interface PaymentProgressProps {
  currentStep: number
}

export default function PaymentProgress({ currentStep }: PaymentProgressProps) {
  const steps = [
    { id: 1, name: "Chọn gói", icon: Package },
    { id: 2, name: "Thanh toán", icon: CreditCard },
    { id: 3, name: "Xác nhận", icon: CheckCircle },
  ]

  return (
    <div className="flex items-center justify-center mb-8">
      {steps.map((step, index) => (
        <React.Fragment key={step.id}>
          {index > 0 && <div className={`w-12 h-0.5 mx-1 ${currentStep >= step.id ? "bg-blue-500" : "bg-gray-200"}`} />}
          <div className="flex flex-col items-center">
            <div
              className={`flex items-center justify-center w-10 h-10 rounded-full ${
                currentStep > step.id
                  ? "bg-green-100 text-green-600"
                  : currentStep === step.id
                    ? "bg-blue-100 text-blue-600"
                    : "bg-gray-100 text-gray-400"
              }`}
            >
              {currentStep > step.id ? (
                <CheckCircle className="w-5 h-5" />
              ) : currentStep === step.id && currentStep === 3 ? (
                <Loader2 className="w-5 h-5 animate-spin" />
              ) : (
                <step.icon className="w-5 h-5" />
              )}
            </div>
            <span className={`mt-2 text-xs font-medium ${currentStep >= step.id ? "text-gray-900" : "text-gray-500"}`}>
              {step.name}
            </span>
          </div>
        </React.Fragment>
      ))}
    </div>
  )
}
