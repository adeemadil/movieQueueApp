// Database migration runner for MealStream
import fs from 'fs/promises'
import path from 'path'
import { 
  getDatabase, 
  createMigrationsTable, 
  getAppliedMigrations, 
  applyMigration,
  insertSeedData,
  type Migration 
} from './connection'

const MIGRATIONS_DIR = path.join(process.cwd(), 'src/lib/database/migrations')

async function loadMigrations(): Promise<Migration[]> {
  try {
    const files = await fs.readdir(MIGRATIONS_DIR)
    const migrationFiles = files
      .filter(file => file.endsWith('.sql'))
      .sort()

    const migrations: Migration[] = []

    for (const file of migrationFiles) {
      const filePath = path.join(MIGRATIONS_DIR, file)
      const sql = await fs.readFile(filePath, 'utf-8')
      
      // Extract migration ID and name from filename
      // Format: 001_initial_schema.sql
      const match = file.match(/^(\d+)_(.+)\.sql$/)
      if (!match) {
        console.warn(`Skipping invalid migration file: ${file}`)
        continue
      }

      const [, id, name] = match
      migrations.push({
        id,
        name: name.replace(/_/g, ' '),
        sql
      })
    }

    return migrations
  } catch (error) {
    console.error('Failed to load migrations:', error)
    throw error
  }
}

export async function runMigrations(options: {
  seed?: boolean
  force?: boolean
} = {}): Promise<void> {
  const db = getDatabase()
  
  try {
    console.log('🔄 Starting database migrations...')
    
    // Create migrations table if it doesn't exist
    await createMigrationsTable(db)
    
    // Load available migrations
    const availableMigrations = await loadMigrations()
    console.log(`📁 Found ${availableMigrations.length} migration files`)
    
    // Get applied migrations
    const appliedMigrations = await getAppliedMigrations(db)
    console.log(`✅ ${appliedMigrations.length} migrations already applied`)
    
    // Find pending migrations
    const pendingMigrations = availableMigrations.filter(
      migration => !appliedMigrations.includes(migration.id)
    )
    
    if (pendingMigrations.length === 0) {
      console.log('✨ Database is up to date!')
      
      if (options.seed) {
        console.log('🌱 Inserting seed data...')
        await insertSeedData(db)
        console.log('✅ Seed data inserted')
      }
      
      return
    }
    
    console.log(`🚀 Applying ${pendingMigrations.length} pending migrations...`)
    
    // Apply pending migrations
    for (const migration of pendingMigrations) {
      console.log(`⏳ Applying migration ${migration.id}: ${migration.name}`)
      
      try {
        await applyMigration(db, migration)
        console.log(`✅ Migration ${migration.id} applied successfully`)
      } catch (error) {
        console.error(`❌ Failed to apply migration ${migration.id}:`, error)
        
        if (!options.force) {
          throw error
        }
        
        console.log('⚠️  Continuing due to --force flag')
      }
    }
    
    console.log('🎉 All migrations completed successfully!')
    
    // Insert seed data if requested
    if (options.seed) {
      console.log('🌱 Inserting seed data...')
      await insertSeedData(db)
      console.log('✅ Seed data inserted')
    }
    
  } catch (error) {
    console.error('💥 Migration failed:', error)
    throw error
  }
}

export async function rollbackMigration(migrationId: string): Promise<void> {
  console.warn('⚠️  Rollback functionality not implemented yet')
  console.warn('Manual rollback required for migration:', migrationId)
  // TODO: Implement rollback functionality
  // This would require storing rollback SQL in migration files
}

export async function getMigrationStatus(): Promise<{
  applied: string[]
  pending: string[]
  total: number
}> {
  const db = getDatabase()
  
  try {
    await createMigrationsTable(db)
    
    const availableMigrations = await loadMigrations()
    const appliedMigrations = await getAppliedMigrations(db)
    
    const pendingMigrations = availableMigrations
      .filter(migration => !appliedMigrations.includes(migration.id))
      .map(migration => migration.id)
    
    return {
      applied: appliedMigrations,
      pending: pendingMigrations,
      total: availableMigrations.length
    }
  } catch (error) {
    console.error('Failed to get migration status:', error)
    throw error
  }
}

// CLI interface for migrations
export async function runMigrationCLI(): Promise<void> {
  const args = process.argv.slice(2)
  const command = args[0]
  
  switch (command) {
    case 'migrate':
      await runMigrations({
        seed: args.includes('--seed'),
        force: args.includes('--force')
      })
      break
      
    case 'status':
      const status = await getMigrationStatus()
      console.log('📊 Migration Status:')
      console.log(`   Applied: ${status.applied.length}`)
      console.log(`   Pending: ${status.pending.length}`)
      console.log(`   Total: ${status.total}`)
      
      if (status.pending.length > 0) {
        console.log('\n📋 Pending migrations:')
        status.pending.forEach(id => console.log(`   - ${id}`))
      }
      break
      
    case 'rollback':
      const migrationId = args[1]
      if (!migrationId) {
        console.error('❌ Migration ID required for rollback')
        process.exit(1)
      }
      await rollbackMigration(migrationId)
      break
      
    default:
      console.log('📖 Usage:')
      console.log('  npm run db:migrate        - Run pending migrations')
      console.log('  npm run db:migrate --seed - Run migrations and insert seed data')
      console.log('  npm run db:status         - Show migration status')
      console.log('  npm run db:rollback <id>  - Rollback specific migration')
      break
  }
}

// Run CLI if this file is executed directly
if (require.main === module) {
  runMigrationCLI()
    .then(() => process.exit(0))
    .catch((error) => {
      console.error('Migration failed:', error)
      process.exit(1)
    })
}