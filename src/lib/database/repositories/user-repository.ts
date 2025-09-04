// User repository for database operations
import bcrypt from 'bcryptjs'
import type { 
  User, 
  UserWithoutPassword, 
  CreateUserRequest, 
  UpdateUserRequest,
  UserPreferences,
  ViewingContext,
  DatabaseConnection,
  DuplicateUserError,
  UserNotFoundError
} from '@/types/database'
import { getDatabase, isUniqueConstraintError } from '../connection'

export class UserRepository {
  private db: DatabaseConnection

  constructor(db?: DatabaseConnection) {
    this.db = db || getDatabase()
  }

  async createUser(userData: CreateUserRequest): Promise<UserWithoutPassword> {
    const { email, password, platforms = [], preferences = {} } = userData
    
    // Hash password
    const saltRounds = 12
    const password_hash = await bcrypt.hash(password, saltRounds)
    
    try {
      const [user] = await this.db.query<User>(`
        INSERT INTO users (
          email, 
          password_hash, 
          platforms, 
          preferences,
          food_friendly_threshold,
          default_context
        ) VALUES ($1, $2, $3, $4, $5, $6)
        RETURNING id, email, created_at, updated_at, preferences, 
                  platforms, food_friendly_threshold, default_context
      `, [
        email.toLowerCase().trim(),
        password_hash,
        platforms,
        JSON.stringify(preferences),
        6, // Default food-friendly threshold
        JSON.stringify({}) // Default empty context
      ])
      
      return user
    } catch (error) {
      if (isUniqueConstraintError(error)) {
        throw new DuplicateUserError(email)
      }
      throw error
    }
  }

  async getUserById(userId: string): Promise<UserWithoutPassword | null> {
    const [user] = await this.db.query<UserWithoutPassword>(`
      SELECT id, email, created_at, updated_at, preferences, 
             platforms, food_friendly_threshold, default_context
      FROM users 
      WHERE id = $1
    `, [userId])
    
    return user || null
  }

  async getUserByEmail(email: string): Promise<UserWithoutPassword | null> {
    const [user] = await this.db.query<UserWithoutPassword>(`
      SELECT id, email, created_at, updated_at, preferences, 
             platforms, food_friendly_threshold, default_context
      FROM users 
      WHERE email = $1
    `, [email.toLowerCase().trim()])
    
    return user || null
  }

  async getUserWithPasswordByEmail(email: string): Promise<User | null> {
    const [user] = await this.db.query<User>(`
      SELECT id, email, password_hash, created_at, updated_at, 
             preferences, platforms, food_friendly_threshold, default_context
      FROM users 
      WHERE email = $1
    `, [email.toLowerCase().trim()])
    
    return user || null
  }

  async updateUser(userId: string, updates: UpdateUserRequest): Promise<UserWithoutPassword> {
    const updateFields: string[] = []
    const updateValues: any[] = []
    let paramIndex = 1

    // Build dynamic update query
    if (updates.platforms !== undefined) {
      updateFields.push(`platforms = $${paramIndex}`)
      updateValues.push(updates.platforms)
      paramIndex++
    }

    if (updates.preferences !== undefined) {
      updateFields.push(`preferences = $${paramIndex}`)
      updateValues.push(JSON.stringify(updates.preferences))
      paramIndex++
    }

    if (updates.food_friendly_threshold !== undefined) {
      updateFields.push(`food_friendly_threshold = $${paramIndex}`)
      updateValues.push(updates.food_friendly_threshold)
      paramIndex++
    }

    if (updates.default_context !== undefined) {
      updateFields.push(`default_context = $${paramIndex}`)
      updateValues.push(JSON.stringify(updates.default_context))
      paramIndex++
    }

    if (updateFields.length === 0) {
      // No updates provided, return current user
      const user = await this.getUserById(userId)
      if (!user) {
        throw new UserNotFoundError(userId)
      }
      return user
    }

    // Add updated_at timestamp
    updateFields.push(`updated_at = NOW()`)
    
    // Add user ID for WHERE clause
    updateValues.push(userId)
    const whereParamIndex = paramIndex

    const query = `
      UPDATE users 
      SET ${updateFields.join(', ')}
      WHERE id = $${whereParamIndex}
      RETURNING id, email, created_at, updated_at, preferences, 
                platforms, food_friendly_threshold, default_context
    `

    const [user] = await this.db.query<UserWithoutPassword>(query, updateValues)
    
    if (!user) {
      throw new UserNotFoundError(userId)
    }
    
    return user
  }

