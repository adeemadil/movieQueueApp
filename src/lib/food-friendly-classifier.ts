// Food-Friendly Content Classification Engine
// Optimized for eating context decision making

export interface FoodFriendlyMetrics {
  subtitleDensity: number // 0-1: subtitle frequency
  plotComplexity: number // 0-1: narrative complexity
  visualIntensity: number // 0-1: action/visual chaos
  dialoguePace: number // 0-1: conversation speed
  eatingScenes: boolean // Contains food/eating
  overallScore: number // 1-10: final food-friendly score
  confidence: number // 0-1: classification confidence
  reasoning: string[] // Human-readable explanations
}

export class FoodFriendlyClassifier {
  // Genre-based baseline scoring (eating-optimized)
  private genreScores = new Map([
    // High food-friendly (7-10)
    ['documentary', 8.5], // Usually narrated, steady pace
    ['cooking', 9.0], // Perfect for eating context
    ['nature', 8.8], // Calm, beautiful visuals
    ['comedy', 7.5], // Light, entertaining
    ['sitcom', 8.0], // Familiar format, easy to follow
    
    // Medium food-friendly (5-7)
    ['drama', 6.0], // Depends on complexity
    ['romance', 6.5], // Usually dialogue-heavy
    ['animation', 7.0], // Often family-friendly
    ['reality', 6.8], // Varies by show type
    
    // Low food-friendly (1-5)
    ['thriller', 4.0], // Requires attention
    ['horror', 2.0], // Disturbing while eating
    ['action', 3.5], // Fast-paced, complex
    ['mystery', 4.5], // Plot-heavy
    ['foreign', 2.0], // Subtitle-heavy
    ['anime', 3.0], // Usually subtitled
  ])
  
  // Runtime-based adjustments for eating context
  private runtimeMultipliers = new Map([
    [15, 1.2], // Perfect snack length
    [30, 1.1], // Good meal length
    [45, 1.0], // Standard meal
    [60, 0.9], // Long meal
    [90, 0.8], // Extended viewing
    [120, 0.7], // Very long commitment
  ])
  
  async classifyContent(content: {
    title: string
    genres: string[]
    runtime?: number
    year?: number
    language?: string
    description?: string
    keywords?: string[]
  }): Promise<FoodFriendlyMetrics> {
    
    const metrics: Partial<FoodFriendlyMetrics> = {
      reasoning: []
    }
    
    // 1. Genre Analysis (40% weight)
    const genreScore = this.analyzeGenres(content.genres, metrics)
    
    // 2. Language/Subtitle Analysis (30% weight)
    const subtitlePenalty = this.analyzeSubtitles(content.language, metrics)
    
    // 3. Runtime Optimization (20% weight)
    const runtimeScore = this.analyzeRuntime(content.runtime, metrics)
    
    // 4. Content Analysis (10% weight)
    const contentScore = this.analyzeContent(content.description, content.keywords, metrics)
    
    // Calculate weighted final score
    const baseScore = (
      genreScore * 0.4 +
      (10 - subtitlePenalty) * 0.3 +
      runtimeScore * 0.2 +
      contentScore * 0.1
    )
    
    // Apply eating-context adjustments
    const finalScore = this.applyEatingContextAdjustments(baseScore, content, metrics)
    
    return {
      subtitleDensity: subtitlePenalty / 10,
      plotComplexity: this.calculatePlotComplexity(content.genres),
      visualIntensity: this.calculateVisualIntensity(content.genres),
      dialoguePace: this.calculateDialoguePace(content.genres),
      eatingScenes: this.detectEatingScenes(content.description, content.keywords),
      overallScore: Math.round(finalScore * 10) / 10,
      confidence: this.calculateConfidence(content),
      reasoning: metrics.reasoning || []
    }
  }
  
  private analyzeGenres(genres: string[], metrics: Partial<FoodFriendlyMetrics>): number {
    if (!genres.length) return 5.0 // Neutral default
    
    const scores = genres.map(genre => {
      const score = this.genreScores.get(genre.toLowerCase()) || 5.0
      if (score >= 8) {
        metrics.reasoning?.push(`${genre} is excellent for eating`)
      } else if (score <= 4) {
        metrics.reasoning?.push(`${genre} requires focused attention`)
      }
      return score
    })
    
    return scores.reduce((sum, score) => sum + score, 0) / scores.length
  }
  
  private analyzeSubtitles(language?: string, metrics: Partial<FoodFriendlyMetrics>): number {
    if (!language) return 2 // Assume some subtitles
    
    const englishLanguages = ['en', 'english', 'en-us', 'en-gb']
    const isEnglish = englishLanguages.includes(language.toLowerCase())
    
    if (!isEnglish) {
      metrics.reasoning?.push('Non-English content requires subtitle reading')
      return 8 // High subtitle penalty
    }
    
    return 1 // Minimal subtitle penalty for English
  }
  
