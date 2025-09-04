# Design Document

## Overview

MealStream is a mobile-first web application designed to provide lightning-fast, context-aware streaming content recommendations optimized for eating scenarios. The system prioritizes speed, simplicity, and "food-friendly" content classification to solve decision paralysis in under 30 seconds.

The application follows a progressive web app (PWA) architecture to ensure cross-platform compatibility while maintaining native-like performance. The core innovation lies in the proprietary "Food-Friendly" scoring algorithm and ultra-fast recommendation engine.

## Architecture

### High-Level System Architecture

```
┌─────────────────┐    ┌─────────────────┐    ┌─────────────────┐
│   Client Apps   │    │   API Gateway   │    │   Core Services │
│                 │    │                 │    │                 │
│ • PWA (Mobile)  │◄──►│ • Rate Limiting │◄──►│ • Recommendation│
│ • Web (Desktop) │    │ • Authentication│    │ • Classification│
│ • Tablet        │    │ • Load Balancer │    │ • User Profile  │
└─────────────────┘    └─────────────────┘    └─────────────────┘
                                │                        │
                                ▼                        ▼
                       ┌─────────────────┐    ┌─────────────────┐
                       │  External APIs  │    │   Data Layer    │
                       │                 │    │                 │
                       │ • Streaming     │    │ • PostgreSQL    │
                       │   Availability  │    │ • Redis Cache   │
                       │ • TMDB          │    │ • Content DB    │
                       └─────────────────┘    └─────────────────┘
```

### Technology Stack

**Frontend:**

- Next.js 14+ (App Router) for full-stack React framework
- TypeScript for type safety and modern development
- Tailwind CSS with custom design tokens for rapid, consistent styling
- Framer Motion for smooth micro-animations (200ms duration max)
- Zustand for client state management, SWR for server state
- PWA capabilities with service workers for offline functionality

**Backend:**

- Next.js API routes for serverless backend
- TypeScript for full-stack type safety
- JWT for stateless authentication
- Rate limiting with exponential backoff

**Database:**

- PostgreSQL for relational data (users, preferences, viewing history)
- Redis for caching recommendations and session data
- Content metadata stored in optimized JSON columns

**External Integrations:**

- Streaming Availability API for platform content data
- The Movie Database (TMDB) API for content metadata
- Fallback to web scraping for missing platform data

## Components and Interfaces

### Core Components

#### 1. Context Capture Engine

```typescript
interface ViewingContext {
  viewingParty: 'alone' | 'partner' | 'friends' | 'family'
  attentionLevel: 'background' | 'focused'
  contentPreference: 'continue' | 'comedy' | 'documentary' | 'comfort'
  duration: 'snack' | 'meal' | 'extended'
  timestamp: Date
}

interface ContextCaptureService {
  captureContext(userId: string): Promise<ViewingContext>
  getQuickContext(userId: string): Promise<ViewingContext> // Uses last session
  validateContext(context: ViewingContext): boolean
}
```

#### 2. Food-Friendly Classification System

```typescript
interface FoodFriendlyScore {
  overallScore: number // 1-10 scale
  subtitleIntensity: number // 0-1 (0 = no subtitles, 1 = heavy subtitles)
  plotComplexity: number // 0-1 (0 = simple, 1 = complex)
  visualIntensity: number // 0-1 (0 = calm, 1 = intense visuals)
  eatingScenes: boolean // Contains eating/food scenes
  reasoning: string[]
}

interface ClassificationService {
  classifyContent(contentId: string): Promise<FoodFriendlyScore>
  batchClassify(contentIds: string[]): Promise<Map<string, FoodFriendlyScore>>
  updateClassification(contentId: string, userFeedback: number): Promise<void>
}
```

#### 3. Recommendation Engine

```typescript
interface RecommendationRequest {
  userId: string
  context: ViewingContext
  platforms: string[]
  excludeWatched: boolean
  maxResults: number
}

interface ContentRecommendation {
  contentId: string
  title: string
  type: 'movie' | 'series' | 'episode'
  platform: string
  foodFriendlyScore: number
  matchScore: number
  duration: number
  thumbnailUrl: string
  directLink: string
  reasoning: string
}

interface RecommendationService {
  getRecommendations(
    request: RecommendationRequest
  ): Promise<ContentRecommendation[]>
  getEmergencyPick(
    userId: string,
    platforms: string[]
  ): Promise<ContentRecommendation>
  recordSelection(
    userId: string,
    contentId: string,
    satisfied: boolean
  ): Promise<void>
}
```

#### 4. Premium UI Component System

**Design Token Architecture:**

```typescript
interface DesignTokens {
  colors: {
    primary: { 50: '#F0F4FF'; 500: '#0A0E27'; 900: '#020617' }
    accent: { 50: '#FFF7ED'; 500: '#FF8C42'; 900: '#C2410C' }
    success: { 50: '#ECFDF5'; 500: '#10B981'; 900: '#064E3B' }
    semantic: {
      foodFriendly: '#10B981'
      warning: '#F59E0B'
      error: '#EF4444'
    }
  }
  typography: {
    fontFamily: 'Inter, system-ui, sans-serif'
    scales: {
      xs: '12px'
      sm: '14px'
      base: '16px'
      lg: '18px'
      xl: '20px'
      '2xl': '24px'
    }
    weights: { normal: 400; medium: 500; semibold: 600; bold: 700 }
  }
  spacing: {
    xs: '4px'
    sm: '8px'
    md: '16px'
    lg: '24px'
    xl: '32px'
    '2xl': '48px'
  }
  borderRadius: {
    sm: '4px'
    md: '8px'
    lg: '12px'
    xl: '16px'
    '2xl': '24px'
  }
  shadows: {
    sm: '0 1px 2px rgba(0,0,0,0.05)'
    md: '0 4px 6px rgba(0,0,0,0.07)'
    lg: '0 10px 15px rgba(0,0,0,0.1)'
    glass: '0 8px 32px rgba(0,0,0,0.12)'
  }
}
```

**Context Selection Interface:**

- **Progressive Disclosure Cards**: Large, colorful selection cards (120px height) with glassmorphism effects
- **One-Hand Optimization**: All interactive elements within 75% of screen height for thumb reach
- **Smart Defaults**: AI-powered suggestions based on time of day, weather, and user patterns
- **Visual Hierarchy**: Clear primary/secondary actions with size and color differentiation
- **Haptic Feedback**: Subtle vibration on selection with visual confirmation animations
- **Maximum 3 Taps**: Streamlined flow with intelligent context inference

**Recommendation Display System:**

- **Hero Card Layout**: Large primary recommendation (60% width) with two smaller alternatives
- **Food-Friendly Scoring**: Animated leaf icons with color-coded scoring (green=excellent, amber=good)
- **Platform Integration**: Native-feeling launch buttons with platform-specific styling
- **Quick Pick Prominence**: Always-visible floating action button with pulsing animation after 25 seconds
- **Content Previews**: High-quality thumbnails with subtle hover/press states
- **Zero Auto-Play**: Respectful of eating context with manual preview activation

**Comprehensive Component Library:**

**Button System:**

