-- MealStream Database Schema
-- PostgreSQL schema for streaming decision helper

-- Enable UUID extension
CREATE EXTENSION IF NOT EXISTS "uuid-ossp";

-- Create custom types
CREATE TYPE content_type AS ENUM ('movie', 'series', 'episode', 'documentary');
CREATE TYPE viewing_party AS ENUM ('alone', 'partner', 'friends', 'family');
CREATE TYPE attention_level AS ENUM ('background', 'focused');
CREATE TYPE content_preference AS ENUM ('continue', 'comedy', 'documentary', 'comfort');
CREATE TYPE duration_type AS ENUM ('snack', 'meal', 'extended');

-- Users table for authentication and preferences
CREATE TABLE users (
  id UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
  email VARCHAR(255) UNIQUE NOT NULL,
  password_hash VARCHAR(255) NOT NULL,
  created_at TIMESTAMP WITH TIME ZONE DEFAULT NOW(),
  updated_at TIMESTAMP WITH TIME ZONE DEFAULT NOW(),
  
  -- User preferences stored as JSONB for flexibility
  preferences JSONB DEFAULT '{}',
  
  -- Available streaming platforms
  platforms TEXT[] DEFAULT ARRAY[]::TEXT[],
  
  -- Food-friendly sensitivity (1-10 scale)
  food_friendly_threshold INTEGER DEFAULT 6 CHECK (food_friendly_threshold >= 1 AND food_friendly_threshold <= 10),
  
  -- Quick context preferences for returning users
  default_context JSONB DEFAULT '{}'
);

-- Content metadata table (eating-context optimized)
CREATE TABLE content (
  id UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
  
  -- External API identifiers
  external_id VARCHAR(255) NOT NULL,
  tmdb_id INTEGER,
  imdb_id VARCHAR(20),
  
  -- Basic content information
  title VARCHAR(500) NOT NULL,
  original_title VARCHAR(500),
  type content_type NOT NULL,
  release_year INTEGER,
  duration_minutes INTEGER,
  
  -- Content classification
  genres TEXT[],
  languages TEXT[],
  countries TEXT[],
  content_rating VARCHAR(10), -- G, PG, PG-13, R, etc.
  
  -- Platform availability (dynamic data)
  platforms JSONB DEFAULT '{}',
  
  -- Food-friendly scoring (enhanced)
  food_friendly_score JSONB DEFAULT '{}',
  
  -- Eating-context specific metadata
  has_subtitles BOOLEAN DEFAULT false,
  has_dubbing BOOLEAN DEFAULT false,
  subtitle_density DECIMAL(3,2), -- 0.00-1.00 scale
  visual_intensity DECIMAL(3,2), -- 0.00-1.00 scale
  plot_complexity DECIMAL(3,2), -- 0.00-1.00 scale
  
  -- Performance optimization flags
  is_emergency_pick BOOLEAN DEFAULT false,
  is_comfort_viewing BOOLEAN DEFAULT false,
  quick_decision_score DECIMAL(3,2), -- How good for quick decisions
  
  -- API source tracking for compliance
  data_source VARCHAR(100), -- 'tmdb', 'streaming-availability', 'manual'
  last_api_update TIMESTAMP WITH TIME ZONE,
  
  -- Additional metadata
  metadata JSONB DEFAULT '{}',
  
  -- Timestamps
  created_at TIMESTAMP WITH TIME ZONE DEFAULT NOW(),
  updated_at TIMESTAMP WITH TIME ZONE DEFAULT NOW(),
  
  -- Unique constraint on external ID and type
  UNIQUE(external_id, type)
);

-- Viewing history for personalization
CREATE TABLE viewing_history (
  id UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
  user_id UUID REFERENCES users(id) ON DELETE CASCADE,
  content_id UUID REFERENCES content(id) ON DELETE SET NULL,
  
  -- Viewing details
  watched_at TIMESTAMP WITH TIME ZONE DEFAULT NOW(),
  completion_percentage DECIMAL(5,2) DEFAULT 0,
  user_rating INTEGER CHECK (user_rating >= 1 AND user_rating <= 5),
  
  -- Context when content was selected
  context JSONB DEFAULT '{}',
  
  -- User satisfaction with recommendation
  satisfied BOOLEAN,
  
  -- Manual entry flag for MVP
  manual_entry BOOLEAN DEFAULT true
);

