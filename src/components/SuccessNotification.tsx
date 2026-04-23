"use client"

import { useEffect, useState } from "react"
import { CheckCircle2, X } from "lucide-react"

interface SuccessNotificationProps {
  message: string
}

export function SuccessNotification({ message }: SuccessNotificationProps) {
  const [isVisible, setIsVisible] = useState(true)
  const [shouldRender, setShouldRender] = useState(true)

  useEffect(() => {
    const timer = setTimeout(() => {
      setIsVisible(false)
    }, 3000)

    const removeTimer = setTimeout(() => {
      setShouldRender(false)
    }, 3500) // Allow time for exit animation

    return () => {
      clearTimeout(timer)
      clearTimeout(removeTimer)
    }
  }, [])

  if (!shouldRender) return null

  return (
    <div 
      className={`fixed top-20 right-6 z-50 transition-all duration-500 ease-out ${
        isVisible 
          ? "opacity-100 translate-y-0 scale-100" 
          : "opacity-0 -translate-y-4 scale-95 pointer-events-none"
      }`}
    >
      <div className="bg-white dark:bg-zinc-900 text-zinc-900 dark:text-white px-5 py-3.5 rounded-2xl shadow-[0_20px_50px_rgba(0,0,0,0.2)] flex items-center gap-4 font-medium border border-zinc-200 dark:border-zinc-800 min-w-[300px]">
        <div className="h-8 w-8 rounded-full bg-green-500/10 flex items-center justify-center shrink-0">
          <CheckCircle2 className="h-5 w-5 text-green-500" />
        </div>
        <div className="flex-1 text-sm">
          {message}
        </div>
        <button 
          onClick={() => setIsVisible(false)}
          className="text-zinc-400 hover:text-zinc-600 dark:hover:text-zinc-200 transition-colors"
        >
          <X className="h-4 w-4" />
        </button>
      </div>
      
      {/* Progress bar at the bottom */}
      <div className="absolute bottom-0 left-4 right-4 h-0.5 bg-zinc-100 dark:bg-zinc-800 rounded-full overflow-hidden">
        <div 
          className="h-full bg-green-500 transition-all duration-[3000ms] ease-linear"
          style={{ width: isVisible ? "0%" : "100%" }}
        />
      </div>
    </div>
  )
}
