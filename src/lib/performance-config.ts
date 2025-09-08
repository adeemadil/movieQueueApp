/**
 * Performance Configuration for MealStream
 * 
 * Optimized for the eating context where users:
 * - Have limited attention span
 * - May have one hand occupied
 * - Need immediate results
 * - Often have poor network conditions (restaurants, etc.)
 */

// Core Web Vitals targets for eating context
export const PERFORMANCE_TARGETS = {
  // Aggressive targets because users are hungry and impatient
  firstContentfulPaint: 1000, // 1s (vs typical 1.8s)
  largestContentfulPaint: 2000, // 2s (vs typical 2.5s)
  firstInputDelay: 50, // 50ms (vs typical 100ms)
  cumulativeLayoutShift: 0.05, // 0.05 (vs typical 0.1)
  timeToInteractive: 2500, // 2.5s (vs typical 3.9s)
  
  // Eating-specific metrics
  contextCaptureTime: 10000, // 10s max for context selection
  recommendationLoadTime: 3000, // 3s max for recommendations
  platformHandoffTime: 500, // 500ms max to launch external app
}

// Network-aware loading strategy
export const NETWORK_STRATEGY = {
  // Detect connection quality and adapt
  connectionTypes: {
    '4g': {
      imageQuality: 'high',
      prefetchCount: 10,
      cacheStrategy: 'aggressive',
    },
    '3g': {
      imageQuality: 'medium',
      prefetchCount: 5,
      cacheStrategy: 'conservative',
    },
    '2g': {
      imageQuality: 'low',
      prefetchCount: 2,
      cacheStrategy: 'minimal',
    },
    'offline': {
      imageQuality: 'cached',
      prefetchCount: 0,
      cacheStrategy: 'emergency',
    },
  },
  
  // Eating context: Prioritize essential content
  loadingPriorities: {
    critical: ['context-selection', 'quick-pick-button'],
    high: ['primary-recommendation', 'food-friendly-score'],
    medium: ['secondary-recommendations', 'platform-icons'],
    low: ['user-history', 'settings'],
    deferred: ['analytics', 'social-features'],
  },
}

// Image optimization for mobile eating context
export const IMAGE_OPTIMIZATION = {
  // Responsive image sizes for different contexts
  sizes: {
    thumbnail: {
      mobile: '120x180', // Small enough for one-hand viewing
      tablet: '160x240',
      desktop: '200x300',
    },
    hero: {
      mobile: '280x420', // Fits in thumb-reachable area
      tablet: '400x600',
      desktop: '500x750',
    },
    background: {
      mobile: '375x667', // iPhone SE baseline
      tablet: '768x1024',
      desktop: '1920x1080',
    },
  },
  
  // Eating-friendly image loading
  strategy: {
    // Load images progressively to avoid layout shift
    progressive: true,
    
    // Use blur placeholders for smooth loading
    placeholder: 'blur',
    
    // Prioritize above-the-fold content
    priority: ['hero-recommendation', 'context-cards'],
    
    // Lazy load everything else
    lazy: ['secondary-recommendations', 'history-items'],
  },
}

// Bundle optimization for mobile
export const BUNDLE_OPTIMIZATION = {
  // Code splitting strategy
  chunks: {
    // Critical path: Context selection + recommendations
    critical: ['context-capture', 'recommendation-engine'],
    
    // Secondary: User management and settings
    secondary: ['user-profile', 'settings', 'history'],
    
    // Deferred: Analytics and non-essential features
    deferred: ['analytics', 'feedback', 'social'],
  },
  
  // Tree shaking priorities
  treeshaking: {
    // Remove unused Tailwind classes
    css: true,
    
    // Remove unused JavaScript
    javascript: true,
    
    // Remove unused icons (keep only essential ones)
    icons: ['play', 'heart', 'settings', 'back', 'leaf'],
  },
}

// Service Worker strategy for offline eating scenarios
export const OFFLINE_STRATEGY = {
  // Cache essential resources for offline use
  cacheFirst: [
    // App shell
    '/',
    '/context',
    '/recommendations',
    
    // Essential assets
    '/fonts/inter.woff2',
    '/icons/platforms/*.svg',
    '/images/placeholders/*.webp',
  ],
  
  // Network first with fallback for dynamic content
  networkFirst: [
    '/api/recommendations',
    '/api/content',
    '/api/platforms',
  ],
  
  // Emergency offline content
  emergencyCache: {
    // 50 most popular food-friendly titles
    recommendations: 50,
    
    // Essential platform information
    platforms: ['netflix', 'disney-plus', 'prime-video', 'hulu'],
    
    // Fallback images
    placeholders: ['movie-placeholder.webp', 'series-placeholder.webp'],
  },
}

// Performance monitoring for eating context
export const MONITORING_CONFIG = {
  // Track eating-specific metrics
  customMetrics: [
    'context-selection-time',
    'recommendation-acceptance-rate',
    'platform-handoff-success-rate',
    'emergency-pick-usage',
  ],
  
  // Real User Monitoring (RUM) configuration
  rum: {
    // Sample rate based on user engagement
    sampleRate: 0.1, // 10% of sessions
    
    // Track performance by context
    dimensions: [
      'viewing-party-size',
      'attention-level',
      'meal-duration',
      'device-type',
      'network-speed',
    ],
  },
  
  // Alerts for eating context issues
  alerts: {
    // Critical: App unusable while eating
    critical: [
      'recommendation-load-time > 5s',
      'context-selection-errors > 5%',
      'platform-handoff-failures > 10%',
    ],
    
    // Warning: Degraded eating experience
    warning: [
      'recommendation-load-time > 3s',
      'emergency-pick-usage > 20%',
      'user-abandonment > 30%',
    ],
  },
}

// Export performance utilities
export function getNetworkAwareConfig() {
  // Detect network connection and return appropriate config
  if (typeof navigator !== 'undefined' && 'connection' in navigator) {
    const connection = (navigator as any).connection
    const effectiveType = connection?.effectiveType || '4g'
    return NETWORK_STRATEGY.connectionTypes[effectiveType as keyof typeof NETWORK_STRATEGY.connectionTypes]
  }
  
  // Default to conservative settings
  return NETWORK_STRATEGY.connectionTypes['3g']
}

export function shouldPrefetch(priority: string): boolean {
  const config = getNetworkAwareConfig()
  const priorities = NETWORK_STRATEGY.loadingPriorities
  
  return (
    priorities.critical.includes(priority) ||
    (config.cacheStrategy === 'aggressive' && priorities.high.includes(priority))
  )
}