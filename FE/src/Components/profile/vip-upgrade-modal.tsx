"use client"

import { Dialog, DialogContent, DialogHeader, DialogTitle, DialogFooter } from "../profile/ui/dialog"
import { Button } from "../profile/ui/button"
import { RadioGroup, RadioGroupItem } from "../profile/ui/radio-group"
import { Label } from "../profile/ui/label"
import { getSubscriptionDetails } from "../../lib/utils"
import { useState } from "react"

interface VIPUpgradeModalProps {
  isOpen: boolean
  onClose: () => void
  currentLevel: number
  onUpgrade: (level: number) => Promise<void>
}

export default function VIPUpgradeModal({ isOpen, onClose, currentLevel, onUpgrade }: VIPUpgradeModalProps) {
  const [selectedLevel, setSelectedLevel] = useState(Math.min(currentLevel + 1, 10))
  const [isSubmitting, setIsSubmitting] = useState(false)

  const handleUpgrade = async () => {
    setIsSubmitting(true)
    try {
      await onUpgrade(selectedLevel)
    } catch (error) {
      console.error("Error upgrading subscription:", error)
    } finally {
      setIsSubmitting(false)
    }
  }

  const availableLevels = [1, 2, 5, 10].filter((level) => level > currentLevel || level === 10)

  return (
    <Dialog open={isOpen} onOpenChange={onClose}>
      <DialogContent className="sm:max-w-[425px]">
        <DialogHeader>
          <DialogTitle>Nâng cấp gói VIP</DialogTitle>
        </DialogHeader>
        <div className="py-4">
          <RadioGroup
            value={selectedLevel.toString()}
            onValueChange={(value: string) => setSelectedLevel(Number.parseInt(value))}
          >
            {availableLevels.map((level) => {
              const details = getSubscriptionDetails(level)
              return (
                <div key={level} className="flex items-center space-x-2 space-y-2">
                  <RadioGroupItem value={level.toString()} id={`level-${level}`} />
                  <Label htmlFor={`level-${level}`} className="flex flex-1 items-center gap-2">
                    {details.icon}
                    <span>Gói {details.name}</span>
                    <span className="ml-auto text-sm text-muted-foreground">{details.multiplier}x rewards</span>
                  </Label>
                </div>
              )
            })}
          </RadioGroup>

          <div className="mt-4 rounded-lg border p-4">
            <h4 className="font-medium">Đặc quyền bao gồm:</h4>
            <ul className="mt-2 space-y-1 text-sm">
              {getSubscriptionDetails(selectedLevel).benefits.map((benefit, i) => (
                <li key={i} className="flex items-center gap-2">
                  <svg className="h-4 w-4 text-green-500" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                    <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M5 13l4 4L19 7" />
                  </svg>
                  {benefit}
                </li>
              ))}
            </ul>
          </div>
        </div>
        <DialogFooter>
          <Button type="button" variant="outline" onClick={onClose}>
            Hủy
          </Button>
          <Button onClick={handleUpgrade} disabled={isSubmitting}>
            {isSubmitting ? "Đang xử lý..." : "Nâng cấp ngay"}
          </Button>
        </DialogFooter>
      </DialogContent>
    </Dialog>
  )
}
