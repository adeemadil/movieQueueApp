/**
 * Input Component - MealStream Design System
 * 
 * Glass-styled input component optimized for eating context
 * with large touch targets and clear visual feedback
 */

'use client'

import { InputHTMLAttributes, forwardRef, useState } from 'react'
import { motion } from 'framer-motion'
import { cn } from '@/utils/cn'

interface InputProps extends InputHTMLAttributes<HTMLInputElement> {
  label?: string
  error?: string
  helperText?: string
  icon?: React.ReactNode
  showPasswordToggle?: boolean
}

const Input = forwardRef<HTMLInputElement, InputProps>(
  ({ 
    label, 
    error, 
    helperText, 
    icon, 
    showPasswordToggle = false,
    type = 'text',
    className,
    ...props 
  }, ref) => {
    const [showPassword, setShowPassword] = useState(false)
    const [isFocused, setIsFocused] = useState(false)

    const inputType = showPasswordToggle && showPassword ? 'text' : type

    return (
      <div className="w-full">
        {label && (
          <label className="block text-sm font-medium text-neutral-200 mb-2">
            {label}
          </label>
        )}
        
        <div className="relative">
          {icon && (
            <motion.div 
              className={cn(
                "absolute left-5 top-1/2 transform -translate-y-1/2 transition-colors duration-300",
                isFocused ? "text-primary-400" : "text-neutral-400",
                error && "text-red-400"
              )}
              animate={{ scale: isFocused ? 1.1 : 1 }}
              transition={{ duration: 0.2 }}
            >
              {icon}
            </motion.div>
          )}
          
          <motion.div className="relative">
            {/* Animated border gradient */}
            <motion.div
              className={cn(
                "absolute -inset-0.5 bg-gradient-to-r from-primary-500 via-accent-500 to-success-500 rounded-xl blur opacity-0 transition-opacity duration-300",
                isFocused && !error && "opacity-20"
              )}
            />
            
            <motion.input
              ref={ref}
              type={inputType}
              className={cn(
                // Base styles
                'relative w-full h-14 px-5 text-base text-neutral-100 placeholder-neutral-400 font-medium',
                'bg-glass-primary backdrop-blur-xl border-2 border-white/20 rounded-xl shadow-lg',
                'transition-all duration-300 focus:outline-none',
                
                // Focus states
                'focus:border-primary-400/50 focus:shadow-primary-glow focus:bg-white/15',
                'focus:placeholder-neutral-300',
                
                // Error states
                error && 'border-red-400/50 focus:border-red-400/70 focus:shadow-red-500/20 bg-red-500/5',
                
                // Icon padding
                icon && 'pl-14',
                showPasswordToggle && 'pr-14',
                
                // Touch-friendly sizing (minimum 44px height)
                'min-h-[56px]',
                
                className
              )}
              onFocus={() => setIsFocused(true)}
              onBlur={() => setIsFocused(false)}
              {...(props as any)}
            />
          </motion.div>
          
          {showPasswordToggle && (
            <motion.button
              type="button"
              className={cn(
                "absolute right-5 top-1/2 transform -translate-y-1/2 transition-colors duration-300 p-1 rounded-lg hover:bg-white/10",
                isFocused ? "text-primary-400" : "text-neutral-400",
                "hover:text-neutral-200"
              )}
              onClick={() => setShowPassword(!showPassword)}
              tabIndex={-1}
              whileHover={{ scale: 1.1 }}
              whileTap={{ scale: 0.95 }}
            >
              {showPassword ? (
                <svg className="w-5 h-5" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                  <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M13.875 18.825A10.05 10.05 0 0112 19c-4.478 0-8.268-2.943-9.543-7a9.97 9.97 0 011.563-3.029m5.858.908a3 3 0 114.243 4.243M9.878 9.878l4.242 4.242M9.878 9.878L3 3m6.878 6.878L21 21" />
                </svg>
              ) : (
                <svg className="w-5 h-5" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                  <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M15 12a3 3 0 11-6 0 3 3 0 016 0z" />
                  <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M2.458 12C3.732 7.943 7.523 5 12 5c4.478 0 8.268 2.943 9.542 7-1.274 4.057-5.064 7-9.542 7-4.477 0-8.268-2.943-9.542-7z" />
                </svg>
              )}
            </motion.button>
          )}
        </div>
        
        {(error || helperText) && (
          <motion.div
            initial={{ opacity: 0, y: -5 }}
            animate={{ opacity: 1, y: 0 }}
            className="mt-2"
          >
            {error ? (
              <p className="text-sm text-red-400 flex items-center">
                <svg className="w-4 h-4 mr-1" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                  <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M12 8v4m0 4h.01M21 12a9 9 0 11-18 0 9 9 0 0118 0z" />
                </svg>
                {error}
              </p>
            ) : (
              <p className="text-sm text-neutral-400">{helperText}</p>
            )}
          </motion.div>
        )}
      </div>
    )
  }
)

Input.displayName = 'Input'

export default Input