```typescript
interface ButtonComponent {
  // Variants for different use cases
  variants: {
    primary: {
      background: 'gradient-to-r from-primary-600 to-primary-700'
      color: 'white'
      shadow: 'lg'
      hover: 'transform scale-105 shadow-primaryGlow'
      active: 'transform scale-95'
    }
    secondary: {
      background: 'glass-primary'
      color: 'neutral-100'
      border: '1px solid rgba(255,255,255,0.2)'
      hover: 'background-opacity-90 border-opacity-40'
    }
    accent: {
      background: 'gradient-to-r from-accent-500 to-accent-600'
      color: 'white'
      shadow: 'accentGlow'
      hover: 'transform scale-105'
    }
    ghost: {
      background: 'transparent'
      color: 'neutral-300'
      hover: 'background-neutral-800/50'
    }
    emergency: {
      background: 'gradient-to-r from-red-500 to-red-600'
      color: 'white'
      animation: 'pulse-slow'
      shadow: '2xl'
    }
  }

  // Size variants optimized for touch
  sizes: {
    sm: { height: '36px'; padding: '8px 16px'; fontSize: 'sm' }
    md: { height: '44px'; padding: '12px 24px'; fontSize: 'base' }
    lg: { height: '52px'; padding: '16px 32px'; fontSize: 'lg' }
    xl: { height: '60px'; padding: '20px 40px'; fontSize: 'xl' }
    hero: { height: '72px'; padding: '24px 48px'; fontSize: '2xl' }
  }

  // Interactive states
  states: {
    default: 'cursor-pointer transition-all duration-150'
    hover: 'transform scale-105 shadow-lg'
    pressed: 'transform scale-95'
    disabled: 'opacity-50 cursor-not-allowed'
    loading: 'cursor-wait opacity-75'
  }
}
```

**Card System:**

```typescript
interface CardComponent {
  variants: {
    recommendation: {
      background: 'glass-primary'
      padding: '24px'
      borderRadius: 'xl'
      shadow: 'glass'
      hover: 'transform translateY(-4px) shadow-glassHover'
      transition: 'all 200ms ease-out'
    }
    context: {
      background: 'gradient-to-br from-primary-900/50 to-primary-800/30'
      padding: '32px'
      borderRadius: '2xl'
      border: '2px solid transparent'
      hover: 'border-primary-400 transform scale-105'
      active: 'border-primary-300 transform scale-95'
    }
    platform: {
      background: 'neutral-800/80'
      padding: '16px'
      borderRadius: 'lg'
      border: '1px solid neutral-700'
      hover: 'border-accent-400 shadow-md'
    }
    glass: {
      background: 'glass-elevated'
      backdropFilter: 'blur(16px)'
      border: '1px solid rgba(255,255,255,0.1)'
      shadow: 'glass'
    }
  }

  elevations: {
    flat: 'shadow-none'
    raised: 'shadow-md hover:shadow-lg'
    floating: 'shadow-xl hover:shadow-2xl transform hover:-translate-y-1'
  }

  interactions: {
    static: 'cursor-default'
    pressable: 'cursor-pointer active:transform active:scale-95'
    swipeable: 'touch-pan-x cursor-grab active:cursor-grabbing'
  }
}
```

**Food-Friendly Indicator System:**

```typescript
interface FoodFriendlyIndicator {
  // Visual representation of food-friendliness
  scoreDisplay: {
    1-3: {
      color: 'red-500';
      icon: 'leaf-outline';
      label: 'Attention Required';
      animation: 'none';
    };
    4-6: {
      color: 'amber-500';
      icon: 'leaf-half';
      label: 'Moderate Focus';
      animation: 'pulse-gentle';
    };
    7-8: {
      color: 'success-500';
      icon: 'leaf-solid';
      label: 'Food Friendly';
      animation: 'bounce-subtle';
    };
    9-10: {
      color: 'success-400';
      icon: 'leaf-sparkle';
      label: 'Perfect for Eating';
      animation: 'glow-pulse';
    };
  };

  styles: {
    minimal: {
      display: 'icon-only';
      size: '16px';
      position: 'top-right-corner';
    };
    detailed: {
      display: 'icon-score-label';
      size: '24px';
      layout: 'horizontal';
      showReasoning: true;
    };
    badge: {
      display: 'score-in-circle';
      size: '32px';
      background: 'score-color';
      position: 'overlay';
    };
  };

  animations: {
    static: 'no-animation';
    pulse: 'animate-pulse duration-2000';
    grow: 'hover:scale-110 transition-transform';
    glow: 'animate-glow-pulse shadow-successGlow';
  };
}
```

**Loading State System:**

```typescript
interface LoadingComponent {
  skeletonScreens: {
    recommendationCard: {
      layout: 'thumbnail-title-description-score'
      shimmer: 'gradient-animation'
      duration: '1.5s'
      colors: ['neutral-800', 'neutral-700', 'neutral-800']
    }
    contextSelection: {
      layout: 'three-large-buttons'
      shimmer: 'pulse-animation'
      stagger: '100ms-delay-between-items'
    }
    contentList: {
      layout: 'repeated-card-grid'
      count: 6
      shimmer: 'wave-animation'
    }
  }

  progressiveLoading: {
    imageLoading: {
      placeholder: 'blur-gradient'
      transition: 'fade-in 300ms'
      fallback: 'platform-logo'
    }
    contentLoading: {
      order: ['title', 'thumbnail', 'score', 'description']
      stagger: '50ms'
      animation: 'slide-up-fade-in'
    }
  }

  spinners: {
    primary: {
      type: 'rotating-gradient-ring'
      size: '24px'
      colors: ['primary-500', 'accent-500']
      speed: '1s'
    }
    minimal: {
      type: 'pulsing-dots'
      count: 3
      color: 'neutral-400'
      timing: 'staggered'
    }
  }
}
```

**Navigation System:**

```typescript
interface NavigationComponent {
  bottomNavigation: {
    position: 'fixed-bottom'
    background: 'glass-primary'
    height: '72px'
    safeArea: 'padding-bottom-env(safe-area-inset-bottom)'
    items: [
      { icon: 'home'; label: 'Quick Pick'; active: true },
      { icon: 'history'; label: 'History' },
      { icon: 'settings'; label: 'Settings' },
    ]
    activeIndicator: 'accent-gradient-background'
  }

  topNavigation: {
    position: 'sticky-top'
    background: 'glass-subtle'
    height: '56px'
    backButton: {
      position: 'left'
      size: '44px'
      icon: 'chevron-left'
      haptic: 'light-impact'
    }
    title: {
      position: 'center'
      typography: 'font-semibold text-lg'
      color: 'neutral-100'
    }
  }

  gestureNavigation: {
    swipeBack: {
      trigger: 'swipe-right-from-edge'
      threshold: '50px'
      animation: 'slide-right-fade-out'
    }
    pullToRefresh: {
      trigger: 'pull-down-from-top'
      threshold: '80px'
      indicator: 'rotating-refresh-icon'
    }
  }
}
```

**Input System:**

