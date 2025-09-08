/**
 * Card Component - MealStream Design System
 * 
 * Versatile card component with glassmorphism effects,
 * multiple variants for different use cases, and premium animations
 */

'use client'

import { HTMLAttributes, ReactNode, forwardRef } from 'react'
import { motion, MotionProps } from 'framer-motion'
import { cn } from '@/utils/cn'

interface CardProps extends HTMLAttributes<HTMLDivElement> {
  variant?: 'recommendation' | 'context' | 'platform' | 'glass' | 'elevated'
  elevation?: 'flat' | 'raised' | 'floating'
  interaction?: 'static' | 'pressable' | 'swipeable'
  children: ReactNode
  motionProps?: MotionProps
  loading?: boolean
}

const Card = forwardRef<HTMLDivElement, CardProps>(
  ({ 
    variant = 'glass', 
    elevation = 'raised',
    interaction = 'static',
    loading = false,
    children, 
    className,
    motionProps,
    ...props 
  }, ref) => {

    const baseClasses = 'relative overflow-hidden transition-all duration-200'

    const variants = {
      recommendation: cn(
        'bg-slate-800/80 backdrop-blur-xl p-6 rounded-xl border border-white/20',
        'hover:bg-slate-700/80 hover:border-white/30 hover:shadow-2xl',
        'group cursor-pointer'
      ),
      context: cn(
        'bg-gradient-to-br from-primary-900/50 via-primary-800/40 to-primary-900/30',
        'backdrop-blur-lg p-8 rounded-2xl border-2 border-transparent',
        'hover:border-primary-400/50 hover:from-primary-800/60 hover:to-primary-700/40',
        'active:border-primary-300/70 active:scale-[0.98]',
        'transition-all duration-200 cursor-pointer group'
      ),
      platform: cn(
        'bg-neutral-800/80 backdrop-blur-sm p-4 rounded-lg border border-neutral-700/50',
        'hover:bg-neutral-700/80 hover:border-accent-400/50 hover:shadow-md',
        'transition-all duration-200 cursor-pointer'
      ),
      glass: cn(
        'bg-slate-800/80 backdrop-blur-xl border border-white/10',
        'rounded-xl shadow-2xl'
      ),
      elevated: cn(
        'bg-semantic-surfaceElevated border border-neutral-700/30',
        'rounded-xl shadow-xl'
      )
    }

    const elevations = {
      flat: 'shadow-none',
      raised: 'shadow-lg hover:shadow-xl',
      floating: 'shadow-2xl hover:shadow-2xl hover:-translate-y-1'
    }

    const interactions = {
      static: 'cursor-default',
      pressable: 'cursor-pointer active:scale-[0.98]',
      swipeable: 'cursor-grab active:cursor-grabbing touch-pan-x'
    }

    const cardVariants = {
      initial: { 
        scale: 1,
        y: 0,
        rotateX: 0,
        rotateY: 0
      },
      hover: interaction !== 'static' ? { 
        scale: 1.02,
        y: elevation === 'floating' ? -4 : -2,
        transition: { 
          duration: 0.2, 
          ease: "easeOut" 
        }
      } : {},
      tap: interaction === 'pressable' ? { 
        scale: 0.98,
        transition: { 
          duration: 0.1, 
          ease: "easeInOut" 
        }
      } : {},
      swipe: interaction === 'swipeable' ? {
        rotateY: 5,
        transition: { 
          duration: 0.3, 
          ease: "easeOut" 
        }
      } : {}
    }

    const shimmerVariants = {
      initial: { x: '-100%', opacity: 0 },
      hover: { 
        x: '100%', 
        opacity: 1,
        transition: { 
          duration: 0.8, 
          ease: "easeInOut" 
        }
      }
    }

    return (
      <motion.div
        ref={ref}
        className={cn(
          baseClasses,
          variants[variant],
          elevations[elevation],
          interactions[interaction],
          loading && 'animate-pulse',
          className
        )}
        variants={cardVariants}
        initial="initial"
        whileHover="hover"
        whileTap="tap"
        {...motionProps}
        {...props}
      >
        {/* Shimmer effect for interactive cards */}
        {interaction !== 'static' && !loading && (
          <motion.div
            className="absolute inset-0 bg-gradient-to-r from-transparent via-white/10 to-transparent -skew-x-12 pointer-events-none"
            variants={shimmerVariants}
            initial="initial"
          />
        )}

        {/* Loading skeleton overlay */}
        {loading && (
          <motion.div
            className="absolute inset-0 bg-gradient-to-r from-neutral-800/50 via-neutral-700/50 to-neutral-800/50 animate-pulse"
            initial={{ opacity: 0 }}
            animate={{ opacity: 1 }}
            transition={{ duration: 0.3 }}
          />
        )}

        {/* Content */}
        <div className="relative z-10">
          {children}
        </div>

        {/* Glow effect for context cards */}
        {variant === 'context' && (
          <motion.div
            className="absolute inset-0 bg-gradient-to-r from-primary-500/20 via-accent-500/20 to-success-500/20 rounded-2xl opacity-0 group-hover:opacity-100 transition-opacity duration-300 pointer-events-none"
            initial={{ opacity: 0 }}
            whileHover={{ opacity: 1 }}
          />
        )}
      </motion.div>
    )
  }
)

Card.displayName = 'Card'

export default Card