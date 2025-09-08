# MealStream Deployment Guide

## Overview

This guide covers deploying MealStream to production environments following our technical north star of "Fast, Reliable, Scalable, Maintainable". The application uses Next.js 14+ with App Router for a full-stack serverless deployment optimized for the 30-second decision target.

**Technical Architecture Principles:**

- PostgreSQL for ACID-compliant user preferences and relational data
- Redis for multi-layer caching (CDN, Redis, in-memory)
- Comprehensive rate limiting with exponential backoff
- Performance targets: <1.5s First Contentful Paint, <3s Time to Interactive

**Key Constraints:**

- Netflix/Disney+ APIs are restricted - must use alternative data sources
- Mobile-first experience (70% of usage expected on mobile)
- Must respect streaming platform Terms of Service
- Cannot store user passwords/login credentials

**UX Performance Requirements:**

- **Speed Beats Choice**: API responses must return maximum 3 recommendations
- **Mobile-Obsessed**: Optimize for thumb-reachable navigation and one-hand operation
- **Respect the Moment**: No auto-playing content, fast loading with skeleton screens
- **Forgiveness First**: Graceful degradation when external APIs fail

## Architecture Overview

Following our "Fast, Reliable, Scalable, Maintainable" technical architecture:

```
┌─────────────────┐    ┌─────────────────┐    ┌─────────────────┐
│     Vercel      │    │   Database      │    │   External      │
│  (Full-Stack)   │◄──►│   Layer         │◄──►│   APIs          │
│                 │    │                 │    │                 │
│ • Next.js 14+   │    │ • PostgreSQL    │    │ • Streaming     │
│ • API Routes    │    │   (ACID)        │    │   Availability  │
│ • Edge Functions│    │ • Redis Cache   │    │   (Primary)     │
│ • PWA Features  │    │   (Multi-layer) │    │ • TMDB          │
│ • Cloudflare CDN│    │ • Read Replicas │    │   (Secondary)   │
└─────────────────┘    └─────────────────┘    └─────────────────┘
```

## Prerequisites

### Required Accounts

