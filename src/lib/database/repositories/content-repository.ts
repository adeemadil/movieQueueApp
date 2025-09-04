// Content repository for database operations
import type {
  Content,
  ContentType,
  FoodFriendlyScore,
  ContentMetadata,
  PlatformAvailability,
  ContentSearchRequest,
  ContentWithRecommendationScore,
  CreateContent,
  UpdateContent,
  DatabaseConnection,
  ContentNotFoundError
} from '@/types/database'
import { getDatabase } from '../connection'

export class ContentRepository {
  private db: DatabaseConnection

  constructor(db?: DatabaseConnection) {
    this.db = db || getDatabase()
  }

  async createContent(contentData: CreateContent): Promise<Content> {
    const {
      external_id,
      tmdb_id,
      imdb_id,
      title,
      original_title,
      type,
      release_year,
      duration_minutes,
      genres = [],
      languages = [],
      countries = [],
      platforms = {},
      food_friendly_score = {},
      metadata = {}
    } = contentData

    const [content] = await this.db.query<Content>(`
      INSERT INTO content (
        external_id, tmdb_id, imdb_id, title, original_title, type,
        release_year, duration_minutes, genres, languages, countries,
        platforms, food_friendly_score, metadata
      ) VALUES ($1, $2, $3, $4, $5, $6, $7, $8, $9, $10, $11, $12, $13, $14)
      RETURNING *
    `, [
      external_id,
      tmdb_id,
      imdb_id,
      title,
      original_title,
      type,
      release_year,
      duration_minutes,
      genres,
      languages,
      countries,
      JSON.stringify(platforms),
      JSON.stringify(food_friendly_score),
      JSON.stringify(metadata)
    ])

    return content
  }

  async getContentById(contentId: string): Promise<Content | null> {
    const [content] = await this.db.query<Content>(`
      SELECT * FROM content WHERE id = $1
    `, [contentId])

    return content || null
  }

  async getContentByExternalId(externalId: string, type: ContentType): Promise<Content | null> {
    const [content] = await this.db.query<Content>(`
      SELECT * FROM content WHERE external_id = $1 AND type = $2
    `, [externalId, type])

    return content || null
  }

  async updateContent(contentId: string, updates: UpdateContent): Promise<Content> {
    const updateFields: string[] = []
    const updateValues: any[] = []
    let paramIndex = 1

    // Build dynamic update query
    if (updates.title !== undefined) {
      updateFields.push(`title = $${paramIndex}`)
      updateValues.push(updates.title)
      paramIndex++
    }

    if (updates.original_title !== undefined) {
      updateFields.push(`original_title = $${paramIndex}`)
      updateValues.push(updates.original_title)
      paramIndex++
    }

    if (updates.release_year !== undefined) {
      updateFields.push(`release_year = $${paramIndex}`)
      updateValues.push(updates.release_year)
      paramIndex++
    }

    if (updates.duration_minutes !== undefined) {
      updateFields.push(`duration_minutes = $${paramIndex}`)
      updateValues.push(updates.duration_minutes)
      paramIndex++
    }

    if (updates.genres !== undefined) {
      updateFields.push(`genres = $${paramIndex}`)
      updateValues.push(updates.genres)
      paramIndex++
    }

    if (updates.languages !== undefined) {
      updateFields.push(`languages = $${paramIndex}`)
      updateValues.push(updates.languages)
      paramIndex++
    }

    if (updates.countries !== undefined) {
      updateFields.push(`countries = $${paramIndex}`)
      updateValues.push(updates.countries)
      paramIndex++
    }

    if (updates.platforms !== undefined) {
      updateFields.push(`platforms = $${paramIndex}`)
      updateValues.push(JSON.stringify(updates.platforms))
      paramIndex++
    }

    if (updates.food_friendly_score !== undefined) {
      updateFields.push(`food_friendly_score = $${paramIndex}`)
      updateValues.push(JSON.stringify(updates.food_friendly_score))
      paramIndex++
    }

    if (updates.metadata !== undefined) {
      updateFields.push(`metadata = $${paramIndex}`)
      updateValues.push(JSON.stringify(updates.metadata))
      paramIndex++
    }

    if (updateFields.length === 0) {
      // No updates provided, return current content
      const content = await this.getContentById(contentId)
      if (!content) {
        throw new ContentNotFoundError(contentId)
      }
      return content
    }

    // Add updated_at timestamp
    updateFields.push(`updated_at = NOW()`)
    
    // Add content ID for WHERE clause
    updateValues.push(contentId)
    const whereParamIndex = paramIndex

    const query = `
      UPDATE content 
      SET ${updateFields.join(', ')}
      WHERE id = $${whereParamIndex}
      RETURNING *
    `

    const [content] = await this.db.query<Content>(query, updateValues)
    
    if (!content) {
      throw new ContentNotFoundError(contentId)
    }
    
    return content
  }

