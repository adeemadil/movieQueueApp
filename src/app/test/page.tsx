'use client'

import { Button, Card } from '@/components/ui'

export default function TestPage() {
  return (
    <div className="min-h-screen bg-gradient-to-br from-slate-900 to-gray-900 p-8">
      <div className="max-w-4xl mx-auto space-y-8">
        <h1 className="text-4xl font-bold text-white text-center mb-8">
          UI Test Page
        </h1>
        
        {/* Test Buttons */}
        <div className="space-y-4">
          <h2 className="text-2xl font-semibold text-white">Buttons</h2>
          <div className="flex flex-wrap gap-4">
            <Button variant="primary">Primary Button</Button>
            <Button variant="secondary">Secondary Button</Button>
            <Button variant="accent">Accent Button</Button>
            <Button variant="ghost">Ghost Button</Button>
            <Button variant="emergency">Emergency Button</Button>
          </div>
        </div>

        {/* Test Cards */}
        <div className="space-y-4">
          <h2 className="text-2xl font-semibold text-white">Cards</h2>
          <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
            <Card variant="glass" className="p-6">
              <h3 className="text-lg font-semibold text-white mb-2">Glass Card</h3>
              <p className="text-gray-400">This is a glass effect card with backdrop blur.</p>
            </Card>
            
            <Card variant="recommendation" className="p-6">
              <h3 className="text-lg font-semibold text-white mb-2">Recommendation Card</h3>
              <p className="text-gray-400">This is for content recommendations.</p>
            </Card>
            
            <Card variant="context" className="p-6">
              <h3 className="text-lg font-semibold text-white mb-2">Context Card</h3>
              <p className="text-gray-400">This is for context selection.</p>
            </Card>
          </div>
        </div>

        {/* Test Colors */}
        <div className="space-y-4">
          <h2 className="text-2xl font-semibold text-white">Color Test</h2>
          <div className="grid grid-cols-2 md:grid-cols-4 gap-4">
            <div className="h-20 bg-blue-500 rounded-lg flex items-center justify-center text-white font-semibold">
              Blue 500
            </div>
            <div className="h-20 bg-orange-500 rounded-lg flex items-center justify-center text-white font-semibold">
              Orange 500
            </div>
            <div className="h-20 bg-green-500 rounded-lg flex items-center justify-center text-white font-semibold">
              Green 500
            </div>
            <div className="h-20 bg-red-500 rounded-lg flex items-center justify-center text-white font-semibold">
              Red 500
            </div>
          </div>
        </div>

        {/* Test Gradients */}
        <div className="space-y-4">
          <h2 className="text-2xl font-semibold text-white">Gradient Test</h2>
          <div className="h-32 bg-gradient-to-r from-blue-600 via-purple-600 to-orange-600 rounded-lg flex items-center justify-center">
            <span className="text-white text-xl font-bold">Gradient Background</span>
          </div>
        </div>

        {/* Test Glassmorphism */}
        <div className="space-y-4">
          <h2 className="text-2xl font-semibold text-white">Glassmorphism Test</h2>
          <div className="relative h-40 bg-gradient-to-r from-blue-500 to-purple-500 rounded-lg overflow-hidden">
            <div className="absolute inset-4 bg-white/10 backdrop-blur-lg border border-white/20 rounded-lg flex items-center justify-center">
              <span className="text-white text-lg font-semibold">Glass Effect</span>
            </div>
          </div>
        </div>
      </div>
    </div>
  )
}