/**
 * DemoSection Component - MealStream Home Page
 * 
 * Interactive demo showing a sample recommendation
 */

'use client'

import { motion } from 'framer-motion'
import { Card, Button, FoodFriendlyIndicator } from '@/components/ui'

export default function DemoSection() {
  return (
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
  )
}