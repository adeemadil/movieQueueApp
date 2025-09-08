/**
 * API Strategy for MealStream
 * 
 * Handles the complex reality of streaming platform API limitations
 * with intelligent fallbacks and caching strategies optimized for
 * the eating context (users need fast results, can't wait for retries)
 */

export interface ContentSource {
  id: string
  priority: number
  rateLimit: {
    requestsPerMinute: number
    requestsPerDay: number
  }
  reliability: number // 0-1 score based on historical uptime
  cost: number // requests per dollar (for optimization)
}

export interface APIFallbackChain {
  primary: ContentSource
  secondary: ContentSource[]
  emergency: ContentSource // Local cache/manual data
}

// API Configuration optimized for eating context
export const API_SOURCES: Record<string, ContentSource> = {
  streamingAvailability: {
    id: 'streaming-availability',
    priority: 1,
    rateLimit: {
      requestsPerMinute: 100, // RapidAPI free tier
      requestsPerDay: 1000,
    },
    reliability: 0.95,
    cost: 0.001, // $1 per 1000 requests
  },
  tmdb: {
    id: 'tmdb',
    priority: 2,
    rateLimit: {
      requestsPerMinute: 40, // TMDB free tier
      requestsPerDay: 1000000, // Effectively unlimited
    },
    reliability: 0.98,
    cost: 0, // Free
  },
  localCache: {
    id: 'local-cache',
    priority: 3,
    rateLimit: {
      requestsPerMinute: 10000, // Local database
      requestsPerDay: 1000000,
    },
    reliability: 0.99,
    cost: 0,
  },
}

// Eating context optimization: Aggressive caching strategy
export const CACHE_STRATEGY = {
  // Cache recommendations for 15 minutes (typical meal duration)
  recommendationTTL: 15 * 60 * 1000,
  
  // Cache content metadata for 24 hours (changes infrequently)
  contentMetadataTTL: 24 * 60 * 60 * 1000,
  
  // Cache platform availability for 6 hours (changes moderately)
  platformAvailabilityTTL: 6 * 60 * 60 * 1000,
  
  // Emergency cache: Keep 100 most popular food-friendly titles locally
  emergencyCacheSize: 100,
  
  // Prefetch strategy: Load popular content during off-peak hours
  prefetchSchedule: {
    enabled: true,
    hours: [2, 3, 4], // 2-4 AM local time
    contentTypes: ['comfort-viewing', 'background-friendly'],
  },
}

// Circuit breaker pattern for API reliability
export class APICircuitBreaker {
  private failures: Map<string, number> = new Map()
  private lastFailure: Map<string, number> = new Map()
  private readonly maxFailures = 5
  private readonly resetTimeout = 60000 // 1 minute

  isOpen(apiId: string): boolean {
    const failures = this.failures.get(apiId) || 0
    const lastFailure = this.lastFailure.get(apiId) || 0
    
    if (failures >= this.maxFailures) {
      if (Date.now() - lastFailure > this.resetTimeout) {
        this.failures.set(apiId, 0)
        return false
      }
      return true
    }
    return false
  }

  recordFailure(apiId: string): void {
    const current = this.failures.get(apiId) || 0
    this.failures.set(apiId, current + 1)
    this.lastFailure.set(apiId, Date.now())
  }

  recordSuccess(apiId: string): void {
    this.failures.set(apiId, 0)
  }
}

// Rate limiter with eating context awareness
export class EatingContextRateLimiter {
  private requests: Map<string, number[]> = new Map()

  async canMakeRequest(apiId: string, isUrgent = false): Promise<boolean> {
    const source = API_SOURCES[apiId]
    if (!source) return false

    const now = Date.now()
    const requests = this.requests.get(apiId) || []
    
    // Clean old requests (older than 1 minute)
    const recentRequests = requests.filter(time => now - time < 60000)
    
    // Eating context: Allow burst requests for urgent scenarios
    const limit = isUrgent 
      ? Math.floor(source.rateLimit.requestsPerMinute * 1.5) 
      : source.rateLimit.requestsPerMinute

    if (recentRequests.length >= limit) {
      return false
    }

    recentRequests.push(now)
    this.requests.set(apiId, recentRequests)
    return true
  }
}

// Export singleton instances
export const circuitBreaker = new APICircuitBreaker()
export const rateLimiter = new EatingContextRateLimiter()