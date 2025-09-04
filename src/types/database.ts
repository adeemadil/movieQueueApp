// Database types and interfaces for MealStream
// These interfaces match the PostgreSQL schema

// Enum types from database
export type ContentType = 'movie' | 'series' | 'episode' | 'documentary'
export type ViewingParty = 'alone' | 'partner' | 'friends' | 'family'
export type AttentionLevel = 'background' | 'focused'
export type ContentPreference = 'continue' | 'comedy' | 'documentary' | 'comfort'
export type DurationType = 'snack' | 'meal' | 'extended'

// Core database interfaces
export interface User {
  id: string
  email: string
  password_hash: string
  created_at: Date
  updated_at: Date
  preferences: UserPreferences
  platforms: string[]
  food_friendly_threshold: number
  default_context: ViewingContext
}

export interface UserPreferences {
  theme?: 'light' | 'dark' | 'auto'
  notifications?: boolean
  accessibility?: {
    high_contrast?: boolean
    reduced_motion?: boolean
    text_scale?: number
  }
  privacy?: {
    analytics?: boolean
    personalization?: boolean
  }
}

export interface ViewingContext {
  viewing_party: ViewingParty
  attention_level: AttentionLevel
  content_preference: ContentPreference
  duration: DurationType
  timestamp?: Date
}

export interface Content {
  id: string
  external_id: string
  tmdb_id?: number
  imdb_id?: string
  title: string
  original_title?: string
  type: ContentType
  release_year?: number
  duration_minutes?: number
  genres: string[]
  languages: string[]
  countries: string[]
  platforms: PlatformAvailability
  food_friendly_score: FoodFriendlyScore
  metadata: ContentMetadata
  created_at: Date
  updated_at: Date
}

export interface FoodFriendlyScore {
  overall_score: number // 1-10 scale
  subtitle_intensity: number // 0-1 (0 = no subtitles, 1 = heavy subtitles)
  plot_complexity: number // 0-1 (0 = simple, 1 = complex)
  visual_intensity: number // 0-1 (0 = calm, 1 = intense visuals)
  eating_scenes: boolean // Contains eating/food scenes
  reasoning: string[]
  last_updated: Date
  confidence_score: number // Algorithm confidence 0-1
}

export interface PlatformAvailability {
  [platform: string]: {
    available: boolean
    deep_link?: string
    subscription_required?: boolean
    rental_price?: number
    purchase_price?: number
    last_checked: Date
  }
}

export interface ContentMetadata {
  description?: string
  poster_url?: string
  backdrop_url?: string
  trailer_url?: string
  cast?: string[]
  director?: string
  rating?: string // PG, PG-13, R, etc.
  imdb_rating?: number
  tmdb_rating?: number
  popularity_score?: number
  tags?: string[]
}

export interface ViewingHistory {
  id: string
  user_id: string
  content_id?: string
  watched_at: Date
  completion_percentage: number
  user_rating?: number
  context: ViewingContext
  satisfied?: boolean
  manual_entry: boolean
}

export interface UserSession {
  id: string
  user_id: string
  viewing_context: ViewingContext
  created_at: Date
  completed_at?: Date
  selected_content_id?: string
  selection_time_seconds?: number
  emergency_pick_used: boolean
}

export interface RecommendationCache {
  id: string
  cache_key: string
  recommendations: ContentRecommendation[]
  created_at: Date
  expires_at: Date
  user_id: string
}

export interface ContentRecommendation {
  content_id: string
  title: string
  type: ContentType
  platform: string
  food_friendly_score: number
  match_score: number
  duration_minutes?: number
  thumbnail_url?: string
  deep_link?: string
  reasoning: string
  metadata?: {
    genres: string[]
    release_year?: number
    rating?: string
    description?: string
  }
}

export interface ClassificationFeedback {
  id: string
  user_id: string
  content_id: string
  user_food_friendly_score: number
  system_food_friendly_score: number
  feedback_context: {
    viewing_context?: ViewingContext
    comment?: string
    timestamp: Date
  }
  created_at: Date
}

export interface PlatformContent {
  id: string
  content_id: string
  platform_name: string
  platform_id?: string
  available: boolean
  deep_link_url?: string
  last_checked: Date
  created_at: Date
}

