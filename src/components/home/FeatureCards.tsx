/**
 * FeatureCards Component - MealStream Home Page
 * 
 * Three feature cards highlighting key benefits
 */

'use client'

import { motion } from 'framer-motion'
import { Card } from '@/components/ui'

const FEATURES = [
  {
    id: 'speed',
    title: 'Lightning Fast',
    description: 'Make decisions in under 30 seconds while your food stays hot',
    gradient: 'from-primary-500 to-primary-600',
    icon: (
      <svg className="w-8 h-8 text-white" fill="none" stroke="currentColor" viewBox="0 0 24 24">
        <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M12 8v4l3 3m6-3a9 9 0 11-18 0 9 9 0 0118 0z" />
      </svg>
    )
  },
  {
    id: 'food-friendly',
    title: 'Food-Friendly',
    description: 'Content classified for easy eating - no complex plots or heavy subtitles',
    gradient: 'from-success-500 to-success-600',
    icon: (
      <svg className="w-8 h-8 text-white" fill="currentColor" viewBox="0 0 24 24">
        <path d="M20.354 15.354A9 9 0 018.646 3.646 9.003 9.003 0 0012 21a9.003 9.003 0 008.354-5.646z" />
      </svg>
    )
  },
  {
    id: 'platforms',
    title: 'All Platforms',
    description: 'Works with Netflix, Disney+, Prime Video, and more streaming services',
    gradient: 'from-accent-500 to-accent-600',
    icon: (
      <svg className="w-8 h-8 text-white" fill="none" stroke="currentColor" viewBox="0 0 24 24">
        <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M9.75 17L9 20l-1 1h8l-1-1-.75-3M3 13h18M5 17h14a2 2 0 002-2V5a2 2 0 00-2-2H5a2 2 0 00-2 2v10a2 2 0 002 2z" />
      </svg>
    )
  }
] as const

export default function FeatureCards() {
  return (
    <motion.div 
      className="grid grid-cols-1 md:grid-cols-3 gap-8 mb-16"
      initial={{ opacity: 0, y: 40 }}
      animate={{ opacity: 1, y: 0 }}
      transition={{ delay: 0.8, duration: 0.6 }}
    >
      {FEATURES.map((feature, index) => (
        <motion.div
          key={feature.id}
          initial={{ opacity: 0, y: 20 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ delay: 0.8 + (index * 0.1), duration: 0.4 }}
        >
          <Card variant="glass" className="p-8 text-center hover:transform hover:scale-105 transition-transform duration-200">
            <div className={`w-16 h-16 bg-gradient-to-r ${feature.gradient} rounded-2xl flex items-center justify-center mx-auto mb-4`}>
              {feature.icon}
            </div>
            <h3 className="text-xl font-semibold text-neutral-100 mb-2">{feature.title}</h3>
            <p className="text-neutral-400">{feature.description}</p>
          </Card>
        </motion.div>
      ))}
    </motion.div>
  )
}