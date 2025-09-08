'use client'

import { motion } from 'framer-motion'
import { Button, Card, FoodFriendlyIndicator } from '@/components/ui'
import Link from 'next/link'

export default function Home() {
  return (
    <main className="min-h-screen bg-gradient-to-br from-primary-950 via-neutral-900 to-primary-950">
      {/* Hero Section */}
      <div className="container mx-auto px-4 py-16">
        <motion.div 
          className="text-center mb-16"
          initial={{ opacity: 0, y: 30 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ duration: 0.8 }}
        >
          <motion.h1 
            className="text-5xl md:text-7xl font-bold bg-gradient-to-r from-accent-400 via-accent-500 to-accent-600 bg-clip-text text-transparent mb-6"
            initial={{ scale: 0.9 }}
            animate={{ scale: 1 }}
            transition={{ duration: 0.5, delay: 0.2 }}
          >
            MealStream
          </motion.h1>
          <motion.p 
            className="text-xl md:text-2xl text-neutral-300 mb-8 max-w-2xl mx-auto"
            initial={{ opacity: 0 }}
            animate={{ opacity: 1 }}
            transition={{ delay: 0.4 }}
          >
            Find something perfect for your meal in under 30 seconds
          </motion.p>
          
          <motion.div 
            className="flex flex-col sm:flex-row gap-4 justify-center items-center"
            initial={{ opacity: 0, y: 20 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ delay: 0.6 }}
          >
            <Button variant="primary" size="lg">
              Get Started
            </Button>
            <Link href="/components-demo">
              <Button variant="secondary" size="lg">
                View Components
              </Button>
            </Link>
          </motion.div>
        </motion.div>

        {/* Feature Cards */}
        <motion.div 
          className="grid grid-cols-1 md:grid-cols-3 gap-8 mb-16"
          initial={{ opacity: 0, y: 40 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ delay: 0.8, duration: 0.6 }}
        >
          <Card variant="glass" className="p-8 text-center">
            <div className="w-16 h-16 bg-gradient-to-r from-primary-500 to-primary-600 rounded-2xl flex items-center justify-center mx-auto mb-4">
              <svg className="w-8 h-8 text-white" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M12 8v4l3 3m6-3a9 9 0 11-18 0 9 9 0 0118 0z" />
              </svg>
            </div>
            <h3 className="text-xl font-semibold text-neutral-100 mb-2">Lightning Fast</h3>
            <p className="text-neutral-400">Make decisions in under 30 seconds while your food stays hot</p>
          </Card>

          <Card variant="glass" className="p-8 text-center">
            <div className="w-16 h-16 bg-gradient-to-r from-success-500 to-success-600 rounded-2xl flex items-center justify-center mx-auto mb-4">
              <svg className="w-8 h-8 text-white" fill="currentColor" viewBox="0 0 24 24">
                <path d="M20.354 15.354A9 9 0 018.646 3.646 9.003 9.003 0 0012 21a9.003 9.003 0 008.354-5.646z" />
              </svg>
            </div>
            <h3 className="text-xl font-semibold text-neutral-100 mb-2">Food-Friendly</h3>
            <p className="text-neutral-400">Content classified for easy eating - no complex plots or heavy subtitles</p>
          </Card>

          <Card variant="glass" className="p-8 text-center">
            <div className="w-16 h-16 bg-gradient-to-r from-accent-500 to-accent-600 rounded-2xl flex items-center justify-center mx-auto mb-4">
              <svg className="w-8 h-8 text-white" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M9.75 17L9 20l-1 1h8l-1-1-.75-3M3 13h18M5 17h14a2 2 0 002-2V5a2 2 0 00-2-2H5a2 2 0 00-2 2v10a2 2 0 002 2z" />
              </svg>
            </div>
            <h3 className="text-xl font-semibold text-neutral-100 mb-2">All Platforms</h3>
            <p className="text-neutral-400">Works with Netflix, Disney+, Prime Video, and more streaming services</p>
          </Card>
        </motion.div>

        {/* Demo Section */}
        <motion.div 
          className="text-center"
          initial={{ opacity: 0 }}
          animate={{ opacity: 1 }}
          transition={{ delay: 1.2 }}
        >
          <Card variant="recommendation" className="max-w-md mx-auto p-6">
            <div className="space-y-4">
              <div className="h-32 bg-gradient-to-r from-red-600 to-red-700 rounded-lg flex items-center justify-center">
                <span className="text-white font-bold text-2xl">NETFLIX</span>
              </div>
              <div className="flex items-center justify-between">
                <div className="text-left">
                  <h3 className="text-lg font-semibold text-neutral-100">The Office</h3>
                  <p className="text-sm text-neutral-400">Comedy • 22 min episodes</p>
                </div>
                <FoodFriendlyIndicator score={9} style="detailed" animation="glow" />
              </div>
              <Button variant="accent" className="w-full">
                Watch on Netflix
              </Button>
            </div>
          </Card>
          <p className="text-neutral-400 mt-4">Perfect for eating - light comedy with no complex plot!</p>
        </motion.div>
      </div>
    </main>
  )
}
