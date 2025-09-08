/**
 * Recommendations API - Simulates real streaming API integration
 * Returns food-friendly content recommendations based on context
 */

import { NextRequest, NextResponse } from 'next/server'
import { FoodFriendlyClassifier } from '@/lib/food-friendly-classifier'

interface ViewingContext {
  mealType: 'breakfast' | 'lunch' | 'dinner' | 'snack'
  duration: number
  platforms: string[]
  mood: 'comfort' | 'discovery' | 'background' | 'focus'
  eatingStyle: 'quick' | 'leisurely' | 'multitasking'
}

// Mock content database - in production this would come from streaming APIs
const MOCK_CONTENT = [
  {
    contentId: 'office-us',
    title: 'The Office (US)',
    type: 'series' as const,
    platform: 'netflix',
    duration: 22,
    genres: ['comedy', 'mockumentary'],
    description: 'A mockumentary on a group of typical office workers, where the workday consists of ego clashes, inappropriate behavior, and tedium.',
    language: 'en',
    year: 2005,
    rating: 'TV-14'
  },
  {
    contentId: 'friends',
    title: 'Friends',
    type: 'series' as const,
    platform: 'hbo',
    duration: 22,
    genres: ['comedy', 'romance'],
    description: 'Follows the personal and professional lives of six twenty to thirty-something-year-old friends living in Manhattan.',
    language: 'en',
    year: 1994,
    rating: 'TV-14'
  },
  {
    contentId: 'planet-earth',
    title: 'Planet Earth',
    type: 'series' as const,
    platform: 'netflix',
    duration: 50,
    genres: ['documentary', 'nature'],
    description: 'A nature documentary series featuring the breadth of the diversity of habitats around the world.',
    language: 'en',
    year: 2006,
    rating: 'TV-G'
  },
  {
    contentId: 'brooklyn-99',
    title: 'Brooklyn Nine-Nine',
    type: 'series' as const,
    platform: 'hulu',
    duration: 22,
    genres: ['comedy', 'crime'],
    description: 'Comedy series following the exploits of Det. Jake Peralta and his diverse, lovable colleagues.',
    language: 'en',
    year: 2013,
    rating: 'TV-14'
  },
  {
    contentId: 'great-british-baking',
    title: 'The Great British Baking Show',
    type: 'series' as const,
    platform: 'netflix',
    duration: 60,
    genres: ['reality', 'competition'],
    description: 'Amateur bakers compete in challenges to impress judges and avoid elimination.',
    language: 'en',
    year: 2010,
    rating: 'TV-PG'
  },
  {
    contentId: 'parks-rec',
    title: 'Parks and Recreation',
    type: 'series' as const,
    platform: 'amazon',
    duration: 22,
    genres: ['comedy', 'mockumentary'],
    description: 'A mockumentary comedy series about the Parks Department in the fictional town of Pawnee, Indiana.',
    language: 'en',
    year: 2009,
    rating: 'TV-14'
  },
  {
    contentId: 'ted-lasso',
    title: 'Ted Lasso',
    type: 'series' as const,
    platform: 'apple',
    duration: 30,
    genres: ['comedy', 'drama', 'sports'],
    description: 'An American football coach is hired to coach a British soccer team, despite having no experience in the sport.',
    language: 'en',
    year: 2020,
    rating: 'TV-MA'
  },
  {
    contentId: 'schitts-creek',
    title: "Schitt's Creek",
    type: 'series' as const,
    platform: 'netflix',
    duration: 22,
    genres: ['comedy'],
    description: 'When a wealthy family suddenly loses their fortune, they are forced to leave their pampered life and start over.',
    language: 'en',
    year: 2015,
    rating: 'TV-14'
  }
]

export async function POST(request: NextRequest) {
  try {
    const context: ViewingContext = await request.json()
    
    // Simulate API delay
    await new Promise(resolve => setTimeout(resolve, 1500))
    
    const classifier = new FoodFriendlyClassifier()
    
    // Filter content by platform availability
    let availableContent = MOCK_CONTENT
    if (context.platforms.length > 0) {
      availableContent = MOCK_CONTENT.filter(content => 
        context.platforms.includes(content.platform)
      )
    }
    
    // Score and rank content
    const scoredContent = availableContent.map(content => {
      const foodFriendlyScore = classifier.classifyContent(content)
      
      // Calculate match score based on context
      let matchScore = 5 // Base score
      
      // Duration matching
      if (content.duration <= context.duration) {
        matchScore += 2
      } else if (content.duration <= context.duration + 10) {
        matchScore += 1
      } else {
        matchScore -= 1
      }
      
      // Mood matching
      if (context.mood === 'comfort' && content.genres.includes('comedy')) {
        matchScore += 2
      }
      if (context.mood === 'discovery' && content.year && content.year > 2015) {
        matchScore += 1
      }
      if (context.mood === 'background' && content.genres.includes('reality')) {
        matchScore += 2
      }
      
      // Meal type matching
      if (context.mealType === 'breakfast' && content.duration <= 30) {
        matchScore += 1
      }
      if (context.mealType === 'dinner' && content.duration >= 45) {
        matchScore += 1
      }
      
      // Eating style matching
      if (context.eatingStyle === 'quick' && content.duration <= 25) {
        matchScore += 2
      }
      if (context.eatingStyle === 'multitasking' && foodFriendlyScore.overallScore >= 7) {
        matchScore += 1
      }
      
      return {
        contentId: content.contentId,
        title: content.title,
        type: content.type,
        platform: content.platform,
        foodFriendlyScore: foodFriendlyScore.overallScore,
        matchScore: Math.min(10, Math.max(1, matchScore)),
        duration: content.duration,
        thumbnailUrl: '#', // Would be real URLs in production
        directLink: generatePlatformLink(content.platform, content.title),
        reasoning: foodFriendlyScore.reasoning,
        genres: content.genres,
        year: content.year
      }
    })
    
    // Sort by combined score (food-friendly + match score)
    const recommendations = scoredContent
      .sort((a, b) => {
        const scoreA = (a.foodFriendlyScore * 0.6) + (a.matchScore * 0.4)
        const scoreB = (b.foodFriendlyScore * 0.6) + (b.matchScore * 0.4)
        return scoreB - scoreA
      })
      .slice(0, 3) // Return top 3 recommendations
    
    return NextResponse.json({ recommendations })
    
  } catch (error) {
    console.error('Recommendations API error:', error)
    return NextResponse.json(
      { error: 'Failed to generate recommendations' },
      { status: 500 }
    )
  }
}

function generatePlatformLink(platform: string, title: string): string {
  const encodedTitle = encodeURIComponent(title)
  
  switch (platform) {
    case 'netflix':
      return `https://www.netflix.com/search?q=${encodedTitle}`
    case 'disney':
      return `https://www.disneyplus.com/search?q=${encodedTitle}`
    case 'amazon':
      return `https://www.amazon.com/s?k=${encodedTitle}&i=instant-video`
    case 'hulu':
      return `https://www.hulu.com/search?q=${encodedTitle}`
    case 'hbo':
      return `https://www.hbomax.com/search?q=${encodedTitle}`
    case 'apple':
      return `https://tv.apple.com/search?term=${encodedTitle}`
    default:
      return '#'
  }
}