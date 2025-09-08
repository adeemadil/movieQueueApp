/**
 * MealContextSelector - Quick context setup for eating scenarios
 * Optimized for speed with smart defaults and one-tap selections
 */

'use client'

import { useState } from 'react'
import { motion } from 'framer-motion'
import { Button, Card } from '@/components/ui'

interface ViewingContext {
  mealType: 'breakfast' | 'lunch' | 'dinner' | 'snack'
  duration: number
  platforms: string[]
  mood: 'comfort' | 'discovery' | 'background' | 'focus'
  eatingStyle: 'quick' | 'leisurely' | 'multitasking'
}

interface MealContextSelectorProps {
  onContextSelected: (context: ViewingContext) => void
}

const MEAL_PRESETS = {
  breakfast: {
    mealType: 'breakfast' as const,
    duration: 20,
    mood: 'background' as const,
    eatingStyle: 'quick' as const,
    icon: '🌅',
    title: 'Breakfast',
    subtitle: 'Quick & light',
    description: 'Short episodes, easy viewing while you start your day'
  },
  lunch: {
    mealType: 'lunch' as const,
    duration: 30,
    mood: 'comfort' as const,
    eatingStyle: 'leisurely' as const,
    icon: '🥪',
    title: 'Lunch Break',
    subtitle: 'Perfect pause',
    description: 'Comfort shows that help you unwind mid-day'
  },
  dinner: {
    mealType: 'dinner' as const,
    duration: 60,
    mood: 'discovery' as const,
    eatingStyle: 'leisurely' as const,
    icon: '🍽️',
    title: 'Dinner Time',
    subtitle: 'Main event',
    description: 'Movies or longer content for your main meal'
  },
  snack: {
    mealType: 'snack' as const,
    duration: 15,
    mood: 'background' as const,
    eatingStyle: 'multitasking' as const,
    icon: '🍿',
    title: 'Quick Snack',
    subtitle: 'Just a bite',
    description: 'Short clips or familiar content while snacking'
  }
}

const PLATFORM_OPTIONS = [
  { id: 'netflix', name: 'Netflix', color: 'bg-red-600', icon: 'N' },
  { id: 'disney', name: 'Disney+', color: 'bg-blue-600', icon: 'D+' },
  { id: 'amazon', name: 'Prime Video', color: 'bg-blue-500', icon: 'PV' },
  { id: 'hulu', name: 'Hulu', color: 'bg-green-500', icon: 'H' },
  { id: 'hbo', name: 'HBO Max', color: 'bg-purple-600', icon: 'HBO' },
  { id: 'apple', name: 'Apple TV+', color: 'bg-gray-800', icon: 'TV+' }
]

