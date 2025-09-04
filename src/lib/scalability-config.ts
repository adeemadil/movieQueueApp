// Scalability configuration for MealStream
// Designed to handle growth from MVP to 100k+ users

export const SCALABILITY_TIERS = {
  // Tier 1: MVP (0-1k users)
  mvp: {
    database: {
      type: 'postgresql',
      provider: 'supabase-free', // 500MB, 2 CPU hours
      connections: 20,
      readReplicas: 0,
    },
    caching: {
      type: 'in-memory',
      provider: 'upstash-redis-free', // 10k requests/day
      ttl: 3600, // 1 hour
    },
    cdn: {
      provider: 'vercel-edge',
      regions: ['us-east-1'],
    },
    monitoring: {
      provider: 'vercel-analytics',
      level: 'basic',
    },
  },
  
  // Tier 2: Growth (1k-10k users)
  growth: {
    database: {
      type: 'postgresql',
      provider: 'supabase-pro', // 8GB, dedicated CPU
      connections: 100,
      readReplicas: 1, // For recommendation queries
    },
    caching: {
      type: 'redis-cluster',
      provider: 'upstash-redis-pro',
      ttl: 1800, // 30 minutes
      layers: ['cdn', 'redis', 'memory'],
    },
    cdn: {
      provider: 'cloudflare',
      regions: ['global'],
      caching: 'aggressive',
    },
    monitoring: {
      provider: 'datadog',
      level: 'comprehensive',
      alerts: ['response-time', 'error-rate', 'api-limits'],
    },
  },
  
  // Tier 3: Scale (10k-100k users)
  scale: {
    database: {
      type: 'postgresql-cluster',
      provider: 'aws-rds',
      connections: 500,
      readReplicas: 3, // Geographic distribution
      sharding: 'by-user-id',
    },
    caching: {
      type: 'redis-cluster',
      provider: 'aws-elasticache',
      ttl: 900, // 15 minutes
      layers: ['cdn', 'redis-cluster', 'application-cache'],
      eviction: 'lru',
    },
    cdn: {
      provider: 'aws-cloudfront',
      regions: ['global'],
      edgeComputing: true,
      compression: 'brotli',
    },
    monitoring: {
      provider: 'aws-cloudwatch',
      level: 'enterprise',
      alerts: ['all-metrics'],
      dashboards: ['real-time', 'business-metrics'],
    },
  },
} as const

// Auto-scaling triggers based on usage patterns
export const SCALING_TRIGGERS = {
  // Database scaling indicators
  database: {
    connectionUtilization: 0.8, // Scale at 80% connection usage
    queryLatency: 500, // Scale if queries > 500ms
    cpuUtilization: 0.7, // Scale at 70% CPU
  },
  
  // Cache scaling indicators  
  cache: {
    hitRate: 0.85, // Scale if hit rate < 85%
    memoryUtilization: 0.8, // Scale at 80% memory
    requestRate: 1000, // Scale if > 1000 req/min
  },
  
  // API scaling indicators
  api: {
    responseTime: 2000, // Scale if response > 2s (eating context)
    errorRate: 0.05, // Scale if error rate > 5%
    throughput: 100, // Scale if > 100 req/s
  },
} as const

// Performance budgets for eating context
export const PERFORMANCE_BUDGETS = {
  // Critical for 30-second decision target
  critical: {
    firstContentfulPaint: 1500, // 1.5s max
    largestContentfulPaint: 2500, // 2.5s max
    timeToInteractive: 3000, // 3s max
    firstInputDelay: 100, // 100ms max
  },
  
  // Network performance (eating scenarios often have poor wifi)
  network: {
    slowConnection: {
      threshold: '2g',
      budgets: {
        javascript: '150kb', // Reduced for slow connections
        css: '50kb',
        images: '200kb',
        fonts: '30kb',
      },
    },
    fastConnection: {
      threshold: '4g',
      budgets: {
        javascript: '300kb',
        css: '100kb', 
        images: '500kb',
        fonts: '60kb',
      },
    },
  },
  
  // Memory constraints (mobile devices while eating)
  memory: {
    heapSize: '50mb', // Conservative for mobile
    domNodes: 1500, // Keep DOM lightweight
    eventListeners: 100, // Minimize memory leaks
  },
} as const

// Eating-context specific optimizations
export const EATING_CONTEXT_OPTIMIZATIONS = {
  // Preload strategies for meal timing
  preloading: {
    lunchTime: {
      hours: [11, 12, 13], // 11am-1pm
      preloadContent: ['quick-bite', 'comedy', 'light-drama'],
      cacheStrategy: 'aggressive',
    },
    dinnerTime: {
      hours: [17, 18, 19, 20], // 5pm-8pm
      preloadContent: ['full-meal', 'documentary', 'series'],
      cacheStrategy: 'standard',
    },
    snackTime: {
      hours: [15, 16, 21, 22], // 3pm-4pm, 9pm-10pm
      preloadContent: ['short-form', 'comedy', 'cooking'],
      cacheStrategy: 'minimal',
    },
  },
  
  // Offline-first for poor connectivity during meals
  offline: {
    essentialContent: [
      'last-3-recommendations',
      'user-favorites',
      'emergency-picks',
      'platform-icons',
    ],
    syncStrategy: 'background-sync',
    storageQuota: '50mb', // Conservative mobile storage
  },
  
  // Battery optimization (phones get hot while eating/charging)
  battery: {
    reducedAnimations: true, // When battery < 20%
    lowerImageQuality: true, // When battery < 15%
    minimalBackground: true, // When battery < 10%
  },
} as const