```typescript
interface InputComponent {
  searchInput: {
    background: 'glass-primary'
    border: '2px solid transparent'
    borderRadius: 'xl'
    padding: '16px 20px'
    fontSize: 'lg'
    placeholder: 'neutral-400'
    focus: 'border-primary-400 shadow-primaryGlow'
    icon: {
      position: 'left'
      type: 'search'
      color: 'neutral-400'
    }
  }

  selectionButtons: {
    multiChoice: {
      layout: 'grid-auto-fit-120px'
      gap: '12px'
      button: {
        height: '80px'
        background: 'glass-primary'
        border: '2px solid transparent'
        borderRadius: 'lg'
        selected: 'border-accent-400 background-accent-500/20'
        hover: 'transform scale-105'
      }
    }

    quickPick: {
      size: 'hero'
      position: 'center-screen'
      background: 'gradient-accent'
      shadow: 'accentGlow'
      animation: 'pulse-after-30s'
      text: 'Just Pick Something!'
    }
  }
}
```

**Modal and Overlay System:**

```typescript
interface OverlayComponent {
  // Note: Avoid modals per UX commandments, use slide-up panels instead
  slideUpPanel: {
    background: 'glass-elevated'
    borderRadius: 'top-2xl'
    animation: 'slide-up-from-bottom 200ms ease-out'
    backdrop: 'backdrop-blur-sm bg-black/50'
    handle: {
      width: '40px'
      height: '4px'
      background: 'neutral-400'
      borderRadius: 'full'
      position: 'top-center'
      margin: '12px'
    }
  }

  toast: {
    position: 'top-safe-area'
    background: 'glass-primary'
    borderRadius: 'lg'
    padding: '16px 20px'
    animation: 'slide-down-fade-in 200ms'
    autoHide: '4s'
    variants: {
      success: 'border-l-4 border-success-500'
      error: 'border-l-4 border-red-500'
      info: 'border-l-4 border-primary-500'
    }
  }

  contextMenu: {
    background: 'glass-elevated'
    borderRadius: 'md'
    shadow: 'xl'
    animation: 'scale-in-fade-in 150ms'
    items: {
      padding: '12px 16px'
      hover: 'background-neutral-700/50'
      icon: 'left-aligned'
      text: 'font-medium'
    }
  }
}
```

**Premium Visual Design System (2025):**

**Color System - "Warm Evening" Palette:**

```typescript
const colorTokens = {
  // Primary - Deep Evening Blues
  primary: {
    50: '#F0F4FF', // Lightest blue for backgrounds
    100: '#E0E7FF', // Light blue for subtle elements
    200: '#C7D2FE', // Medium light for borders
    300: '#A5B4FC', // Medium for inactive states
    400: '#818CF8', // Medium active for secondary actions
    500: '#6366F1', // Primary brand color
    600: '#4F46E5', // Primary hover state
    700: '#4338CA', // Primary pressed state
    800: '#3730A3', // Dark primary
    900: '#312E81', // Darkest primary
    950: '#0A0E27', // Near black for text
  },

  // Accent - Warm Amber for Energy
  accent: {
    50: '#FFF7ED', // Lightest amber background
    100: '#FFEDD5', // Light amber for highlights
    200: '#FED7AA', // Medium light amber
    300: '#FDBA74', // Medium amber for warnings
    400: '#FB923C', // Medium active amber
    500: '#FF8C42', // Primary accent color
    600: '#EA580C', // Accent hover
    700: '#C2410C', // Accent pressed
    800: '#9A3412', // Dark accent
    900: '#7C2D12', // Darkest accent
  },

  // Success - Food-Friendly Green
  success: {
    50: '#ECFDF5', // Lightest green background
    100: '#D1FAE5', // Light green for success states
    200: '#A7F3D0', // Medium light green
    300: '#6EE7B7', // Medium green
    400: '#34D399', // Medium active green
    500: '#10B981', // Primary success/food-friendly
    600: '#059669', // Success hover
    700: '#047857', // Success pressed
    800: '#065F46', // Dark success
    900: '#064E3B', // Darkest success
  },

  // Semantic Colors
  semantic: {
    foodFriendly: '#10B981', // Green for food-friendly content
    attentionRequired: '#F59E0B', // Amber for attention-heavy content
    subtitleHeavy: '#EF4444', // Red for subtitle-heavy content
    comfortViewing: '#8B5CF6', // Purple for comfort content
    background: '#020617', // Deep navy background
    surface: '#0F172A', // Slightly lighter surface
    surfaceElevated: '#1E293B', // Elevated surface color
  },

  // Neutral Grays
  neutral: {
    50: '#F8FAFC', // Pure white alternative
    100: '#F1F5F9', // Light gray background
    200: '#E2E8F0', // Light gray borders
    300: '#CBD5E1', // Medium light gray
    400: '#94A3B8', // Medium gray for placeholders
    500: '#64748B', // Medium gray for secondary text
    600: '#475569', // Dark gray for primary text
    700: '#334155', // Darker gray
    800: '#1E293B', // Very dark gray
    900: '#0F172A', // Near black
    950: '#020617', // Pure black alternative
  },
}
```

**Typography System - "Readable Comfort":**

```typescript
const typographyTokens = {
  fontFamily: {
    primary: [
      'Inter',
      'system-ui',
      '-apple-system',
      'BlinkMacSystemFont',
      'sans-serif',
    ],
    display: ['Inter', 'system-ui', 'sans-serif'], // For headings
    mono: ['JetBrains Mono', 'Menlo', 'Monaco', 'Consolas', 'monospace'],
  },

  // Eating-optimized scale (larger for readability while eating)
  fontSize: {
    xs: '12px', // Small labels
    sm: '14px', // Secondary text
    base: '16px', // Body text (minimum for eating)
    lg: '18px', // Large body text
    xl: '20px', // Small headings
    '2xl': '24px', // Medium headings (eating-friendly)
    '3xl': '30px', // Large headings
    '4xl': '36px', // Display headings
    '5xl': '48px', // Hero text
    '6xl': '60px', // Large display
  },

  fontWeight: {
    light: 300,
    normal: 400,
    medium: 500,
    semibold: 600,
    bold: 700,
    extrabold: 800,
  },

  lineHeight: {
    tight: 1.25, // For headings
    snug: 1.375, // For large text
    normal: 1.5, // For body text
    relaxed: 1.625, // For comfortable reading
    loose: 2, // For very relaxed reading
  },

  letterSpacing: {
    tighter: '-0.05em',
    tight: '-0.025em',
    normal: '0em',
    wide: '0.025em',
    wider: '0.05em',
    widest: '0.1em',
  },
}
```

**Spacing System - "Comfortable Touch":**

```typescript
const spacingTokens = {
  // Base 8px grid system
  spacing: {
    px: '1px',
    0: '0px',
    0.5: '2px',
    1: '4px',
    1.5: '6px',
    2: '8px', // Base unit
    2.5: '10px',
    3: '12px',
    3.5: '14px',
    4: '16px', // Common spacing
    5: '20px',
    6: '24px', // Medium spacing
    7: '28px',
    8: '32px', // Large spacing
    9: '36px',
    10: '40px',
    11: '44px', // Minimum touch target
    12: '48px', // Comfortable touch target
    14: '56px', // Large touch target
    16: '64px', // Extra large spacing
    20: '80px', // Section spacing
    24: '96px', // Large section spacing
    28: '112px',
    32: '128px',
    36: '144px',
    40: '160px',
    44: '176px',
    48: '192px',
    52: '208px',
    56: '224px',
    60: '240px',
    64: '256px',
    72: '288px',
    80: '320px',
    96: '384px',
  },

  // Touch-friendly sizing
  touchTargets: {
    minimum: '44px', // WCAG minimum
    comfortable: '48px', // Recommended
    large: '56px', // For primary actions
    extraLarge: '64px', // For emergency actions
  },
}
```

