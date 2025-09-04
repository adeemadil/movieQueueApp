# QuickPick - Streaming Decision Helper

**North Star Metric:** Time from app open to content selection (Target: <30 seconds)

A lightning-fast, context-aware streaming content recommendation app designed to solve decision paralysis when you want to quickly find something to watch while eating. Get personalized recommendations in under 30 seconds.

**Core Hypothesis:** "People waste 10-20 minutes deciding what to watch while eating because existing solutions don't understand eating context, leading to cold food and frustration."

> **Project Status:** 📋 Specification Complete | 🚧 Ready for Implementation  
> **Development Environment:** Kiro AI Assistant with MCP Integration Enabled

## 🎯 Problem Statement

Stop spending 10-20 minutes browsing Netflix, Prime, Disney+, and other platforms while your food gets cold. This app provides "food-friendly" content recommendations that match your viewing context, attention level, and available time.

## 📊 Success Metrics

- **Primary**: 80% of users make a selection within 30 seconds
- **Secondary**: 60% of users return for 3+ sessions within first week
- **Tertiary**: Average user session leads to actual content consumption

## ⚠️ Key Constraints

- Netflix/Disney+ APIs are restricted - must work around this limitation
- Mobile-first experience (70% of usage expected on mobile)
- Must work across all major streaming platforms
- Cannot store or access user passwords/login credentials
- Must respect streaming platform Terms of Service

## ✨ Key Features

### 🚀 Lightning Fast Decisions

- Get recommendations in under 30 seconds
- Emergency "Quick Pick" for instant decisions
- One-tap access to streaming platforms
- Maximum 3 options per screen to prevent choice overload

### 🍽️ Food-Friendly Content Classification

- Proprietary scoring system (1-10) for eating-while-watching suitability
- Filters out subtitle-heavy content (anime, foreign films)
- Excludes complex plots requiring full attention
- Identifies content with eating scenes or food triggers

### 🎭 Context-Aware Recommendations

- **Viewing Party**: Alone, with partner, friends, or family
- **Attention Level**: Background viewing or focused content
- **Content Preference**: Continue series, comedy, documentary, or comfort viewing
- **Duration**: Quick snack (15-30 min), meal (30-60 min), or extended viewing (60+ min)

### 📱 Mobile-Obsessed Design

- Progressive Web App (PWA) optimized for mobile-first experience
- Thumb-reachable navigation zones for one-hand operation
- Large touch targets (minimum 44px) for easy interaction while eating
- Portrait mode optimization with readable interface
- Dark mode optimized for evening viewing

## 🎯 UX Design Principles

Following our core UX commandments for optimal eating-while-watching experience:

### Speed Beats Choice

- **3 options maximum** per selection screen
- **No infinite scroll** or complex filters
- **One-tap selections** preferred over multi-step flows

### Context is King

- Every recommendation considers **who's eating and watching**
- **"Food-friendly" classification** takes precedence over general popularity
- **Time of day and meal context** influence suggestions

### Forgiveness First

- Easy **"try again" options** without losing context
- **Undo for accidental selections**
- **Graceful degradation** when APIs fail
- **Clear error messages** with next steps

### Learn Quietly

- **Track preferences** without explicit user input
- **Improve recommendations** over time
- **Never make learning feel like work** for the user

### Respect the Moment

- **No unnecessary notifications** or interruptions
- **Fast loading** with skeleton screens
- **Immediate feedback** on all interactions
- **Exit gracefully** to streaming platforms

### Forbidden Patterns

❌ Complex onboarding flows  
❌ Modal dialogs that block the main flow  
❌ Auto-playing videos (users are eating)  
❌ Social features that add friction  
❌ Any feature that adds >5 seconds to core flow

## 🏗️ Architecture

### Technology Stack

Following our technical north star of "Fast, Reliable, Scalable, Maintainable":

- **Frontend**: Next.js 14+ (App Router) + TypeScript + Tailwind CSS + Framer Motion
- **Backend**: Next.js API routes (serverless) + TypeScript + JWT authentication
- **Database**: PostgreSQL (ACID compliance) + Redis (multi-layer caching)
- **APIs**: Streaming Availability API (primary) + TMDB (secondary) + manual fallback
- **State Management**: Zustand (client) + SWR (server state)
- **Deployment**: Vercel (full-stack PWA) + Cloudflare CDN

