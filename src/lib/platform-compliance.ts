/**
 * Platform Compliance for MealStream
 * 
 * Ensures compliance with streaming platform Terms of Service
 * while maximizing user experience within legal boundaries
 */

// Streaming platform compliance rules
export const PLATFORM_COMPLIANCE = {
  netflix: {
    // Netflix prohibits automated access to their service
    restrictions: {
      noDirectAPI: true,
      noScraping: true,
      noAutomation: true,
    },
    
    // Compliant approaches
    allowedMethods: {
      // Use third-party APIs that have Netflix partnerships
      thirdPartyAPIs: ['streaming-availability', 'justwatch'],
      
      // Manual user input for viewing history
      manualInput: true,
      
      // Deep linking to Netflix (allowed)
      deepLinking: 'https://www.netflix.com/title/{id}',
    },
    
    // Data we can legally use
    publicData: {
      // Publicly available metadata (from TMDB, etc.)
      metadata: true,
      
      // User-provided viewing history
      userHistory: true,
      
      // General availability (not real-time)
      availability: 'cached-third-party',
    },
  },

  disneyPlus: {
    restrictions: {
      noDirectAPI: true,
      noScraping: true,
      limitedAutomation: true,
    },
    
    allowedMethods: {
      thirdPartyAPIs: ['streaming-availability'],
      manualInput: true,
      deepLinking: 'https://www.disneyplus.com/movies/{slug}',
    },
  },

  amazonPrime: {
    restrictions: {
      noDirectAPI: true,
      noScraping: true,
    },
    
    allowedMethods: {
      thirdPartyAPIs: ['streaming-availability', 'tmdb'],
      affiliateLinks: true, // Amazon allows affiliate program
      deepLinking: 'https://www.amazon.com/dp/{asin}',
    },
  },
}

// Compliance monitoring and enforcement
export const COMPLIANCE_MONITORING = {
  // Rate limiting to avoid appearing automated
  respectfulLimits: {
    requestsPerSecond: 1,
    requestsPerMinute: 30,
    requestsPerHour: 1000,
  },
  
  // User agent and headers to identify as legitimate service
  headers: {
    userAgent: 'MealStream/1.0 (Food-Friendly Content Discovery)',
    referer: 'https://mealstream.app',
    acceptLanguage: 'en-US,en;q=0.9',
  },
}

// Legal data collection boundaries
export const DATA_BOUNDARIES = {
  // What we CAN collect and use
  allowed: {
    // Public metadata from legitimate APIs
    publicMetadata: [
      'title',
      'genre',
      'duration',
      'release-year',
      'rating',
      'description',
    ],
    
    // User-provided information
    userProvided: [
      'viewing-history',
      'platform-subscriptions',
      'preferences',
      'ratings',
    ],
    
    // Aggregated, anonymized usage data
    analytics: [
      'recommendation-acceptance-rates',
      'popular-content-trends',
      'usage-patterns',
    ],
  },
  
  // What we CANNOT collect or use
  prohibited: {
    // Direct platform data
    platformData: [
      'user-credentials',
      'viewing-sessions',
      'real-time-availability',
      'pricing-information',
    ],
    
    // Personal information beyond what's necessary
    personalData: [
      'location-tracking',
      'device-fingerprinting',
      'cross-platform-tracking',
    ],
  },
}

// Compliance validation functions
export function validateAPIUsage(apiCall: {
  platform: string
  endpoint: string
  frequency: number
}): { allowed: boolean; reason?: string } {
  const platform = PLATFORM_COMPLIANCE[apiCall.platform as keyof typeof PLATFORM_COMPLIANCE]
  
  if (!platform) {
    return { allowed: false, reason: 'Unknown platform' }
  }
  
  // Check if we're using allowed methods
  if (apiCall.endpoint.includes('direct-api') && platform.restrictions.noDirectAPI) {
    return { allowed: false, reason: 'Direct API access prohibited' }
  }
  
  // Check rate limits
  if (apiCall.frequency > COMPLIANCE_MONITORING.respectfulLimits.requestsPerSecond) {
    return { allowed: false, reason: 'Rate limit exceeded' }
  }
  
  return { allowed: true }
}

export function sanitizeContentData(rawData: any, platform: string) {
  const platformConfig = PLATFORM_COMPLIANCE[platform as keyof typeof PLATFORM_COMPLIANCE]
  
  if (!platformConfig) {
    throw new Error(`Unknown platform: ${platform}`)
  }
  
  // Only return data we're allowed to use
  const allowedFields = DATA_BOUNDARIES.allowed.publicMetadata
  
  return Object.keys(rawData)
    .filter(key => allowedFields.includes(key))
    .reduce((obj, key) => {
      obj[key] = rawData[key]
      return obj
    }, {} as any)
}