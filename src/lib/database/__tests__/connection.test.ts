// Database connection tests
import { describe, it, expect, beforeAll, afterAll } from 'vitest'
import { getDatabase, testDatabaseConnection, closeDatabase } from '../connection'
import type { DatabaseConnection } from '@/types/database'

describe('Database Connection', () => {
  let db: DatabaseConnection

  beforeAll(async () => {
    db = getDatabase()
  })

  afterAll(async () => {
    await closeDatabase()
  })

  it('should establish database connection', async () => {
    const isConnected = await testDatabaseConnection()
    expect(isConnected).toBe(true)
  })

  it('should execute simple query', async () => {
    const result = await db.query<{ test: number }>('SELECT 1 as test')
    expect(result).toHaveLength(1)
    expect(result[0].test).toBe(1)
  })

  it('should handle transactions', async () => {
    const result = await db.transaction(async (client) => {
      const [row] = await client.query<{ sum: number }>('SELECT 1 + 1 as sum')
      return row.sum
    })
    
    expect(result).toBe(2)
  })

  it('should handle transaction rollback on error', async () => {
    await expect(
      db.transaction(async (client) => {
        await client.query('SELECT 1')
        throw new Error('Test error')
      })
    ).rejects.toThrow('Test error')
  })
})

describe('Database Schema Validation', () => {
  let db: DatabaseConnection

  beforeAll(async () => {
    db = getDatabase()
  })

  afterAll(async () => {
    await closeDatabase()
  })

  it('should have migrations table', async () => {
    const result = await db.query(`
      SELECT table_name 
      FROM information_schema.tables 
      WHERE table_schema = 'public' 
        AND table_name = 'migrations'
    `)
    
    expect(result).toHaveLength(1)
  })

  it('should have all required tables', async () => {
    const expectedTables = [
      'users',
      'content',
      'viewing_history',
      'user_sessions',
      'recommendation_cache',
      'classification_feedback',
      'platform_content'
    ]

    const result = await db.query<{ table_name: string }>(`
      SELECT table_name 
      FROM information_schema.tables 
      WHERE table_schema = 'public' 
        AND table_name = ANY($1)
      ORDER BY table_name
    `, [expectedTables])

    const tableNames = result.map(row => row.table_name)
    
    for (const expectedTable of expectedTables) {
      expect(tableNames).toContain(expectedTable)
    }
  })

  it('should have required indexes', async () => {
    const result = await db.query<{ indexname: string }>(`
      SELECT indexname 
      FROM pg_indexes 
      WHERE schemaname = 'public'
        AND indexname LIKE 'idx_%'
    `)

    expect(result.length).toBeGreaterThan(0)
    
    // Check for some critical indexes
    const indexNames = result.map(row => row.indexname)
    expect(indexNames).toContain('idx_users_email')
    expect(indexNames).toContain('idx_content_food_score')
  })

  it('should have custom types defined', async () => {
    const result = await db.query<{ typname: string }>(`
      SELECT typname 
      FROM pg_type 
      WHERE typname IN ('content_type', 'viewing_party', 'attention_level')
    `)

    expect(result).toHaveLength(3)
  })
})