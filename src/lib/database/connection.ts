// Database connection utilities for MealStream
import { Pool, PoolClient, QueryResult } from 'pg'
import type { DatabaseConfig, DatabaseConnection } from '@/types/database'

class PostgreSQLConnection implements DatabaseConnection {
  private pool: Pool

  constructor(config: DatabaseConfig) {
    this.pool = new Pool({
      host: config.host,
      port: config.port,
      database: config.database,
      user: config.username,
      password: config.password,
      ssl: config.ssl ? { rejectUnauthorized: false } : false,
      max: config.pool_size || 20,
      connectionTimeoutMillis: config.connection_timeout || 5000,
      idleTimeoutMillis: 30000,
    })

    // Handle pool errors
    this.pool.on('error', (err) => {
      console.error('Unexpected error on idle client', err)
    })
  }

  async query<T = any>(text: string, params?: any[]): Promise<T[]> {
    const client = await this.pool.connect()
    try {
      const result: QueryResult<T> = await client.query(text, params)
      return result.rows
    } finally {
      client.release()
    }
  }

  async transaction<T>(
    callback: (client: DatabaseConnection) => Promise<T>
  ): Promise<T> {
    const client = await this.pool.connect()
    
    try {
      await client.query('BEGIN')
      
      const transactionClient: DatabaseConnection = {
        query: async <U = any>(text: string, params?: any[]): Promise<U[]> => {
          const result: QueryResult<U> = await client.query(text, params)
          return result.rows
        },
        transaction: async <U>(cb: (c: DatabaseConnection) => Promise<U>): Promise<U> => {
          throw new Error('Nested transactions not supported')
        },
        close: async () => {
          // No-op for transaction client
        }
      }
      
      const result = await callback(transactionClient)
      await client.query('COMMIT')
      return result
    } catch (error) {
      await client.query('ROLLBACK')
      throw error
    } finally {
      client.release()
    }
  }

  async close(): Promise<void> {
    await this.pool.end()
  }

  async healthCheck(): Promise<boolean> {
    try {
      await this.query('SELECT 1')
      return true
    } catch (error) {
      console.error('Database health check failed:', error)
      return false
    }
  }

  getPoolStatus() {
    return {
      totalCount: this.pool.totalCount,
      idleCount: this.pool.idleCount,
      waitingCount: this.pool.waitingCount,
    }
  }
}

// Database configuration from environment variables
function getDatabaseConfig(): DatabaseConfig {
  const config: DatabaseConfig = {
    host: process.env.DATABASE_HOST || 'localhost',
    port: parseInt(process.env.DATABASE_PORT || '5432'),
    database: process.env.DATABASE_NAME || 'mealstream',
    username: process.env.DATABASE_USER || 'postgres',
    password: process.env.DATABASE_PASSWORD || '',
    ssl: process.env.DATABASE_SSL === 'true',
    pool_size: parseInt(process.env.DATABASE_POOL_SIZE || '20'),
    connection_timeout: parseInt(process.env.DATABASE_TIMEOUT || '5000'),
  }

  // Validate required configuration
  if (!config.password && process.env.NODE_ENV === 'production') {
    throw new Error('DATABASE_PASSWORD is required in production')
  }

  return config
}

// Singleton database connection
let dbConnection: DatabaseConnection | null = null

export function getDatabase(): DatabaseConnection {
  if (!dbConnection) {
    const config = getDatabaseConfig()
    dbConnection = new PostgreSQLConnection(config)
  }
  return dbConnection
}

// Close database connection (for cleanup)
export async function closeDatabase(): Promise<void> {
  if (dbConnection) {
    await dbConnection.close()
    dbConnection = null
  }
}

// Database utilities
export async function testDatabaseConnection(): Promise<boolean> {
  try {
    const db = getDatabase()
    if ('healthCheck' in db) {
      return await (db as PostgreSQLConnection).healthCheck()
    }
    
    // Fallback health check
    await db.query('SELECT 1')
    return true
  } catch (error) {
    console.error('Database connection test failed:', error)
    return false
  }
}

