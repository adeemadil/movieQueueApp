/**
 * Food-Friendly Content Classification System
 * Core innovation: Understanding eating context for content recommendations
 */

export interface FoodFriendlyFactors {
  subtitleIntensity: number // 0-1: Heavy subtitles make eating difficult
  plotComplexity: number // 0-1: Complex plots require full attention
  visualIntensity: number // 0-1: Fast cuts/action scenes distract from eating
  audioClarity: number // 0-1: Clear dialogue vs background music heavy
  eatingScenes: boolean // Contains eating/food scenes (can be triggering)
  episodeLength: number // Minutes - affects meal timing
  genreFactors: GenreEatingScore
}

export interface GenreEatingScore {
  comedy: number // 8/10 - Light, doesn't require full attention
  documentary: number // 6/10 - Educational but can be complex
  action: number // 3/10 - Too intense for eating
  drama: number // 5/10 - Varies by complexity
  animation: number // 4/10 - Often subtitle-heavy
  reality: number // 9/10 - Perfect background viewing
  news: number // 7/10 - Good for quick meals
  cooking: number // 2/10 - Can make you feel bad about your meal
}

export class FoodFriendlyClassifier {
  private readonly GENRE_SCORES: GenreEatingScore = {
    comedy: 8,
    documentary: 6,
    action: 3,
    drama: 5,
    animation: 4,
    reality: 9,
    news: 7,
    cooking: 2
  }

  private readonly SUBTITLE_KEYWORDS = [
    'foreign', 'subtitled', 'anime', 'korean', 'japanese', 'spanish',
    'french', 'german', 'italian', 'mandarin', 'hindi'
  ]

  private readonly COMPLEX_PLOT_KEYWORDS = [
    'thriller', 'mystery', 'psychological', 'noir', 'complex',
    'intricate', 'mind-bending', 'confusing', 'plot-heavy'
  ]

  private readonly EATING_SCENE_KEYWORDS = [
    'cooking', 'chef', 'restaurant', 'food', 'eating', 'meal',
    'kitchen', 'recipe', 'culinary', 'baking', 'feast'
  ]

  classifyContent(content: ContentMetadata): FoodFriendlyScore {
    const factors = this.analyzeFactors(content)
    const overallScore = this.calculateOverallScore(factors)
    
    return {
      overallScore,
      subtitleIntensity: factors.subtitleIntensity,
      plotComplexity: factors.plotComplexity,
      visualIntensity: factors.visualIntensity,
      eatingScenes: factors.eatingScenes,
      reasoning: this.generateReasoning(factors, overallScore)
    }
  }

  private analyzeFactors(content: ContentMetadata): FoodFriendlyFactors {
    const description = `${content.title} ${content.description || ''}`.toLowerCase()
    const genres = content.genres || []

    return {
      subtitleIntensity: this.analyzeSubtitles(description, content.language),
      plotComplexity: this.analyzePlotComplexity(description, genres),
      visualIntensity: this.analyzeVisualIntensity(genres, content.rating),
      audioClarity: this.analyzeAudioClarity(genres),
      eatingScenes: this.hasEatingScenes(description),
      episodeLength: content.duration || 0,
      genreFactors: this.analyzeGenres(genres)
    }
  }

  private analyzeSubtitles(description: string, language?: string): number {
    // High subtitle intensity = bad for eating
    if (language && language !== 'en') return 0.9
    
    const subtitleMatches = this.SUBTITLE_KEYWORDS.filter(keyword => 
      description.includes(keyword)
    ).length
    
    return Math.min(subtitleMatches * 0.3, 1.0)
  }

  private analyzePlotComplexity(description: string, genres: string[]): number {
    let complexity = 0
    
    // Genre-based complexity
    if (genres.includes('thriller') || genres.includes('mystery')) complexity += 0.4
    if (genres.includes('sci-fi') || genres.includes('fantasy')) complexity += 0.3
    if (genres.includes('drama')) complexity += 0.2
    
    // Description-based complexity
    const complexMatches = this.COMPLEX_PLOT_KEYWORDS.filter(keyword =>
      description.includes(keyword)
    ).length
    
    complexity += complexMatches * 0.2
    
    return Math.min(complexity, 1.0)
  }