  async updateFoodFriendlyScore(contentId: string, score: FoodFriendlyScore): Promise<Content> {
    return this.updateContent(contentId, { food_friendly_score: score })
  }

  async updatePlatformAvailability(contentId: string, platforms: PlatformAvailability): Promise<Content> {
    return this.updateContent(contentId, { platforms })
  }

  async searchContent(searchParams: ContentSearchRequest): Promise<Content[]> {
    const {
      query,
      type,
      genres = [],
      platforms = [],
      min_food_friendly_score,
      max_duration,
      limit = 20,
      offset = 0
    } = searchParams

    const conditions: string[] = []
    const values: any[] = []
    let paramIndex = 1

    // Text search
    if (query) {
      conditions.push(`(title ILIKE $${paramIndex} OR original_title ILIKE $${paramIndex})`)
      values.push(`%${query}%`)
      paramIndex++
    }

    // Content type filter
    if (type) {
      conditions.push(`type = $${paramIndex}`)
      values.push(type)
      paramIndex++
    }

    // Genre filter
    if (genres.length > 0) {
      conditions.push(`genres && $${paramIndex}`)
      values.push(genres)
      paramIndex++
    }

    // Platform filter
    if (platforms.length > 0) {
      const platformConditions = platforms.map(platform => {
        const condition = `platforms ? $${paramIndex}`
        values.push(platform)
        paramIndex++
        return condition
      })
      conditions.push(`(${platformConditions.join(' OR ')})`)
    }

    // Food-friendly score filter
    if (min_food_friendly_score !== undefined) {
      conditions.push(`(food_friendly_score->>'overall_score')::numeric >= $${paramIndex}`)
      values.push(min_food_friendly_score)
      paramIndex++
    }

    // Duration filter
    if (max_duration !== undefined) {
      conditions.push(`duration_minutes <= $${paramIndex}`)
      values.push(max_duration)
      paramIndex++
    }

    const whereClause = conditions.length > 0 ? `WHERE ${conditions.join(' AND ')}` : ''
    
    // Add limit and offset
    values.push(limit, offset)
    const limitClause = `LIMIT $${paramIndex} OFFSET $${paramIndex + 1}`

    const query_sql = `
      SELECT * FROM content 
      ${whereClause}
      ORDER BY 
        CASE WHEN food_friendly_score->>'overall_score' IS NOT NULL 
             THEN (food_friendly_score->>'overall_score')::numeric 
             ELSE 0 END DESC,
        created_at DESC
      ${limitClause}
    `

    return this.db.query<Content>(query_sql, values)
  }

  async getRecommendations(
    userPlatforms: string[],
    minFoodFriendlyScore: number = 6,
    excludeContentIds: string[] = [],
    limit: number = 10
  ): Promise<ContentWithRecommendationScore[]> {
    const conditions: string[] = []
    const values: any[] = []
    let paramIndex = 1

    // Platform availability filter
    if (userPlatforms.length > 0) {
      const platformConditions = userPlatforms.map(platform => {
        const condition = `platforms ? $${paramIndex}`
        values.push(platform)
        paramIndex++
        return condition
      })
      conditions.push(`(${platformConditions.join(' OR ')})`)
    }

    // Food-friendly score filter
    conditions.push(`(food_friendly_score->>'overall_score')::numeric >= $${paramIndex}`)
    values.push(minFoodFriendlyScore)
    paramIndex++

    // Exclude specific content
    if (excludeContentIds.length > 0) {
      conditions.push(`id != ALL($${paramIndex})`)
      values.push(excludeContentIds)
      paramIndex++
    }

    // Add limit
    values.push(limit)
    const limitParam = paramIndex

    const query = `
      SELECT *,
        (food_friendly_score->>'overall_score')::numeric as recommendation_score
      FROM content 
      WHERE ${conditions.join(' AND ')}
      ORDER BY 
        (food_friendly_score->>'overall_score')::numeric DESC,
        RANDOM()
      LIMIT $${limitParam}
    `

    return this.db.query<ContentWithRecommendationScore>(query, values)
  }

  async getContentByGenres(genres: string[], limit: number = 20): Promise<Content[]> {
    return this.db.query<Content>(`
      SELECT * FROM content 
      WHERE genres && $1
      ORDER BY 
        CASE WHEN food_friendly_score->>'overall_score' IS NOT NULL 
             THEN (food_friendly_score->>'overall_score')::numeric 
             ELSE 0 END DESC
      LIMIT $2
    `, [genres, limit])
  }

