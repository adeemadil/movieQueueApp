/**
 * LoadingState Components - MealStream Design System
 * 
 * Skeleton screens, progressive loading, and shimmer effects
 * optimized for perceived performance during content loading
 */

'use client'

import { HTMLAttributes, forwardRef } from 'react'
import { motion } from 'framer-motion'
import { cn } from '@/utils/cn'

interface LoadingStateProps extends HTMLAttributes<HTMLDivElement> {
  type?: 'skeleton' | 'spinner' | 'progressive' | 'shimmer'
  content?: 'card' | 'list' | 'image' | 'text' | 'recommendation' | 'context'
  count?: number
  size?: 'sm' | 'md' | 'lg'
  animated?: boolean
}

const LoadingState = forwardRef<HTMLDivElement, LoadingStateProps>(
  ({ 
    type = 'skeleton', 
    content = 'card',
    count = 1,
    size = 'md',
    animated = true,
    className,
    ...props 
  }, ref) => {

    const shimmerClasses = animated ? 'animate-pulse' : ''
    
    const skeletonBase = 'bg-gradient-to-r from-neutral-800 via-neutral-700 to-neutral-800 rounded'

    // Skeleton components for different content types
    const SkeletonCard = ({ index = 0 }: { index?: number }) => (
      <motion.div
        className={cn('bg-glass-primary rounded-xl p-6 space-y-4', shimmerClasses)}
        initial={{ opacity: 0, y: 20 }}
        animate={{ opacity: 1, y: 0 }}
        transition={{ duration: 0.3, delay: index * 0.1 }}
      >
        {/* Thumbnail */}
        <div className={cn(skeletonBase, 'h-32 w-full')} />
        
        {/* Title */}
        <div className="space-y-2">
          <div className={cn(skeletonBase, 'h-4 w-3/4')} />
          <div className={cn(skeletonBase, 'h-4 w-1/2')} />
        </div>
        
        {/* Metadata */}
        <div className="flex items-center space-x-2">
          <div className={cn(skeletonBase, 'h-3 w-16')} />
          <div className={cn(skeletonBase, 'h-3 w-12')} />
          <div className={cn(skeletonBase, 'h-3 w-20')} />
        </div>
        
        {/* Food-friendly indicator */}
        <div className="flex items-center space-x-2">
          <div className={cn(skeletonBase, 'h-6 w-6 rounded-full')} />
          <div className={cn(skeletonBase, 'h-4 w-24')} />
        </div>
        
        {/* Action button */}
        <div className={cn(skeletonBase, 'h-12 w-full rounded-lg')} />
      </motion.div>
    )

    const SkeletonRecommendation = ({ index = 0 }: { index?: number }) => (
      <motion.div
        className={cn('bg-glass-primary rounded-xl overflow-hidden', shimmerClasses)}
        initial={{ opacity: 0, scale: 0.95 }}
        animate={{ opacity: 1, scale: 1 }}
        transition={{ duration: 0.4, delay: index * 0.15 }}
      >
        {/* Large thumbnail */}
        <div className={cn(skeletonBase, 'h-48 w-full rounded-none')} />
        
        <div className="p-6 space-y-4">
          {/* Title and score */}
          <div className="flex items-start justify-between">
            <div className="space-y-2 flex-1">
              <div className={cn(skeletonBase, 'h-5 w-4/5')} />
              <div className={cn(skeletonBase, 'h-4 w-3/5')} />
            </div>
            <div className={cn(skeletonBase, 'h-8 w-20 rounded-lg ml-4')} />
          </div>
          
          {/* Description */}
          <div className="space-y-2">
            <div className={cn(skeletonBase, 'h-3 w-full')} />
            <div className={cn(skeletonBase, 'h-3 w-4/5')} />
            <div className={cn(skeletonBase, 'h-3 w-3/5')} />
          </div>
          
          {/* Platform button */}
          <div className={cn(skeletonBase, 'h-12 w-full rounded-lg')} />
        </div>
      </motion.div>
    )

    const SkeletonContext = ({ index = 0 }: { index?: number }) => (
      <motion.div
        className={cn('bg-gradient-to-br from-primary-900/30 to-primary-800/20 rounded-2xl p-8 text-center space-y-4', shimmerClasses)}
        initial={{ opacity: 0, y: 30 }}
        animate={{ opacity: 1, y: 0 }}
        transition={{ duration: 0.5, delay: index * 0.2 }}
      >
        {/* Icon */}
        <div className={cn(skeletonBase, 'h-12 w-12 rounded-full mx-auto')} />
        
        {/* Title */}
        <div className={cn(skeletonBase, 'h-5 w-24 mx-auto')} />
        
        {/* Subtitle */}
        <div className={cn(skeletonBase, 'h-4 w-16 mx-auto')} />
      </motion.div>
    )

    const SkeletonList = ({ index = 0 }: { index?: number }) => (
      <motion.div
        className={cn('flex items-center space-x-4 p-4 bg-glass-subtle rounded-lg', shimmerClasses)}
        initial={{ opacity: 0, x: -20 }}
        animate={{ opacity: 1, x: 0 }}
        transition={{ duration: 0.3, delay: index * 0.05 }}
      >
        <div className={cn(skeletonBase, 'h-12 w-12 rounded-lg flex-shrink-0')} />
        <div className="flex-1 space-y-2">
          <div className={cn(skeletonBase, 'h-4 w-3/4')} />
          <div className={cn(skeletonBase, 'h-3 w-1/2')} />
        </div>
        <div className={cn(skeletonBase, 'h-6 w-16 rounded-full')} />
      </motion.div>
    )

    // Spinner component
    const Spinner = () => {
      const sizes = {
        sm: 'w-4 h-4',
        md: 'w-6 h-6', 
        lg: 'w-8 h-8'
      }

      return (
        <motion.div
          className={cn(
            'border-2 border-primary-500/30 border-t-primary-500 rounded-full',
            sizes[size]
          )}
          animate={{ rotate: 360 }}
          transition={{ duration: 1, repeat: Infinity, ease: "linear" }}
        />
      )
    }

    // Progressive loading dots
    const ProgressiveDots = () => (
      <div className="flex space-x-1">
        {[0, 1, 2].map((i) => (
          <motion.div
            key={i}
            className="w-2 h-2 bg-primary-500 rounded-full"
            animate={{
              scale: [1, 1.2, 1],
              opacity: [0.5, 1, 0.5]
            }}
            transition={{
              duration: 1,
              repeat: Infinity,
              delay: i * 0.2,
              ease: "easeInOut"
            }}
          />
        ))}
      </div>
    )

    // Shimmer wave effect
    const ShimmerWave = () => (
      <motion.div
        className="relative overflow-hidden bg-neutral-800 rounded-lg h-32"
        initial={{ opacity: 0 }}
        animate={{ opacity: 1 }}
      >
        <motion.div
          className="absolute inset-0 bg-gradient-to-r from-transparent via-white/10 to-transparent"
          animate={{ x: ['-100%', '100%'] }}
          transition={{ duration: 1.5, repeat: Infinity, ease: "linear" }}
        />
      </motion.div>
    )

    // Render based on type
    if (type === 'spinner') {
      return (
        <div ref={ref} className={cn('flex items-center justify-center p-8', className)} {...props}>
          <Spinner />
        </div>
      )
    }

    if (type === 'progressive') {
      return (
        <div ref={ref} className={cn('flex items-center justify-center p-8', className)} {...props}>
          <ProgressiveDots />
        </div>
      )
    }

    if (type === 'shimmer') {
      return (
        <div ref={ref} className={cn('space-y-4', className)} {...props}>
          {Array.from({ length: count }).map((_, i) => (
            <ShimmerWave key={i} />
          ))}
        </div>
      )
    }

    // Skeleton type (default)
    const skeletonComponents = {
      card: SkeletonCard,
      recommendation: SkeletonRecommendation,
      context: SkeletonContext,
      list: SkeletonList,
      image: () => <div className={cn(skeletonBase, 'h-32 w-full', shimmerClasses)} />,
      text: () => (
        <div className={cn('space-y-2', shimmerClasses)}>
          <div className={cn(skeletonBase, 'h-4 w-full')} />
          <div className={cn(skeletonBase, 'h-4 w-4/5')} />
          <div className={cn(skeletonBase, 'h-4 w-3/5')} />
        </div>
      )
    }

    const SkeletonComponent = skeletonComponents[content] || skeletonComponents.card

    return (
      <div ref={ref} className={cn('space-y-4', className)} {...props}>
        {Array.from({ length: count }).map((_, i) => (
          <SkeletonComponent key={i} index={i} />
        ))}
      </div>
    )
  }
)

LoadingState.displayName = 'LoadingState'

export default LoadingState