  private analyzeRuntime(runtime?: number, metrics: Partial<FoodFriendlyMetrics>): number {
    if (!runtime) return 7.0 // Default assumption
    
    // Find closest runtime multiplier
    const runtimeKeys = Array.from(this.runtimeMultipliers.keys()).sort((a, b) => 
      Math.abs(runtime - a) - Math.abs(runtime - b)
    )
    
    const closestRuntime = runtimeKeys[0]
    const multiplier = this.runtimeMultipliers.get(closestRuntime) || 1.0
    const baseScore = 7.0
    
    if (runtime <= 30) {
      metrics.reasoning?.push('Perfect length for a quick meal')
    } else if (runtime >= 120) {
      metrics.reasoning?.push('Long runtime - better for extended viewing')
    }
    
    return baseScore * multiplier
  }
  
  private analyzeContent(description?: string, keywords?: string[], metrics: Partial<FoodFriendlyMetrics>): number {
    let score = 7.0 // Neutral default
    
    const text = `${description || ''} ${keywords?.join(' ') || ''}`.toLowerCase()
    
    // Positive indicators for eating context
    const positiveTerms = ['cooking', 'food', 'restaurant', 'chef', 'recipe', 'calm', 'relaxing', 'gentle']
    const negativeTerms = ['intense', 'violent', 'disturbing', 'complex', 'mystery', 'thriller', 'horror']
    
    positiveTerms.forEach(term => {
      if (text.includes(term)) {
        score += 0.5
        metrics.reasoning?.push(`Contains ${term} - good for eating context`)
      }
    })
    
    negativeTerms.forEach(term => {
      if (text.includes(term)) {
        score -= 0.8
        metrics.reasoning?.push(`Contains ${term} - may be distracting while eating`)
      }
    })
    
    return Math.max(1, Math.min(10, score))
  }
  
  private applyEatingContextAdjustments(
    baseScore: number, 
    content: any, 
    metrics: Partial<FoodFriendlyMetrics>
  ): number {
    let adjustedScore = baseScore
    
    // Boost score for content that's specifically good while eating
    if (content.genres?.includes('cooking') || content.genres?.includes('food')) {
      adjustedScore += 1.5
      metrics.reasoning?.push('Food-related content - perfect while eating')
    }
    
    // Penalize content that's known to be attention-demanding
    const attentionDemanding = ['thriller', 'mystery', 'horror', 'complex-drama']
    if (content.genres?.some((g: string) => attentionDemanding.includes(g))) {
      adjustedScore -= 1.0
      metrics.reasoning?.push('Requires focused attention - not ideal while eating')
    }
    
    return Math.max(1, Math.min(10, adjustedScore))
  }
  
  private calculatePlotComplexity(genres: string[]): number {
    const complexGenres = ['thriller', 'mystery', 'sci-fi', 'drama']
    const simpleGenres = ['comedy', 'documentary', 'reality', 'cooking']
    
    if (genres.some(g => complexGenres.includes(g))) return 0.8
    if (genres.some(g => simpleGenres.includes(g))) return 0.2
    return 0.5
  }
  
  private calculateVisualIntensity(genres: string[]): number {
    const intenseGenres = ['action', 'horror', 'thriller']
    const calmGenres = ['documentary', 'cooking', 'nature']
    
    if (genres.some(g => intenseGenres.includes(g))) return 0.9
    if (genres.some(g => calmGenres.includes(g))) return 0.1
    return 0.4
  }
  
  private calculateDialoguePace(genres: string[]): number {
    const fastPaced = ['comedy', 'action', 'thriller']
    const slowPaced = ['documentary', 'drama', 'nature']
    
    if (genres.some(g => fastPaced.includes(g))) return 0.8
    if (genres.some(g => slowPaced.includes(g))) return 0.3
    return 0.5
  }
  
  private detectEatingScenes(description?: string, keywords?: string[]): boolean {
    const text = `${description || ''} ${keywords?.join(' ') || ''}`.toLowerCase()
    const eatingTerms = ['food', 'eating', 'restaurant', 'cooking', 'meal', 'dinner', 'lunch']
    return eatingTerms.some(term => text.includes(term))
  }
  
  private calculateConfidence(content: any): number {
    let confidence = 0.5 // Base confidence
    
    // More data = higher confidence
    if (content.genres?.length > 0) confidence += 0.2
    if (content.description) confidence += 0.2
    if (content.runtime) confidence += 0.1
    if (content.year && content.year > 2000) confidence += 0.1 // Recent content more reliable
    
    return Math.min(1.0, confidence)
  }
}