**Border Radius System - "Soft Modern":**

```typescript
const borderRadiusTokens = {
  none: '0px',
  sm: '4px', // Small elements
  base: '8px', // Default radius
  md: '12px', // Medium elements
  lg: '16px', // Large cards
  xl: '20px', // Extra large cards
  '2xl': '24px', // Hero elements
  '3xl': '32px', // Large hero elements
  full: '9999px', // Pills and circles
}
```

**Shadow System - "Elevated Depth":**

```typescript
const shadowTokens = {
  // Standard shadows
  sm: '0 1px 2px rgba(0, 0, 0, 0.05)',
  base: '0 1px 3px rgba(0, 0, 0, 0.1), 0 1px 2px rgba(0, 0, 0, 0.06)',
  md: '0 4px 6px rgba(0, 0, 0, 0.07), 0 2px 4px rgba(0, 0, 0, 0.06)',
  lg: '0 10px 15px rgba(0, 0, 0, 0.1), 0 4px 6px rgba(0, 0, 0, 0.05)',
  xl: '0 20px 25px rgba(0, 0, 0, 0.1), 0 10px 10px rgba(0, 0, 0, 0.04)',
  '2xl': '0 25px 50px rgba(0, 0, 0, 0.25)',

  // Glassmorphism shadows
  glass: '0 8px 32px rgba(0, 0, 0, 0.12)',
  glassHover: '0 12px 40px rgba(0, 0, 0, 0.15)',

  // Colored shadows for depth
  primaryGlow: '0 0 20px rgba(99, 102, 241, 0.3)',
  accentGlow: '0 0 20px rgba(255, 140, 66, 0.3)',
  successGlow: '0 0 20px rgba(16, 185, 129, 0.3)',

  // Inner shadows
  inner: 'inset 0 2px 4px rgba(0, 0, 0, 0.06)',
  innerLg: 'inset 0 4px 8px rgba(0, 0, 0, 0.1)',
}
```

**Glassmorphism Effects:**

```css
/* Primary glass effect for cards */
.glass-primary {
  background: rgba(15, 23, 42, 0.8);
  backdrop-filter: blur(12px) saturate(180%);
  border: 1px solid rgba(255, 255, 255, 0.1);
  box-shadow: 0 8px 32px rgba(0, 0, 0, 0.12);
}

/* Elevated glass for floating elements */
.glass-elevated {
  background: rgba(30, 41, 59, 0.9);
  backdrop-filter: blur(16px) saturate(200%);
  border: 1px solid rgba(255, 255, 255, 0.15);
  box-shadow: 0 12px 40px rgba(0, 0, 0, 0.15);
}

/* Subtle glass for backgrounds */
.glass-subtle {
  background: rgba(2, 6, 23, 0.6);
  backdrop-filter: blur(8px) saturate(150%);
  border: 1px solid rgba(255, 255, 255, 0.05);
}
```

**Motion Design System:**

```typescript
const motionTokens = {
  // Duration scale
  duration: {
    instant: '75ms', // Immediate feedback
    fast: '100ms', // Quick transitions
    normal: '150ms', // Standard transitions
    slow: '200ms', // Deliberate transitions
    slower: '300ms', // Complex animations
    slowest: '500ms', // Hero animations
  },

  // Easing curves
  easing: {
    linear: 'linear',
    easeIn: 'cubic-bezier(0.4, 0, 1, 1)',
    easeOut: 'cubic-bezier(0, 0, 0.2, 1)',
    easeInOut: 'cubic-bezier(0.4, 0, 0.2, 1)',

    // Custom curves for premium feel
    bounce: 'cubic-bezier(0.68, -0.55, 0.265, 1.55)',
    smooth: 'cubic-bezier(0.25, 0.46, 0.45, 0.94)',
    snappy: 'cubic-bezier(0.4, 0, 0.6, 1)',
    gentle: 'cubic-bezier(0.25, 0.1, 0.25, 1)',
  },

  // Transform presets
  transforms: {
    slideUp: 'translateY(20px)',
    slideDown: 'translateY(-20px)',
    slideLeft: 'translateX(20px)',
    slideRight: 'translateX(-20px)',
    scaleIn: 'scale(0.95)',
    scaleOut: 'scale(1.05)',
    fadeIn: 'opacity(0)',
    rotateIn: 'rotate(-5deg) scale(0.95)',
  },
}
```

**Iconography System:**

- **Streaming Platforms**: High-quality SVG icons for Netflix, Disney+, Amazon Prime, Hulu, HBO Max, Apple TV+
- **Food-Friendly Indicators**: Animated leaf icons with growth states (1-10 scale)
- **Content Types**: Movie, series, documentary, comedy, drama icons
- **Context Icons**: Utensils for easy eating, eye for attention level, clock for duration
- **Action Icons**: Play, pause, heart, thumbs up/down, share, settings
- **Navigation**: Chevrons, arrows, hamburger menu, close, back
- **Status Icons**: Loading spinners, checkmarks, warning triangles, info circles

## Data Models

### User Profile

```sql
CREATE TABLE users (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  email VARCHAR(255) UNIQUE NOT NULL,
  password_hash VARCHAR(255) NOT NULL,
  created_at TIMESTAMP DEFAULT NOW(),
  updated_at TIMESTAMP DEFAULT NOW(),
  preferences JSONB DEFAULT '{}',
  platforms TEXT[] DEFAULT ARRAY[]::TEXT[]
);
```

### Content Metadata

```sql
CREATE TABLE content (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  external_id VARCHAR(255) NOT NULL,
  title VARCHAR(500) NOT NULL,
  type content_type NOT NULL,
  release_year INTEGER,
  duration_minutes INTEGER,
  genres TEXT[],
  platforms JSONB DEFAULT '{}',
  food_friendly_score JSONB,
  metadata JSONB DEFAULT '{}',
  created_at TIMESTAMP DEFAULT NOW(),
  updated_at TIMESTAMP DEFAULT NOW()
);

CREATE INDEX idx_content_platforms ON content USING GIN (platforms);
CREATE INDEX idx_content_food_score ON content ((food_friendly_score->>'overallScore'));
```

### Viewing History

```sql
CREATE TABLE viewing_history (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  user_id UUID REFERENCES users(id) ON DELETE CASCADE,
  content_id UUID REFERENCES content(id),
  watched_at TIMESTAMP DEFAULT NOW(),
  completion_percentage DECIMAL(5,2),
  user_rating INTEGER CHECK (user_rating >= 1 AND user_rating <= 5),
  context JSONB,
  satisfied BOOLEAN
);
```

### Recommendation Cache

```sql
CREATE TABLE recommendation_cache (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  cache_key VARCHAR(255) UNIQUE NOT NULL,
  recommendations JSONB NOT NULL,
  created_at TIMESTAMP DEFAULT NOW(),
  expires_at TIMESTAMP NOT NULL
);

CREATE INDEX idx_cache_expiry ON recommendation_cache (expires_at);
```

