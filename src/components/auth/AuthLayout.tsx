/**
 * Authentication Layout Component
 * 
 * Premium authentication experience with sophisticated animations,
 * glassmorphism effects, and eating-context optimized design
 */

'use client'

import { ReactNode, useEffect, useState } from 'react'
import { motion, AnimatePresence } from 'framer-motion'

interface AuthLayoutProps {
  children: ReactNode
  title: string
  subtitle?: string
}

export default function AuthLayout({ children, title, subtitle }: AuthLayoutProps) {
  const [mousePosition, setMousePosition] = useState({ x: 0, y: 0 })
  const [isLoaded, setIsLoaded] = useState(false)

  useEffect(() => {
    setIsLoaded(true)
    
    const handleMouseMove = (e: MouseEvent) => {
      setMousePosition({ x: e.clientX, y: e.clientY })
    }

    window.addEventListener('mousemove', handleMouseMove)
    return () => window.removeEventListener('mousemove', handleMouseMove)
  }, [])

  return (
    <div className="min-h-screen relative overflow-hidden">
      {/* Dynamic gradient background */}
      <div 
        className="absolute inset-0 bg-gradient-radial from-primary-900 via-primary-950 to-semantic-background"
        style={{
          background: `
            radial-gradient(circle at ${mousePosition.x}px ${mousePosition.y}px, rgba(99, 102, 241, 0.15) 0%, transparent 50%),
            radial-gradient(circle at 20% 80%, rgba(255, 140, 66, 0.1) 0%, transparent 50%),
            radial-gradient(circle at 80% 20%, rgba(16, 185, 129, 0.1) 0%, transparent 50%),
            linear-gradient(135deg, #020617 0%, #0A0E27 50%, #312E81 100%)
          `
        }}
      />

      {/* Animated background elements */}
      <div className="absolute inset-0 overflow-hidden">
        {/* Floating orbs */}
        <motion.div
          animate={{
            x: [0, 100, 0],
            y: [0, -100, 0],
            scale: [1, 1.2, 1],
          }}
          transition={{
            duration: 20,
            repeat: Infinity,
            ease: "easeInOut"
          }}
          className="absolute top-1/4 left-1/4 w-96 h-96 bg-accent-500/5 rounded-full blur-3xl"
        />
        
        <motion.div
          animate={{
            x: [0, -150, 0],
            y: [0, 100, 0],
            scale: [1, 0.8, 1],
          }}
          transition={{
            duration: 25,
            repeat: Infinity,
            ease: "easeInOut",
            delay: 5
          }}
          className="absolute bottom-1/4 right-1/4 w-80 h-80 bg-primary-500/8 rounded-full blur-3xl"
        />

        <motion.div
          animate={{
            x: [0, 80, 0],
            y: [0, -80, 0],
            rotate: [0, 180, 360],
          }}
          transition={{
            duration: 30,
            repeat: Infinity,
            ease: "linear"
          }}
          className="absolute top-1/2 right-1/3 w-64 h-64 bg-success-500/6 rounded-full blur-2xl"
        />

        {/* Subtle grid pattern */}
        <div 
          className="absolute inset-0 opacity-[0.02]"
          style={{
            backgroundImage: `
              linear-gradient(rgba(255,255,255,0.1) 1px, transparent 1px),
              linear-gradient(90deg, rgba(255,255,255,0.1) 1px, transparent 1px)
            `,
            backgroundSize: '50px 50px'
          }}
        />
      </div>

      {/* Main content */}
      <div className="relative z-10 min-h-screen flex items-center justify-center p-4">
        <AnimatePresence>
          {isLoaded && (
            <motion.div
              initial={{ opacity: 0, y: 40, scale: 0.9 }}
              animate={{ opacity: 1, y: 0, scale: 1 }}
              exit={{ opacity: 0, y: -40, scale: 0.9 }}
              transition={{ 
                duration: 0.8, 
                ease: [0.25, 0.46, 0.45, 0.94],
                type: "spring",
                stiffness: 100
              }}
              className="w-full max-w-md"
            >
              {/* Logo and branding */}
              <div className="text-center mb-10">
                <motion.div
                  initial={{ scale: 0.5, opacity: 0, rotateY: -180 }}
                  animate={{ scale: 1, opacity: 1, rotateY: 0 }}
                  transition={{ 
                    duration: 1, 
                    delay: 0.3,
                    ease: [0.25, 0.46, 0.45, 0.94]
                  }}
                  className="mb-8"
                >
                  {/* Enhanced logo with glow effect */}
                  <div className="relative">
                    <motion.h1 
                      className="text-5xl font-bold bg-gradient-to-r from-accent-400 via-accent-500 to-accent-600 bg-clip-text text-transparent relative z-10"
                      animate={{
                        backgroundPosition: ['0% 50%', '100% 50%', '0% 50%'],
                      }}
                      transition={{
                        duration: 3,
                        repeat: Infinity,
                        ease: "easeInOut"
                      }}
                      style={{
                        backgroundSize: '200% 200%'
                      }}
                    >
                      MealStream
                    </motion.h1>
                    
                    {/* Glow effect behind logo */}
                    <div className="absolute inset-0 text-5xl font-bold text-accent-500/20 blur-xl">
                      MealStream
                    </div>
                  </div>
                  
                  <motion.div
                    initial={{ opacity: 0, y: 10 }}
                    animate={{ opacity: 1, y: 0 }}
                    transition={{ delay: 0.6, duration: 0.6 }}
                    className="flex items-center justify-center gap-2 mt-3"
                  >
                    <motion.div
                      animate={{ rotate: 360 }}
                      transition={{ duration: 20, repeat: Infinity, ease: "linear" }}
                      className="w-1 h-1 bg-accent-400 rounded-full"
                    />
                    <p className="text-neutral-300 text-sm font-medium">
                      Find something perfect for your meal
                    </p>
                    <motion.div
                      animate={{ rotate: -360 }}
                      transition={{ duration: 15, repeat: Infinity, ease: "linear" }}
                      className="w-1 h-1 bg-accent-400 rounded-full"
                    />
                  </motion.div>
                </motion.div>

                <motion.div
                  initial={{ opacity: 0, y: 20 }}
                  animate={{ opacity: 1, y: 0 }}
                  transition={{ duration: 0.6, delay: 0.8 }}
                >
                  <h2 className="text-3xl font-semibold text-neutral-100 mb-3">
                    {title}
                  </h2>
                  {subtitle && (
                    <motion.p 
                      className="text-neutral-400 text-lg leading-relaxed"
                      initial={{ opacity: 0 }}
                      animate={{ opacity: 1 }}
                      transition={{ delay: 1, duration: 0.6 }}
                    >
                      {subtitle}
                    </motion.p>
                  )}
                </motion.div>
              </div>

              {/* Enhanced auth form container */}
              <motion.div
                initial={{ opacity: 0, y: 20, rotateX: -15 }}
                animate={{ opacity: 1, y: 0, rotateX: 0 }}
                transition={{ duration: 0.8, delay: 1.2 }}
                className="relative group"
              >
                {/* Animated border gradient */}
                <div className="absolute -inset-0.5 bg-gradient-to-r from-accent-500 via-primary-500 to-success-500 rounded-3xl blur opacity-20 group-hover:opacity-30 transition duration-1000 group-hover:duration-200 animate-pulse" />
                
                {/* Main form container */}
                <div className="relative bg-glass-primary backdrop-blur-xl border border-white/20 rounded-3xl p-10 shadow-glass">
                  {/* Inner glow effect */}
                  <div className="absolute inset-0 bg-gradient-to-br from-white/5 via-transparent to-transparent rounded-3xl" />
                  
                  <div className="relative z-10">
                    {children}
                  </div>
                </div>
              </motion.div>

              {/* Enhanced footer */}
              <motion.div
                initial={{ opacity: 0, y: 20 }}
                animate={{ opacity: 1, y: 0 }}
                transition={{ duration: 0.6, delay: 1.6 }}
                className="text-center mt-8"
              >
                <div className="flex items-center justify-center gap-3 mb-4">
                  <motion.div
                    animate={{ scale: [1, 1.2, 1] }}
                    transition={{ duration: 2, repeat: Infinity }}
                    className="text-2xl"
                  >
                    🍽️
                  </motion.div>
                  <p className="text-neutral-500 text-sm font-medium">
                    Made for food lovers who value their time
                  </p>
                  <motion.div
                    animate={{ scale: [1, 1.2, 1] }}
                    transition={{ duration: 2, repeat: Infinity, delay: 1 }}
                    className="text-2xl"
                  >
                    ⚡
                  </motion.div>
                </div>
                
                {/* Subtle stats */}
                <motion.div
                  initial={{ opacity: 0 }}
                  animate={{ opacity: 1 }}
                  transition={{ delay: 2, duration: 1 }}
                  className="text-xs text-neutral-600 space-x-4"
                >
                  <span>⏱️ 30-second decisions</span>
                  <span>•</span>
                  <span>🎯 Food-friendly content</span>
                  <span>•</span>
                  <span>📱 Mobile-optimized</span>
                </motion.div>
              </motion.div>
            </motion.div>
          )}
        </AnimatePresence>
      </div>
    </div>
  )
}