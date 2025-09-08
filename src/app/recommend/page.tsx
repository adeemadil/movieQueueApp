/**
 * Recommendation Flow Page - Main MealStream Experience
 * Handles the complete flow from context selection to content recommendation
 */

'use client'

import { useState } from 'react'
import { motion, AnimatePresence } from 'framer-motion'
import MealContextSelector from '@/components/MealContextSelector'
import RecommendationEngine from '@/components/RecommendationEngine'
import { Button, Card } from '@/components/ui'

interface ViewingContext {
  mealType: 'breakfast' | 'lunch' | 'dinner' | 'snack'
  duration: number
  platforms: string[]
  mood: 'comfort' | 'discovery' | 'background' | 'focus'
  eatingStyle: 'quick' | 'leisurely' | 'multitasking'
}

interface ContentRecommendation {
  contentId: string
  title: string
  type: 'movie' | 'series' | 'episode'
  platform: string
  foodFriendlyScore: number
  matchScore: number
  duration: number
  thumbnailUrl: string
  directLink: string
  reasoning: string[]
  genres: string[]
  year?: number
}

type FlowStep = 'context' | 'recommendations' | 'selected'

export default function RecommendPage() {
  const [step, setStep] = useState<FlowStep>('context')
  const [context, setContext] = useState<ViewingContext | null>(null)
  const [selectedContent, setSelectedContent] = useState<ContentRecommendation | null>(null)

  const handleContextSelected = (newContext: ViewingContext) => {
    setContext(newContext)
    setStep('recommendations')
  }

  const handleContentSelected = (content: ContentRecommendation) => {
    setSelectedContent(content)
    setStep('selected')
  }

  const handleContextChange = (changes: Partial<ViewingContext>) => {
    if (context) {
      setContext({ ...context, ...changes })
    }
  }

  const handleStartOver = () => {
    setStep('context')
    setContext(null)
    setSelectedContent(null)
  }

  const handleWatchNow = () => {
    if (selectedContent) {
      // Track the selection for analytics
      console.log('User selected:', selectedContent)
      
      // Open the streaming platform
      window.open(selectedContent.directLink, '_blank')
    }
  }

  return (
    <div className="min-h-screen bg-gradient-to-br from-slate-900 via-gray-900 to-slate-900">
      <div className="container mx-auto py-8">
        <AnimatePresence mode="wait">
          {/* Step 1: Context Selection */}
          {step === 'context' && (
            <motion.div
              key="context"
              initial={{ opacity: 0, x: -50 }}
              animate={{ opacity: 1, x: 0 }}
              exit={{ opacity: 0, x: -50 }}
              transition={{ duration: 0.3 }}
            >
              <MealContextSelector onContextSelected={handleContextSelected} />
            </motion.div>
          )}

          {/* Step 2: Recommendations */}
          {step === 'recommendations' && context && (
            <motion.div
              key="recommendations"
              initial={{ opacity: 0, x: 50 }}
              animate={{ opacity: 1, x: 0 }}
              exit={{ opacity: 0, x: 50 }}
              transition={{ duration: 0.3 }}
            >
              <div className="mb-6 text-center">
                <Button
                  variant="ghost"
                  onClick={handleStartOver}
                  className="text-neutral-400 hover:text-neutral-200"
                >
                  ← Change meal context
                </Button>
              </div>
              
              <RecommendationEngine
                context={context}
                onSelection={handleContentSelected}
                onContextChange={handleContextChange}
              />
            </motion.div>
          )}

          {/* Step 3: Selection Confirmation */}
          {step === 'selected' && selectedContent && (
            <motion.div
              key="selected"
              initial={{ opacity: 0, scale: 0.9 }}
              animate={{ opacity: 1, scale: 1 }}
              exit={{ opacity: 0, scale: 0.9 }}
              transition={{ duration: 0.4 }}
              className="max-w-2xl mx-auto p-6"
            >
              <div className="text-center mb-8">
                <motion.div
                  initial={{ scale: 0 }}
                  animate={{ scale: 1 }}
                  transition={{ delay: 0.2, type: "spring", stiffness: 200 }}
                  className="text-6xl mb-4"
                >
                  🎉
                </motion.div>
                <h1 className="text-3xl font-bold text-neutral-100 mb-2">
                  Perfect Match Found!
                </h1>
                <p className="text-neutral-400">
                  Enjoy your meal and your show!
                </p>
              </div>

              <Card variant="recommendation" className="p-8 mb-8">
                {/* Content Preview */}
                <div className="flex flex-col md:flex-row gap-6">
                  <div className="md:w-1/3">
                    <div className="aspect-video bg-gradient-to-br from-neutral-700 to-neutral-800 rounded-lg flex items-center justify-center">
                      {selectedContent.thumbnailUrl !== '#' ? (
                        <img 
                          src={selectedContent.thumbnailUrl} 
                          alt={selectedContent.title}
                          className="w-full h-full object-cover rounded-lg"
                        />
                      ) : (
                        <span className="text-xl font-bold text-neutral-400">
                          {selectedContent.platform.toUpperCase()}
                        </span>
                      )}
                    </div>
                  </div>

                  <div className="md:w-2/3 space-y-4">
                    <div>
                      <h2 className="text-2xl font-bold text-neutral-100 mb-2">
                        {selectedContent.title}
                      </h2>
                      <p className="text-neutral-400">
                        {selectedContent.genres.join(', ')} • {selectedContent.duration} min
                      </p>
                    </div>

                    <div className="space-y-2">
                      <h3 className="text-sm font-semibold text-neutral-300">
                        Why this is perfect for eating:
                      </h3>
                      {selectedContent.reasoning.map((reason, index) => (
                        <motion.p
                          key={index}
                          initial={{ opacity: 0, x: 20 }}
                          animate={{ opacity: 1, x: 0 }}
                          transition={{ delay: 0.3 + index * 0.1 }}
                          className="text-sm text-neutral-400 flex items-center"
                        >
                          <span className="w-1.5 h-1.5 bg-primary-400 rounded-full mr-3" />
                          {reason}
                        </motion.p>
                      ))}
                    </div>

                    <div className="flex items-center justify-between pt-4">
                      <div className="flex items-center space-x-2">
                        <span className="text-sm text-neutral-400">Food-Friendly Score:</span>
                        <div className="flex items-center space-x-1">
                          {Array.from({ length: 10 }).map((_, i) => (
                            <div
                              key={i}
                              className={`w-2 h-2 rounded-full ${
                                i < selectedContent.foodFriendlyScore
                                  ? 'bg-green-400'
                                  : 'bg-neutral-600'
                              }`}
                            />
                          ))}
                          <span className="text-sm font-semibold text-green-400 ml-2">
                            {selectedContent.foodFriendlyScore}/10
                          </span>
                        </div>
                      </div>
                    </div>
                  </div>
                </div>
              </Card>

              {/* Action Buttons */}
              <div className="flex flex-col sm:flex-row gap-4 justify-center">
                <Button
                  variant="primary"
                  size="lg"
                  onClick={handleWatchNow}
                  className="pulse-glow"
                >
                  🍿 Watch on {selectedContent.platform}
                </Button>
                <Button
                  variant="secondary"
                  size="lg"
                  onClick={handleStartOver}
                >
                  🔄 Find Something Else
                </Button>
              </div>

              {/* Quick Tips */}
              <motion.div
                initial={{ opacity: 0, y: 20 }}
                animate={{ opacity: 1, y: 0 }}
                transition={{ delay: 0.6 }}
                className="mt-8"
              >
                <Card variant="glass" className="p-4">
                  <div className="text-center space-y-2">
                    <p className="text-sm text-neutral-400">
                      <strong>Pro tip:</strong> Bookmark MealStream for your next meal!
                    </p>
                    <div className="flex justify-center space-x-4 text-xs text-neutral-500">
                      <span>⌨️ Keyboard shortcuts available</span>
                      <span>📱 Mobile optimized</span>
                      <span>🔒 No data stored</span>
                    </div>
                  </div>
                </Card>
              </motion.div>
            </motion.div>
          )}
        </AnimatePresence>
      </div>
    </div>
  )
}