  async updateUserPlatforms(userId: string, platforms: string[]): Promise<UserWithoutPassword> {
    return this.updateUser(userId, { platforms })
  }

  async updateUserPreferences(userId: string, preferences: Partial<UserPreferences>): Promise<UserWithoutPassword> {
    // Get current preferences and merge with updates
    const currentUser = await this.getUserById(userId)
    if (!currentUser) {
      throw new UserNotFoundError(userId)
    }

    const mergedPreferences = {
      ...currentUser.preferences,
      ...preferences
    }

    return this.updateUser(userId, { preferences: mergedPreferences })
  }

  async updateDefaultContext(userId: string, context: Partial<ViewingContext>): Promise<UserWithoutPassword> {
    // Get current default context and merge with updates
    const currentUser = await this.getUserById(userId)
    if (!currentUser) {
      throw new UserNotFoundError(userId)
    }

    const mergedContext = {
      ...currentUser.default_context,
      ...context
    }

    return this.updateUser(userId, { default_context: mergedContext })
  }

  async verifyPassword(email: string, password: string): Promise<UserWithoutPassword | null> {
    const user = await this.getUserWithPasswordByEmail(email)
    if (!user) {
      return null
    }

    const isValid = await bcrypt.compare(password, user.password_hash)
    if (!isValid) {
      return null
    }

    // Return user without password
    const { password_hash, ...userWithoutPassword } = user
    return userWithoutPassword
  }

  async updatePassword(userId: string, newPassword: string): Promise<void> {
    const saltRounds = 12
    const password_hash = await bcrypt.hash(newPassword, saltRounds)

    const [result] = await this.db.query(`
      UPDATE users 
      SET password_hash = $1, updated_at = NOW()
      WHERE id = $2
      RETURNING id
    `, [password_hash, userId])

    if (!result) {
      throw new UserNotFoundError(userId)
    }
  }

  async deleteUser(userId: string): Promise<void> {
    const [result] = await this.db.query(`
      DELETE FROM users 
      WHERE id = $1
      RETURNING id
    `, [userId])

    if (!result) {
      throw new UserNotFoundError(userId)
    }
  }

  async getUserStats(userId: string): Promise<{
    total_sessions: number
    total_selections: number
    avg_selection_time: number
    favorite_platforms: string[]
    most_used_context: ViewingContext | null
  }> {
    // Get user session statistics
    const [sessionStats] = await this.db.query<{
      total_sessions: number
      total_selections: number
      avg_selection_time: number
    }>(`
      SELECT 
        COUNT(*) as total_sessions,
        COUNT(selected_content_id) as total_selections,
        COALESCE(AVG(selection_time_seconds), 0) as avg_selection_time
      FROM user_sessions 
      WHERE user_id = $1
    `, [userId])

    // Get favorite platforms from viewing history
    const platformStats = await this.db.query<{ platform: string; count: number }>(`
      SELECT 
        (context->>'platform') as platform,
        COUNT(*) as count
      FROM viewing_history 
      WHERE user_id = $1 
        AND context->>'platform' IS NOT NULL
      GROUP BY context->>'platform'
      ORDER BY count DESC
      LIMIT 3
    `, [userId])

    // Get most used viewing context
    const [contextStats] = await this.db.query<{ context: ViewingContext; count: number }>(`
      SELECT 
        viewing_context as context,
        COUNT(*) as count
      FROM user_sessions 
      WHERE user_id = $1
      GROUP BY viewing_context
      ORDER BY count DESC
      LIMIT 1
    `, [userId])

    return {
      total_sessions: sessionStats?.total_sessions || 0,
      total_selections: sessionStats?.total_selections || 0,
      avg_selection_time: sessionStats?.avg_selection_time || 0,
      favorite_platforms: platformStats.map(p => p.platform),
      most_used_context: contextStats?.context || null
    }
  }

  async searchUsers(query: string, limit: number = 10): Promise<UserWithoutPassword[]> {
    return this.db.query<UserWithoutPassword>(`
      SELECT id, email, created_at, updated_at, preferences, 
             platforms, food_friendly_threshold, default_context
      FROM users 
      WHERE email ILIKE $1
      ORDER BY created_at DESC
      LIMIT $2
    `, [`%${query}%`, limit])
  }

  async getUserCount(): Promise<number> {
    const [result] = await this.db.query<{ count: number }>(`
      SELECT COUNT(*) as count FROM users
    `)
    return result?.count || 0
  }
}

export default UserRepository