- [Vercel](https://vercel.com) - Frontend hosting
- [Railway](https://railway.app) or [Render](https://render.com) - Backend hosting
- [Supabase](https://supabase.com) or [PlanetScale](https://planetscale.com) - Database
- [Upstash](https://upstash.com) - Redis cache
- [Streaming Availability API](https://www.movieofthenight.com/about/api) - Content data
- [TMDB](https://www.themoviedb.org/settings/api) - Movie metadata

### Required Tools

- Node.js 18+
- Git
- Vercel CLI: `npm i -g vercel`
- Railway CLI: `npm i -g @railway/cli` (if using Railway)

## Environment Configuration

### Environment Variables (.env.local)

```env
# App Configuration
NEXT_PUBLIC_APP_URL=https://mealstream.vercel.app
NEXTAUTH_URL=https://mealstream.vercel.app
NEXTAUTH_SECRET=your-nextauth-secret-here

# Database
DATABASE_URL=postgresql://username:password@host:5432/mealstream
REDIS_URL=redis://username:password@host:6379

# Authentication
JWT_SECRET=your-jwt-secret-here
JWT_EXPIRES_IN=15m

# External APIs (Netflix/Disney+ restricted)
STREAMING_AVAILABILITY_API_KEY=your-streaming-api-key
TMDB_API_KEY=your-tmdb-api-key

# Performance Targets (UX Commandments)
RECOMMENDATION_TIMEOUT=3000
QUICK_PICK_TIMEOUT=1000
MAX_RECOMMENDATIONS=3
MOBILE_FIRST_OPTIMIZATION=true
```

### Backend Environment Variables

```env
# Database
DATABASE_URL=postgresql://username:password@host:5432/database
REDIS_URL=redis://username:password@host:6379

# Authentication
JWT_SECRET=your-jwt-secret-here
JWT_EXPIRES_IN=15m
REFRESH_TOKEN_EXPIRES_IN=7d

# External APIs
STREAMING_AVAILABILITY_API_KEY=your-streaming-api-key
TMDB_API_KEY=your-tmdb-api-key

# App Configuration
NODE_ENV=production
PORT=3001
CORS_ORIGIN=https://your-app.vercel.app

# Rate Limiting
RATE_LIMIT_WINDOW_MS=60000
RATE_LIMIT_MAX_REQUESTS=100

# Monitoring
SENTRY_DSN=your-sentry-dsn
LOG_LEVEL=info
```

## Database Setup

### Option 1: Supabase (Recommended)

1. **Create Project**

   ```bash
   # Visit https://supabase.com/dashboard
   # Create new project
   # Note your database URL and anon key
   ```

2. **Run Migrations**

   ```bash
   # Install Supabase CLI
   npm install -g supabase

   # Login and link project
   supabase login
   supabase link --project-ref your-project-ref

   # Push schema
   supabase db push
   ```

3. **Seed Data**
   ```bash
   npm run db:seed:production
   ```

### Option 2: PlanetScale

1. **Create Database**

   ```bash
   # Install PlanetScale CLI
   curl -fsSL https://get.planetscale.com/cli | sh

   # Create database
   pscale database create mealstream --region us-east

   # Create branch
   pscale branch create mealstream main
   ```

2. **Deploy Schema**

   ```bash
   # Connect to branch
   pscale connect mealstream main --port 3309

   # Run migrations
   npm run db:migrate:production
   ```

## Backend Deployment

### Option 1: Railway (Recommended)

1. **Install CLI and Login**

   ```bash
   npm install -g @railway/cli
   railway login
   ```

2. **Initialize Project**

   ```bash
   railway init
   railway link
   ```

3. **Configure Environment**

   ```bash
   # Set environment variables
   railway variables set DATABASE_URL="your-database-url"
   railway variables set REDIS_URL="your-redis-url"
   railway variables set JWT_SECRET="your-jwt-secret"
   # ... add all other variables
   ```

4. **Deploy**

   ```bash
   railway up
   ```

5. **Custom Domain (Optional)**
   ```bash
   railway domain add api.your-domain.com
   ```

### Option 2: Render

1. **Create Web Service**
   - Visit [Render Dashboard](https://dashboard.render.com)
   - Connect your GitHub repository
   - Choose "Web Service"

2. **Configure Build**

   ```yaml
   # render.yaml
   services:
     - type: web
       name: mealstream-api
       env: node
       buildCommand: npm install && npm run build
       startCommand: npm start
       envVars:
         - key: NODE_ENV
           value: production
         - key: DATABASE_URL
           fromDatabase:
             name: mealstream-db
             property: connectionString
   ```

3. **Environment Variables**
   - Add all required environment variables in Render dashboard
   - Use Render's built-in PostgreSQL for database

## Full-Stack Deployment

### Vercel Deployment (Recommended)

1. **Install Vercel CLI**

   ```bash
   npm i -g vercel
   ```

2. **Login and Initialize**

   ```bash
   vercel login
   vercel
   ```

3. **Configure Project**

   ```json
   // vercel.json
   {
     "framework": "nextjs",
     "buildCommand": "npm run build",
     "devCommand": "npm run dev",
     "installCommand": "npm install",
     "functions": {
       "app/api/**/*.ts": {
         "maxDuration": 30
       }
     },
     "headers": [
       {
         "source": "/api/(.*)",
         "headers": [
           {
             "key": "Access-Control-Allow-Origin",
             "value": "*"
           }
         ]
       }
     ]
   }
   ```

4. **Environment Variables**

   ```bash
   # Set production environment variables
   vercel env add NEXT_PUBLIC_API_URL production
   vercel env add NEXTAUTH_SECRET production
   # ... add all other variables
   ```

5. **Deploy**

   ```bash
   vercel --prod
   ```

6. **Custom Domain**
   ```bash
   vercel domains add mealstream.app
   ```

## Redis Cache Setup

### Upstash Redis

1. **Create Database**
   - Visit [Upstash Console](https://console.upstash.com)
   - Create new Redis database
   - Choose region closest to your backend

2. **Configure Connection**

   ```env
   REDIS_URL=rediss://username:password@host:port
   ```

3. **Test Connection**
   ```bash
   # Test Redis connection
   npm run test:redis
   ```

## Monitoring and Logging

### Application Monitoring

1. **Sentry Setup**

   ```bash
   npm install @sentry/node @sentry/nextjs
   ```

   ```javascript
   // sentry.server.config.js
   import * as Sentry from '@sentry/nextjs'

   Sentry.init({
     dsn: process.env.SENTRY_DSN,
     environment: process.env.NODE_ENV,
   })
   ```

2. **Health Check Endpoints**
   ```javascript
   // Backend health check
   app.get('/health', (req, res) => {
     res.json({
       status: 'healthy',
       timestamp: new Date().toISOString(),
       version: process.env.npm_package_version,
     })
   })
   ```

### Performance Monitoring

1. **Vercel Analytics**

   ```bash
   npm install @vercel/analytics
   ```

2. **Core Web Vitals**

   ```javascript
   // pages/_app.tsx
   import { Analytics } from '@vercel/analytics/react'

   export default function App({ Component, pageProps }) {
     return (
       <>
         <Component {...pageProps} />
         <Analytics />
       </>
     )
   }
   ```

## SSL and Security

### SSL Certificates

- **Vercel**: Automatic SSL with Let's Encrypt
- **Railway**: Automatic SSL for custom domains
- **Render**: Automatic SSL included

### Security Headers

```javascript
// next.config.js
const securityHeaders = [
  {
    key: 'X-DNS-Prefetch-Control',
    value: 'on',
  },
  {
    key: 'Strict-Transport-Security',
    value: 'max-age=63072000; includeSubDomains; preload',
  },
  {
    key: 'X-XSS-Protection',
    value: '1; mode=block',
  },
  {
    key: 'X-Frame-Options',
    value: 'DENY',
  },
  {
    key: 'X-Content-Type-Options',
    value: 'nosniff',
  },
]

module.exports = {
  async headers() {
    return [
      {
        source: '/(.*)',
        headers: securityHeaders,
      },
    ]
  },
}
```

## CI/CD Pipeline

### GitHub Actions

```yaml
# .github/workflows/deploy.yml
name: Deploy to Production

on:
  push:
    branches: [main]

jobs:
  test:
    runs-on: ubuntu-latest
    steps:
      - uses: actions/checkout@v3
      - uses: actions/setup-node@v3
        with:
          node-version: '18'
      - run: npm ci
      - run: npm run test
      - run: npm run test:e2e

  deploy-backend:
    needs: test
    runs-on: ubuntu-latest
    steps:
      - uses: actions/checkout@v3
      - name: Deploy to Railway
        run: |
          npm install -g @railway/cli
          railway login --token ${{ secrets.RAILWAY_TOKEN }}
          railway up --service backend

  deploy-frontend:
    needs: test
    runs-on: ubuntu-latest
    steps:
      - uses: actions/checkout@v3
      - name: Deploy to Vercel
        uses: amondnet/vercel-action@v25
        with:
          vercel-token: ${{ secrets.VERCEL_TOKEN }}
          vercel-org-id: ${{ secrets.VERCEL_ORG_ID }}
          vercel-project-id: ${{ secrets.VERCEL_PROJECT_ID }}
          vercel-args: '--prod'
```

## Backup and Recovery

### Database Backups

1. **Automated Backups**

   ```bash
   # Supabase: Automatic daily backups
   # PlanetScale: Automatic backups with point-in-time recovery
   ```

2. **Manual Backup**

   ```bash
   # PostgreSQL backup
   pg_dump $DATABASE_URL > backup-$(date +%Y%m%d).sql

   # Upload to S3
   aws s3 cp backup-$(date +%Y%m%d).sql s3://your-backup-bucket/
   ```

### Application Recovery

1. **Rollback Strategy**

   ```bash
   # Vercel rollback
   vercel rollback

   # Railway rollback
   railway rollback
   ```

2. **Database Migration Rollback**
   ```bash
   # Run down migrations
   npm run db:migrate:down
   ```

## Performance Optimization

### CDN Configuration

- **Vercel Edge Network**: Automatic global CDN
- **Cloudflare**: Additional CDN layer for API caching

### Caching Strategy

```javascript
// API response caching
app.use('/api/recommendations', cache('5 minutes'))
app.use('/api/content', cache('1 hour'))
app.use('/api/search', cache('30 minutes'))
```

### Database Optimization

```sql
-- Add indexes for performance
CREATE INDEX CONCURRENTLY idx_content_food_score
ON content ((food_friendly_score->>'overallScore'));

CREATE INDEX CONCURRENTLY idx_user_platforms
ON users USING GIN (platforms);
```

## Troubleshooting

### Common Issues

1. **API Timeout Errors**

   ```bash
   # Check external API status
   curl -I https://streaming-availability.p.rapidapi.com/health

   # Increase timeout in production
   EXTERNAL_API_TIMEOUT=10000
   ```

2. **Database Connection Issues**

   ```bash
   # Test database connection
   npm run db:test-connection

   # Check connection pool
   DATABASE_POOL_SIZE=20
   ```

3. **Memory Issues**
   ```bash
   # Increase Node.js memory limit
   NODE_OPTIONS="--max-old-space-size=2048"
   ```

### Monitoring Commands

```bash
# Check application health
curl https://your-api.railway.app/health

# Monitor logs
railway logs --service backend
vercel logs

# Check database performance
npm run db:analyze
```

## Scaling Considerations

### Horizontal Scaling

- **Railway**: Auto-scaling based on CPU/memory usage
- **Vercel**: Automatic edge function scaling
- **Database**: Read replicas for high-traffic scenarios

### Performance Targets

- **Response Time**: <3s for 95% of requests
- **Throughput**: 1000+ concurrent users
- **Availability**: 99.9% uptime SLA

## Security Checklist

- [ ] Environment variables secured
- [ ] Database connections encrypted
- [ ] API rate limiting enabled
- [ ] CORS properly configured
- [ ] Security headers implemented
- [ ] SSL certificates active
- [ ] Dependency vulnerabilities scanned
- [ ] Authentication tokens secured
- [ ] Backup encryption enabled
- [ ] Monitoring alerts configured

## Support and Maintenance

### Regular Tasks

- **Weekly**: Review error logs and performance metrics
- **Monthly**: Update dependencies and security patches
- **Quarterly**: Review and optimize database queries
- **Annually**: Security audit and penetration testing

### Emergency Contacts

- **Infrastructure**: Railway/Vercel support
- **Database**: Supabase/PlanetScale support
- **Monitoring**: Sentry alerts
- **On-call**: Your team's incident response
