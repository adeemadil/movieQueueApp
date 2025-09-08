/**
 * Toast Component - MealStream Design System
 * 
 * Non-intrusive notification system with glassmorphism styling
 * and smooth animations, avoiding modals per UX commandments
 */

'use client'

import { HTMLAttributes, forwardRef, useEffect, useState } from 'react'
import { motion, AnimatePresence } from 'framer-motion'
import { cn } from '@/utils/cn'

interface ToastProps extends HTMLAttributes<HTMLDivElement> {
  variant?: 'success' | 'error' | 'info' | 'warning'
  title?: string
  description?: string
  action?: {
    label: string
    onClick: () => void
  }
  autoHide?: boolean
  duration?: number
  onClose?: () => void
  visible?: boolean
}

const Toast = forwardRef<HTMLDivElement, ToastProps>(
  ({ 
    variant = 'info',
    title,
    description,
    action,
    autoHide = true,
    duration = 4000,
    onClose,
    visible = true,
    className,
    children,
    ...props 
  }, ref) => {

    const [isVisible, setIsVisible] = useState(visible)

    useEffect(() => {
      setIsVisible(visible)
    }, [visible])

    useEffect(() => {
      if (autoHide && isVisible) {
        const timer = setTimeout(() => {
          handleClose()
        }, duration)

        return () => clearTimeout(timer)
      }
    }, [autoHide, duration, isVisible])

    const handleClose = () => {
      setIsVisible(false)
      onClose?.()
    }

    const variants = {
      success: {
        bg: 'bg-glass-primary border-l-4 border-success-500',
        icon: (
          <svg className="w-5 h-5 text-success-500" fill="none" stroke="currentColor" viewBox="0 0 24 24">
            <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M5 13l4 4L19 7" />
          </svg>
        ),
        iconBg: 'bg-success-500/20'
      },
      error: {
        bg: 'bg-glass-primary border-l-4 border-red-500',
        icon: (
          <svg className="w-5 h-5 text-red-500" fill="none" stroke="currentColor" viewBox="0 0 24 24">
            <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M6 18L18 6M6 6l12 12" />
          </svg>
        ),
        iconBg: 'bg-red-500/20'
      },
      warning: {
        bg: 'bg-glass-primary border-l-4 border-amber-500',
        icon: (
          <svg className="w-5 h-5 text-amber-500" fill="none" stroke="currentColor" viewBox="0 0 24 24">
            <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M12 9v2m0 4h.01m-6.938 4h13.856c1.54 0 2.502-1.667 1.732-2.5L13.732 4c-.77-.833-1.964-.833-2.732 0L3.732 16.5c-.77.833.192 2.5 1.732 2.5z" />
          </svg>
        ),
        iconBg: 'bg-amber-500/20'
      },
      info: {
        bg: 'bg-glass-primary border-l-4 border-primary-500',
        icon: (
          <svg className="w-5 h-5 text-primary-500" fill="none" stroke="currentColor" viewBox="0 0 24 24">
            <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M13 16h-1v-4h-1m1-4h.01M21 12a9 9 0 11-18 0 9 9 0 0118 0z" />
          </svg>
        ),
        iconBg: 'bg-primary-500/20'
      }
    }

    const toastVariants = {
      initial: { 
        opacity: 0, 
        y: -50, 
        scale: 0.95,
        filter: 'blur(4px)'
      },
      animate: { 
        opacity: 1, 
        y: 0, 
        scale: 1,
        filter: 'blur(0px)',
        transition: { 
          duration: 0.3, 
          ease: "easeOut" 
        }
      },
      exit: { 
        opacity: 0, 
        y: -20, 
        scale: 0.95,
        filter: 'blur(2px)',
        transition: { 
          duration: 0.2, 
          ease: "easeIn" 
        }
      }
    }

    const progressVariants = {
      initial: { width: '100%' },
      animate: { 
        width: '0%',
        transition: { 
          duration: duration / 1000, 
          ease: "linear" 
        }
      }
    }

    return (
      <AnimatePresence>
        {isVisible && (
          <motion.div
            ref={ref}
            className={cn(
              'fixed top-4 right-4 z-50 max-w-sm w-full',
              'backdrop-blur-xl shadow-xl rounded-lg overflow-hidden',
              variants[variant].bg,
              className
            )}
            variants={toastVariants}
            initial="initial"
            animate="animate"
            exit="exit"
            {...props}
          >
            <div className="p-4">
              <div className="flex items-start">
                {/* Icon */}
                <motion.div
                  className={cn(
                    'flex-shrink-0 w-8 h-8 rounded-full flex items-center justify-center mr-3',
                    variants[variant].iconBg
                  )}
                  initial={{ scale: 0, rotate: -180 }}
                  animate={{ scale: 1, rotate: 0 }}
                  transition={{ delay: 0.1, duration: 0.3, ease: "backOut" }}
                >
                  {variants[variant].icon}
                </motion.div>

                {/* Content */}
                <div className="flex-1 min-w-0">
                  {title && (
                    <motion.p
                      className="text-sm font-semibold text-neutral-100 mb-1"
                      initial={{ opacity: 0, x: -10 }}
                      animate={{ opacity: 1, x: 0 }}
                      transition={{ delay: 0.2, duration: 0.3 }}
                    >
                      {title}
                    </motion.p>
                  )}
                  
                  {(description || children) && (
                    <motion.div
                      className="text-sm text-neutral-300"
                      initial={{ opacity: 0, x: -10 }}
                      animate={{ opacity: 1, x: 0 }}
                      transition={{ delay: 0.25, duration: 0.3 }}
                    >
                      {description || children}
                    </motion.div>
                  )}

                  {/* Action button */}
                  {action && (
                    <motion.button
                      className="mt-2 text-sm font-medium text-primary-400 hover:text-primary-300 transition-colors duration-200"
                      onClick={action.onClick}
                      initial={{ opacity: 0, y: 10 }}
                      animate={{ opacity: 1, y: 0 }}
                      transition={{ delay: 0.3, duration: 0.3 }}
                      whileHover={{ scale: 1.05 }}
                      whileTap={{ scale: 0.95 }}
                    >
                      {action.label}
                    </motion.button>
                  )}
                </div>

                {/* Close button */}
                <motion.button
                  className="flex-shrink-0 ml-2 text-neutral-400 hover:text-neutral-200 transition-colors duration-200 p-1 rounded-lg hover:bg-white/10"
                  onClick={handleClose}
                  initial={{ opacity: 0, scale: 0 }}
                  animate={{ opacity: 1, scale: 1 }}
                  transition={{ delay: 0.4, duration: 0.2 }}
                  whileHover={{ scale: 1.1 }}
                  whileTap={{ scale: 0.9 }}
                >
                  <svg className="w-4 h-4" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                    <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M6 18L18 6M6 6l12 12" />
                  </svg>
                </motion.button>
              </div>
            </div>

            {/* Progress bar for auto-hide */}
            {autoHide && (
              <motion.div
                className="h-1 bg-gradient-to-r from-primary-500 to-accent-500"
                variants={progressVariants}
                initial="initial"
                animate="animate"
              />
            )}
          </motion.div>
        )}
      </AnimatePresence>
    )
  }
)

Toast.displayName = 'Toast'

export default Toast