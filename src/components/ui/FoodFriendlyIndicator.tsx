/**
 * FoodFriendlyIndicator Component - MealStream Design System
 * 
 * Unique visual indicator for food-friendly content scoring
 * with animated leaf icons and intuitive 1-10 scale visualization
 */

'use client'

import { HTMLAttributes, forwardRef } from 'react'
import { motion } from 'framer-motion'
import { cn } from '@/utils/cn'

interface FoodFriendlyIndicatorProps extends HTMLAttributes<HTMLDivElement> {
  score: number // 1-10 scale
  style?: 'minimal' | 'detailed' | 'badge'
  animation?: 'static' | 'pulse' | 'grow' | 'glow'
  showReasoning?: boolean
  reasoning?: string[]
  size?: 'sm' | 'md' | 'lg'
}

const FoodFriendlyIndicator = forwardRef<HTMLDivElement, FoodFriendlyIndicatorProps>(
  ({ 
    score, 
    style = 'detailed',
    animation = 'grow',
    showReasoning = false,
    reasoning = [],
    size = 'md',
    className,
    ...props 
  }, ref) => {

    // Clamp score between 1-10
    const clampedScore = Math.max(1, Math.min(10, score))
    
    // Determine color and label based on score
    const getScoreData = (score: number) => {
      if (score <= 3) {
        return {
          color: 'red-500',
          bgColor: 'red-500/20',
          borderColor: 'red-500/30',
          icon: 'leaf-outline',
          label: 'Attention Required',
          description: 'Complex content requiring focus'
        }
      } else if (score <= 6) {
        return {
          color: 'amber-500',
          bgColor: 'amber-500/20',
          borderColor: 'amber-500/30',
          icon: 'leaf-half',
          label: 'Moderate Focus',
          description: 'Some attention needed'
        }
      } else if (score <= 8) {
        return {
          color: 'success-500',
          bgColor: 'success-500/20',
          borderColor: 'success-500/30',
          icon: 'leaf-solid',
          label: 'Food Friendly',
          description: 'Great for eating'
        }
      } else {
        return {
          color: 'success-400',
          bgColor: 'success-400/20',
          borderColor: 'success-400/30',
          icon: 'leaf-sparkle',
          label: 'Perfect for Eating',
          description: 'Ideal background content'
        }
      }
    }

    const scoreData = getScoreData(clampedScore)

    const sizes = {
      sm: {
        container: 'text-xs',
        icon: 'w-4 h-4',
        badge: 'w-6 h-6 text-xs',
        spacing: 'gap-1'
      },
      md: {
        container: 'text-sm',
        icon: 'w-5 h-5',
        badge: 'w-8 h-8 text-sm',
        spacing: 'gap-2'
      },
      lg: {
        container: 'text-base',
        icon: 'w-6 h-6',
        badge: 'w-10 h-10 text-base',
        spacing: 'gap-3'
      }
    }

    const animations = {
      static: {},
      pulse: {
        animate: { scale: [1, 1.05, 1] },
        transition: { duration: 2, repeat: Infinity, ease: "easeInOut" }
      },
      grow: {
        whileHover: { scale: 1.1 },
        transition: { duration: 0.2 }
      },
      glow: {
        animate: { 
          boxShadow: [
            `0 0 5px rgba(16, 185, 129, 0.3)`,
            `0 0 20px rgba(16, 185, 129, 0.6)`,
            `0 0 5px rgba(16, 185, 129, 0.3)`
          ]
        },
        transition: { duration: 2, repeat: Infinity, ease: "easeInOut" }
      }
    }

    // Leaf icon component
    const LeafIcon = ({ variant, className: iconClassName }: { variant: string, className?: string }) => {
      const iconVariants = {
        'leaf-outline': (
          <svg className={iconClassName} fill="none" stroke="currentColor" viewBox="0 0 24 24">
            <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M20.354 15.354A9 9 0 018.646 3.646 9.003 9.003 0 0012 21a9.003 9.003 0 008.354-5.646z" />
          </svg>
        ),
        'leaf-half': (
          <svg className={iconClassName} fill="currentColor" stroke="currentColor" viewBox="0 0 24 24">
            <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={1} d="M20.354 15.354A9 9 0 018.646 3.646 9.003 9.003 0 0012 21a9.003 9.003 0 008.354-5.646z" fillOpacity="0.5" />
          </svg>
        ),
        'leaf-solid': (
          <svg className={iconClassName} fill="currentColor" viewBox="0 0 24 24">
            <path d="M20.354 15.354A9 9 0 018.646 3.646 9.003 9.003 0 0012 21a9.003 9.003 0 008.354-5.646z" />
          </svg>
        ),
        'leaf-sparkle': (
          <svg className={iconClassName} fill="currentColor" viewBox="0 0 24 24">
            <path d="M20.354 15.354A9 9 0 018.646 3.646 9.003 9.003 0 0012 21a9.003 9.003 0 008.354-5.646z" />
            <circle cx="16" cy="8" r="1" fill="white" opacity="0.8" />
            <circle cx="14" cy="6" r="0.5" fill="white" opacity="0.6" />
            <circle cx="18" cy="10" r="0.5" fill="white" opacity="0.6" />
          </svg>
        )
      }
      return iconVariants[variant as keyof typeof iconVariants] || iconVariants['leaf-solid']
    }

    if (style === 'minimal') {
      return (
        <motion.div
          ref={ref}
          className={cn(
            'inline-flex items-center justify-center rounded-full',
            `bg-${scoreData.bgColor} border border-${scoreData.borderColor}`,
            sizes[size].badge,
            className
          )}
          {...animations[animation]}
          {...props}
        >
          <LeafIcon 
            variant={scoreData.icon} 
            className={cn(sizes[size].icon, `text-${scoreData.color}`)} 
          />
        </motion.div>
      )
    }

    if (style === 'badge') {
      return (
        <motion.div
          ref={ref}
          className={cn(
            'inline-flex items-center justify-center rounded-full font-bold',
            `bg-${scoreData.color} text-white shadow-lg`,
            sizes[size].badge,
            className
          )}
          {...animations[animation]}
          {...props}
        >
          {clampedScore}
        </motion.div>
      )
    }

    // Detailed style (default)
    return (
      <motion.div
        ref={ref}
        className={cn(
          'inline-flex items-center rounded-lg px-3 py-2',
          `bg-${scoreData.bgColor} border border-${scoreData.borderColor}`,
          sizes[size].container,
          sizes[size].spacing,
          className
        )}
        {...animations[animation]}
        {...props}
      >
        <motion.div
          className="flex-shrink-0"
          animate={animation === 'pulse' ? { rotate: [0, 5, -5, 0] } : {}}
          transition={{ duration: 2, repeat: Infinity, ease: "easeInOut" }}
        >
          <LeafIcon 
            variant={scoreData.icon} 
            className={cn(sizes[size].icon, `text-${scoreData.color}`)} 
          />
        </motion.div>
        
        <div className="flex flex-col">
          <div className="flex items-center gap-1">
            <span className={`font-semibold text-${scoreData.color}`}>
              {clampedScore}/10
            </span>
            <span className="text-neutral-300 font-medium">
              {scoreData.label}
            </span>
          </div>
          
          {showReasoning && reasoning.length > 0 && (
            <motion.div
              className="text-xs text-neutral-400 mt-1"
              initial={{ opacity: 0, height: 0 }}
              animate={{ opacity: 1, height: 'auto' }}
              transition={{ duration: 0.3 }}
            >
              {reasoning.slice(0, 2).join(', ')}
            </motion.div>
          )}
        </div>
      </motion.div>
    )
  }
)

FoodFriendlyIndicator.displayName = 'FoodFriendlyIndicator'

export default FoodFriendlyIndicator