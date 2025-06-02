"use client"

import { createContext, useContext, useState, type ReactNode } from "react"
import { WalletLoginModal } from "./wallet-login-modal"

interface LoginModalContextType {
  openLoginModal: (options?: { requireSignature?: boolean; actionMessage?: string; onSuccess?: () => void }) => void
  closeLoginModal: () => void
  isLoginModalOpen: boolean
}

const LoginModalContext = createContext<LoginModalContextType | undefined>(undefined)

export function useLoginModal() {
  const context = useContext(LoginModalContext)
  if (!context) {
    throw new Error("useLoginModal phải được sử dụng trong LoginModalProvider")
  }
  return context
}

interface LoginModalProviderProps {
  children: ReactNode
}

export function LoginModalProvider({ children }: LoginModalProviderProps) {
  const [isOpen, setIsOpen] = useState(false)
  const [requireSignature, setRequireSignature] = useState(false)
  const [actionMessage, setActionMessage] = useState<string | undefined>(undefined)
  const [onSuccess, setOnSuccess] = useState<(() => void) | undefined>(undefined)

  const openLoginModal = (options?: { requireSignature?: boolean; actionMessage?: string; onSuccess?: () => void }) => {
    setRequireSignature(options?.requireSignature || false)
    setActionMessage(options?.actionMessage)
    setOnSuccess(options?.onSuccess)
    setIsOpen(true)
  }

  const closeLoginModal = () => {
    setIsOpen(false)
  }

  const handleSuccess = () => {
    if (onSuccess) {
      onSuccess()
    }
  }

  return (
    <LoginModalContext.Provider
      value={{
        openLoginModal,
        closeLoginModal,
        isLoginModalOpen: isOpen,
      }}
    >
      {children}
      <WalletLoginModal
        isOpen={isOpen}
        onClose={closeLoginModal}
        onSuccess={handleSuccess}
        requireSignature={requireSignature}
        actionMessage={actionMessage}
      />
    </LoginModalContext.Provider>
  )
}
