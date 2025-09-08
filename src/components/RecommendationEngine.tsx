/**
 * RecommendationEngine - Core component for MealStream
 * Handles the 30-second decision flow optimized for eating context
 */

'use client'

import { useState, useEffect, useCallback } from 'react'
import { motion, AnimatePresence } from 'framer-motion'
import { Button, Card, FoodFriendlyIndicator, LoadingState } from '@/components/ui'
import { FoodFriendlyClassifier } from '@/lib/food-friendly-classifier'
import { APICircuitBreaker, ContentAPIManager } from '@/lib/api-strategy'
import { PerformanceMonitor } from '@/lib/performance-config'

interface ViewingContext {
  mealType: 'breakfast' | 'lunch' | 'dinner' | 'snack'
  duration: number // minutes available
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

interface RecommendationEngineProps {
  context: ViewingContext
  onSelection: (recommendation: ContentRecommendation) => void
  onContextChange: (context: Partial<ViewingContext>) => void
}

export default function RecommendationEngine({ 
  context, 
  onSelection, 
  onContextChange 
}: RecommendationEngineProps) {
  const [recommendations, setRecommendations] = useState<ContentRecommendation[]>([])
  const [loading, setLoading] = useState(true)
  const [error, setError] = useState<string | null>(null)
  const [timeRemaining, setTimeRemaining] = useState(30)
  const [showEmergencyPick, setShowEmergencyPick] = useState(false)
  const [selectedIndex, setSelectedIndex] = useState(0)

  const classifier = new FoodFriendlyClassifier()
  const apiManager = new ContentAPIManager()
  const performanceMonitor = new PerformanceMonitor()

  // Emergency recommendations for when APIs fail or time runs out
  const EMERGENCY_PICKS: ContentRecommendation[] = [
    {
      contentId: 'emergency-office',
      title: 'The Office (US)',
      type: 'series',
      platform: 'netflix',
      foodFriendlyScore: 9,
      matchScore: 8,
      duration: 22,
      thumbnailUrl: '/emergency-thumbnails/office.jpg',
      directLink: 'https://www.netflix.com/search?q=the%20office',
      reasoning: ['Perfect background viewing', 'Light comedy', 'No complex plot'],
      genres: ['comedy', 'mockumentary'],
      year: 2005
    },
    {
      contentId: 'emergency-friends',
      title: 'Friends',
      type: 'series',
      platform: 'hbo',
      foodFriendlyScore: 9,
      matchScore: 8,
      duration: 22,
      thumbnailUrl: '/emergency-thumbnails/friends.jpg',
      directLink: 'https://www.hbomax.com/search?q=friends',
      reasoning: ['Comfort viewing', 'Easy to follow', 'Great for meals'],
      genres: ['comedy', 'sitcom'],
      year: 1994
    },
    {
      contentId: 'emergency-nature',
      title: 'Planet Earth',
      type: 'series',
      platform: 'netflix',
      foodFriendlyScore: 8,
      matchScore: 7,
      duration: 50,
      thumbnailUrl: '/emergency-thumbnails/planet-earth.jpg',
      directLink: 'https://www.netflix.com/search?q=planet%20earth',
      reasoning: ['Beautiful visuals', 'Relaxing narration', 'No plot to follow'],
      genres: ['documentary', 'nature'],
      year: 2006
    }
  ]

  // Timer countdown effect
  useEffect(() => {
    const timer = setInterval(() => {
      setTimeRemaining(prev => {
        if (prev <= 1) {
          setShowEmergencyPick(true)
          return 0
        }
        if (prev === 5) {
          // Show emergency pick at 5 seconds
          setShowEmergencyPick(true)
        }
        return prev - 1
      })
    }, 1000)

    return () => clearInterval(timer)
  }, [])

  // Load recommendations
  useEffect(() => {
    const loadRecommendations = async () => {
      const endTiming = performanceMonitor.startTiming('recommendation-load')
      
      try {
        setLoading(true)
        setError(null)

        // Call our API endpoint
        const response = await fetch('/api/recommendations', {
          method: 'POST',
          headers: {
            'Content-Type': 'application/json',
          },
          body: JSON.stringify(context)
        })

        if (!response.ok) {
          throw new Error('API request failed')
        }

        const data = await response.json()
        
        if (!data.recommendations || data.recommendations.length === 0) {
          throw new Error('No recommendations available')
        }

        setRecommendations(data.recommendations)
        endTiming()
      } catch (err) {
        console.error('Failed to load recommendations:', err)
        setError('Unable to load fresh recommendations')
        
        // Fall back to emergency picks
        const filteredEmergency = EMERGENCY_PICKS.filter(pick => 
          context.platforms.includes(pick.platform) || context.platforms.length === 0
        )
        setRecommendations(filteredEmergency.slice(0, 3))
        endTiming()
      } finally {
        setLoading(false)
      }
    }

    loadRecommendations()
  }, [context])

  // Handle emergency pick selection
  const handleEmergencyPick = useCallback(() => {
    const bestPick = recommendations[0] || EMERGENCY_PICKS[0]
    onSelection(bestPick)
  }, [recommendations, onSelection])

  // Handle keyboard navigation
  useEffect(() => {
    const handleKeyPress = (e: KeyboardEvent) => {
      switch (e.key) {
        case 'ArrowUp':
          e.preventDefault()
          setSelectedIndex(prev => Math.max(0, prev - 1))
          break
        case 'ArrowDown':
          e.preventDefault()
          setSelectedIndex(prev => Math.min(recommendations.length - 1, prev + 1))
          break
        case 'Enter':
          e.preventDefault()
          if (recommendations[selectedIndex]) {
            onSelection(recommendations[selectedIndex])
          }
          break
        case 'Escape':
          e.preventDefault()
          handleEmergencyPick()
          break
      }
    }

    window.addEventListener('keydown', handleKeyPress)
    return () => window.removeEventListener('keydown', handleKeyPress)
  }, [selectedIndex, recommendations, onSelection, handleEmergencyPick])

  if (loading) {
    return (
      <div className="max-w-4xl mx-auto p-6">
        <div className="text-center mb-8">
          <motion.div
            className="text-6xl font-bold text-primary-400 mb-2"
            animate={{ scale: [1, 1.1, 1] }}
            transition={{ duration: 2, repeat: Infinity }}
          >
            {timeRemaining}
          </motion.div>
          <p className="text-neutral-300">Finding perfect content for your meal...</p>
        </div>
        
        <LoadingState 
          type="skeleton" 
          content="recommendation" 
          count={3} 
          animated={true}
        />
      </div>
    )
  }

  return (
    <div className="max-w-4xl mx-auto p-6">
      {/* Timer and Emergency Pick */}
      <div className="text-center mb-8">
        <motion.div
          className={`text-6xl font-bold mb-2 ${
            timeRemaining <= 10 ? 'text-red-400' : 'text-primary-400'
          }`}
          animate={{ 
            scale: timeRemaining <= 10 ? [1, 1.1, 1] : 1,
            color: timeRemaining <= 5 ? ['#ef4444', '#dc2626', '#ef4444'] : undefined
          }}
          transition={{ duration: 1, repeat: timeRemaining <= 10 ? Infinity : 0 }}
        >
          {timeRemaining}
        </motion.div>
        
        <p className="text-neutral-300 mb-4">
          {timeRemaining > 10 ? 'Choose your perfect meal companion' : 'Time running out!'}
        </p>

        <AnimatePresence>
          {showEmergencyPick && (
            <motion.div
              initial={{ opacity: 0, y: 20 }}
              animate={{ opacity: 1, y: 0 }}
              exit={{ opacity: 0, y: -20 }}
            >
              <Button
                variant="accent"
                size="lg"
                onClick={handleEmergencyPick}
                className="pulse-glow"
              >
                🚨 Emergency Pick - Just Give Me Something Good!
              </Button>
            </motion.div>
          )}
        </AnimatePresence>
      </div>

      {/* Error State */}
      {error && (
        <motion.div
          initial={{ opacity: 0, y: 20 }}
          animate={{ opacity: 1, y: 0 }}
          className="bg-yellow-500/10 border border-yellow-500/30 rounded-xl p-4 mb-6"
        >
          <p className="text-yellow-400 text-center">
            {error} - Showing backup recommendations
          </p>
        </motion.div>
      )}

      {/* Recommendations Grid */}
      <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
        {recommendations.slice(0, 3).map((rec, index) => (
          <motion.div
            key={rec.contentId}
            initial={{ opacity: 0, y: 30 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ delay: index * 0.1 }}
            className={`${selectedIndex === index ? 'ring-2 ring-primary-400' : ''}`}
          >
            <Card 
              variant="recommendation" 
              className="h-full cursor-pointer hover:scale-105 transition-transform"
              onClick={() => onSelection(rec)}
            >
              {/* Thumbnail */}
              <div className="relative h-48 bg-gradient-to-br from-neutral-700 to-neutral-800 rounded-t-xl overflow-hidden">
                {rec.thumbnailUrl !== '#' ? (
                  <img 
                    src={rec.thumbnailUrl} 
                    alt={rec.title}
                    className="w-full h-full object-cover"
                  />
                ) : (
                  <div className="w-full h-full flex items-center justify-center">
                    <span className="text-2xl font-bold text-neutral-400">
                      {rec.platform.toUpperCase()}
                    </span>
                  </div>
                )}
                
                {/* Platform badge */}
                <div className="absolute top-3 left-3 bg-black/70 backdrop-blur-sm rounded-lg px-2 py-1">
                  <span className="text-xs font-medium text-white">
                    {rec.platform.toUpperCase()}
                  </span>
                </div>
              </div>

              {/* Content */}
              <div className="p-6 space-y-4">
                <div className="flex items-start justify-between">
                  <div className="flex-1">
                    <h3 className="text-lg font-semibold text-neutral-100 mb-1">
                      {rec.title}
                    </h3>
                    <p className="text-sm text-neutral-400">
                      {rec.genres.join(', ')} • {rec.duration} min
                    </p>
                  </div>
                  <FoodFriendlyIndicator 
                    score={rec.foodFriendlyScore} 
                    style="compact"
                    animation="glow"
                  />
                </div>

                {/* Reasoning */}
                <div className="space-y-1">
                  {rec.reasoning.slice(0, 2).map((reason, i) => (
                    <p key={i} className="text-xs text-neutral-400 flex items-center">
                      <span className="w-1 h-1 bg-primary-400 rounded-full mr-2" />
                      {reason}
                    </p>
                  ))}
                </div>

                {/* Action Button */}
                <Button
                  variant="primary"
                  className="w-full"
                  onClick={(e) => {
                    e.stopPropagation()
                    onSelection(rec)
                  }}
                >
                  Watch on {rec.platform}
                </Button>
              </div>
            </Card>
          </motion.div>
        ))}
      </div>

      {/* Quick Context Adjustments */}
      <motion.div
        initial={{ opacity: 0, y: 30 }}
        animate={{ opacity: 1, y: 0 }}
        transition={{ delay: 0.5 }}
        className="mt-8 text-center"
      >
        <p className="text-neutral-400 text-sm mb-4">
          Not quite right? Quick adjustments:
        </p>
        <div className="flex flex-wrap justify-center gap-2">
          <Button
            variant="ghost"
            size="sm"
            onClick={() => onContextChange({ mood: 'comfort' })}
            className={context.mood === 'comfort' ? 'bg-primary-500/20' : ''}
          >
            More Comfort
          </Button>
          <Button
            variant="ghost"
            size="sm"
            onClick={() => onContextChange({ mood: 'discovery' })}
            className={context.mood === 'discovery' ? 'bg-primary-500/20' : ''}
          >
            Something New
          </Button>
          <Button
            variant="ghost"
            size="sm"
            onClick={() => onContextChange({ eatingStyle: 'background' })}
            className={context.eatingStyle === 'background' ? 'bg-primary-500/20' : ''}
          >
            Background Only
          </Button>
        </div>
      </motion.div>

      {/* Keyboard shortcuts hint */}
      <div className="mt-6 text-center text-xs text-neutral-500">
        Use ↑↓ arrows to navigate, Enter to select, Esc for emergency pick
      </div>
    </div>
  )
}