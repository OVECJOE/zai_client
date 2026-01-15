"use client"

import * as React from "react"
import { cn } from "@/lib/utils"

export interface GameButtonProps
  extends React.ButtonHTMLAttributes<HTMLButtonElement> {
  variant?: 'primary' | 'outline' | 'accent' | 'danger';
  size?: 'sm' | 'md' | 'lg';
}

const GameButton = React.forwardRef<HTMLButtonElement, GameButtonProps>(
  ({ className, variant = 'primary', size = 'md', children, ...props }, ref) => {
    const baseClasses = "relative font-bold uppercase tracking-wider transition-all duration-200 disabled:opacity-50 disabled:cursor-not-allowed";
    
    const variantClasses = {
      primary: "game-button text-white",
      outline: "game-button-outline",
      accent: "game-button bg-[#FFE500] text-[#0A0B14] border-white",
      danger: "game-button bg-[#FF0033] text-white border-white",
    };
    
    const sizeClasses = {
      sm: "px-4 py-2 text-sm",
      md: "px-6 py-3 text-base",
      lg: "px-8 py-4 text-lg",
    };
    
    return (
      <button
        className={cn(
          baseClasses,
          variantClasses[variant],
          sizeClasses[size],
          className
        )}
        ref={ref}
        {...props}
      >
        <span className="relative z-10">{children}</span>
      </button>
    )
  }
)
GameButton.displayName = "GameButton"

export { GameButton }
