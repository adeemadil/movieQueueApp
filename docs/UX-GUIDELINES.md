# UX Guidelines for MealStream

## Overview

MealStream follows strict UX commandments designed specifically for the eating-while-watching context. These principles ensure users can make content decisions in under 30 seconds without compromising their meal experience.

**North Star Metric:** Time from app open to content selection (Target: <30 seconds)

**Premium Design System (2025):** Built with comprehensive "Warm Evening" visual identity featuring deep evening blues, warm amber accents, and food-friendly greens. Includes glassmorphism effects, Inter typography optimized for eating contexts, 8px base grid spacing, and smooth micro-animations with custom easing curves for premium feel.

## Core UX Commandments

### 1. SPEED BEATS CHOICE

**Principle:** Reduce cognitive load by limiting options and streamlining interactions.

**Implementation:**

- ✅ Maximum 3 options per selection screen
- ✅ No infinite scroll or complex filters
- ✅ One-tap selections preferred over multi-step flows
- ✅ Smart defaults to reduce required interactions
- ✅ Progressive disclosure for advanced features

**Code Examples:**

```typescript
// API Response - Maximum 3 recommendations
interface RecommendationResponse {
  recommendations: ContentRecommendation[]; // Max length: 3
  quickPick?: ContentRecommendation; // Emergency option
}

// UI Component - Limited options
const ContextSelector = () => (
  <div className="grid grid-cols-1 gap-4 max-w-sm">
    {options.slice(0, 3).map(option => (
      <Button key={option.id} size="lg" className="min-h-[44px]">
        {option.label}
      </Button>
    ))}
  </div>
);
```

### 2. CONTEXT IS KING

**Principle:** Every recommendation must consider the eating and viewing context.

**Implementation:**

- ✅ Food-friendly classification takes precedence over popularity
- ✅ Time of day influences recommendations
- ✅ Viewing party size affects content selection
- ✅ Attention level determines content complexity
- ✅ Meal duration matches content length

**Context Factors:**

```typescript
interface ViewingContext {
  viewingParty: 'alone' | 'partner' | 'friends' | 'family'
  attentionLevel: 'background' | 'focused'
  mealType: 'snack' | 'meal' | 'extended'
  timeOfDay: 'morning' | 'afternoon' | 'evening' | 'late'
  foodType?: 'messy' | 'neat' | 'finger-food'
}

// Food-friendly scoring algorithm
const calculateFoodFriendlyScore = (content: Content): number => {
  let score = 10

  // Penalize subtitle-heavy content
  if (content.subtitleIntensity > 0.7) score -= 4

  // Penalize complex plots
  if (content.plotComplexity > 0.8) score -= 3

  // Penalize fast-paced visuals
  if (content.visualIntensity > 0.8) score -= 2

  // Bonus for familiar content
  if (content.isComfortViewing) score += 1

  return Math.max(1, Math.min(10, score))
}
```

### 3. MOBILE-OBSESSED DESIGN

**Principle:** Optimize for one-hand operation while eating.

**Implementation:**

- ✅ Thumb-reachable navigation zones (bottom 75% of screen)
- ✅ Large touch targets (minimum 44px)
- ✅ Portrait mode optimization
- ✅ Readable text while holding phone with one hand
- ✅ Haptic feedback for important interactions

**Design Specifications:**

