/**
 * Navigation Components - MealStream Design System
 * 
 * Bottom navigation tabs and top navigation bars
 * optimized for mobile-first eating context with thumb-reachable zones
 */

'use client'

import { HTMLAttributes, ReactNode, forwardRef } from 'react'
import { motion } from 'framer-motion'
import { cn } from '@/utils/cn'

interface NavigationItem {
  id: string
  label: string
  icon: ReactNode
  active?: boolean
  badge?: number
  onClick?: () => void
}

interface BottomNavigationProps extends HTMLAttributes<HTMLDivElement> {
  items: NavigationItem[]
  activeId?: string
  onItemClick?: (id: string) => void
}

interface TopNavigationProps extends HTMLAttributes<HTMLDivElement> {
  title?: string
  subtitle?: string
  showBack?: boolean
  onBack?: () => void
  actions?: ReactNode
}

// Bottom Navigation Component
const BottomNavigation = forwardRef<HTMLDivElement, BottomNavigationProps>(
  ({ 
    items,
    activeId,
    onItemClick,
    className,
    ...props 
  }, ref) => {

    const handleItemClick = (item: NavigationItem) => {
      item.onClick?.()
      onItemClick?.(item.id)
    }

    return (
      <motion.nav
        ref={ref}
        className={cn(
          'fixed bottom-0 left-0 right-0 z-40',
          'bg-glass-primary backdrop-blur-xl border-t border-white/20',
          'safe-area-inset-bottom', // Handle iPhone notch
          className
        )}
        initial={{ y: 100, opacity: 0 }}
        animate={{ y: 0, opacity: 1 }}
        transition={{ duration: 0.4, ease: "easeOut" }}
        {...props}
      >
        <div className="flex items-center justify-around px-2 py-2 pb-safe">
          {items.map((item, index) => {
            const isActive = activeId ? item.id === activeId : item.active

            return (
              <motion.button
                key={item.id}
                className={cn(
                  'relative flex flex-col items-center justify-center',
                  'min-h-[56px] px-3 py-2 rounded-xl transition-all duration-200',
                  'hover:bg-white/10 active:scale-95',
                  isActive && 'bg-gradient-to-r from-accent-500/20 to-accent-400/20'
                )}
                onClick={() => handleItemClick(item)}
                initial={{ y: 50, opacity: 0 }}
                animate={{ y: 0, opacity: 1 }}
                transition={{ 
                  duration: 0.3, 
                  delay: index * 0.1,
                  ease: "backOut"
                }}
                whileHover={{ scale: 1.05 }}
                whileTap={{ scale: 0.95 }}
              >
                {/* Active indicator */}
                {isActive && (
                  <motion.div
                    className="absolute inset-0 bg-gradient-to-r from-accent-500/30 to-accent-400/30 rounded-xl"
                    layoutId="activeTab"
                    transition={{ duration: 0.3, ease: "easeInOut" }}
                  />
                )}

                {/* Icon container */}
                <motion.div
                  className={cn(
                    'relative flex items-center justify-center w-6 h-6 mb-1',
                    isActive ? 'text-accent-400' : 'text-neutral-400'
                  )}
                  animate={{ 
                    scale: isActive ? 1.1 : 1,
                    color: isActive ? '#FB923C' : '#94A3B8'
                  }}
                  transition={{ duration: 0.2 }}
                >
                  {item.icon}
                  
                  {/* Badge */}
                  {item.badge && item.badge > 0 && (
                    <motion.div
                      className="absolute -top-1 -right-1 bg-red-500 text-white text-xs rounded-full min-w-[16px] h-4 flex items-center justify-center px-1"
                      initial={{ scale: 0 }}
                      animate={{ scale: 1 }}
                      transition={{ delay: 0.2, type: "spring", stiffness: 500 }}
                    >
                      {item.badge > 99 ? '99+' : item.badge}
                    </motion.div>
                  )}
                </motion.div>

                {/* Label */}
                <motion.span
                  className={cn(
                    'text-xs font-medium transition-colors duration-200',
                    isActive ? 'text-accent-400' : 'text-neutral-400'
                  )}
                  animate={{ 
                    opacity: isActive ? 1 : 0.8,
                    fontWeight: isActive ? 600 : 500
                  }}
                >
                  {item.label}
                </motion.span>
              </motion.button>
            )
          })}
        </div>
      </motion.nav>
    )
  }
)

// Top Navigation Component
const TopNavigation = forwardRef<HTMLDivElement, TopNavigationProps>(
  ({ 
    title,
    subtitle,
    showBack = false,
    onBack,
    actions,
    className,
    ...props 
  }, ref) => {

    return (
      <motion.header
        ref={ref}
        className={cn(
          'sticky top-0 z-30 bg-glass-subtle backdrop-blur-xl',
          'border-b border-white/10 safe-area-inset-top',
          className
        )}
        initial={{ y: -100, opacity: 0 }}
        animate={{ y: 0, opacity: 1 }}
        transition={{ duration: 0.4, ease: "easeOut" }}
        {...props}
      >
        <div className="flex items-center justify-between px-4 py-3 pt-safe">
          {/* Left side - Back button */}
          <div className="flex items-center">
            {showBack && (
              <motion.button
                className={cn(
                  'flex items-center justify-center w-11 h-11 mr-2',
                  'text-neutral-300 hover:text-neutral-100 hover:bg-white/10',
                  'rounded-xl transition-all duration-200'
                )}
                onClick={onBack}
                initial={{ x: -20, opacity: 0 }}
                animate={{ x: 0, opacity: 1 }}
                transition={{ delay: 0.1, duration: 0.3 }}
                whileHover={{ scale: 1.05 }}
                whileTap={{ scale: 0.95 }}
              >
                <svg className="w-6 h-6" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                  <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M15 19l-7-7 7-7" />
                </svg>
              </motion.button>
            )}
          </div>

          {/* Center - Title */}
          <motion.div
            className="flex-1 text-center"
            initial={{ opacity: 0, y: -10 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ delay: 0.2, duration: 0.3 }}
          >
            {title && (
              <h1 className="text-lg font-semibold text-neutral-100 truncate">
                {title}
              </h1>
            )}
            {subtitle && (
              <p className="text-sm text-neutral-400 truncate">
                {subtitle}
              </p>
            )}
          </motion.div>

          {/* Right side - Actions */}
          <motion.div
            className="flex items-center space-x-2"
            initial={{ x: 20, opacity: 0 }}
            animate={{ x: 0, opacity: 1 }}
            transition={{ delay: 0.3, duration: 0.3 }}
          >
            {actions}
          </motion.div>
        </div>
      </motion.header>
    )
  }
)

BottomNavigation.displayName = 'BottomNavigation'
TopNavigation.displayName = 'TopNavigation'

export { BottomNavigation, TopNavigation }
export type { NavigationItem, BottomNavigationProps, TopNavigationProps }