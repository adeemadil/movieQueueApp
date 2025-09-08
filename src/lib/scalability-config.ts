/**
 * Scalability Configuration for MealStream
 * 
 * Designed to scale from MVP (50 users) to 100k+ users
 * while maintaining the 30-second decision target
 */

// Scaling thresholds and corresponding infrastructure changes
export const SCALING_THRESHOLDS = {
  mvp: {
    users: 50,
    dailyRequests: 500,
    infrastructure: {
      database: 'supabase-free',
      caching: 'in-memory',
      cdn: 'vercel-edge',
      monitoring: 'basic',
    },
  },
  
  growth: {
    users: 1000,
    dailyRequests: 10000,
    infrastructure: {
      database: 'supabase-pro',
      caching: 'redis-basic',
      cdn: 'cloudflare',
      monitoring: 'enhanced',
    },
  },
  
  scale: {
    users: 10000,
    dailyRequests: 100000,
    infrastructure: {
      database: 'supabase-pro + read-replicas',
      caching: 'redis-cluster',
      cdn: 'cloudflare-pro',
      monitoring: 'comprehensive',
    },
  },
  
  enterprise: {
    users: 100000,
    dailyRequests: 1000000,
    infrastructure: {
      database: 'dedicated-postgres-cluster',
      caching: 'redis-cluster + edge-cache',
      cdn: 'multi-region-cdn',
      monitoring: 'real-time-alerting',
    },
  },
}

// Database scaling strategy
export const DATABASE_SCALING = {
  // Query optimization for eating context
  indexStrategy: {
    // Fast lookups for recommendation generation
    primary: [
      'content(food_friendly_score)',
      'content(platforms)',
      'content(duration_minutes)',
      'users(platforms)',
      'viewing_history(user_id, watched_at)',
    ],
    
    // Composite indexes for complex queries
    composite: [
      'content(food_friendly_score, platforms, duration_minutes)',
      'viewing_history(user_id, content_id, user_rating)',
    ],
  },
  
  // Partitioning strategy for large datasets
  partitioning: {
    // Partition viewing history by month (eating patterns are seasonal)
    viewingHistory: 'monthly',
    
    // Partition content by platform (different update frequencies)
    content: 'platform',
    
    // Partition recommendations cache by user region
    recommendationCache: 'region',
  },
  
  // Read replica strategy
  readReplicas: {
    // Route read-heavy operations to replicas
    routes: {
      recommendations: 'read-replica',
      contentSearch: 'read-replica',
      userHistory: 'read-replica',
      analytics: 'read-replica',
    },
    
    // Keep writes on primary
    writes: {
      userPreferences: 'primary',
      viewingHistory: 'primary',
      contentUpdates: 'primary',
    },
  },
}

// Caching strategy by scale
export const CACHING_STRATEGY = {
  // Multi-layer caching for eating context speed
  layers: {
    // L1: Browser cache (immediate response)
    browser: {
      duration: '5m',
      content: ['static-assets', 'user-preferences'],
    },
    
    // L2: CDN edge cache (regional speed)
    edge: {
      duration: '1h',
      content: ['content-metadata', 'platform-icons'],
    },
    
    // L3: Application cache (Redis)
    application: {
      duration: '15m',
      content: ['recommendations', 'user-context'],
    },
    
    // L4: Database query cache
    database: {
      duration: '5m',
      content: ['content-queries', 'aggregations'],
    },
  },
  
  // Cache warming strategy for peak eating times
  warming: {
    // Pre-warm cache before meal times
    schedule: [
      { time: '11:30', type: 'lunch-content' },
      { time: '17:30', type: 'dinner-content' },
      { time: '20:30', type: 'evening-content' },
    ],
    
    // Popular content by time of day
    content: {
      morning: ['news', 'light-comedy'],
      lunch: ['short-episodes', 'documentaries'],
      dinner: ['comfort-viewing', 'family-friendly'],
      evening: ['movies', 'binge-worthy'],
    },
  },
}

