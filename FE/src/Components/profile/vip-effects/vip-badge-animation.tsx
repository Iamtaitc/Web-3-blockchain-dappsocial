interface VIPBadgeAnimationProps {
    level: number
  }
  
  export default function VIPBadgeAnimation({ level }: VIPBadgeAnimationProps) {
    if (level < 5) return null
  
    if (level >= 10) {
      return (
        <div className="absolute -bottom-2 -right-2 z-10">
          <div className="elite-badge">
            <span className="text-xs font-bold">ELITE</span>
          </div>
        </div>
      )
    }
  
    if (level >= 5) {
      return (
        <div className="absolute -bottom-2 -right-2 z-10">
          <div className="pro-badge">
            <span className="text-xs font-bold">PRO</span>
          </div>
        </div>
      )
    }
  
    return null
  }
  