## Error Handling

### API Error Handling Strategy

1. **Graceful Degradation**: When external APIs fail, serve cached recommendations
2. **Circuit Breaker Pattern**: Temporarily disable failing API endpoints
3. **Fallback Chain**: Streaming API → TMDB → Local cache → Emergency recommendations
4. **User Communication**: Clear, non-technical error messages with suggested actions

### Error Response Format

```typescript
interface ErrorResponse {
  error: {
    code: string
    message: string
    details?: any
    timestamp: string
    requestId: string
  }
  fallback?: {
    type: 'cached' | 'emergency' | 'partial'
    data?: any
  }
}
```

### Critical Error Scenarios

- **API Rate Limit Exceeded**: Serve cached results, implement exponential backoff
- **Database Connection Lost**: Use Redis cache, graceful degradation to read-only mode
- **Classification Service Down**: Use pre-computed scores, disable real-time classification
- **User Authentication Failed**: Clear session, redirect to login with context preservation
- **30-Second Timeout**: Automatically trigger emergency Quick Pick recommendation
- **Network Connectivity Issues**: Serve cached recommendations with offline indicator

## Advanced Interaction Design

### Motion Design System

```typescript
interface MotionTokens {
  durations: {
    instant: '100ms' // Micro-feedback
    quick: '150ms' // Button states
    smooth: '200ms' // Page transitions
    relaxed: '300ms' // Complex animations
  }
  easings: {
    standard: 'cubic-bezier(0.4, 0, 0.2, 1)'
    decelerate: 'cubic-bezier(0, 0, 0.2, 1)'
    accelerate: 'cubic-bezier(0.4, 0, 1, 1)'
    bounce: 'cubic-bezier(0.68, -0.55, 0.265, 1.55)'
  }
  transforms: {
    slideUp: 'translateY(20px) → translateY(0)'
    scaleIn: 'scale(0.95) → scale(1)'
    fadeIn: 'opacity(0) → opacity(1)'
    glassBlur: 'backdrop-filter: blur(0) → blur(12px)'
  }
}
```

### Comprehensive Screen Designs and User Flows

**1. Splash Screen and Onboarding:**

```typescript
interface SplashScreen {
  design: {
    background: 'gradient-radial from-primary-900 via-primary-950 to-black'
    logo: {
      type: 'animated-wordmark'
      animation: 'fade-in-scale 800ms ease-out'
      color: 'gradient-to-r from-accent-400 to-accent-600'
    }
    tagline: {
      text: 'Find something perfect for your meal'
      typography: 'text-xl font-light text-neutral-300'
      animation: 'slide-up-fade-in 600ms delay-400ms'
    }
    loadingIndicator: {
      type: 'minimal-dots'
      position: 'bottom-center'
      color: 'accent-400'
    }
  }

  onboarding: {
    screens: [
      {
        title: 'Quick Decisions'
        subtitle: 'Find something to watch in under 30 seconds'
        illustration: 'clock-with-food-icons'
        animation: 'gentle-bounce'
      },
      {
        title: 'Food-Friendly Content'
        subtitle: 'No subtitles, no complex plots while you eat'
        illustration: 'leaf-with-play-button'
        animation: 'grow-pulse'
      },
      {
        title: 'All Your Platforms'
        subtitle: 'Works with Netflix, Disney+, Prime, and more'
        illustration: 'platform-logos-grid'
        animation: 'stagger-fade-in'
      },
    ]
    navigation: {
      skipButton: 'top-right ghost-button'
      nextButton: 'bottom-right primary-button'
      progressIndicator: 'bottom-center dots'
    }
  }
}
```

**2. Context Selection Interface:**

```typescript
interface ContextSelectionScreen {
  layout: {
    header: {
      title: "What's the vibe?"
      subtitle: 'Just 3 quick taps'
      progress: 'step-indicator (1/3, 2/3, 3/3)'
    }

    selectionGrid: {
      columns: 'auto-fit-minmax(140px, 1fr)'
      gap: '16px'
      padding: '24px'
      maxWidth: '480px'
      margin: 'auto'
    }

    footer: {
      quickPickButton: {
        text: 'Just Pick Something!'
        style: 'emergency-variant'
        visibility: 'hidden-until-25s'
        animation: 'pulse-glow-after-delay'
      }
    }
  }

  contextCards: {
    viewingParty: [
      {
        id: 'alone'
        icon: 'person-outline'
        title: 'Solo Dining'
        subtitle: 'Just me'
        color: 'primary-gradient'
      },
      {
        id: 'partner'
        icon: 'people-outline'
        title: 'Date Night'
        subtitle: 'With partner'
        color: 'accent-gradient'
      },
      {
        id: 'family'
        icon: 'family-outline'
        title: 'Family Time'
        subtitle: 'Everyone'
        color: 'success-gradient'
      },
    ]

    attentionLevel: [
      {
        id: 'background'
        icon: 'eye-off-outline'
        title: 'Background'
        subtitle: 'While eating'
        indicator: 'food-friendly-high'
      },
      {
        id: 'focused'
        icon: 'eye-outline'
        title: 'Focused'
        subtitle: 'Full attention'
        indicator: 'attention-required'
      },
    ]

    duration: [
      {
        id: 'snack'
        icon: 'clock-15'
        title: 'Quick Bite'
        subtitle: '15-30 min'
        examples: 'Episodes, shorts'
      },
      {
        id: 'meal'
        icon: 'clock-45'
        title: 'Full Meal'
        subtitle: '30-90 min'
        examples: 'Movies, specials'
      },
      {
        id: 'extended'
        icon: 'clock-plus'
        title: 'Long Session'
        subtitle: '90+ min'
        examples: 'Binge watching'
      },
    ]
  }

  interactions: {
    cardSelection: {
      feedback: 'haptic-light + scale-animation'
      transition: 'slide-to-next-step 200ms'
      validation: 'require-one-selection-per-step'
    }

    gestureSupport: {
      swipeLeft: 'next-step'
      swipeRight: 'previous-step'
      doubleTap: 'quick-select-and-advance'
    }
  }
}
```

**3. Recommendation Display Interface:**

