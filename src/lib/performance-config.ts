// Performance configuration optimized for eating context
// Target: <1.5s FCP, <30s total decision time

export const PERFORMANCE_CONFIG = {
  // Critical rendering path optimization
  criticalCSS: {
    inline: true, // Inline critical CSS for faster FCP
    maxSize: '14kb', // HTTP/2 initial congestion window
  },
  
  // Image optimization for food-friendly thumbnails
  images: {
    formats: ['avif', 'webp', 'jpg'], // Modern formats first
    sizes: {
      thumbnail: { width: 320, height: 180 }, // 16:9 mobile
      hero: { width: 640, height: 360 },
      placeholder: { width: 32, height: 18 }, // Blur placeholder
    },
    quality: 85, // Balance size vs quality for eating context
    loading: 'lazy', // Except above-fold content
  },
  
  // Caching strategy for offline eating scenarios
  caching: {
    recommendations: {
      ttl: 300000, // 5 minutes (fresh for meal duration)
      staleWhileRevalidate: 900000, // 15 minutes
    },
    contentMetadata: {
      ttl: 86400000, // 24 hours
      maxEntries: 5000,
    },
    userPreferences: {
      ttl: Infinity, // Cache indefinitely, sync when online
      storage: 'localStorage',
    },
  },
  
  // Network-aware loading optimized for eating context
  networkOptimization: {
    slowConnection: {
      threshold: '2g', // Detect slow connections
      reducedQuality: true,
      skipNonEssential: true,
      emergencyMode: true, // Skip to emergency picks faster
    },
    adaptiveLoading: {
      // Eating scenarios: prioritize speed over completeness
      fastTrack: {
        enabled: true,
        timeoutMs: 1500, // Faster timeout when eating
        fallbackToCache: true,
      },
      // Progressive enhancement based on connection
      connectionAware: {
        '2g': { imageQuality: 60, skipAnimations: true },
        '3g': { imageQuality: 75, reduceAnimations: true },
        '4g': { imageQuality: 85, fullExperience: true },
      },
    },
    preload: {
      recommendations: 3, // Preload top 3 recommendations
      platforms: ['netflix', 'disney', 'prime'], // Most common
      contextBased: true, // Preload based on meal timing
    },
  },
  
  // Bundle optimization for mobile
  bundling: {
    maxChunkSize: '244kb', // Mobile-friendly chunk size
    splitPoints: ['routes', 'vendor', 'components'],
    treeshaking: true,
    compression: 'brotli',
  },
} as const

// Service Worker strategy for offline-first eating experience
export const SW_STRATEGY = {
  // Cache essential app shell
  appShell: [
    '/',
    '/context',
    '/recommendations',
    '/offline',
  ],
  
  // Cache user's last recommendations for offline access
  recommendations: {
    strategy: 'staleWhileRevalidate',
    maxEntries: 50,
    maxAgeSeconds: 3600, // 1 hour
  },
  
  // Cache platform icons and essential images
  images: {
    strategy: 'cacheFirst',
    maxEntries: 100,
    maxAgeSeconds: 86400, // 24 hours
  },
} as const