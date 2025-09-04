// User repository tests
import { describe, it, expect, beforeAll, afterAll, beforeEach } from 'vitest'
import { getDatabase, closeDatabase } from '../connection'
import UserRepository from '../repositories/user-repository'
import type { DatabaseConnection, CreateUserRequest } from '@/types/database'

describe('UserRepository', () => {
  let db: DatabaseConnection
  let userRepo: UserRepository
  let testUserId: string

  beforeAll(async () => {
    db = getDatabase()
    userRepo = new UserRepository(db)
  })

  afterAll(async () => {
    // Clean up test data
    if (testUserId) {
      try {
        await userRepo.deleteUser(testUserId)
      } catch (error) {
        // Ignore cleanup errors
      }
    }
    await closeDatabase()
  })

  beforeEach(async () => {
    // Clean up any existing test users
    await db.query(`
      DELETE FROM users 
      WHERE email LIKE 'test%@example.com'
    `)
  })

  describe('createUser', () => {
    it('should create a new user successfully', async () => {
      const userData: CreateUserRequest = {
        email: 'test@example.com',
        password: 'testpassword123',
        platforms: ['netflix', 'disney-plus'],
        preferences: {
          theme: 'dark',
          notifications: true
        }
      }

      const user = await userRepo.createUser(userData)
      testUserId = user.id

      expect(user.id).toBeDefined()
      expect(user.email).toBe('test@example.com')
      expect(user.platforms).toEqual(['netflix', 'disney-plus'])
      expect(user.preferences.theme).toBe('dark')
      expect(user.food_friendly_threshold).toBe(6)
      expect(user.created_at).toBeInstanceOf(Date)
    })

    it('should hash the password', async () => {
      const userData: CreateUserRequest = {
        email: 'test2@example.com',
        password: 'testpassword123'
      }

      const user = await userRepo.createUser(userData)
      
      // Verify password is hashed (not stored in plain text)
      const userWithPassword = await userRepo.getUserWithPasswordByEmail(user.email)
      expect(userWithPassword?.password_hash).toBeDefined()
      expect(userWithPassword?.password_hash).not.toBe('testpassword123')
      
      // Clean up
      await userRepo.deleteUser(user.id)
    })

    it('should throw error for duplicate email', async () => {
      const userData: CreateUserRequest = {
        email: 'duplicate@example.com',
        password: 'testpassword123'
      }

      const user1 = await userRepo.createUser(userData)
      
      await expect(
        userRepo.createUser(userData)
      ).rejects.toThrow('User already exists')
      
      // Clean up
      await userRepo.deleteUser(user1.id)
    })
  })

  describe('getUserById', () => {
    it('should retrieve user by ID', async () => {
      const userData: CreateUserRequest = {
        email: 'test3@example.com',
        password: 'testpassword123'
      }

      const createdUser = await userRepo.createUser(userData)
      const retrievedUser = await userRepo.getUserById(createdUser.id)

      expect(retrievedUser).toBeDefined()
      expect(retrievedUser?.id).toBe(createdUser.id)
      expect(retrievedUser?.email).toBe('test3@example.com')
      
      // Clean up
      await userRepo.deleteUser(createdUser.id)
    })

    it('should return null for non-existent user', async () => {
      const user = await userRepo.getUserById('00000000-0000-0000-0000-000000000000')
      expect(user).toBeNull()
    })
  })

  describe('getUserByEmail', () => {
    it('should retrieve user by email', async () => {
      const userData: CreateUserRequest = {
        email: 'test4@example.com',
        password: 'testpassword123'
      }

      const createdUser = await userRepo.createUser(userData)
      const retrievedUser = await userRepo.getUserByEmail('test4@example.com')

      expect(retrievedUser).toBeDefined()
      expect(retrievedUser?.email).toBe('test4@example.com')
      
      // Clean up
      await userRepo.deleteUser(createdUser.id)
    })

    it('should be case insensitive', async () => {
      const userData: CreateUserRequest = {
        email: 'test5@example.com',
        password: 'testpassword123'
      }

      const createdUser = await userRepo.createUser(userData)
      const retrievedUser = await userRepo.getUserByEmail('TEST5@EXAMPLE.COM')

      expect(retrievedUser).toBeDefined()
      expect(retrievedUser?.email).toBe('test5@example.com')
      
      // Clean up
      await userRepo.deleteUser(createdUser.id)
    })
  })

  describe('verifyPassword', () => {
    it('should verify correct password', async () => {
      const userData: CreateUserRequest = {
        email: 'test6@example.com',
        password: 'correctpassword'
      }

      const createdUser = await userRepo.createUser(userData)
      const verifiedUser = await userRepo.verifyPassword('test6@example.com', 'correctpassword')

      expect(verifiedUser).toBeDefined()
      expect(verifiedUser?.id).toBe(createdUser.id)
      
      // Clean up
      await userRepo.deleteUser(createdUser.id)
    })

    it('should reject incorrect password', async () => {
      const userData: CreateUserRequest = {
        email: 'test7@example.com',
        password: 'correctpassword'
      }

      const createdUser = await userRepo.createUser(userData)
      const verifiedUser = await userRepo.verifyPassword('test7@example.com', 'wrongpassword')

      expect(verifiedUser).toBeNull()
      
      // Clean up
      await userRepo.deleteUser(createdUser.id)
    })
  })

  describe('updateUser', () => {
    it('should update user platforms', async () => {
      const userData: CreateUserRequest = {
        email: 'test8@example.com',
        password: 'testpassword123',
        platforms: ['netflix']
      }

      const createdUser = await userRepo.createUser(userData)
      const updatedUser = await userRepo.updateUserPlatforms(createdUser.id, ['netflix', 'hulu', 'disney-plus'])

      expect(updatedUser.platforms).toEqual(['netflix', 'hulu', 'disney-plus'])
      expect(updatedUser.updated_at.getTime()).toBeGreaterThan(createdUser.updated_at.getTime())
      
      // Clean up
      await userRepo.deleteUser(createdUser.id)
    })

    it('should update user preferences', async () => {
      const userData: CreateUserRequest = {
        email: 'test9@example.com',
        password: 'testpassword123',
        preferences: { theme: 'light' }
      }

      const createdUser = await userRepo.createUser(userData)
      const updatedUser = await userRepo.updateUserPreferences(createdUser.id, {
        theme: 'dark',
        notifications: false
      })

      expect(updatedUser.preferences.theme).toBe('dark')
      expect(updatedUser.preferences.notifications).toBe(false)
      
      // Clean up
      await userRepo.deleteUser(createdUser.id)
    })
  })

  describe('getUserStats', () => {
    it('should return user statistics', async () => {
      const userData: CreateUserRequest = {
        email: 'test10@example.com',
        password: 'testpassword123'
      }

      const createdUser = await userRepo.createUser(userData)
      const stats = await userRepo.getUserStats(createdUser.id)

      expect(stats).toBeDefined()
      expect(stats.total_sessions).toBe(0)
      expect(stats.total_selections).toBe(0)
      expect(stats.avg_selection_time).toBe(0)
      expect(Array.isArray(stats.favorite_platforms)).toBe(true)
      
      // Clean up
      await userRepo.deleteUser(createdUser.id)
    })
  })
})