```typescript
interface RecommendationScreen {
  layout: {
    header: {
      contextSummary: {
        text: 'Solo • Background • 30 min'
        style: 'glass-pill neutral-text'
        editButton: 'pencil-icon tap-to-modify'
      }

      quickPickButton: {
        position: 'top-right'
        style: 'floating-action-button'
        animation: 'pulse-after-25s'
        size: '56px'
      }
    }

    recommendationGrid: {
      layout: 'hero-card + two-secondary'
      heroCard: {
        width: '100%'
        height: '240px'
        position: 'top'
        prominence: 'primary-recommendation'
      }

      secondaryCards: {
        width: '48%'
        height: '180px'
        layout: 'side-by-side'
        gap: '4%'
      }
    }

    footer: {
      refreshButton: {
        text: 'Show me different options'
        style: 'ghost-button'
        icon: 'refresh-outline'
      }

      emergencyPick: {
        text: "I can't decide - pick for me!"
        style: 'emergency-button'
        visibility: 'show-after-30s'
      }
    }
  }

  recommendationCard: {
    structure: {
      thumbnail: {
        aspectRatio: '16:9'
        borderRadius: 'lg'
        overlay: 'gradient-bottom-fade'
        fallback: 'platform-logo-placeholder'
      }

      foodFriendlyScore: {
        position: 'top-right-overlay'
        style: 'animated-leaf-badge'
        tooltip: 'tap-for-reasoning'
      }

      content: {
        title: {
          typography: 'text-lg font-semibold'
          lines: 'max-2-with-ellipsis'
          color: 'neutral-100'
        }

        metadata: {
          duration: 'text-sm neutral-400'
          genre: 'text-sm neutral-400'
          year: 'text-sm neutral-400'
          separator: '•'
        }

        description: {
          typography: 'text-sm font-normal'
          lines: 'max-3-with-ellipsis'
          color: 'neutral-300'
          visibility: 'hero-card-only'
        }
      }

      actionButton: {
        text: 'Watch on [Platform]'
        style: 'platform-branded-button'
        icon: 'platform-logo'
        fullWidth: true
        height: '48px'
      }
    }

    interactions: {
      cardTap: 'expand-details-panel'
      buttonTap: 'launch-platform-with-animation'
      longPress: 'show-context-menu'
      swipe: 'dismiss-recommendation'
    }
  }

  emptyStates: {
    noRecommendations: {
      illustration: 'confused-food-character'
      title: 'Hmm, nothing perfect right now'
      subtitle: "Let's try different preferences"
      actions: ['Adjust Context', 'Emergency Pick', 'Browse All Content']
    }

    apiError: {
      illustration: 'disconnected-wifi-food'
      title: 'Connection hiccup'
      subtitle: 'Here are some cached favorites'
      fallbackContent: 'show-cached-recommendations'
    }
  }
}
```

**4. Platform Integration and Handoff:**

```typescript
interface PlatformHandoff {
  launchAnimation: {
    sequence: [
      'card-scale-up 150ms',
      'platform-logo-grow 100ms',
      'screen-fade-to-platform-color 200ms',
      'launch-external-app',
    ]

    feedback: {
      haptic: 'medium-impact'
      visual: 'platform-color-flash'
      audio: 'subtle-success-chime (optional)'
    }
  }

  fallbackHandling: {
    appNotInstalled: {
      action: 'open-web-version'
      message: 'Opening in browser'
      toast: 'Consider installing the app for better experience'
    }

    deepLinkFailed: {
      action: 'open-platform-homepage'
      message: 'Opening platform'
      guidance: 'Search for "[content-title]"'
    }
  }

  returnExperience: {
    backgroundDetection: 'detect-app-return'
    welcomeBack: {
      message: 'How was it?'
      quickRating: 'thumbs-up/down'
      nextRecommendation: 'auto-suggest-similar'
    }
  }
}
```

**5. Settings and Personalization:**

```typescript
interface SettingsScreen {
  layout: {
    sections: [
      {
        title: 'Streaming Platforms'
        items: ['platform-toggle-list', 'add-new-platform-button']
      },
      {
        title: 'Preferences'
        items: [
          'food-friendly-sensitivity-slider',
          'default-context-settings',
          'quick-pick-behavior',
        ]
      },
      {
        title: 'Accessibility'
        items: [
          'text-size-selector',
          'high-contrast-toggle',
          'reduced-motion-toggle',
          'haptic-feedback-toggle',
        ]
      },
      {
        title: 'Data & Privacy'
        items: [
          'viewing-history-management',
          'data-export-button',
          'delete-account-button',
        ]
      },
    ]
  }

  platformToggle: {
    design: {
      layout: 'logo + name + toggle-switch'
      spacing: 'comfortable-touch-targets'
      feedback: 'immediate-visual-confirmation'
    }

    states: {
      enabled: 'full-color-logo + green-toggle'
      disabled: 'grayscale-logo + gray-toggle'
      loading: 'skeleton-placeholder'
    }
  }
}
```

### Innovative Interaction Patterns

**Ultra-Fast Context Selection:**

- **Gesture-Based Selection**: Swipe gestures for rapid context switching with haptic feedback
- **Predictive Interface**: AI-powered context pre-selection based on time, weather, and usage patterns
- **Voice Integration**: Optional "Hey MealStream" voice commands for hands-free operation while eating
- **Smart Shortcuts**: Prominent "Usual Setup" button that learns and adapts to user patterns
- **Contextual Defaults**: Intelligent pre-selection based on meal time (breakfast = lighter content, dinner = longer content)

**Food-Friendly Visual Language:**

- **Animated Scoring**: Leaf icons that grow, pulse, and change color based on food-friendliness (1-10 scale)
- **Contextual Indicators**: Utensil icons for "easy eating" content, eye icons for attention requirements
- **Attention Meters**: Visual progress bars showing required focus level with color coding
- **Comfort Badges**: Special warm-colored indicators for familiar, comforting content
- **Eating Scene Warnings**: Subtle indicators for content with prominent eating scenes that might affect appetite

**Progressive Disclosure System:**

- **Layered Information**: Essential info (title, platform, score) first, details (plot, cast) on demand
- **Smart Defaults**: Intelligent pre-selection to reduce decision points from 10+ to 3 maximum
- **Contextual Help**: Just-in-time guidance tooltips that appear only when users hesitate
- **Adaptive Complexity**: Interface automatically simplifies based on user confidence and speed
- **Emergency Simplification**: After 25 seconds, interface reduces to single "Quick Pick" option

**Premium Micro-Interactions:**

- **Satisfying Feedback**: Every tap produces appropriate haptic feedback with visual confirmation
- **Contextual Animations**: Different animation styles based on content mood (bouncy for comedy, smooth for drama)
- **Anticipatory Loading**: Content starts loading before user completes selection based on hover/focus patterns
- **Emotional Resonance**: Visual elements subtly respond to user satisfaction and engagement levels
- **Seamless Transitions**: No jarring cuts between screens, everything flows with purpose and elegance

### Accessibility and Inclusive Design

**Universal Design Principles:**

```typescript
interface AccessibilityFeatures {
  visualAccessibility: {
    highContrast: boolean
    largeText: '100%' | '125%' | '150%' | '200%'
    reducedMotion: boolean
    colorBlindSupport: 'protanopia' | 'deuteranopia' | 'tritanopia'
  }
  motorAccessibility: {
    touchTargetSize: 'standard' | 'large' | 'extra-large'
    dwellTime: number // For switch navigation
    gestureAlternatives: boolean
    oneHandMode: boolean
  }
  cognitiveAccessibility: {
    simplifiedLanguage: boolean
    extendedTimeouts: boolean
    consistentNavigation: boolean
    errorPrevention: boolean
  }
  auditoryAccessibility: {
    screenReaderOptimized: boolean
    hapticFeedback: boolean
    visualIndicators: boolean
  }
}
```

**Multi-Generational Support:**

- **Adaptive Complexity**: Interface complexity adjusts to user tech comfort level automatically
- **Clear Visual Hierarchy**: Obvious primary actions with secondary options de-emphasized through size and color
- **Familiar Patterns**: Uses established UI conventions while adding innovation thoughtfully
- **Generous Spacing**: Comfortable touch targets and visual breathing room for all age groups