  private analyzeVisualIntensity(genres: string[], rating?: string): number {
    let intensity = 0
    
    if (genres.includes('action')) intensity += 0.5
    if (genres.includes('horror')) intensity += 0.6
    if (genres.includes('thriller')) intensity += 0.4
    if (rating === 'R' || rating === 'TV-MA') intensity += 0.3
    
    return Math.min(intensity, 1.0)
  }

  private analyzeAudioClarity(genres: string[]): number {
    // Higher score = clearer dialogue, better for eating
    if (genres.includes('comedy')) return 0.9
    if (genres.includes('documentary')) return 0.8
    if (genres.includes('news')) return 0.9
    if (genres.includes('action')) return 0.3 // Loud explosions
    if (genres.includes('musical')) return 0.4 // Music over dialogue
    
    return 0.6 // Default
  }

  private hasEatingScenes(description: string): boolean {
    return this.EATING_SCENE_KEYWORDS.some(keyword => 
      description.includes(keyword)
    )
  }

  private analyzeGenres(genres: string[]): GenreEatingScore {
    const scores = { ...this.GENRE_SCORES }
    
    // Adjust based on genre combinations
    if (genres.includes('comedy') && genres.includes('reality')) {
      scores.comedy = Math.min(scores.comedy + 1, 10)
    }
    
    return scores
  }

  private calculateOverallScore(factors: FoodFriendlyFactors): number {
    let score = 5 // Start neutral
    
    // Subtract for eating-unfriendly factors
    score -= factors.subtitleIntensity * 4 // Heavy penalty for subtitles
    score -= factors.plotComplexity * 3 // Moderate penalty for complexity
    score -= factors.visualIntensity * 2 // Light penalty for visual intensity
    score -= factors.eatingScenes ? 2 : 0 // Penalty for eating scenes
    
    // Add for eating-friendly factors
    score += factors.audioClarity * 2 // Bonus for clear audio
    
    // Genre adjustments
    const avgGenreScore = Object.values(factors.genreFactors).reduce((a, b) => a + b, 0) / 
                         Object.values(factors.genreFactors).length
    score += (avgGenreScore - 5) * 0.5 // Adjust based on genre friendliness
    
    // Duration adjustments for meal context
    if (factors.episodeLength > 0) {
      if (factors.episodeLength <= 30) score += 1 // Perfect for quick meals
      else if (factors.episodeLength <= 60) score += 0.5 // Good for regular meals
      else if (factors.episodeLength > 120) score -= 1 // Too long for most meals
    }
    
    return Math.max(1, Math.min(10, Math.round(score)))
  }

  private generateReasoning(factors: FoodFriendlyFactors, score: number): string[] {
    const reasons: string[] = []
    
    if (factors.subtitleIntensity > 0.5) {
      reasons.push('Heavy subtitles require reading while eating')
    }
    
    if (factors.plotComplexity > 0.6) {
      reasons.push('Complex plot needs full attention')
    }
    
    if (factors.visualIntensity > 0.7) {
      reasons.push('Fast-paced visuals may distract from meal')
    }
    
    if (factors.eatingScenes) {
      reasons.push('Contains eating scenes that might affect appetite')
    }
    
    if (factors.audioClarity > 0.8) {
      reasons.push('Clear dialogue, easy to follow while eating')
    }
    
    if (score >= 8) {
      reasons.push('Perfect background viewing for meals')
    } else if (score >= 6) {
      reasons.push('Good for casual meal viewing')
    } else if (score <= 4) {
      reasons.push('Better watched when not eating')
    }
    
    return reasons
  }
}

// Content metadata interface
export interface ContentMetadata {
  title: string
  description?: string
  genres: string[]
  language?: string
  duration?: number // minutes
  rating?: string
  year?: number
  type: 'movie' | 'series' | 'episode'
}

export interface FoodFriendlyScore {
  overallScore: number // 1-10 scale
  subtitleIntensity: number
  plotComplexity: number
  visualIntensity: number
  eatingScenes: boolean
  reasoning: string[]
}