```css
/* Premium Design System - Touch target sizing with glassmorphism */
.touch-target {
  min-height: 44px;
  min-width: 44px;
  padding: 12px 16px;
  background: rgba(15, 23, 42, 0.8);
  backdrop-filter: blur(12px) saturate(180%);
  border: 1px solid rgba(255, 255, 255, 0.1);
  border-radius: 12px;
  transition: all 150ms cubic-bezier(0.4, 0, 0.2, 1);
}

.touch-target:hover {
  transform: scale(1.05);
  box-shadow: 0 8px 32px rgba(0, 0, 0, 0.12);
}

/* Thumb-reachable zone with warm evening palette */
.thumb-zone {
  position: fixed;
  bottom: 0;
  left: 0;
  right: 0;
  height: 75vh;
  background: linear-gradient(to top, rgba(2, 6, 23, 0.9), transparent);
}

/* One-hand friendly navigation with premium styling */
.nav-primary {
  position: fixed;
  bottom: 24px;
  left: 50%;
  transform: translateX(-50%);
  max-width: 320px;
  background: rgba(30, 41, 59, 0.9);
  backdrop-filter: blur(16px) saturate(200%);
  border: 1px solid rgba(255, 255, 255, 0.15);
  border-radius: 24px;
  padding: 16px;
}

/* Food-friendly indicator with animated leaf icons */
.food-friendly-score {
  display: flex;
  align-items: center;
  gap: 8px;
  color: #10b981;
  font-weight: 600;
}

.food-friendly-score.excellent {
  animation: glow-pulse 2s infinite;
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
```

### 4. FORGIVENESS FIRST

**Principle:** Make it easy to recover from mistakes and handle failures gracefully.

**Implementation:**

- ✅ Easy "try again" options without losing context
- ✅ Undo functionality for accidental selections
- ✅ Graceful degradation when APIs fail
- ✅ Clear error messages with actionable next steps
- ✅ Fallback recommendations when primary sources fail

**Error Handling Pattern:**

```typescript
const RecommendationService = {
  async getRecommendations(
    context: ViewingContext
  ): Promise<RecommendationResponse> {
    try {
      // Primary recommendation source
      return await primaryAPI.getRecommendations(context)
    } catch (error) {
      try {
        // Fallback to cached recommendations
        const cached = await cache.getCachedRecommendations(context)
        if (cached) return { ...cached, source: 'cached' }

        // Emergency fallback
        return await this.getEmergencyRecommendations(context)
      } catch (fallbackError) {
        // Graceful degradation with user-friendly message
        return {
          recommendations: [],
          error: {
            message:
              "We're having trouble finding recommendations right now. Try again in a moment?",
            action: 'retry',
            canContinue: true,
          },
        }
      }
    }
  },
}
```

### 5. LEARN QUIETLY

**Principle:** Improve recommendations without burdening the user.

**Implementation:**

- ✅ Track preferences through implicit interactions
- ✅ Learn from selection patterns over time
- ✅ Never require explicit rating or feedback
- ✅ Improve accuracy through usage analytics
- ✅ Respect privacy while learning

**Implicit Learning:**

```typescript
// Track user behavior without explicit feedback
const trackImplicitFeedback = (interaction: UserInteraction) => {
  switch (interaction.type) {
    case 'recommendation_selected':
      // Positive signal - user chose this recommendation
      updatePreferences(interaction.userId, {
        genre: interaction.content.genre,
        foodFriendlyScore: interaction.content.foodFriendlyScore,
        weight: 1.2,
      })
      break

    case 'quick_pick_used':
      // User needed emergency option - learn from context
      updateContextPreferences(interaction.userId, interaction.context)
      break

    case 'recommendation_skipped':
      // Negative signal - avoid similar content
      updatePreferences(interaction.userId, {
        genre: interaction.content.genre,
        weight: 0.8,
      })
      break
  }
}
```

### 6. RESPECT THE MOMENT

**Principle:** Don't interrupt the eating experience.

**Implementation:**

- ✅ No unnecessary notifications or interruptions
- ✅ Fast loading with skeleton screens
- ✅ Immediate feedback on all interactions
- ✅ Graceful exit to streaming platforms
- ✅ No auto-playing videos (users are eating)

**Respectful Loading:**

```typescript
const RecommendationCard = ({ recommendation, loading }: Props) => {
  if (loading) {
    return (
      <div className="animate-pulse">
        <div className="h-32 bg-gray-200 rounded-lg mb-4" />
        <div className="h-4 bg-gray-200 rounded mb-2" />
        <div className="h-4 bg-gray-200 rounded w-2/3" />
      </div>
    );
  }

  return (
    <div className="recommendation-card">
      <img
        src={recommendation.thumbnail}
        alt={recommendation.title}
        loading="lazy"
        // No autoplay - respect eating context
      />
      <h3>{recommendation.title}</h3>
      <FoodFriendlyScore score={recommendation.foodFriendlyScore} />
    </div>
  );
};
```