### Responsive Design System and Breakpoints

**Breakpoint Strategy:**

```typescript
const breakpoints = {
  // Mobile-first approach
  mobile: {
    min: '320px',
    max: '767px',
    layout: 'single-column',
    navigation: 'bottom-tabs',
    contextCards: 'full-width-stack',
    recommendations: 'single-column-hero-plus-two',
  },

  // Large mobile and small tablets
  tablet: {
    min: '768px',
    max: '1023px',
    layout: 'adaptive-two-column',
    navigation: 'side-rail-or-bottom',
    contextCards: 'two-column-grid',
    recommendations: 'three-column-equal',
  },

  // Desktop and large tablets
  desktop: {
    min: '1024px',
    max: '1440px',
    layout: 'three-column-with-sidebar',
    navigation: 'persistent-sidebar',
    contextCards: 'three-column-grid',
    recommendations: 'hero-plus-four-grid',
  },

  // Large desktop
  largeDesktop: {
    min: '1441px',
    layout: 'centered-max-width-1200px',
    navigation: 'persistent-sidebar',
    contextCards: 'four-column-grid',
    recommendations: 'hero-plus-six-grid',
  },
}
```

**Mobile-First Optimizations:**

```typescript
interface MobileOptimizations {
  touchTargets: {
    minimum: '44px'
    comfortable: '48px'
    primary: '56px'
    emergency: '64px'
  }

  thumbZones: {
    easyReach: 'bottom-75%-of-screen'
    stretchReach: 'top-25%-of-screen'
    primaryActions: 'place-in-easy-reach'
    secondaryActions: 'place-in-stretch-reach'
  }

  oneHandOperation: {
    navigationPlacement: 'bottom-of-screen'
    backButton: 'top-left-large-target'
    quickPick: 'floating-bottom-right'
    contextCards: 'thumb-swipeable'
  }

  portraitOptimization: {
    primaryOrientation: 'portrait'
    landscapeSupport: 'adaptive-layout'
    rotationHandling: 'maintain-state-smooth-transition'
  }
}
```

**Tablet Adaptations:**

```typescript
interface TabletOptimizations {
  landscapeLayout: {
    sidebar: 'persistent-context-panel'
    mainArea: 'recommendation-grid'
    navigation: 'top-bar-with-tabs'
  }

  portraitLayout: {
    layout: 'mobile-like-but-wider'
    contextCards: 'two-column-comfortable'
    recommendations: 'larger-cards-more-detail'
  }

  touchOptimizations: {
    hoverStates: 'disabled-on-touch'
    tapTargets: 'slightly-larger-than-mobile'
    gestures: 'swipe-pinch-support'
  }
}
```

**Desktop Enhancements:**

```typescript
interface DesktopOptimizations {
  keyboardNavigation: {
    tabOrder: 'logical-left-to-right-top-to-bottom'
    shortcuts: {
      Space: 'quick-pick'
      Enter: 'select-highlighted'
      Escape: 'go-back'
      'Arrow Keys': 'navigate-cards'
    }
    focusIndicators: 'prominent-visible-outline'
  }

  mouseInteractions: {
    hover: 'subtle-elevation-and-glow'
    click: 'immediate-feedback'
    rightClick: 'contextual-menu'
    scroll: 'smooth-momentum'
  }

  layoutEnhancements: {
    sidebar: 'persistent-platform-list'
    mainArea: 'larger-recommendation-cards'
    details: 'hover-preview-panels'
  }
}
```

### Advanced Accessibility Implementation

**WCAG 2.1 AA Compliance:**

```typescript
interface AccessibilityFeatures {
  colorAndContrast: {
    minimumContrast: '4.5:1-for-normal-text'
    largeTextContrast: '3:1-for-18px-plus'
    colorIndependence: 'never-rely-solely-on-color'
    colorBlindSupport: 'patterns-and-icons-supplement-color'
  }

  keyboardAccessibility: {
    tabNavigation: 'all-interactive-elements'
    skipLinks: 'skip-to-main-content'
    focusManagement: 'logical-focus-order'
    noKeyboardTraps: 'always-escapable'
  }

  screenReaderSupport: {
    semanticHTML: 'proper-heading-structure'
    ariaLabels: 'descriptive-labels-for-all-controls'
    liveRegions: 'announce-dynamic-content-changes'
    landmarks: 'navigation-main-complementary-regions'
  }

  motorAccessibility: {
    largeTargets: 'minimum-44px-touch-targets'
    spacing: 'adequate-space-between-targets'
    timeouts: 'generous-or-adjustable-time-limits'
    motionReduction: 'respect-prefers-reduced-motion'
  }
}
```

**Inclusive Design Patterns:**

```typescript
interface InclusiveDesign {
  cognitiveAccessibility: {
    simpleLanguage: 'clear-concise-instructions'
    consistentPatterns: 'same-actions-same-locations'
    errorPrevention: 'validate-before-submission'
    clearFeedback: 'immediate-understandable-responses'
  }

  visualAccessibility: {
    textScaling: 'support-up-to-200%-zoom'
    highContrast: 'alternative-high-contrast-theme'
    focusIndicators: 'clearly-visible-focus-states'
    animationControl: 'disable-animations-option'
  }

  auditoryAccessibility: {
    noAutoAudio: 'never-auto-play-sound'
    visualAlternatives: 'visual-feedback-for-audio-cues'
    captionSupport: 'support-platform-captions'
  }
}
```

### Component Documentation and Style Guide

**Design Token Documentation:**

```typescript
interface DesignTokenDocumentation {
  colorUsage: {
    primary: 'Brand identity, primary actions, focus states'
    accent: 'Call-to-action, highlights, energy elements'
    success: 'Food-friendly indicators, positive feedback'
    semantic: 'Status communication, contextual meaning'
    neutral: 'Text, backgrounds, borders, subtle elements'
  }

  typographyGuidelines: {
    headings: 'Use semibold weight, generous line-height'
    body: 'Minimum 16px for eating contexts, normal weight'
    labels: 'Medium weight for emphasis, 14px minimum'
    captions: 'Use sparingly, 12px minimum, high contrast'
  }

  spacingPrinciples: {
    touchTargets: 'Always minimum 44px for interactive elements'
    cardPadding: 'Generous internal spacing for comfort'
    gridGaps: 'Consistent 16px gaps for visual rhythm'
    sectionSpacing: 'Clear separation between content areas'
  }
}
```

**Component Usage Guidelines:**

```typescript
interface ComponentGuidelines {
  buttons: {
    primary: 'Use for main actions, maximum one per screen'
    secondary: 'Use for alternative actions, multiple allowed'
    ghost: 'Use for subtle actions, navigation elements'
    emergency: 'Use only for Quick Pick after timeout'
  }

  cards: {
    recommendation: 'Content display with food-friendly scoring'
    context: 'User selection with clear visual feedback'
    platform: 'Service selection with branding respect'
    glass: 'Overlay content with backdrop blur'
  }

  indicators: {
    foodFriendly: 'Always visible on content cards'
    loading: 'Use skeleton screens for better perceived performance'
    progress: 'Show completion state for multi-step flows'
    status: 'Communicate system state clearly'
  }
}
```

### Animation and Motion Guidelines

**Motion Design Principles:**

