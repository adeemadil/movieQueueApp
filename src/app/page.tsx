'use client'

import HeroSection from '@/components/home/HeroSection'
import FeatureCards from '@/components/home/FeatureCards'
import DemoSection from '@/components/home/DemoSection'

export default function Home() {
  return (
    <main className="min-h-screen bg-gradient-to-br from-primary-950 via-semantic-background to-primary-950">
      <div className="container mx-auto px-4 py-16">
        <HeroSection />
        <FeatureCards />
        <DemoSection />
      </div>
    </main>
  )
}