## Forbidden Patterns

### ❌ Complex Onboarding Flows

**Why forbidden:** Users want to start eating immediately.
**Instead:** Use smart defaults and progressive disclosure.

### ❌ Modal Dialogs That Block Main Flow

**Why forbidden:** Interrupts the decision-making process.
**Instead:** Use inline editing and contextual actions.

### ❌ Auto-Playing Videos

**Why forbidden:** Distracting while eating, wastes bandwidth.
**Instead:** Manual preview activation with clear controls.

### ❌ Social Features That Add Friction

**Why forbidden:** Adds complexity to the core 30-second flow.
**Instead:** Focus on personal recommendations and preferences.

### ❌ Any Feature That Adds >5 Seconds to Core Flow

**Why forbidden:** Violates the 30-second decision target.
**Instead:** Move non-essential features to separate flows.

## Implementation Checklist

### For Developers

- [ ] All touch targets are minimum 44px
- [ ] Navigation elements are in thumb-reachable zones
- [ ] API responses limited to 3 recommendations maximum
- [ ] Error states include actionable recovery options
- [ ] Loading states use skeleton screens, not spinners
- [ ] No auto-playing media content
- [ ] Implicit user preference tracking implemented
- [ ] Graceful degradation for API failures
- [ ] Context-aware recommendation scoring
- [ ] Mobile-first responsive design

### For Designers

- [ ] Maximum 3 options per decision screen
- [ ] Clear visual hierarchy for food-friendly scoring
- [ ] Thumb-friendly button placement and sizing
- [ ] Consistent iconography for streaming platforms
- [ ] Dark mode optimized for evening eating
- [ ] Skeleton screens designed for actual content layout
- [ ] Error states are encouraging, not alarming
- [ ] Progressive disclosure for advanced features
- [ ] One-hand operation consideration in all layouts
- [ ] Haptic feedback patterns defined

### For Product Managers

- [ ] All features measured against 30-second target
- [ ] User research includes eating context scenarios
- [ ] Success metrics focus on decision speed
- [ ] Feature requests evaluated for core flow impact
- [ ] A/B tests consider mobile eating context
- [ ] User feedback collection is non-intrusive
- [ ] Platform partnerships respect eating use case
- [ ] Content classification includes food-friendly scoring
- [ ] Analytics track implicit preference signals
- [ ] Accessibility includes eating-while-using scenarios

## Testing Guidelines

### UX Testing Scenarios

1. **One-Hand Operation Test**: Can users complete core flow with one hand?
2. **Eating Simulation Test**: Test with users actually eating different foods
3. **30-Second Challenge**: Time users from app open to content selection
4. **Distraction Test**: Test usability with background distractions
5. **Error Recovery Test**: How quickly can users recover from mistakes?

### Performance Benchmarks

- **First Contentful Paint**: <1.5 seconds
- **Recommendation Generation**: <3 seconds
- **Quick Pick Response**: <1 second
- **Touch Response Time**: <100ms
- **Navigation Smoothness**: 60fps on mobile

## Accessibility Considerations

### Eating-Context Accessibility

- **Large Text**: Readable while eating (minimum 16px base)
- **High Contrast**: Visible in various lighting conditions
- **Voice Control**: Optional hands-free operation
- **Haptic Feedback**: Confirm actions without looking
- **Screen Reader**: Full compatibility for visually impaired users
- **Motor Accessibility**: Accommodate limited dexterity while eating

## Premium Design System Implementation

### Color System - "Warm Evening" Palette

**Primary Colors (Deep Evening Blues):**

- `primary-50`: #F0F4FF (Lightest backgrounds)
- `primary-500`: #6366F1 (Primary brand color)
- `primary-950`: #0A0E27 (Near black for text)

