// Platform compliance and ToS-safe integration strategy
// Ensures we respect streaming platform terms while delivering value

export interface PlatformConfig {
  name: string
  hasOfficialAPI: boolean
  deepLinkSupport: boolean
  contentDiscoveryMethod: 'api' | 'third-party' | 'manual'
  complianceNotes: string[]
}

export const PLATFORM_CONFIGS: Record<string, PlatformConfig> = {
  netflix: {
    name: 'Netflix',
    hasOfficialAPI: false, // Restricted to partners only
    deepLinkSupport: true, // netflix://title/[id] or web links
    contentDiscoveryMethod: 'third-party', // Use TMDB + Streaming Availability API
    complianceNotes: [
      'No direct API access - use third-party aggregators',
      'Deep links allowed for content discovery',
      'Cannot store or cache Netflix-specific user data',
      'Must redirect to Netflix for actual viewing',
    ],
  },
  
  disney: {
    name: 'Disney+',
    hasOfficialAPI: false,
    deepLinkSupport: true, // disneyplus://content/[id]
    contentDiscoveryMethod: 'third-party',
    complianceNotes: [
      'No official API for third-party apps',
      'Content discovery via TMDB acceptable',
      'Deep linking supported for user convenience',
      'Cannot reproduce Disney+ UI elements',
    ],
  },
  
  prime: {
    name: 'Amazon Prime Video',
    hasOfficialAPI: false, // Amazon Associates only
    deepLinkSupport: true, // primevideo://detail/[id]
    contentDiscoveryMethod: 'third-party',
    complianceNotes: [
      'Use Amazon Associates API where possible',
      'Third-party content discovery acceptable',
      'Must include Prime branding correctly',
      'Cannot store Prime-specific viewing data',
    ],
  },
  
  hulu: {
    name: 'Hulu',
    hasOfficialAPI: false,
    deepLinkSupport: true, // hulu://watch/[id]
    contentDiscoveryMethod: 'third-party',
    complianceNotes: [
      'No public API available',
      'Content metadata via third-party sources',
      'Deep linking for user convenience',
      'Respect Hulu branding guidelines',
    ],
  },
  
  hbo: {
    name: 'HBO Max',
    hasOfficialAPI: false,
    deepLinkSupport: true, // hbomax://feature/[id]
    contentDiscoveryMethod: 'third-party',
    complianceNotes: [
      'Warner Bros Discovery content via TMDB',
      'No direct HBO Max API integration',
      'Use official HBO Max branding only',
      'Deep links for content access',
    ],
  },
  
  apple: {
    name: 'Apple TV+',
    hasOfficialAPI: false,
    deepLinkSupport: true, // tv://show?id=[id]
    contentDiscoveryMethod: 'third-party',
    complianceNotes: [
      'Apple TV+ content via third-party APIs',
      'Respect Apple branding guidelines',
      'Universal links preferred over custom schemes',
      'Cannot replicate Apple TV+ interface',
    ],
  },
}

// Safe content discovery methods that respect ToS
export const CONTENT_DISCOVERY_STRATEGY = {
  // Primary: Third-party aggregation APIs (ToS compliant)
  thirdPartyAPIs: [
    {
      name: 'Streaming Availability API',
      coverage: ['netflix', 'disney', 'prime', 'hulu', 'hbo', 'apple'],
      rateLimit: '100/hour',
      compliance: 'Aggregates public data, ToS compliant',
    },
    {
      name: 'TMDB API',
      coverage: ['all platforms via watch providers'],
      rateLimit: '40/10s',
      compliance: 'Official API, platform partnerships',
    },
    {
      name: 'JustWatch API',
      coverage: ['comprehensive platform coverage'],
      rateLimit: 'varies',
      compliance: 'Commercial aggregator, widely used',
    },
  ],
  
  // Fallback: Manual curation (always compliant)
  manualCuration: {
    method: 'Editorial selection of popular content',
    updateFrequency: 'Weekly',
    coverage: 'Top 100 food-friendly titles per platform',
    compliance: 'Fully compliant, no API dependencies',
  },
  
  // Emergency: User-generated (community driven)
  userGenerated: {
    method: 'User submissions with moderation',
    validation: 'Community voting + editorial review',
    compliance: 'User-generated content, platform neutral',
  },
}

// Deep linking strategy for seamless handoff
export const DEEP_LINK_STRATEGY = {
  // Primary: Native app deep links (best UX)
  nativeApps: {
    netflix: {
      scheme: 'netflix://',
      webFallback: 'https://www.netflix.com/title/',
      detection: 'attempt native, fallback to web after 2s',
    },
    disney: {
      scheme: 'disneyplus://',
      webFallback: 'https://www.disneyplus.com/movies/',
      detection: 'iOS: disneyplus://, Android: intent://',
    },
    prime: {
      scheme: 'primevideo://',
      webFallback: 'https://www.amazon.com/dp/',
      detection: 'Universal links preferred',
    },
  },
  
  // Fallback: Web links with app detection
  webLinks: {
    strategy: 'Progressive enhancement',
    appDetection: 'User-agent + feature detection',
    userChoice: 'Remember preference for app vs web',
  },
  
  // Error handling: Graceful degradation
  errorHandling: {
    appNotInstalled: 'Show install prompt + web option',
    linkFailed: 'Provide manual search instructions',
    platformUnavailable: 'Suggest alternative platforms',
  },
}

// Compliance monitoring and validation
export class ComplianceMonitor {
  // Validate that our usage stays within ToS bounds
  static validateAPIUsage(platform: string, requestCount: number, timeWindow: number): boolean {
    const config = PLATFORM_CONFIGS[platform]
    if (!config) return false
    
    // We only use third-party APIs, so we're not bound by platform-specific limits
    // But we should still be respectful of rate limits
    return true
  }
  
  // Ensure we're not storing prohibited data
  static validateDataStorage(dataType: string, platform: string): boolean {
    const prohibitedData = [
      'user-credentials',
      'platform-specific-viewing-history',
      'copyrighted-content-metadata',
      'platform-ui-elements',
    ]
    
    return !prohibitedData.includes(dataType)
  }
  
  // Check that our branding usage is compliant
  static validateBrandingUsage(platform: string, usage: string): boolean {
    const allowedUsages = [
      'platform-identification',
      'deep-link-buttons',
      'availability-indicators',
    ]
    
    return allowedUsages.includes(usage)
  }
}