/**
 * Middleware for MealStream
 * 
 * Handles authentication and route protection
 * optimized for eating context (minimal redirects)
 */

import { withAuth } from 'next-auth/middleware'
import { NextResponse } from 'next/server'

export default withAuth(
  function middleware(req) {
    // Allow access to public routes
    const { pathname } = req.nextUrl
    
    // Public routes that don't require authentication
    const publicRoutes = [
      '/',
      '/auth/signin',
      '/auth/signup',
      '/auth/error',
      '/api/auth',
    ]
    
    // Check if current path is public
    const isPublicRoute = publicRoutes.some(route => 
      pathname.startsWith(route)
    )
    
    if (isPublicRoute) {
      return NextResponse.next()
    }
    
    // For protected routes, NextAuth will handle the redirect
    return NextResponse.next()
  },
  {
    callbacks: {
      authorized: ({ token, req }) => {
        const { pathname } = req.nextUrl
        
        // Public routes are always authorized
        const publicRoutes = [
          '/',
          '/auth/signin',
          '/auth/signup',
          '/auth/error',
        ]
        
        const isPublicRoute = publicRoutes.some(route => 
          pathname.startsWith(route)
        )
        
        if (isPublicRoute) {
          return true
        }
        
        // Protected routes require a valid token
        return !!token
      },
    },
  }
)

export const config = {
  matcher: [
    /*
     * Match all request paths except for the ones starting with:
     * - api/auth (NextAuth.js routes)
     * - _next/static (static files)
     * - _next/image (image optimization files)
     * - favicon.ico (favicon file)
     * - public folder files
     */
    '/((?!api/auth|_next/static|_next/image|favicon.ico|.*\\.png$|.*\\.jpg$|.*\\.jpeg$|.*\\.gif$|.*\\.svg$).*)',
  ],
}