  async getContentByDuration(
    minDuration: number,
    maxDuration: number,
    limit: number = 20
  ): Promise<Content[]> {
    return this.db.query<Content>(`
      SELECT * FROM content 
      WHERE duration_minutes BETWEEN $1 AND $2
      ORDER BY 
        CASE WHEN food_friendly_score->>'overall_score' IS NOT NULL 
             THEN (food_friendly_score->>'overall_score')::numeric 
             ELSE 0 END DESC
      LIMIT $3
    `, [minDuration, maxDuration, limit])
  }

  async getPopularContent(platform?: string, limit: number = 20): Promise<Content[]> {
    const conditions: string[] = []
    const values: any[] = []
    let paramIndex = 1

    if (platform) {
      conditions.push(`platforms ? $${paramIndex}`)
      values.push(platform)
      paramIndex++
    }

    values.push(limit)
    const limitParam = paramIndex

    const whereClause = conditions.length > 0 ? `WHERE ${conditions.join(' AND ')}` : ''

    return this.db.query<Content>(`
      SELECT * FROM content 
      ${whereClause}
      ORDER BY 
        (metadata->>'popularity_score')::numeric DESC NULLS LAST,
        (food_friendly_score->>'overall_score')::numeric DESC NULLS LAST
      LIMIT $${limitParam}
    `, values)
  }

  async getContentStats(): Promise<{
    total_content: number
    by_type: Record<ContentType, number>
    avg_food_friendly_score: number
    platform_coverage: Record<string, number>
  }> {
    // Total content count
    const [totalResult] = await this.db.query<{ count: number }>(`
      SELECT COUNT(*) as count FROM content
    `)

    // Content by type
    const typeResults = await this.db.query<{ type: ContentType; count: number }>(`
      SELECT type, COUNT(*) as count 
      FROM content 
      GROUP BY type
    `)

    // Average food-friendly score
    const [avgScoreResult] = await this.db.query<{ avg_score: number }>(`
      SELECT AVG((food_friendly_score->>'overall_score')::numeric) as avg_score
      FROM content 
      WHERE food_friendly_score->>'overall_score' IS NOT NULL
    `)

    // Platform coverage (content available per platform)
    const platformResults = await this.db.query<{ platform: string; count: number }>(`
      SELECT 
        platform_keys.key as platform,
        COUNT(*) as count
      FROM content,
           jsonb_object_keys(platforms) as platform_keys(key)
      GROUP BY platform_keys.key
      ORDER BY count DESC
    `)

    const byType: Record<ContentType, number> = {
      movie: 0,
      series: 0,
      episode: 0,
      documentary: 0
    }

    typeResults.forEach(result => {
      byType[result.type] = result.count
    })

    const platformCoverage: Record<string, number> = {}
    platformResults.forEach(result => {
      platformCoverage[result.platform] = result.count
    })

    return {
      total_content: totalResult?.count || 0,
      by_type: byType,
      avg_food_friendly_score: avgScoreResult?.avg_score || 0,
      platform_coverage: platformCoverage
    }
  }

  async deleteContent(contentId: string): Promise<void> {
    const [result] = await this.db.query(`
      DELETE FROM content 
      WHERE id = $1
      RETURNING id
    `, [contentId])

    if (!result) {
      throw new ContentNotFoundError(contentId)
    }
  }

  async bulkUpsertContent(contentList: CreateContent[]): Promise<number> {
    let insertedCount = 0

    await this.db.transaction(async (client) => {
      for (const content of contentList) {
        try {
          await client.query(`
            INSERT INTO content (
              external_id, tmdb_id, imdb_id, title, original_title, type,
              release_year, duration_minutes, genres, languages, countries,
              platforms, food_friendly_score, metadata
            ) VALUES ($1, $2, $3, $4, $5, $6, $7, $8, $9, $10, $11, $12, $13, $14)
            ON CONFLICT (external_id, type) 
            DO UPDATE SET
              title = EXCLUDED.title,
              platforms = EXCLUDED.platforms,
              food_friendly_score = EXCLUDED.food_friendly_score,
              metadata = EXCLUDED.metadata,
              updated_at = NOW()
          `, [
            content.external_id,
            content.tmdb_id,
            content.imdb_id,
            content.title,
            content.original_title,
            content.type,
            content.release_year,
            content.duration_minutes,
            content.genres,
            content.languages,
            content.countries,
            JSON.stringify(content.platforms),
            JSON.stringify(content.food_friendly_score),
            JSON.stringify(content.metadata)
          ])
          insertedCount++
        } catch (error) {
          console.error(`Failed to upsert content ${content.external_id}:`, error)
          // Continue with other content items
        }
      }
    })

    return insertedCount
  }
}

export default ContentRepository