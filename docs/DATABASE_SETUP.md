# Database Setup Guide

This guide explains how to set up the PostgreSQL database for MealStream development.

## Prerequisites

- PostgreSQL 14+ installed locally
- Node.js 18+ installed
- npm or yarn package manager

## Quick Setup (Local Development)

### 1. Install PostgreSQL

**macOS (using Homebrew):**
```bash
brew install postgresql@14
brew services start postgresql@14
```

**Ubuntu/Debian:**
```bash
sudo apt update
sudo apt install postgresql postgresql-contrib
sudo systemctl start postgresql
```

**Windows:**
Download and install from [PostgreSQL official website](https://www.postgresql.org/download/windows/)

### 2. Create Database and User

```bash
# Connect to PostgreSQL as superuser
psql postgres

# Create database and user
CREATE DATABASE mealstream_dev;
CREATE USER mealstream_user WITH PASSWORD 'mealstream_password';
GRANT ALL PRIVILEGES ON DATABASE mealstream_dev TO mealstream_user;

# Exit psql
\q
```

### 3. Configure Environment

Copy the example environment file:
```bash
cp .env.example .env.local
```

Update `.env.local` with your database credentials:
```env
DATABASE_HOST=localhost
DATABASE_PORT=5432
DATABASE_NAME=mealstream_dev
DATABASE_USER=mealstream_user
DATABASE_PASSWORD=mealstream_password
```

### 4. Run Database Migrations

```bash
# Install dependencies
npm install

# Run migrations and seed data
npm run db:setup
```

### 5. Verify Setup

```bash
# Check migration status
npm run db:status
```

You should see output indicating that all migrations have been applied.

## Database Schema Overview

### Core Tables

- **users** - User accounts, preferences, and platform subscriptions
- **content** - Movie/TV show metadata with food-friendly scoring
- **viewing_history** - User viewing history and ratings
- **user_sessions** - Context tracking for recommendation sessions
- **recommendation_cache** - Cached recommendations for performance
- **classification_feedback** - User feedback on food-friendly classifications
- **platform_content** - Platform availability tracking

### Key Features

- **UUID Primary Keys** - All tables use UUID for better scalability
- **JSONB Columns** - Flexible storage for preferences, metadata, and scores
- **Full-Text Search** - Optimized indexes for content search
- **Audit Trails** - Created/updated timestamps on all records
- **Referential Integrity** - Foreign key constraints with appropriate cascading

## Development Commands

```bash
# Run pending migrations
npm run db:migrate

# Run migrations with seed data
npm run db:migrate:seed

# Check migration status
npm run db:status

# Reset database (careful - this drops all data!)
npm run db:reset
```

## Production Setup

### Using Supabase (Recommended)

1. Create a new project at [supabase.com](https://supabase.com)
2. Get your database connection string from the project settings
3. Update your production environment variables:

```env
DATABASE_HOST=your-project.supabase.co
DATABASE_PORT=5432
DATABASE_NAME=postgres
DATABASE_USER=postgres
DATABASE_PASSWORD=your-password
DATABASE_SSL=true
```

### Using Railway

1. Create a new project at [railway.app](https://railway.app)
2. Add a PostgreSQL service
3. Copy the connection details to your environment variables

### Using Heroku Postgres

1. Add Heroku Postgres addon to your app
2. The `DATABASE_URL` will be automatically set
3. Parse the URL in your connection configuration

## Troubleshooting

### Connection Issues

**Error: "password authentication failed"**
- Check your username and password in `.env.local`
- Ensure the user has proper permissions on the database

**Error: "database does not exist"**
- Create the database manually using `createdb mealstream_dev`
- Or use the SQL commands in step 2 above

**Error: "connection refused"**
- Ensure PostgreSQL is running: `brew services start postgresql@14`
- Check if PostgreSQL is listening on the correct port

### Migration Issues

**Error: "relation already exists"**
- Check if you have existing tables that conflict
- You may need to drop and recreate the database

**Error: "permission denied"**
- Ensure your database user has CREATE privileges
- Grant additional permissions if needed

### Performance Issues

**Slow queries**
- Check if all indexes are created properly
- Run `ANALYZE` on your tables after large data imports
- Consider increasing `shared_buffers` in PostgreSQL config

## Data Management

### Backup and Restore

```bash
# Create backup
pg_dump mealstream_dev > backup.sql

# Restore from backup
psql mealstream_dev < backup.sql
```

### Seed Data

The migration system includes sample content for development:
- Popular TV shows and movies
- Pre-calculated food-friendly scores
- Sample user preferences

To refresh seed data:
```bash
npm run db:migrate:seed
```

## Security Considerations

### Development
- Use strong passwords even in development
- Don't commit `.env.local` to version control
- Regularly update dependencies

### Production
- Use SSL connections (`DATABASE_SSL=true`)
- Implement connection pooling
- Set up regular backups
- Monitor for suspicious activity
- Use environment-specific credentials

## Monitoring and Maintenance

### Health Checks
The application includes database health check endpoints:
- `/api/health/database` - Basic connectivity test
- `/api/health/migrations` - Migration status check

### Performance Monitoring
- Monitor connection pool usage
- Track slow query logs
- Set up alerts for connection failures
- Monitor disk usage and growth trends

### Regular Maintenance
- Update PostgreSQL regularly
- Vacuum and analyze tables periodically
- Review and optimize slow queries
- Archive old session data as needed