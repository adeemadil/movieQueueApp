/**
 * Authentication Error Page
 * 
 * Handles authentication errors with helpful recovery options
 * optimized for eating context (quick resolution)
 */

'use client'

import { useSearchParams } from 'next/navigation'
import Link from 'next/link'
import { motion } from 'framer-motion'
import AuthLayout from '@/components/auth/AuthLayout'
import Button from '@/components/ui/Button'

const errorMessages: Record<string, { title: string; description: string; action: string }> = {
  Configuration: {
    title: 'Configuration Error',
    description: 'There was a problem with the server configuration.',
    action: 'Please try again later or contact support.'
  },
  AccessDenied: {
    title: 'Access Denied',
    description: 'You do not have permission to sign in.',
    action: 'Please check your account status or contact support.'
  },
  Verification: {
    title: 'Verification Required',
    description: 'Please verify your email address before signing in.',
    action: 'Check your email for a verification link.'
  },
  Default: {
    title: 'Authentication Error',
    description: 'Something went wrong during authentication.',
    action: 'Please try signing in again.'
  }
}

export default function AuthErrorPage() {
  const searchParams = useSearchParams()
  const error = searchParams.get('error') || 'Default'
  
  const errorInfo = errorMessages[error] || errorMessages.Default

  return (
    <AuthLayout title="Oops!" subtitle="Something went wrong">
      <div className="text-center py-8">
        {/* Error icon */}
        <motion.div
          initial={{ scale: 0.8, opacity: 0 }}
          animate={{ scale: 1, opacity: 1 }}
          transition={{ duration: 0.5 }}
          className="w-16 h-16 bg-red-500/20 rounded-full flex items-center justify-center mx-auto mb-6"
        >
          <svg className="w-8 h-8 text-red-400" fill="none" stroke="currentColor" viewBox="0 0 24 24">
            <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M12 8v4m0 4h.01M21 12a9 9 0 11-18 0 9 9 0 0118 0z" />
          </svg>
        </motion.div>

        {/* Error details */}
        <motion.div
          initial={{ opacity: 0, y: 10 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ duration: 0.5, delay: 0.2 }}
          className="mb-8"
        >
          <h3 className="text-xl font-semibold text-neutral-100 mb-3">
            {errorInfo?.title || 'Authentication Error'}
          </h3>
          <p className="text-neutral-300 mb-2">
            {errorInfo?.description || 'Something went wrong during authentication.'}
          </p>
          <p className="text-neutral-400 text-sm">
            {errorInfo?.action || 'Please try signing in again.'}
          </p>
        </motion.div>

        {/* Action buttons */}
        <motion.div
          initial={{ opacity: 0, y: 10 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ duration: 0.5, delay: 0.4 }}
          className="space-y-4"
        >
          <Link href="/auth/signin">
            <Button variant="primary" size="lg" className="w-full">
              Try Signing In Again
            </Button>
          </Link>
          
          <Link href="/auth/signup">
            <Button variant="secondary" size="lg" className="w-full">
              Create New Account
            </Button>
          </Link>
          
          <Link href="/">
            <Button variant="ghost" size="md" className="w-full">
              Go to Home
            </Button>
          </Link>
        </motion.div>

        {/* Help text */}
        <motion.div
          initial={{ opacity: 0 }}
          animate={{ opacity: 1 }}
          transition={{ delay: 0.8 }}
          className="mt-8 p-4 bg-accent-500/10 border border-accent-500/20 rounded-lg"
        >
          <p className="text-accent-300 text-sm">
            🍽️ <strong>Your food is waiting!</strong> If you need immediate access, 
            you can browse recommendations without an account.
          </p>
          <Link href="/" className="text-accent-400 hover:text-accent-300 text-sm underline mt-2 inline-block">
            Browse without signing in →
          </Link>
        </motion.div>
      </div>
    </AuthLayout>
  )
}