/**
 * Session Provider Component
 * 
 * Wraps the app with NextAuth session context
 */

'use client'

import { SessionProvider as NextAuthSessionProvider } from 'next-auth/react'
import { ReactNode } from 'react'

interface SessionProviderProps {
  children: ReactNode
}

export default function SessionProvider({ children }: SessionProviderProps) {
  return (
    <NextAuthSessionProvider>
      {children}
    </NextAuthSessionProvider>
  )
}