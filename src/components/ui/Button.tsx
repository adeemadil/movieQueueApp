/**
 * Button Component - MealStream Design System
 * 
 * Premium button component with sophisticated animations, 
 * glassmorphism effects, and eating-context optimizations
 */

'use client'

import { ButtonHTMLAttributes, ReactNode, forwardRef, useState } from 'react'
import { motion, MotionProps } from 'framer-motion'
import { cn } from '@/utils/cn'

interface ButtonProps extends ButtonHTMLAttributes<HTMLButtonElement> {
  variant?: 'primary' | 'secondary' | 'accent' | 'ghost' | 'emergency'
  size?: 'sm' | 'md' | 'lg' | 'xl' | 'hero'
  loading?: boolean
  children: ReactNode
  motionProps?: MotionProps
}

const Button = forwardRef<HTMLButtonElement, ButtonProps>(
  ({ 
    variant = 'primary', 
    size = 'md', 
    loading = false, 
    disabled, 
    children, 
    className,
    motionProps,
    ...props 
  }, ref) => {
    const [isPressed, setIsPressed] = useState(false)

    const baseClasses = 'relative inline-flex items-center justify-center font-semibold rounded-xl transition-all duration-200 focus:outline-none focus:ring-2 focus:ring-offset-2 focus:ring-offset-transparent disabled:opacity-50 disabled:cursor-not-allowed overflow-hidden group'

    const variants = {
      primary: cn(
        'bg-gradient-to-r from-primary-600 via-primary-500 to-primary-600 text-white shadow-xl',
        'hover:shadow-primary-glow hover:from-primary-500 hover:to-primary-500',
        'focus:ring-primary-400/50 active:shadow-inner',
        'before:absolute before:inset-0 before:bg-gradient-to-r before:from-white/20 before:via-white/10 before:to-transparent before:opacity-0 hover:before:opacity-100 before:transition-opacity before:duration-300'
      ),
      secondary: cn(
        'bg-glass-primary backdrop-blur-xl text-neutral-100 border border-white/30 shadow-lg',
        'hover:bg-white/20 hover:border-white/50 hover:shadow-xl hover:text-white',
        'focus:ring-white/30 active:bg-white/10',
        'before:absolute before:inset-0 before:bg-gradient-to-r before:from-white/10 before:to-transparent before:opacity-0 hover:before:opacity-100 before:transition-opacity before:duration-300'
      ),
      accent: cn(
        'bg-gradient-to-r from-accent-500 via-accent-400 to-accent-500 text-white shadow-xl',
        'hover:shadow-accent-glow hover:from-accent-400 hover:to-accent-400',
        'focus:ring-accent-400/50 active:shadow-inner',
        'before:absolute before:inset-0 before:bg-gradient-to-r before:from-white/20 before:via-white/10 before:to-transparent before:opacity-0 hover:before:opacity-100 before:transition-opacity before:duration-300'
      ),
      ghost: cn(
        'bg-transparent text-neutral-300 border border-transparent',
        'hover:bg-neutral-800/50 hover:text-neutral-100 hover:border-neutral-700/50',
        'focus:ring-neutral-400/50 active:bg-neutral-800/70'
      ),
      emergency: cn(
        'bg-gradient-to-r from-red-500 to-red-600 text-white shadow-2xl',
        'hover:from-red-400 hover:to-red-500 hover:shadow-red-500/50',
        'focus:ring-red-400/50 animate-emergency-pulse',
        'before:absolute before:inset-0 before:bg-gradient-to-r before:from-white/20 before:to-transparent before:opacity-0 hover:before:opacity-100 before:transition-opacity before:duration-300'
      )
    }

    const sizes = {
      sm: 'h-9 px-4 text-sm min-w-[80px]',
      md: 'h-12 px-6 text-base min-w-[120px]', // 48px for comfortable touch
      lg: 'h-14 px-8 text-lg min-w-[140px]',   // 56px for primary actions
      xl: 'h-16 px-10 text-xl min-w-[160px]',  // 64px for hero actions
      hero: 'h-20 px-12 text-2xl min-w-[200px]' // 80px for emergency actions
    }

    const isDisabled = disabled || loading

    const buttonVariants = {
      initial: { scale: 1 },
      hover: { 
        scale: isDisabled ? 1 : 1.02,
        transition: { duration: 0.2, ease: "easeOut" }
      },
      tap: { 
        scale: isDisabled ? 1 : 0.98,
        transition: { duration: 0.1, ease: "easeInOut" }
      }
    }

    const shimmerVariants = {
      initial: { x: '-100%' },
      hover: { 
        x: '100%',
        transition: { duration: 0.6, ease: "easeInOut" }
      }
    }

    return (
      <motion.button
        ref={ref}
        className={cn(
          baseClasses,
          variants[variant],
          sizes[size],
          isDisabled && 'cursor-not-allowed opacity-50',
          className
        )}
        disabled={isDisabled}
        variants={buttonVariants}
        initial="initial"
        whileHover="hover"
        whileTap="tap"
        onMouseDown={() => setIsPressed(true)}
        onMouseUp={() => setIsPressed(false)}
        onMouseLeave={() => setIsPressed(false)}
        {...motionProps}
        {...(props as any)}
      >
        {/* Shimmer effect */}
        {!isDisabled && variant !== 'ghost' && (
          <motion.div
            className="absolute inset-0 bg-gradient-to-r from-transparent via-white/20 to-transparent -skew-x-12"
            variants={shimmerVariants}
            initial="initial"
          />
        )}

        {/* Content */}
        <span className="relative z-10 flex items-center justify-center">
          {loading ? (
            <motion.div 
              className="flex items-center"
              initial={{ opacity: 0 }}
              animate={{ opacity: 1 }}
              transition={{ duration: 0.3 }}
            >
              <motion.div 
                className="w-5 h-5 border-2 border-current border-t-transparent rounded-full mr-3"
                animate={{ rotate: 360 }}
                transition={{ duration: 1, repeat: Infinity, ease: "linear" }}
              />
              <span>Loading...</span>
            </motion.div>
          ) : (
            <motion.span
              initial={{ opacity: 1 }}
              animate={{ opacity: 1 }}
              className="flex items-center justify-center"
            >
              {children}
            </motion.span>
          )}
        </span>

        {/* Ripple effect on click */}
        {isPressed && !isDisabled && (
          <motion.div
            className="absolute inset-0 bg-white/20 rounded-xl"
            initial={{ scale: 0, opacity: 0.5 }}
            animate={{ scale: 1, opacity: 0 }}
            transition={{ duration: 0.4, ease: "easeOut" }}
          />
        )}
      </motion.button>
    )
  }
)

Button.displayName = 'Button'

export default Button