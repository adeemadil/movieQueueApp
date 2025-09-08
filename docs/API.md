# MealStream API Documentation

## Overview

The MealStream API provides endpoints for context-aware content recommendations optimized for eating scenarios. The API is designed to deliver recommendations in under 30 seconds with a focus on "food-friendly" content classification.

**North Star Metric:** Time from app open to content selection (Target: <30 seconds)

**Technical Architecture:** Following "Fast, Reliable, Scalable, Maintainable" principles with Next.js 14+, PostgreSQL for ACID compliance, Redis for multi-layer caching, and comprehensive rate limiting with exponential backoff.

**Premium Design System:** Built with "Warm Evening" visual identity featuring deep blues (#0A0E27-#6366F1), warm amber accents (#FF8C42), and food-friendly greens (#10B981). Includes comprehensive glassmorphism effects, Inter typography optimized for eating contexts, and smooth micro-animations (75ms-200ms) with custom easing curves.

### UX Design Principles

- **Speed Beats Choice**: Maximum 3 recommendations per response
- **Context is King**: Food-friendly classification takes precedence
- **Mobile-Obsessed**: Optimized for one-hand operation while eating
- **Forgiveness First**: Graceful error handling with fallback options
- **Respect the Moment**: No auto-playing content or interruptions

All endpoints require authentication except for health checks.

## Base URL

```
Production: https://mealstream.vercel.app
Development: http://localhost:3000
```

## Key Constraints

- Netflix/Disney+ APIs are restricted - uses alternative data sources
- Mobile-first optimization (70% of usage expected on mobile)
- Must respect streaming platform Terms of Service
- No password storage or credential access

## Authentication

All API requests require a valid JWT token in the Authorization header:

```http
Authorization: Bearer <your_jwt_token>
```

### Get Access Token

```http
POST /auth/login
Content-Type: application/json

{
  "email": "user@example.com",
  "password": "your_password"
}
```

**Response:**

```json
{
  "accessToken": "eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9...",
  "refreshToken": "eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9...",
  "expiresIn": 900,
  "user": {
    "id": "uuid",
    "email": "user@example.com",
    "platforms": ["netflix", "prime", "disney"]
  }
}
```

## Core Endpoints

### 1. Get Recommendations

Get personalized content recommendations based on viewing context.

```http
POST /api/recommendations
Content-Type: application/json
Authorization: Bearer <token>
```

**Request Body:**

```json
{
  "context": {
    "viewingParty": "alone" | "partner" | "friends" | "family",
    "attentionLevel": "background" | "focused",
    "contentPreference": "continue" | "comedy" | "documentary" | "comfort",
    "duration": "snack" | "meal" | "extended"
  },
  "platforms": ["netflix", "prime", "disney", "hulu", "hbo"],
  "excludeWatched": true,
  "maxResults": 3
}
```

**Note:** `maxResults` is capped at 3 to follow UX principle "Speed Beats Choice" - preventing choice overload during eating scenarios.

````

**Response:**
```json
{
  "recommendations": [
    {
      "contentId": "uuid",
      "title": "The Office",
      "type": "series",
      "platform": "netflix",
      "foodFriendlyScore": 9.2,
      "matchScore": 8.7,
      "duration": 22,
      "thumbnailUrl": "https://image.tmdb.org/t/p/w500/path.jpg",
      "directLink": "https://netflix.com/title/70136120",
      "reasoning": "Perfect for background viewing while eating. Familiar comedy with no subtitles."
    }
  ],
  "generatedAt": "2024-01-15T10:30:00Z",
  "cacheExpiry": "2024-01-15T11:00:00Z"
}
````

### 2. Emergency Quick Pick

Get instant recommendation when decision time exceeds 30 seconds.

```http
GET /api/recommendations/quick-pick?platforms=netflix,prime
Authorization: Bearer <token>
```

**Response:**

```json
{
  "recommendation": {
    "contentId": "uuid",
    "title": "Friends",
    "type": "series",
    "platform": "netflix",
    "foodFriendlyScore": 9.5,
    "directLink": "https://netflix.com/title/70153404",
    "reasoning": "Your most-watched comfort show. Perfect for any meal."
  }
}
```

### 3. Update User Platforms

Manage user's streaming platform subscriptions.

```http
PUT /api/user/platforms
Content-Type: application/json
Authorization: Bearer <token>
```

**Request Body:**

```json
{
  "platforms": ["netflix", "prime", "disney", "hulu"]
}
```

### 4. Submit Feedback

Provide feedback on recommendation quality to improve algorithm.

```http
POST /api/content/{contentId}/feedback
Content-Type: application/json
Authorization: Bearer <token>
```

**Request Body:**

```json
{
  "satisfied": true,
  "foodFriendlyRating": 8,
  "contextMatch": 9,
  "notes": "Perfect for dinner viewing"
}
```

### 5. Viewing History

#### Add to History

```http
POST /api/user/history
Content-Type: application/json
Authorization: Bearer <token>
```

**Request Body:**

```json
{
  "contentId": "uuid",
  "watchedAt": "2024-01-15T20:00:00Z",
  "completionPercentage": 85.5,
  "userRating": 4,
  "context": {
    "viewingParty": "partner",
    "attentionLevel": "focused"
  }
}
```

#### Get History

```http
GET /api/user/history?limit=50&offset=0
Authorization: Bearer <token>
```

### 6. Content Search

Search for specific content across platforms.

```http
GET /api/content/search?q=the+office&platforms=netflix,prime
Authorization: Bearer <token>
```

**Response:**

```json
{
  "results": [
    {
      "contentId": "uuid",
      "title": "The Office (US)",
      "type": "series",
      "platforms": {
        "netflix": {
          "available": true,
          "link": "https://netflix.com/title/70136120"
        }
      },
      "foodFriendlyScore": 9.2,
      "metadata": {
        "year": 2005,
        "genres": ["Comedy", "Mockumentary"],
        "duration": 22
      }
    }
  ]
}
```

## Error Handling

All errors follow a consistent format:

```json
{
  "error": {
    "code": "INVALID_CONTEXT",
    "message": "Invalid viewing context provided",
    "details": {
      "field": "attentionLevel",
      "value": "invalid_value",
      "allowedValues": ["background", "focused"]
    },
    "timestamp": "2024-01-15T10:30:00Z",
    "requestId": "req_123456789"
  },
  "fallback": {
    "type": "cached",
    "data": {
      "recommendations": []
    }
  }
}
```

### Common Error Codes

| Code                  | Status | Description                           |
| --------------------- | ------ | ------------------------------------- |
| `INVALID_TOKEN`       | 401    | JWT token invalid or expired          |
| `INVALID_CONTEXT`     | 400    | Invalid viewing context parameters    |
| `PLATFORM_NOT_FOUND`  | 400    | Unsupported streaming platform        |
| `RATE_LIMIT_EXCEEDED` | 429    | Too many requests (100/min limit)     |
| `EXTERNAL_API_ERROR`  | 503    | Streaming API temporarily unavailable |
| `CONTENT_NOT_FOUND`   | 404    | Requested content not available       |

## Rate Limits

- **Authenticated requests**: 100 requests per minute per user
- **Recommendation requests**: 20 requests per minute per user
- **Search requests**: 50 requests per minute per user

Rate limit headers are included in all responses:

```http
X-RateLimit-Limit: 100
X-RateLimit-Remaining: 95
X-RateLimit-Reset: 1642248600
```

## Webhooks

Subscribe to events for real-time updates:

### Available Events

- `recommendation.generated` - New recommendation created
- `user.feedback.submitted` - User provided feedback
- `content.classification.updated` - Food-friendly score updated

### Webhook Payload

```json
{
  "event": "recommendation.generated",
  "timestamp": "2024-01-15T10:30:00Z",
  "data": {
    "userId": "uuid",
    "recommendationId": "uuid",
    "contentId": "uuid",
    "context": {}
  }
}
```

## SDKs and Libraries

### JavaScript/TypeScript

```bash
npm install @quickpick/sdk
```

```javascript
import { MealStream } from '@mealstream/sdk'

const client = new MealStream({
  apiKey: 'your_api_key',
  baseUrl: 'https://mealstream.vercel.app',
})

const recommendations = await client.getRecommendations({
  context: {
    viewingParty: 'alone',
    attentionLevel: 'background',
    contentPreference: 'comedy',
    duration: 'meal',
  },
  platforms: ['netflix', 'prime'],
})
```

### Python

```bash
pip install mealstream-sdk
```

```python
from mealstream import MealStream

client = MealStream(api_key='your_api_key')

recommendations = client.get_recommendations(
    context={
        'viewing_party': 'alone',
        'attention_level': 'background',
        'content_preference': 'comedy',
        'duration': 'meal'
    },
    platforms=['netflix', 'prime']
)
```

## Testing

### Postman Collection

Import our Postman collection for easy API testing:

```
https://api.mealstream.app/postman/collection.json
```

### Test Environment

Use our sandbox environment for development:

```
Base URL: https://api-sandbox.mealstream.app
Test API Key: test_sk_1234567890abcdef
```

## Support

- **Documentation**: https://docs.mealstream.app
- **Status Page**: https://status.mealstream.app
- **Support Email**: api-support@mealstream.app
- **Discord**: https://discord.gg/mealstream