### Premium Design System (2025)

**"Warm Evening" Visual Identity:**

- **Color Palette**: Deep evening blues (#0A0E27 to #6366F1) with warm amber accents (#FF8C42) and food-friendly greens (#10B981)
- **Typography**: Inter font family with eating-optimized scales (16px+ base, 24px+ for meal contexts)
- **Spacing**: 8px base grid with generous touch targets (44px minimum) and comfortable white space
- **Glassmorphism**: Subtle backdrop-filter blur effects (12px-16px) with transparency overlays for premium depth
- **Motion Design**: Smooth micro-animations (75ms-200ms) with custom easing curves for premium feel
- **Component Architecture**: Comprehensive atomic design system with tokens, atoms, molecules, and organisms
- **Iconography**: Custom icon set with streaming platform branding and unique food-friendly visual language

### Core Components

```
┌─────────────────┐    ┌─────────────────┐    ┌─────────────────┐
│   Client Apps   │    │   API Gateway   │    │   Core Services │
│                 │    │                 │    │                 │
│ • PWA (Mobile)  │◄──►│ • Rate Limiting │◄──►│ • Recommendation│
│ • Web (Desktop) │    │ • Authentication│    │ • Classification│
│ • Tablet        │    │ • Load Balancer │    │ • User Profile  │
└─────────────────┘    └─────────────────┘    └─────────────────┘
```

## 🚀 Quick Start

### Development with Kiro AI Assistant

This project is optimized for development with Kiro AI Assistant and includes comprehensive specifications:

- **Requirements**: `.kiro/specs/streaming-decision-helper/requirements.md` - 15 detailed requirements with acceptance criteria
- **Design**: `.kiro/specs/streaming-decision-helper/design.md` - Complete technical architecture and UI/UX specifications
- **Tasks**: `.kiro/specs/streaming-decision-helper/tasks.md` - 20-step implementation plan ready for execution
- **Steering**: `.kiro/steering/` - AI guidance documents for consistent development approach and business strategy

### Prerequisites

- Node.js 18+
- PostgreSQL 14+
- Redis 6+
- Kiro AI Assistant (recommended for guided development)

### Installation

```bash
# Clone the repository
git clone https://github.com/your-username/streaming-decision-helper.git
cd streaming-decision-helper

# Install dependencies
npm install

# Set up environment variables
cp .env.example .env
# Edit .env with your API keys and database URLs

# Set up database
npm run db:migrate
npm run db:seed

# Start development servers
npm run dev
```

### Development with Kiro AI Assistant

This project is fully configured for AI-assisted development:

```bash
# Kiro AI Assistant Features Available:
# - MCP Integration: Enabled in .kiro/settings/mcp.json
# - Comprehensive Specs: Complete requirements, design, and tasks
# - Steering Rules: AI guidance for consistent development approach
# - VS Code Integration: Optimized settings in .vscode/settings.json

# Use Kiro chat interface with context:
# Reference files: #File .kiro/specs/streaming-decision-helper/tasks.md
# Reference folders: #Folder .kiro/specs
# Reference current problems: #Problems
# Reference terminal output: #Terminal
# Reference git changes: #Git Diff
# Scan entire codebase: #Codebase (once indexed)
```

### Kiro Configuration Status

- ✅ **MCP Enabled**: Model Context Protocol integration active
- ✅ **Steering Rules**: 7 guidance documents for consistent AI behavior
- ✅ **Specifications**: Complete requirements, design, and implementation plan
- ✅ **VS Code Integration**: Kiro extension configured and ready
- ✅ **Agent Hooks**: Available for automated workflows (see Explorer > Agent Hooks)

### Environment Variables

```env
# Database
DATABASE_URL=postgresql://username:password@localhost:5432/streaming_helper
REDIS_URL=redis://localhost:6379

# External APIs
STREAMING_AVAILABILITY_API_KEY=your_key_here
TMDB_API_KEY=your_key_here

# Authentication
JWT_SECRET=your_jwt_secret_here
NEXTAUTH_SECRET=your_nextauth_secret_here

# App Configuration
NEXT_PUBLIC_APP_URL=http://localhost:3000
```

## 📊 Food-Friendly Scoring Algorithm

The core innovation is our proprietary scoring system that rates content from 1-10 based on:

- **Subtitle Intensity** (40% weight): Heavy subtitles = lower score
- **Plot Complexity** (30% weight): Complex narratives = lower score
- **Visual Intensity** (20% weight): Fast cuts/action = lower score
- **Eating Scenes** (10% weight): Food content = potential triggers

### Example Scores

- **High Score (8-10)**: The Office, Friends, cooking shows, nature documentaries
- **Medium Score (6-7)**: Marvel movies, sitcoms, reality TV
- **Low Score (1-5)**: Anime with subtitles, psychological thrillers, art films

## 🎯 User Journey

1. **Quick Context** (10 seconds)
   - Who's watching? (alone/partner/friends/family)
   - Attention level? (background/focused)
   - What mood? (continue series/comedy/documentary/comfort)
   - How long? (snack/meal/extended)
   - **Maximum 3 taps** with smart defaults to reduce interaction

2. **Smart Recommendations** (5 seconds)
   - **3 curated options maximum** with food-friendly scores
   - Platform availability based on your subscriptions
   - One-tap launch to streaming service
   - **No auto-playing videos** - respectful of eating context

3. **Emergency Backup** (if over 30 seconds)
   - Prominent **"Quick Pick" button** for instant recommendation
   - Based on your viewing history and preferences
   - **Automatic prompt** after 30 seconds without pressure

## 🔒 Privacy & Security

- **Data Minimization**: Only essential viewing preferences stored
- **Encryption**: AES-256 for data at rest, TLS 1.3 in transit
- **No Sharing**: Personal data never shared with external APIs
- **GDPR Compliant**: Right to deletion, data export, consent management
- **Secure Auth**: JWT tokens with refresh rotation

## 📱 API Documentation

### Core Endpoints

#### Get Recommendations

```http
POST /api/recommendations
Content-Type: application/json
Authorization: Bearer <token>

{
  "context": {
    "viewingParty": "alone",
    "attentionLevel": "background",
    "contentPreference": "comedy",
    "duration": "meal"
  },
  "platforms": ["netflix", "prime", "disney"],
  "maxResults": 5
}
```

#### Emergency Quick Pick

```http
GET /api/recommendations/quick-pick
Authorization: Bearer <token>
```

#### Update Food-Friendly Score

```http
POST /api/content/{contentId}/feedback
Content-Type: application/json
Authorization: Bearer <token>

{
  "satisfied": true,
  "foodFriendlyRating": 8
}
```

## 🧪 Testing

### Running Tests

```bash
# Unit tests
npm run test

# Integration tests
npm run test:integration

# E2E tests
npm run test:e2e

# Performance tests
npm run test:performance
```

### Test Coverage

- **Target**: 90% code coverage for core services
- **Focus**: Recommendation algorithm, classification logic, context validation
- **Performance**: <3s response time for 95% of requests

## 📈 Performance Targets

- **Decision Time**: <30 seconds total user journey
- **API Response**: <3 seconds for recommendations
- **Load Capacity**: 1000+ concurrent users
- **Availability**: 99.9% uptime
- **Mobile Performance**: Lighthouse score >90

## 🛠️ Development

### Project Structure

```
streaming-decision-helper/
├── .kiro/                   # Kiro AI Assistant configuration
│   ├── settings/           # MCP and other Kiro settings
│   ├── specs/              # Complete product specifications
│   │   └── streaming-decision-helper/
│   │       ├── requirements.md  # 15 detailed requirements
│   │       ├── design.md       # Technical architecture & UI/UX
│   │       └── tasks.md        # 20-step implementation plan
│   └── steering/           # AI guidance documents
│       ├── project-strategy.md     # North star & constraints
│       ├── business-strategy.md    # Business model & growth strategy
│       ├── ux-commandments.md      # UX principles & forbidden patterns
│       ├── technical-architecture.md # Core architecture decisions
│       ├── tech.md                # Technology stack
│       └── structure.md           # Project organization
├── apps/
│   ├── web/                # Next.js frontend (to be implemented)
│   └── api/                # Express.js backend (to be implemented)
├── packages/
│   ├── ui/                 # Shared UI components (to be implemented)
│   ├── database/           # Database schemas & migrations (to be implemented)
│   └── shared/             # Shared utilities & types (to be implemented)
├── docs/                   # Comprehensive documentation
│   ├── API.md             # Complete API documentation
│   ├── DEPLOYMENT.md      # Production deployment guide
│   └── UX-GUIDELINES.md   # Detailed UX implementation guide
└── .vscode/               # VS Code configuration with Kiro integration
```

### Key Scripts

```bash
npm run dev          # Start development servers
npm run build        # Build for production
npm run deploy       # Deploy to production
npm run db:migrate   # Run database migrations
npm run db:seed      # Seed database with sample data
```

## 🤝 Contributing

1. Fork the repository
2. Create a feature branch (`git checkout -b feature/amazing-feature`)
3. Commit your changes (`git commit -m 'Add amazing feature'`)
4. Push to the branch (`git push origin feature/amazing-feature`)
5. Open a Pull Request

### Development Guidelines

- Follow TypeScript strict mode
- Maintain 90%+ test coverage
- Use conventional commits
- Update documentation for new features
- Leverage Kiro AI Assistant for guided development
- Follow UX commandments in `.kiro/steering/ux-commandments.md`
- Reference comprehensive specs in `.kiro/specs/streaming-decision-helper/`
- Align with business strategy in `.kiro/steering/business-strategy.md`

## 📄 License

This project is licensed under the MIT License - see the [LICENSE](LICENSE) file for details.

## 📋 Implementation Status

### Specification Phase ✅ Complete

- [x] **Requirements Document**: 15 comprehensive requirements with acceptance criteria
- [x] **Design Document**: Complete technical architecture, UI/UX specifications, and component library
- [x] **Implementation Plan**: 20-step task breakdown ready for development
- [x] **Business Strategy**: 3-phase growth plan with monetization roadmap
- [x] **UX Commandments**: Strict principles for eating-while-watching context
- [x] **API Documentation**: Complete endpoint specifications and error handling
- [x] **Deployment Guide**: Production deployment strategy and monitoring setup

### Development Phase 🚧 Ready to Start

- [ ] **Project Setup**: Next.js 14+ with TypeScript and comprehensive Tailwind CSS design tokens
- [ ] **Database Schema**: PostgreSQL with Redis caching layer and optimized content metadata
- [ ] **Authentication System**: NextAuth.js with JWT tokens and secure session management
- [ ] **Premium Design System**: Complete component library with glassmorphism effects and "Warm Evening" palette
- [ ] **External APIs**: Streaming Availability API and TMDB integration with fallback systems
- [ ] **Food-Friendly Algorithm**: Content classification system (1-10 scoring) with animated leaf indicators
- [ ] **Context Capture**: 3-tap maximum interface with large colorful cards and haptic feedback
- [ ] **Recommendation Engine**: Context-aware algorithm with 30-second target and emergency Quick Pick
- [ ] **Mobile Optimization**: One-hand operation, thumb-reachable navigation, and portrait-first design
- [ ] **Premium Interactions**: Smooth micro-animations, gesture support, and satisfying feedback loops
- [ ] **Performance**: <3s API responses, <1.5s First Contentful Paint, Core Web Vitals optimization
- [ ] **Accessibility**: WCAG 2.1 AA compliance with screen reader support and motor accessibility
- [ ] **Testing**: Unit, integration, and E2E tests for 30-second user journey validation
- [ ] **Deployment**: Production deployment with monitoring, scaling, and performance tracking

### Next Steps

1. **Initialize Project**: Run task 1 from `.kiro/specs/streaming-decision-helper/tasks.md`
2. **Set Up Database**: Configure PostgreSQL and Redis (tasks 2-3)
3. **Build Core Components**: Implement design system and context capture (tasks 4-8)
4. **Develop Recommendation Engine**: Build food-friendly classification and algorithm (tasks 6, 9-10)
5. **Optimize Performance**: Ensure 30-second decision target is met (tasks 12, 15, 19)

## 🙏 Acknowledgments

- [Streaming Availability API](https://www.movieofthenight.com/about/api) for platform data
- [The Movie Database (TMDB)](https://www.themoviedb.org/documentation/api) for content metadata
- [Kiro AI Assistant](https://kiro.ai) for comprehensive development assistance and specification creation

---

**Made with ❤️ for people who just want to eat and watch something good without the endless scrolling.**

> **Ready to build?** Use Kiro AI Assistant to execute the implementation plan step by step. Reference `#File .kiro/specs/streaming-decision-helper/tasks.md` to get started with guided development.