// API rate limiting and quotas by scale
export const API_QUOTAS = {
  // Tiered quotas based on user growth
  tiers: {
    free: {
      requestsPerUser: 10,
      requestsPerDay: 500,
      burstLimit: 20,
    },
    
    basic: {
      requestsPerUser: 50,
      requestsPerDay: 5000,
      burstLimit: 100,
    },
    
    premium: {
      requestsPerUser: 200,
      requestsPerDay: 50000,
      burstLimit: 500,
    },
    
    enterprise: {
      requestsPerUser: 1000,
      requestsPerDay: 1000000,
      burstLimit: 2000,
    },
  },
  
  // Eating context: Allow burst during meal times
  mealTimeBurst: {
    enabled: true,
    multiplier: 2.0, // 2x normal limits during peak eating
    windows: [
      { start: '11:00', end: '14:00' }, // Lunch
      { start: '17:00', end: '21:00' }, // Dinner
    ],
  },
}

// Monitoring and alerting by scale
export const MONITORING_STRATEGY = {
  // Key metrics for eating context
  metrics: {
    // Business metrics
    business: [
      'decision-time-p95',
      'recommendation-acceptance-rate',
      'platform-handoff-success',
      'user-satisfaction-score',
    ],
    
    // Technical metrics
    technical: [
      'api-response-time-p95',
      'database-query-time-p95',
      'cache-hit-ratio',
      'error-rate',
    ],
    
    // Infrastructure metrics
    infrastructure: [
      'cpu-utilization',
      'memory-usage',
      'database-connections',
      'cache-memory-usage',
    ],
  },
  
  // Alerting thresholds by scale
  alerts: {
    mvp: {
      'decision-time-p95': '45s', // 15s buffer on 30s target
      'error-rate': '5%',
      'api-response-time-p95': '5s',
    },
    
    growth: {
      'decision-time-p95': '35s', // Tighter as we scale
      'error-rate': '2%',
      'api-response-time-p95': '3s',
    },
    
    scale: {
      'decision-time-p95': '30s', // Meet target exactly
      'error-rate': '1%',
      'api-response-time-p95': '2s',
    },
  },
}

// Auto-scaling configuration
export const AUTO_SCALING = {
  // Horizontal scaling triggers
  triggers: {
    // Scale up during meal times
    mealTimeTraffic: {
      metric: 'requests-per-minute',
      threshold: 100,
      scaleUp: 2, // Double capacity
      cooldown: '5m',
    },
    
    // Scale up on high latency (eating context is time-sensitive)
    highLatency: {
      metric: 'response-time-p95',
      threshold: '3s',
      scaleUp: 1.5,
      cooldown: '3m',
    },
    
    // Scale down during off-peak
    lowTraffic: {
      metric: 'requests-per-minute',
      threshold: 10,
      scaleDown: 0.5,
      cooldown: '10m',
    },
  },
  
  // Resource limits by scale
  limits: {
    mvp: { min: 1, max: 3 },
    growth: { min: 2, max: 10 },
    scale: { min: 5, max: 50 },
    enterprise: { min: 10, max: 200 },
  },
}

// Cost optimization for sustainable scaling
export const COST_OPTIMIZATION = {
  // Resource scheduling based on eating patterns
  scheduling: {
    // Scale down during low-eating hours (2-6 AM)
    nightMode: {
      enabled: true,
      hours: [2, 3, 4, 5, 6],
      resourceReduction: 0.3, // 70% reduction
    },
    
    // Scale up before meal times
    mealPrep: {
      enabled: true,
      leadTime: '30m', // Scale up 30 min before peak
      peakHours: [11, 12, 13, 18, 19, 20],
    },
  },
  
  // API cost management
  apiCosts: {
    // Prefer cheaper APIs when possible
    preferenceOrder: ['tmdb', 'local-cache', 'streaming-availability'],
    
    // Budget limits by scale
    monthlyBudgets: {
      mvp: 50, // $50/month
      growth: 200, // $200/month
      scale: 1000, // $1000/month
      enterprise: 5000, // $5000/month
    },
  },
}

// Export utility functions
export function getCurrentScale(userCount: number, dailyRequests: number) {
  const thresholds = Object.entries(SCALING_THRESHOLDS)
  
  for (const [scale, config] of thresholds.reverse()) {
    if (userCount >= config.users || dailyRequests >= config.dailyRequests) {
      return { scale, config }
    }
  }
  
  return { scale: 'mvp', config: SCALING_THRESHOLDS.mvp }
}

export function getOptimalCacheConfig(scale: string) {
  const scaleConfig = SCALING_THRESHOLDS[scale as keyof typeof SCALING_THRESHOLDS]
  return {
    ...CACHING_STRATEGY,
    infrastructure: scaleConfig.infrastructure,
  }
}