/**
 * SlideUpPanel Component - MealStream Design System
 * 
 * Mobile-friendly slide-up panel that replaces modals
 * per UX commandments, with glassmorphism styling and smooth animations
 */

'use client'

import { HTMLAttributes, ReactNode, forwardRef, useEffect } from 'react'
import { motion, AnimatePresence, PanInfo } from 'framer-motion'
import { cn } from '@/utils/cn'

interface SlideUpPanelProps extends HTMLAttributes<HTMLDivElement> {
  isOpen: boolean
  onClose: () => void
  title?: string
  description?: string
  children: ReactNode
  size?: 'sm' | 'md' | 'lg' | 'full'
  showHandle?: boolean
  closeOnBackdropClick?: boolean
  closeOnSwipeDown?: boolean
}

const SlideUpPanel = forwardRef<HTMLDivElement, SlideUpPanelProps>(
  ({ 
    isOpen,
    onClose,
    title,
    description,
    children,
    size = 'md',
    showHandle = true,
    closeOnBackdropClick = true,
    closeOnSwipeDown = true,
    className,
    ...props 
  }, ref) => {

    // Prevent body scroll when panel is open
    useEffect(() => {
      if (isOpen) {
        document.body.style.overflow = 'hidden'
      } else {
        document.body.style.overflow = 'unset'
      }

      return () => {
        document.body.style.overflow = 'unset'
      }
    }, [isOpen])

    // Handle escape key
    useEffect(() => {
      const handleEscape = (e: KeyboardEvent) => {
        if (e.key === 'Escape' && isOpen) {
          onClose()
        }
      }

      document.addEventListener('keydown', handleEscape)
      return () => document.removeEventListener('keydown', handleEscape)
    }, [isOpen, onClose])

    const sizes = {
      sm: 'max-h-[40vh]',
      md: 'max-h-[60vh]',
      lg: 'max-h-[80vh]',
      full: 'max-h-[95vh]'
    }

    const backdropVariants = {
      initial: { opacity: 0 },
      animate: { 
        opacity: 1,
        transition: { duration: 0.3, ease: "easeOut" }
      },
      exit: { 
        opacity: 0,
        transition: { duration: 0.2, ease: "easeIn" }
      }
    }

    const panelVariants = {
      initial: { 
        y: '100%',
        opacity: 0
      },
      animate: { 
        y: 0,
        opacity: 1,
        transition: { 
          duration: 0.4, 
          ease: [0.25, 0.46, 0.45, 0.94] // Custom easing for smooth feel
        }
      },
      exit: { 
        y: '100%',
        opacity: 0,
        transition: { 
          duration: 0.3, 
          ease: [0.55, 0.055, 0.675, 0.19]
        }
      }
    }

    const handleDragEnd = (event: any, info: PanInfo) => {
      if (closeOnSwipeDown && info.offset.y > 100) {
        onClose()
      }
    }

    const handleBackdropClick = (e: React.MouseEvent) => {
      if (closeOnBackdropClick && e.target === e.currentTarget) {
        onClose()
      }
    }

    return (
      <AnimatePresence>
        {isOpen && (
          <motion.div
            className="fixed inset-0 z-50 flex items-end justify-center"
            variants={backdropVariants}
            initial="initial"
            animate="animate"
            exit="exit"
          >
            {/* Backdrop */}
            <motion.div
              className="absolute inset-0 bg-black/50 backdrop-blur-sm"
              onClick={handleBackdropClick}
              initial={{ backdropFilter: 'blur(0px)' }}
              animate={{ backdropFilter: 'blur(4px)' }}
              exit={{ backdropFilter: 'blur(0px)' }}
            />

            {/* Panel */}
            <motion.div
              ref={ref}
              className={cn(
                'relative w-full bg-glass-elevated backdrop-blur-xl',
                'border-t border-white/20 shadow-2xl',
                'rounded-t-2xl overflow-hidden',
                sizes[size],
                className
              )}
              variants={panelVariants}
              initial="initial"
              animate="animate"
              exit="exit"
              drag={closeOnSwipeDown ? "y" : false}
              dragConstraints={{ top: 0, bottom: 0 }}
              dragElastic={{ top: 0, bottom: 0.2 }}
              onDragEnd={handleDragEnd}
              {...props}
            >
              {/* Handle */}
              {showHandle && (
                <motion.div
                  className="flex justify-center pt-3 pb-2"
                  initial={{ opacity: 0, scale: 0.8 }}
                  animate={{ opacity: 1, scale: 1 }}
                  transition={{ delay: 0.2, duration: 0.3 }}
                >
                  <div className="w-10 h-1 bg-neutral-400 rounded-full" />
                </motion.div>
              )}

              {/* Header */}
              {(title || description) && (
                <motion.div
                  className="px-6 py-4 border-b border-white/10"
                  initial={{ opacity: 0, y: -10 }}
                  animate={{ opacity: 1, y: 0 }}
                  transition={{ delay: 0.1, duration: 0.3 }}
                >
                  {title && (
                    <h2 className="text-xl font-semibold text-neutral-100 mb-1">
                      {title}
                    </h2>
                  )}
                  {description && (
                    <p className="text-sm text-neutral-400">
                      {description}
                    </p>
                  )}
                </motion.div>
              )}

              {/* Content */}
              <motion.div
                className="flex-1 overflow-y-auto p-6"
                initial={{ opacity: 0, y: 20 }}
                animate={{ opacity: 1, y: 0 }}
                transition={{ delay: 0.2, duration: 0.4 }}
              >
                {children}
              </motion.div>

              {/* Close button (optional, for accessibility) */}
              <motion.button
                className="absolute top-4 right-4 p-2 text-neutral-400 hover:text-neutral-200 hover:bg-white/10 rounded-lg transition-colors duration-200"
                onClick={onClose}
                initial={{ opacity: 0, scale: 0 }}
                animate={{ opacity: 1, scale: 1 }}
                transition={{ delay: 0.3, duration: 0.2 }}
                whileHover={{ scale: 1.1 }}
                whileTap={{ scale: 0.9 }}
                aria-label="Close panel"
              >
                <svg className="w-5 h-5" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                  <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M6 18L18 6M6 6l12 12" />
                </svg>
              </motion.button>
            </motion.div>
          </motion.div>
        )}
      </AnimatePresence>
    )
  }
)

SlideUpPanel.displayName = 'SlideUpPanel'

export default SlideUpPanel