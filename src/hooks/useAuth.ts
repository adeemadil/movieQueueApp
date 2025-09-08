/**
 * Authentication Hook
 * 
 * Provides authentication state and utilities
 * optimized for eating context usage patterns
 */

'use client'

import { useSession, signOut } from 'next-auth/react'
import { useRouter } from 'next/navigation'
import { useCallback } from 'react'

export function useAuth() {
  const { data: session, status } = useSession()
  const router = useRouter()

  const isLoading = status === 'loading'
  const isAuthenticated = status === 'authenticated'
  const user = session?.user

  const signOutUser = useCallback(async () => {
    try {
      await signOut({ 
        callbackUrl: '/',
        redirect: true 
      })
    } catch (error) {
      console.error('Sign out error:', error)
      // Fallback: redirect manually
      router.push('/')
    }
  }, [router])

  const requireAuth = useCallback((redirectTo = '/auth/signin') => {
    if (!isLoading && !isAuthenticated) {
      const currentPath = window.location.pathname
      const callbackUrl = encodeURIComponent(currentPath)
      router.push(`${redirectTo}?callbackUrl=${callbackUrl}`)
      return false
    }
    return isAuthenticated
  }, [isLoading, isAuthenticated, router])

  return {
    // State
    user,
    isLoading,
    isAuthenticated,
    
    // Actions
    signOut: signOutUser,
    requireAuth,
    
    // Utilities
    userId: user?.id,
    userEmail: user?.email,
  }
}