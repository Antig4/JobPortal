"use client"

import { useFormStatus } from "react-dom"
import { Loader2 } from "lucide-react"
import { ComponentProps } from "react"

interface SubmitButtonProps extends ComponentProps<"button"> {
  pendingText?: React.ReactNode
  hideIcon?: boolean
}

export function SubmitButton({
  children,
  pendingText,
  disabled,
  className,
  hideIcon = false,
  ...props
}: SubmitButtonProps) {
  const { pending } = useFormStatus()

  return (
    <button
      type="submit"
      disabled={pending || disabled}
      className={`${className} relative overflow-hidden transition-all duration-300 ${
        pending 
          ? "opacity-80 cursor-not-allowed scale-[0.98] brightness-90 shadow-inner" 
          : "hover:shadow-lg active:scale-[0.97]"
      }`}
      {...props}
    >
      <div className={`flex items-center justify-center gap-2 transition-transform duration-300 ${pending ? "scale-95" : "scale-100"}`}>
        {pending && !hideIcon && (
          <div className="relative flex items-center justify-center">
            <Loader2 className="h-4 w-4 animate-spin shrink-0 text-current" />
            <div className="absolute inset-0 h-4 w-4 rounded-full border-2 border-current opacity-20" />
          </div>
        )}
        {pending && pendingText ? pendingText : children}
      </div>
      
      {/* Shine effect when loading */}
      {pending && (
        <div className="absolute inset-0 bg-gradient-to-r from-transparent via-white/10 to-transparent -translate-x-full animate-[shimmer_1.5s_infinite]" />
      )}
    </button>
  )
}