export default function MealContextSelector({ onContextSelected }: MealContextSelectorProps) {
  const [selectedMeal, setSelectedMeal] = useState<keyof typeof MEAL_PRESETS | null>(null)
  const [selectedPlatforms, setSelectedPlatforms] = useState<string[]>([])
  const [step, setStep] = useState<'meal' | 'platforms' | 'confirm'>('meal')

  const handleMealSelection = (mealKey: keyof typeof MEAL_PRESETS) => {
    setSelectedMeal(mealKey)
    setStep('platforms')
  }

  const togglePlatform = (platformId: string) => {
    setSelectedPlatforms(prev => 
      prev.includes(platformId)
        ? prev.filter(id => id !== platformId)
        : [...prev, platformId]
    )
  }

  const handleContinue = () => {
    if (!selectedMeal) return

    const preset = MEAL_PRESETS[selectedMeal]
    const context: ViewingContext = {
      ...preset,
      platforms: selectedPlatforms.length > 0 ? selectedPlatforms : ['netflix', 'disney', 'amazon']
    }

    onContextSelected(context)
  }

  const handleQuickStart = () => {
    // Smart default based on time of day
    const hour = new Date().getHours()
    let defaultMeal: keyof typeof MEAL_PRESETS = 'lunch'
    
    if (hour < 10) defaultMeal = 'breakfast'
    else if (hour < 14) defaultMeal = 'lunch'
    else if (hour < 22) defaultMeal = 'dinner'
    else defaultMeal = 'snack'

    const preset = MEAL_PRESETS[defaultMeal]
    const context: ViewingContext = {
      ...preset,
      platforms: ['netflix', 'disney', 'amazon'] // Most common platforms
    }

    onContextSelected(context)
  }

  return (
    <div className="max-w-4xl mx-auto p-6">
      {/* Header */}
      <motion.div
        initial={{ opacity: 0, y: 20 }}
        animate={{ opacity: 1, y: 0 }}
        className="text-center mb-8"
      >
        <h1 className="text-4xl font-bold text-neutral-100 mb-2">
          What's the eating situation?
        </h1>
        <p className="text-neutral-400 text-lg">
          Quick setup for the perfect meal companion
        </p>
      </motion.div>

      {/* Quick Start Button */}
      <motion.div
        initial={{ opacity: 0, y: 20 }}
        animate={{ opacity: 1, y: 0 }}
        transition={{ delay: 0.1 }}
        className="text-center mb-8"
      >
        <Button
          variant="accent"
          size="lg"
          onClick={handleQuickStart}
          className="pulse-glow"
        >
          ⚡ Quick Start - Just Give Me Something Now!
        </Button>
        <p className="text-xs text-neutral-500 mt-2">
          Smart defaults based on current time
        </p>
      </motion.div>

      {/* Step 1: Meal Type Selection */}
      {step === 'meal' && (
        <motion.div
          initial={{ opacity: 0, y: 30 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ delay: 0.2 }}
        >
          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-4">
            {Object.entries(MEAL_PRESETS).map(([key, preset], index) => (
              <motion.div
                key={key}
                initial={{ opacity: 0, y: 30 }}
                animate={{ opacity: 1, y: 0 }}
                transition={{ delay: 0.3 + index * 0.1 }}
              >
                <Card
                  variant="glass"
                  className="p-6 text-center cursor-pointer hover:scale-105 transition-all hover:bg-white/10"
                  onClick={() => handleMealSelection(key as keyof typeof MEAL_PRESETS)}
                >
                  <div className="text-4xl mb-3">{preset.icon}</div>
                  <h3 className="text-lg font-semibold text-neutral-100 mb-1">
                    {preset.title}
                  </h3>
                  <p className="text-sm text-primary-400 mb-2">
                    {preset.subtitle}
                  </p>
                  <p className="text-xs text-neutral-400 leading-relaxed">
                    {preset.description}
                  </p>
                  <div className="mt-4 text-xs text-neutral-500">
                    ~{preset.duration} minutes
                  </div>
                </Card>
              </motion.div>
            ))}
          </div>
        </motion.div>
      )}

      {/* Step 2: Platform Selection */}
      {step === 'platforms' && selectedMeal && (
        <motion.div
          initial={{ opacity: 0, x: 50 }}
          animate={{ opacity: 1, x: 0 }}
          className="space-y-6"
        >
          <div className="text-center">
            <h2 className="text-2xl font-semibold text-neutral-100 mb-2">
              Which platforms do you have?
            </h2>
            <p className="text-neutral-400">
              Select all that apply (or skip for all platforms)
            </p>
          </div>

          <div className="grid grid-cols-2 md:grid-cols-3 gap-4">
            {PLATFORM_OPTIONS.map((platform, index) => (
              <motion.div
                key={platform.id}
                initial={{ opacity: 0, y: 20 }}
                animate={{ opacity: 1, y: 0 }}
                transition={{ delay: index * 0.1 }}
              >
                <Card
                  variant="glass"
                  className={`p-4 cursor-pointer transition-all ${
                    selectedPlatforms.includes(platform.id)
                      ? 'ring-2 ring-primary-400 bg-primary-500/20'
                      : 'hover:bg-white/10'
                  }`}
                  onClick={() => togglePlatform(platform.id)}
                >
                  <div className="flex items-center space-x-3">
                    <div className={`w-10 h-10 ${platform.color} rounded-lg flex items-center justify-center text-white font-bold text-sm`}>
                      {platform.icon}
                    </div>
                    <span className="text-neutral-100 font-medium">
                      {platform.name}
                    </span>
                  </div>
                </Card>
              </motion.div>
            ))}
          </div>

          <div className="flex justify-center space-x-4">
            <Button
              variant="ghost"
              onClick={() => setStep('meal')}
            >
              ← Back
            </Button>
            <Button
              variant="primary"
              onClick={handleContinue}
              size="lg"
            >
              Find My Perfect Match →
            </Button>
          </div>
        </motion.div>
      )}

      {/* Progress Indicator */}
      <motion.div
        initial={{ opacity: 0 }}
        animate={{ opacity: 1 }}
        transition={{ delay: 0.5 }}
        className="flex justify-center mt-8"
      >
        <div className="flex space-x-2">
          <div className={`w-2 h-2 rounded-full transition-colors ${
            step === 'meal' ? 'bg-primary-400' : 'bg-neutral-600'
          }`} />
          <div className={`w-2 h-2 rounded-full transition-colors ${
            step === 'platforms' ? 'bg-primary-400' : 'bg-neutral-600'
          }`} />
        </div>
      </motion.div>

      {/* Tips */}
      <motion.div
        initial={{ opacity: 0, y: 20 }}
        animate={{ opacity: 1, y: 0 }}
        transition={{ delay: 0.6 }}
        className="mt-8 text-center"
      >
        <Card variant="glass" className="p-4 max-w-md mx-auto">
          <p className="text-sm text-neutral-400">
            💡 <strong>Pro tip:</strong> We'll prioritize content that's easy to follow while eating - 
            no complex plots or heavy subtitles!
          </p>
        </Card>
      </motion.div>
    </div>
  )
}