// Request/Response interfaces for API
export interface RecommendationRequest {
  user_id: string
  context: ViewingContext
  platforms: string[]
  exclude_watched?: boolean
  max_results?: number
  emergency_pick?: boolean
}

export interface CreateUserRequest {
  email: string
  password: string
  platforms?: string[]
  preferences?: Partial<UserPreferences>
}

export interface UpdateUserRequest {
  platforms?: string[]
  preferences?: Partial<UserPreferences>
  food_friendly_threshold?: number
  default_context?: Partial<ViewingContext>
}

export interface AddViewingHistoryRequest {
  content_title: string
  content_type: ContentType
  user_rating?: number
  completion_percentage?: number
  context?: ViewingContext
}

export interface ContentSearchRequest {
  query?: string
  type?: ContentType
  genres?: string[]
  platforms?: string[]
  min_food_friendly_score?: number
  max_duration?: number
  limit?: number
  offset?: number
}

// Database query result types
export interface UserWithoutPassword extends Omit<User, 'password_hash'> {}

export interface ContentWithRecommendationScore extends Content {
  recommendation_score?: number
  match_reasoning?: string[]
}

export interface ViewingHistoryWithContent extends ViewingHistory {
  content?: Content
}

// Utility types for database operations
export type CreateUser = Omit<User, 'id' | 'created_at' | 'updated_at'>
export type UpdateUser = Partial<Omit<User, 'id' | 'email' | 'created_at' | 'updated_at'>>
export type CreateContent = Omit<Content, 'id' | 'created_at' | 'updated_at'>
export type UpdateContent = Partial<Omit<Content, 'id' | 'external_id' | 'created_at' | 'updated_at'>>

// Database connection and configuration types
export interface DatabaseConfig {
  host: string
  port: number
  database: string
  username: string
  password: string
  ssl?: boolean
  pool_size?: number
  connection_timeout?: number
}

export interface DatabaseConnection {
  query<T = any>(text: string, params?: any[]): Promise<T[]>
  transaction<T>(callback: (client: DatabaseConnection) => Promise<T>): Promise<T>
  close(): Promise<void>
}

// Error types
export interface DatabaseError extends Error {
  code?: string
  constraint?: string
  table?: string
  column?: string
}

export class UserNotFoundError extends Error {
  constructor(identifier: string) {
    super(`User not found: ${identifier}`)
    this.name = 'UserNotFoundError'
  }
}

export class ContentNotFoundError extends Error {
  constructor(identifier: string) {
    super(`Content not found: ${identifier}`)
    this.name = 'ContentNotFoundError'
  }
}

export class DuplicateUserError extends Error {
  constructor(email: string) {
    super(`User already exists: ${email}`)
    this.name = 'DuplicateUserError'
  }
}

// Validation schemas (for runtime validation)
export const SUPPORTED_PLATFORMS = [
  'netflix',
  'disney-plus',
  'amazon-prime',
  'hulu',
  'hbo-max',
  'apple-tv',
  'paramount-plus',
  'peacock',
  'youtube-tv',
  'crunchyroll'
] as const

export type SupportedPlatform = typeof SUPPORTED_PLATFORMS[number]

export const CONTENT_GENRES = [
  'action',
  'adventure',
  'animation',
  'comedy',
  'crime',
  'documentary',
  'drama',
  'family',
  'fantasy',
  'history',
  'horror',
  'music',
  'mystery',
  'romance',
  'science-fiction',
  'thriller',
  'war',
  'western'
] as const

export type ContentGenre = typeof CONTENT_GENRES[number]

// Validation functions
export function isValidEmail(email: string): boolean {
  const emailRegex = /^[^\s@]+@[^\s@]+\.[^\s@]+$/
  return emailRegex.test(email)
}

export function isValidPlatform(platform: string): platform is SupportedPlatform {
  return SUPPORTED_PLATFORMS.includes(platform as SupportedPlatform)
}

export function isValidFoodFriendlyScore(score: number): boolean {
  return Number.isInteger(score) && score >= 1 && score <= 10
}

export function isValidUserRating(rating: number): boolean {
  return Number.isInteger(rating) && rating >= 1 && rating <= 5
}

export function isValidDuration(minutes: number): boolean {
  return Number.isInteger(minutes) && minutes > 0 && minutes <= 600 // Max 10 hours
}