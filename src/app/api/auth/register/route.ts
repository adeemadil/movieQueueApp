/**
 * User Registration API Endpoint
 * 
 * Handles new user registration with validation
 * optimized for quick meal-time signup
 */

import { NextRequest, NextResponse } from 'next/server'
import { createUser } from '@/lib/auth'
import { z } from 'zod'

// Validation schema for registration
const registerSchema = z.object({
  email: z
    .string()
    .email('Please enter a valid email address')
    .min(1, 'Email is required'),
  password: z
    .string()
    .min(8, 'Password must be at least 8 characters')
    .regex(
      /^(?=.*[a-z])(?=.*[A-Z])(?=.*\d)/,
      'Password must contain at least one uppercase letter, one lowercase letter, and one number'
    ),
  confirmPassword: z.string().min(1, 'Please confirm your password'),
}).refine((data) => data.password === data.confirmPassword, {
  message: "Passwords don't match",
  path: ["confirmPassword"],
})

export async function POST(request: NextRequest) {
  try {
    const body = await request.json()
    
    // Validate input
    const validatedData = registerSchema.parse(body)
    
    // Create user
    const user = await createUser(validatedData.email, validatedData.password)
    
    // Return success (exclude sensitive data)
    return NextResponse.json(
      {
        success: true,
        message: 'Account created successfully! You can now sign in.',
        user: {
          id: user.id,
          email: user.email,
          createdAt: user.created_at,
        },
      },
      { status: 201 }
    )
  } catch (error) {
    console.error('Registration error:', error)
    
    // Handle validation errors
    if (error instanceof z.ZodError) {
      return NextResponse.json(
        {
          success: false,
          message: 'Validation failed',
          errors: error.errors.map((err: any) => ({
            field: err.path.join('.'),
            message: err.message,
          })),
        },
        { status: 400 }
      )
    }
    
    // Handle duplicate user error
    if (error instanceof Error && error.message.includes('already exists')) {
      return NextResponse.json(
        {
          success: false,
          message: 'An account with this email already exists',
        },
        { status: 409 }
      )
    }
    
    // Handle other errors
    return NextResponse.json(
      {
        success: false,
        message: 'Something went wrong. Please try again.',
      },
      { status: 500 }
    )
  }
}