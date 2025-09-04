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
  }
} as const

// Circuit breaker pattern for API resilience
export class APICircuitBreaker {
  private failures = new Map<string, number>()
  private lastFailure = new Map<string, number>()
  
  async execute<T>(
    apiName: string, 
    operation: () => Promise<T>,
    fallback: () => Promise<T>
  ): Promise<T> {
    const failureCount = this.failures.get(apiName) || 0
    const lastFail = this.lastFailure.get(apiName) || 0
    
    // Circuit open: too many recent failures
    if (failureCount >= 3 && Date.now() - lastFail < 60000) {
      return fallback()
    }
    
    try {
      const result = await operation()
      this.failures.set(apiName, 0) // Reset on success
      return result
    } catch (error) {
      this.failures.set(apiName, failureCount + 1)
      this.lastFailure.set(apiName, Date.now())
      return fallback()
    }
  }
}