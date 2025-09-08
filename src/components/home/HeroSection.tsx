/**
 * HeroSection Component - MealStream Home Page
 * 
 * Main hero section with animated title, subtitle, and CTA buttons
 */

'use client'

import { motion } from 'framer-motion'
import { Button } from '@/components/ui'
import Link from 'next/link'

const ANIMATION_CONFIG = {
  container: { duration: 0.8 },
  title: { duration: 0.5, delay: 0.2 },
  subtitle: { delay: 0.4 },
  buttons: { delay: 0.6 }
} as const

export default function HeroSection() {
  return (
    <motion.div 
      className="text-center mb-16"
      initial={{ opacity: 0, y: 30 }}
      animate={{ opacity: 1, y: 0 }}
      transition={{ duration: ANIMATION_CONFIG.container.duration }}
    >
      <motion.h1 
        className="text-5xl md:text-7xl font-bold bg-gradient-to-r from-accent-400 via-accent-500 to-accent-600 bg-clip-text text-transparent mb-6"
        initial={{ scale: 0.9 }}
        animate={{ scale: 1 }}
        transition={{ 
          duration: ANIMATION_CONFIG.title.duration, 
          delay: ANIMATION_CONFIG.title.delay 
        }}
      >
        MealStream
      </motion.h1>
      
      <motion.p 
        className="text-xl md:text-2xl text-neutral-300 mb-8 max-w-2xl mx-auto"
        initial={{ opacity: 0 }}
        animate={{ opacity: 1 }}
        transition={{ delay: ANIMATION_CONFIG.subtitle.delay }}
      >
        Find something perfect for your meal in under 30 seconds
      </motion.p>
      
      <motion.div 
        className="flex flex-col sm:flex-row gap-4 justify-center items-center"
        initial={{ opacity: 0, y: 20 }}
        animate={{ opacity: 1, y: 0 }}
        transition={{ delay: ANIMATION_CONFIG.buttons.delay }}
      >
        <Link href="/recommend">
          <Button variant="primary" size="lg" className="animate-pulse-slow">
            🍽️ Find My Perfect Match
          </Button>
        </Link>
        <Link href="/components-demo">
          <Button variant="secondary" size="lg">
            View Components
          </Button>
        </Link>
      </motion.div>
    </motion.div>
  )
}