// Multi-tier API strategy for streaming content discovery
// Designed for resilience against API failures and rate limits

export interface ContentSource {
  name: string
  priority: number
  rateLimit: { requests: number; window: number }
  fallbackDelay: number
}

export const API_STRATEGY = {
  // Primary: Streaming Availability API (most comprehensive)
  primary: {
    name: 'streaming-availability',
    baseUrl: process.env.STREAMING_API_URL,
    rateLimit: { requests: 100, window: 3600000 }, // 100/hour
    timeout: 2000, // 2s max for eating context
    retryConfig: {
      attempts: 2,
      backoffMs: [500, 1500], // Quick retries for eating context
      retryOn: [429, 502, 503, 504],
    },
  },
  
  // Secondary: TMDB (rich metadata, more reliable)
  secondary: {
    name: 'tmdb',
    baseUrl: 'https://api.themoviedb.org/3',
    rateLimit: { requests: 40, window: 10000 }, // 40/10s
    timeout: 1500,
  },
  
  // Tertiary: Cached content database (always available)
  cache: {
    name: 'local-cache',
    ttl: 86400000, // 24 hours
    maxEntries: 10000,
  },
  
  // Emergency: Curated list (when all else fails)
  emergency: {
    name: 'emergency-picks',
    content: 'src/data/emergency-content.json',
    // Pre-classified food-friendly content by platform
    byPlatform: {
      netflix: ['the-office', 'friends', 'brooklyn-99'],
      disney: ['pixar-shorts', 'nature-documentaries'],
      prime: ['the-grand-tour', 'cooking-shows'],
      hulu: ['comedy-specials', 'light-dramas'],
    },
  },
  
  // Intelligent caching for eating patterns
  smartCache: {
    mealTimePreload: true, // Preload during typical meal hours
    contextAware: true, // Cache based on user's eating patterns
    platformPriority: ['netflix', 'disney', 'prime', 'hulu'], // Most common first
  }
} as const

// Enhanced circuit breaker for streaming platform constraints
export class StreamingAPICircuitBreaker {
  private failures = new Map<string, number>()
  private lastFailure = new Map<string, number>()
  private rateLimitResets = new Map<string, number>()
  
  async execute<T>(
    apiName: string, 
    operation: () => Promise<T>,
    fallback: () => Promise<T>,
    options: {
      maxFailures?: number
      resetTimeMs?: number
      respectRateLimit?: boolean
    } = {}
  ): Promise<T> {
    const { maxFailures = 3, resetTimeMs = 60000, respectRateLimit = true } = options
    const failureCount = this.failures.get(apiName) || 0
    const lastFail = this.lastFailure.get(apiName) || 0
    const rateLimitReset = this.rateLimitResets.get(apiName) || 0
    
    // Circuit open: too many recent failures
    if (failureCount >= maxFailures && Date.now() - lastFail < resetTimeMs) {
      console.warn(`Circuit breaker OPEN for ${apiName}, using fallback`)
      return fallback()
    }
    
    // Rate limit protection: wait if we're still in rate limit window
    if (respectRateLimit && Date.now() < rateLimitReset) {
      console.warn(`Rate limit active for ${apiName}, using fallback`)
      return fallback()
    }
    
    try {
      const result = await operation()
      this.failures.set(apiName, 0) // Reset on success
      return result
    } catch (error: any) {
      this.failures.set(apiName, failureCount + 1)
      this.lastFailure.set(apiName, Date.now())
      
      // Handle rate limiting specifically
      if (error.status === 429) {
        const retryAfter = error.headers?.['retry-after'] || 3600 // Default 1 hour
        this.rateLimitResets.set(apiName, Date.now() + (retryAfter * 1000))
        console.warn(`Rate limited on ${apiName}, backing off for ${retryAfter}s`)
      }
      
      return fallback()
    }
  }
  
  // Get circuit status for monitoring
  getStatus(apiName: string) {
    const failures = this.failures.get(apiName) || 0
    const lastFail = this.lastFailure.get(apiName) || 0
    const rateLimitReset = this.rateLimitResets.get(apiName) || 0
    
    return {
      failures,
      isOpen: failures >= 3 && Date.now() - lastFail < 60000,
      isRateLimited: Date.now() < rateLimitReset,
      nextRetryAt: Math.max(lastFail + 60000, rateLimitReset),
    }
  }
}