**Accent Colors (Warm Amber):**

- `accent-50`: #FFF7ED (Light amber backgrounds)
- `accent-500`: #FF8C42 (Primary accent color)
- `accent-900`: #7C2D12 (Darkest accent)

**Semantic Colors:**

- `success-500`: #10B981 (Food-friendly indicators)
- `warning-500`: #F59E0B (Attention-required content)
- `error-500`: #EF4444 (Subtitle-heavy content)

### Typography System - "Readable Comfort"

**Font Family:** Inter (system-ui fallback)
**Eating-Optimized Scale:**

- Base: 16px (minimum for eating contexts)
- Large: 18px (comfortable body text)
- Heading: 24px+ (eating-friendly headings)

**Implementation:**

```css
.text-eating-base {
  font-size: 16px;
  line-height: 1.5;
}
.text-eating-lg {
  font-size: 18px;
  line-height: 1.625;
}
.text-eating-xl {
  font-size: 24px;
  line-height: 1.375;
}
```

### Spacing System - "Comfortable Touch"

**8px Base Grid with Touch-Friendly Targets:**

- Minimum touch target: 44px (WCAG compliance)
- Comfortable touch target: 48px (recommended)
- Large touch target: 56px (primary actions)
- Emergency touch target: 64px (Quick Pick button)

### Glassmorphism Effects

**Primary Glass (Cards):**

```css
.glass-primary {
  background: rgba(15, 23, 42, 0.8);
  backdrop-filter: blur(12px) saturate(180%);
  border: 1px solid rgba(255, 255, 255, 0.1);
  box-shadow: 0 8px 32px rgba(0, 0, 0, 0.12);
}
```

**Elevated Glass (Floating Elements):**

```css
.glass-elevated {
  background: rgba(30, 41, 59, 0.9);
  backdrop-filter: blur(16px) saturate(200%);
  border: 1px solid rgba(255, 255, 255, 0.15);
  box-shadow: 0 12px 40px rgba(0, 0, 0, 0.15);
}
```

### Motion Design System

**Duration Scale:**

- Instant: 75ms (immediate feedback)
- Fast: 100ms (quick transitions)
- Normal: 150ms (standard transitions)
- Slow: 200ms (deliberate transitions)

**Custom Easing Curves:**

- Standard: `cubic-bezier(0.4, 0, 0.2, 1)`
- Bounce: `cubic-bezier(0.68, -0.55, 0.265, 1.55)`
- Smooth: `cubic-bezier(0.25, 0.46, 0.45, 0.94)`

### Component Library

**Button Variants:**

- Primary: Gradient with glow effect
- Secondary: Glass with subtle border
- Accent: Warm amber gradient
- Emergency: Pulsing red gradient (Quick Pick)

**Card System:**

- Recommendation cards: Glass with hover lift
- Context selection: Large colorful cards (120px height)
- Platform cards: Branded with smooth transitions

**Food-Friendly Indicators:**

- Leaf icons with animated growth states
- Color-coded scoring (green=excellent, amber=good, red=attention-required)
- Glow effects for perfect eating content (9-10 score)

### Iconography System

**Streaming Platforms:** High-quality SVG icons
**Food-Friendly:** Animated leaf icons (1-10 scale)
**Content Types:** Movie, series, documentary icons
**Context:** Utensils, eye, clock icons
**Actions:** Play, heart, thumbs, share icons
**Navigation:** Chevrons, arrows, menu icons

## Conclusion

These UX commandments are not suggestions—they are requirements for QuickPick. Every feature, design decision, and code implementation must be evaluated against these principles. The goal is to create the fastest, most respectful content discovery experience for people who just want to eat and watch something good.

**Remember:** If a feature adds more than 5 seconds to the core flow or requires more than 3 taps, it doesn't belong in MealStream.

The premium design system ensures that every interaction feels polished and intentional, while maintaining the core focus on speed and eating-context optimization. The glassmorphism effects, warm color palette, and smooth animations create a 2025-ready experience that users will want to show their friends.