```typescript
interface MotionPrinciples {
  purposefulMotion: {
    guideFocus: 'Direct attention to important elements'
    provideContext: 'Show relationships between elements'
    giveFeedback: 'Confirm user actions immediately'
    expressPersonality: 'Reinforce brand warmth and friendliness'
  }

  performanceFirst: {
    duration: 'Keep under 200ms for UI feedback'
    easing: 'Use consistent easing curves'
    transforms: 'Prefer transform over layout changes'
    reducedMotion: 'Respect user preferences always'
  }

  emotionalResonance: {
    gentle: 'Soft, welcoming animations for onboarding'
    snappy: 'Quick, responsive feedback for interactions'
    satisfying: 'Rewarding animations for completions'
    calming: 'Smooth, predictable transitions'
  }
}
```

**Animation Implementation:**

```css
/* Core animation utilities */
@keyframes gentle-bounce {
  0%,
  100% {
    transform: translateY(0);
  }
  50% {
    transform: translateY(-4px);
  }
}

@keyframes glow-pulse {
  0%,
  100% {
    box-shadow: 0 0 20px rgba(16, 185, 129, 0.3);
  }
  50% {
    box-shadow: 0 0 30px rgba(16, 185, 129, 0.5);
  }
}

@keyframes slide-up-fade-in {
  from {
    opacity: 0;
    transform: translateY(20px);
  }
  to {
    opacity: 1;
    transform: translateY(0);
  }
}

/* Respect reduced motion preferences */
@media (prefers-reduced-motion: reduce) {
  *,
  *::before,
  *::after {
    animation-duration: 0.01ms !important;
    animation-iteration-count: 1 !important;
    transition-duration: 0.01ms !important;
  }
}
```

### Implementation Guidelines and Best Practices

**Development Workflow:**

```typescript
interface DevelopmentGuidelines {
  componentDevelopment: {
    atomicDesign: 'Build tokens → atoms → molecules → organisms'
    testingStrategy: 'Unit tests for logic, visual regression for UI'
    documentation: 'Storybook for component showcase'
    accessibility: 'Test with screen readers and keyboard navigation'
  }

  performanceOptimization: {
    codesplitting: 'Lazy load non-critical components'
    imageOptimization: 'WebP with fallbacks, lazy loading'
    bundleSize: 'Monitor and optimize JavaScript bundles'
    caching: 'Aggressive caching for static assets'
  }

  qualityAssurance: {
    crossBrowser: 'Test on Safari, Chrome, Firefox, Edge'
    deviceTesting: 'Real device testing for touch interactions'
    performanceAudits: 'Regular Lighthouse audits'
    accessibilityAudits: 'Automated and manual accessibility testing'
  }
}
```

This comprehensive design system provides the foundation for creating a premium, accessible, and delightful streaming decision helper app that truly solves the problem of quick content selection while eating. The system prioritizes speed, accessibility, and emotional connection while maintaining cutting-edge 2025 design standards.

## Innovation Features and Premium Experience

### Cutting-Edge 2025 Design Elements

**Glassmorphism Implementation:**

```css
.glass-card {
  background: rgba(255, 255, 255, 0.08);
  backdrop-filter: blur(12px) saturate(180%);
  border: 1px solid rgba(255, 255, 255, 0.12);
  box-shadow: 0 8px 32px rgba(0, 0, 0, 0.12);
}
```

**Dynamic Visual Feedback:**

- **Contextual Animations**: Different animations based on content type and user mood
- **Adaptive Theming**: Subtle color shifts based on time of day and content genre
- **Micro-Interactions**: Satisfying feedback for every user action
- **Emotional Resonance**: Visual elements that respond to user satisfaction and engagement

**Premium Loading Experience:**

- **Skeleton Screens**: Content-aware loading placeholders that match final layout
- **Progressive Image Loading**: Blur-to-sharp transitions for content thumbnails
- **Staggered Animations**: Elegant reveal patterns for recommendation cards
- **Smart Preloading**: Anticipatory loading based on user behavior patterns
- **Performance Targets**: First Contentful Paint <1.5s, Largest Contentful Paint <2.5s per requirements

### Emotional Design Framework

**Warm and Supportive Tone:**

```typescript
interface EmotionalDesign {
  copyTone: {
    welcoming: 'Ready to find something perfect for your meal?'
    encouraging: 'Great choice! This pairs wonderfully with dinner.'
    supportive: "No worries, let's find something else you'll love."
    celebratory: 'Perfect! Enjoy your show and your meal! 🍽️'
  }
  visualMood: {
    colors: 'warm and inviting'
    illustrations: 'friendly and approachable'
    animations: 'gentle and reassuring'
    feedback: 'positive and encouraging'
  }
}
```

**Stress-Reduction Features:**

- **No Pressure Timing**: Gentle prompts without countdown anxiety
- **Positive Framing**: Focus on benefits rather than limitations
- **Confidence Building**: Clear feedback that builds user trust
- **Graceful Recovery**: Elegant handling of mistakes or changes of mind

## Testing Strategy

### Design System Testing

- **Visual Regression Testing**: Automated screenshot comparison across components
- **Accessibility Auditing**: Automated WCAG compliance testing with axe-core
- **Performance Testing**: Core Web Vitals monitoring for all interaction patterns
- **Cross-Device Testing**: Consistent experience across mobile, tablet, and desktop

### User Experience Validation

- **30-Second Challenge**: Timed usability testing for core user journey
- **Accessibility Testing**: Testing with actual users with disabilities
- **Multi-Generational Testing**: Validation across different age groups and tech comfort levels
- **Emotional Response Testing**: Measuring user satisfaction and delight metrics

### Component Library Testing

```typescript
describe('Design System Components', () => {
  test('FoodFriendlyIndicator renders correctly', () => {
    render(<FoodFriendlyIndicator score={8} style="detailed" />);
    expect(screen.getByRole('img', { name: /food friendly score/i })).toBeInTheDocument();
    expect(screen.getByText('8/10')).toBeInTheDocument();
  });

  test('Button meets accessibility requirements', () => {
    render(<Button variant="primary" size="lg">Select</Button>);
    const button = screen.getByRole('button');
    expect(button).toHaveStyle('min-height: 44px');
    expect(button).toHaveAttribute('aria-label');
  });
});
```

## Security and Privacy

### Authentication & Authorization

- **JWT Tokens**: Short-lived access tokens (15 minutes) with refresh tokens (7 days)
- **Password Security**: bcrypt with salt rounds of 12
- **Session Management**: Secure, httpOnly cookies for refresh tokens

### Data Protection

- **Encryption at Rest**: AES-256 encryption for sensitive user data
- **Encryption in Transit**: TLS 1.3 for all communications
- **Data Minimization**: Only collect essential viewing preferences and history

### Privacy Compliance

- **GDPR Compliance**: Right to deletion, data portability, consent management
- **Data Retention**: Automatic deletion of viewing history after 2 years
- **Third-Party Data**: No sharing of personal data with external APIs

### API Security

- **Rate Limiting**: 100 requests per minute per user
- **Input Validation**: Comprehensive sanitization and validation
- **CORS Policy**: Restrictive cross-origin resource sharing
- **Security Headers**: Comprehensive security header implementation