-- User sessions for context tracking (eating-optimized)
CREATE TABLE user_sessions (
  id UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
  user_id UUID REFERENCES users(id) ON DELETE CASCADE,
  
  -- Session context
  viewing_context JSONB NOT NULL,
  
  -- Session metadata
  created_at TIMESTAMP WITH TIME ZONE DEFAULT NOW(),
  completed_at TIMESTAMP WITH TIME ZONE,
  
  -- Selected content (if any)
  selected_content_id UUID REFERENCES content(id) ON DELETE SET NULL,
  selection_time_seconds INTEGER,
  
  -- Emergency pick used
  emergency_pick_used BOOLEAN DEFAULT false,
  
  -- Eating context specific tracking
  meal_type VARCHAR(50), -- breakfast, lunch, dinner, snack
  device_type VARCHAR(50), -- mobile, tablet, desktop, tv
  network_speed VARCHAR(10), -- 2g, 3g, 4g, wifi
  
  -- Performance metrics for eating context
  api_response_time_ms INTEGER,
  total_load_time_ms INTEGER,
  user_abandoned BOOLEAN DEFAULT false,
  abandonment_reason VARCHAR(100),
  
  -- Success metrics
  reached_platform BOOLEAN DEFAULT false,
  user_satisfaction_rating INTEGER CHECK (user_satisfaction_rating >= 1 AND user_satisfaction_rating <= 5)
);

-- Recommendation cache for performance
CREATE TABLE recommendation_cache (
  id UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
  
  -- Cache key based on user context and preferences
  cache_key VARCHAR(255) UNIQUE NOT NULL,
  
  -- Cached recommendations
  recommendations JSONB NOT NULL,
  
  -- Cache metadata
  created_at TIMESTAMP WITH TIME ZONE DEFAULT NOW(),
  expires_at TIMESTAMP WITH TIME ZONE NOT NULL,
  
  -- User context for cache invalidation
  user_id UUID REFERENCES users(id) ON DELETE CASCADE
);

-- Content classification feedback for algorithm improvement
CREATE TABLE classification_feedback (
  id UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
  user_id UUID REFERENCES users(id) ON DELETE CASCADE,
  content_id UUID REFERENCES content(id) ON DELETE CASCADE,
  
  -- User feedback on food-friendly classification
  user_food_friendly_score INTEGER CHECK (user_food_friendly_score >= 1 AND user_food_friendly_score <= 10),
  system_food_friendly_score INTEGER,
  
  -- Feedback context
  feedback_context JSONB DEFAULT '{}',
  created_at TIMESTAMP WITH TIME ZONE DEFAULT NOW(),
  
  -- Prevent duplicate feedback
  UNIQUE(user_id, content_id)
);

-- Platform availability tracking
CREATE TABLE platform_content (
  id UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
  content_id UUID REFERENCES content(id) ON DELETE CASCADE,
  
  -- Platform information
  platform_name VARCHAR(100) NOT NULL,
  platform_id VARCHAR(255),
  
  -- Availability details
  available BOOLEAN DEFAULT true,
  deep_link_url TEXT,
  
  -- Metadata
  last_checked TIMESTAMP WITH TIME ZONE DEFAULT NOW(),
  created_at TIMESTAMP WITH TIME ZONE DEFAULT NOW(),
  
  -- Unique constraint
  UNIQUE(content_id, platform_name)
);

-- Indexes for performance
CREATE INDEX idx_users_email ON users(email);
CREATE INDEX idx_users_platforms ON users USING GIN (platforms);

CREATE INDEX idx_content_type ON content(type);
CREATE INDEX idx_content_genres ON content USING GIN (genres);
CREATE INDEX idx_content_platforms ON content USING GIN (platforms);
CREATE INDEX idx_content_food_score ON content ((food_friendly_score->>'overallScore'));
CREATE INDEX idx_content_duration ON content(duration_minutes);
CREATE INDEX idx_content_release_year ON content(release_year);

CREATE INDEX idx_viewing_history_user ON viewing_history(user_id);
CREATE INDEX idx_viewing_history_content ON viewing_history(content_id);
CREATE INDEX idx_viewing_history_watched_at ON viewing_history(watched_at);

CREATE INDEX idx_user_sessions_user ON user_sessions(user_id);
CREATE INDEX idx_user_sessions_created_at ON user_sessions(created_at);

CREATE INDEX idx_recommendation_cache_key ON recommendation_cache(cache_key);
CREATE INDEX idx_recommendation_cache_expires ON recommendation_cache(expires_at);
CREATE INDEX idx_recommendation_cache_user ON recommendation_cache(user_id);

CREATE INDEX idx_classification_feedback_content ON classification_feedback(content_id);
CREATE INDEX idx_classification_feedback_user ON classification_feedback(user_id);

CREATE INDEX idx_platform_content_platform ON platform_content(platform_name);
CREATE INDEX idx_platform_content_available ON platform_content(available);

-- Update triggers for updated_at timestamps
CREATE OR REPLACE FUNCTION update_updated_at_column()
RETURNS TRIGGER AS $$
BEGIN
    NEW.updated_at = NOW();
    RETURN NEW;
END;
$$ language 'plpgsql';

CREATE TRIGGER update_users_updated_at BEFORE UPDATE ON users
    FOR EACH ROW EXECUTE FUNCTION update_updated_at_column();

CREATE TRIGGER update_content_updated_at BEFORE UPDATE ON content
    FOR EACH ROW EXECUTE FUNCTION update_updated_at_column();