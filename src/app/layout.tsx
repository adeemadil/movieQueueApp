import type { Metadata } from 'next'
import { Inter } from 'next/font/google'
import './globals.css'

const inter = Inter({
  subsets: ['latin'],
  display: 'swap',
  variable: '--font-inter',
})

export const metadata: Metadata = {
  title: 'MealStream - Quick Streaming Decisions',
  description: 'Find something perfect for your meal in under 30 seconds',
  viewport: 'width=device-width, initial-scale=1, maximum-scale=1',
  themeColor: '#0A0E27',
  manifest: '/manifest.json',
}

export default function RootLayout({
  children,
}: {
  children: React.ReactNode
}) {
  return (
    <html lang="en" className={`${inter.variable} dark`}>
      <body
        className={`${inter.className} bg-semantic-background text-neutral-100 antialiased`}
      >
        {children}
      </body>
    </html>
  )
}