export function getDatabaseStatus() {
  if (!dbConnection || !('getPoolStatus' in dbConnection)) {
    return null
  }
  
  return (dbConnection as PostgreSQLConnection).getPoolStatus()
}

// Error handling utilities
export function isDatabaseError(error: any): error is Error & { code?: string } {
  return error && typeof error === 'object' && 'code' in error
}

export function isUniqueConstraintError(error: any): boolean {
  return isDatabaseError(error) && error.code === '23505'
}

export function isForeignKeyConstraintError(error: any): boolean {
  return isDatabaseError(error) && error.code === '23503'
}

export function isNotNullConstraintError(error: any): boolean {
  return isDatabaseError(error) && error.code === '23502'
}

// Migration utilities
export interface Migration {
  id: string
  name: string
  sql: string
  applied_at?: Date
}

export async function createMigrationsTable(db: DatabaseConnection): Promise<void> {
  await db.query(`
    CREATE TABLE IF NOT EXISTS migrations (
      id VARCHAR(255) PRIMARY KEY,
      name VARCHAR(255) NOT NULL,
      applied_at TIMESTAMP WITH TIME ZONE DEFAULT NOW()
    )
  `)
}

export async function getAppliedMigrations(db: DatabaseConnection): Promise<string[]> {
  const rows = await db.query<{ id: string }>(`
    SELECT id FROM migrations ORDER BY applied_at ASC
  `)
  return rows.map(row => row.id)
}

export async function applyMigration(
  db: DatabaseConnection,
  migration: Migration
): Promise<void> {
  await db.transaction(async (client) => {
    // Execute migration SQL
    await client.query(migration.sql)
    
    // Record migration as applied
    await client.query(
      'INSERT INTO migrations (id, name) VALUES ($1, $2)',
      [migration.id, migration.name]
    )
  })
}

// Seed data utilities
export async function insertSeedData(db: DatabaseConnection): Promise<void> {
  // Insert sample content for development/testing
  const sampleContent = [
    {
      external_id: 'sample-1',
      title: 'The Great British Baking Show',
      type: 'series',
      duration_minutes: 60,
      genres: ['reality', 'food'],
      food_friendly_score: {
        overall_score: 9,
        subtitle_intensity: 0.1,
        plot_complexity: 0.2,
        visual_intensity: 0.1,
        eating_scenes: true,
        reasoning: ['Calm pacing', 'Food-focused content', 'Minimal subtitles'],
        confidence_score: 0.95
      },
      platforms: {
        netflix: {
          available: true,
          deep_link: 'https://netflix.com/title/80063327',
          last_checked: new Date()
        }
      }
    },
    {
      external_id: 'sample-2',
      title: 'Friends',
      type: 'series',
      duration_minutes: 22,
      genres: ['comedy', 'sitcom'],
      food_friendly_score: {
        overall_score: 8,
        subtitle_intensity: 0.0,
        plot_complexity: 0.3,
        visual_intensity: 0.2,
        eating_scenes: false,
        reasoning: ['Light comedy', 'Familiar content', 'Easy to follow'],
        confidence_score: 0.9
      },
      platforms: {
        'hbo-max': {
          available: true,
          deep_link: 'https://play.hbomax.com/series/friends',
          last_checked: new Date()
        }
      }
    }
  ]

  for (const content of sampleContent) {
    await db.query(`
      INSERT INTO content (
        external_id, title, type, duration_minutes, genres,
        food_friendly_score, platforms
      ) VALUES ($1, $2, $3, $4, $5, $6, $7)
      ON CONFLICT (external_id, type) DO NOTHING
    `, [
      content.external_id,
      content.title,
      content.type,
      content.duration_minutes,
      content.genres,
      JSON.stringify(content.food_friendly_score),
      JSON.stringify(content.platforms)
    ])
  }
}

export default getDatabase