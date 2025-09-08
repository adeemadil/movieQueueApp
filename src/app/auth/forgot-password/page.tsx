/**
 * Forgot Password Page
 * 
 * Simple password reset request form
 * optimized for quick meal-time usage
 */

'use client'

import { useState } from 'react'
import Link from 'next/link'
import { motion } from 'framer-motion'
import AuthLayout from '@/components/auth/AuthLayout'
import Button from '@/components/ui/Button'
import Input from '@/components/ui/Input'

export default function ForgotPasswordPage() {
  const [email, setEmail] = useState('')
  const [loading, setLoading] = useState(false)
  const [success, setSuccess] = useState(false)
  const [error, setError] = useState('')

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault()
    
    if (!email) {
      setError('Please enter your email address')
      return
    }

    setLoading(true)
    setError('')

    try {
      // TODO: Implement password reset API endpoint
      // For now, simulate the request
      await new Promise(resolve => setTimeout(resolve, 1500))
      setSuccess(true)
    } catch (err) {
      setError('Something went wrong. Please try again.')
    } finally {
      setLoading(false)
    }
  }

  if (success) {
    return (
      <AuthLayout title="Check Your Email" subtitle="Password reset instructions sent">
        <motion.div
          initial={{ scale: 0.8, opacity: 0 }}
          animate={{ scale: 1, opacity: 1 }}
          className="text-center py-8"
        >
          <div className="w-16 h-16 bg-accent-500/20 rounded-full flex items-center justify-center mx-auto mb-4">
            <svg className="w-8 h-8 text-accent-400" fill="none" stroke="currentColor" viewBox="0 0 24 24">
              <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M3 8l7.89 4.26a2 2 0 002.22 0L21 8M5 19h14a2 2 0 002-2V7a2 2 0 00-2-2H5a2 2 0 00-2 2v10a2 2 0 002 2z" />
            </svg>
          </div>
          <h3 className="text-lg font-semibold text-neutral-100 mb-2">
            Email Sent!
          </h3>
          <p className="text-neutral-400 mb-6">
            We've sent password reset instructions to <strong>{email}</strong>
          </p>
          <p className="text-neutral-500 text-sm mb-6">
            Check your email and follow the link to reset your password. 
            The link will expire in 1 hour.
          </p>
          <Link href="/auth/signin">
            <Button variant="primary" size="lg" className="w-full">
              Back to Sign In
            </Button>
          </Link>
        </motion.div>
      </AuthLayout>
    )
  }

  return (
    <AuthLayout 
      title="Reset Password" 
      subtitle="Enter your email to receive reset instructions"
    >
      <form onSubmit={handleSubmit} className="space-y-6">
        {/* Error message */}
        {error && (
          <motion.div
            initial={{ opacity: 0, y: -10 }}
            animate={{ opacity: 1, y: 0 }}
            className="bg-red-500/10 border border-red-500/20 rounded-lg p-4"
          >
            <p className="text-red-400 text-sm flex items-center">
              <svg className="w-4 h-4 mr-2" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M12 8v4m0 4h.01M21 12a9 9 0 11-18 0 9 9 0 0118 0z" />
              </svg>
              {error}
            </p>
          </motion.div>
        )}

        {/* Email input */}
        <Input
          label="Email Address"
          type="email"
          value={email}
          onChange={(e) => {
            setEmail(e.target.value)
            if (error) setError('')
          }}
          placeholder="your@email.com"
          required
          icon={
            <svg className="w-5 h-5" fill="none" stroke="currentColor" viewBox="0 0 24 24">
              <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M16 12a4 4 0 10-8 0 4 4 0 008 0zm0 0v1.5a2.5 2.5 0 005 0V12a9 9 0 10-9 9m4.5-1.206a8.959 8.959 0 01-4.5 1.207" />
            </svg>
          }
        />

        {/* Submit button */}
        <Button
          type="submit"
          variant="primary"
          size="lg"
          loading={loading}
          className="w-full"
        >
          {loading ? 'Sending...' : 'Send Reset Instructions'}
        </Button>

        {/* Back to sign in */}
        <div className="text-center">
          <Link 
            href="/auth/signin" 
            className="text-sm text-neutral-400 hover:text-neutral-300 transition-colors"
          >
            ← Back to Sign In
          </Link>
        </div>
      </form>

      {/* Help note */}
      <motion.div
        initial={{ opacity: 0 }}
        animate={{ opacity: 1 }}
        transition={{ delay: 0.8 }}
        className="mt-6 p-4 bg-accent-500/10 border border-accent-500/20 rounded-lg"
      >
        <p className="text-accent-300 text-sm">
          🍽️ <strong>Quick tip:</strong> While you wait for the email, 
          you can browse recommendations without an account!
        </p>
        <Link href="/" className="text-accent-400 hover:text-accent-300 text-sm underline mt-2 inline-block">
          Browse recommendations →
        </Link>
      </motion.div>
    </AuthLayout>
  )
}