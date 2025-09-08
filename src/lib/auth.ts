/**
 * NextAuth.js Configuration for MealStream
 * 
 * Implements secure authentication with email/password
 * optimized for quick meal-time usage scenarios
 */

import { NextAuthOptions } from 'next-auth'
import CredentialsProvider from 'next-auth/providers/credentials'
import PostgresAdapter from '@auth/pg-adapter'
import { Pool } from 'pg'
import bcrypt from 'bcryptjs'

// Database connection for NextAuth
const pool = new Pool({
  connectionString: process.env.DATABASE_URL,
  ssl: process.env.NODE_ENV === 'production' ? { rejectUnauthorized: false } : false,
})

export const authOptions: NextAuthOptions = {
  adapter: PostgresAdapter(pool),
  providers: [
    CredentialsProvider({
      name: 'credentials',
      credentials: {
        email: { 
          label: 'Email', 
          type: 'email',
          placeholder: 'your@email.com'
        },
        password: { 
          label: 'Password', 
          type: 'password',
          placeholder: 'Your password'
        }
      },
      async authorize(credentials) {
        if (!credentials?.email || !credentials?.password) {
          throw new Error('Email and password are required')
        }

        try {
          // Query user from database
          const result = await pool.query(
            'SELECT id, email, password_hash, created_at FROM users WHERE email = $1',
            [credentials.email]
          )

          const user = result.rows[0]
          if (!user) {
            throw new Error('No user found with this email')
          }

          // Verify password
          const isValidPassword = await bcrypt.compare(
            credentials.password,
            user.password_hash
          )

          if (!isValidPassword) {
            throw new Error('Invalid password')
          }

          // Return user object (password_hash excluded for security)
          return {
            id: user.id,
            email: user.email,
            createdAt: user.created_at,
          }
        } catch (error) {
          console.error('Authentication error:', error)
          throw new Error('Authentication failed')
        }
      }
    })
  ],
  session: {
    strategy: 'jwt',
    maxAge: 7 * 24 * 60 * 60, // 7 days (eating habits are consistent)
  },
  jwt: {
    maxAge: 7 * 24 * 60 * 60, // 7 days
  },
  pages: {
    signIn: '/auth/signin',
    error: '/auth/error',
  },
  callbacks: {
    async jwt({ token, user }) {
      // Persist user data in JWT token
      if (user) {
        token.id = user.id
        token.email = user.email
      }
      return token
    },
    async session({ session, token }) {
      // Send properties to the client
      if (token) {
        session.user.id = token.id as string
        session.user.email = token.email as string
      }
      return session
    },
  },
  events: {
    async signIn({ user, isNewUser }) {
      if (isNewUser) {
        console.log(`New user registered: ${user.email}`)
        // Could trigger welcome email or analytics event
      }
    },
  },
  // Security configuration
  secret: process.env.NEXTAUTH_SECRET,
  debug: process.env.NODE_ENV === 'development',
}

// Helper function to hash passwords
export async function hashPassword(password: string): Promise<string> {
  const saltRounds = 12 // High security for user passwords
  return bcrypt.hash(password, saltRounds)
}

// Helper function to create a new user
export async function createUser(email: string, password: string) {
  try {
    // Check if user already exists
    const existingUser = await pool.query(
      'SELECT id FROM users WHERE email = $1',
      [email]
    )

    if (existingUser.rows.length > 0) {
      throw new Error('User already exists with this email')
    }

    // Hash password and create user
    const hashedPassword = await hashPassword(password)
    const result = await pool.query(
      `INSERT INTO users (email, password_hash, created_at, updated_at) 
       VALUES ($1, $2, NOW(), NOW()) 
       RETURNING id, email, created_at`,
      [email, hashedPassword]
    )

    return result.rows[0]
  } catch (error) {
    console.error('User creation error:', error)
    throw error
  }
}

// Type extensions for NextAuth
declare module 'next-auth' {
  interface Session {
    user: {
      id: string
      email: string
      name?: string | null
      image?: string | null
    }
  }

  interface User {
    id: string
    email: string
    createdAt?: Date
  }
}

declare module 'next-auth/jwt' {
  interface JWT {
    id: string
    email: string
  }
}