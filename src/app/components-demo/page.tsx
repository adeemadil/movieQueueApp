/**
 * Components Demo Page - MealStream Design System
 * 
 * Showcase all UI components for testing and development
 */

'use client'

import { useState } from 'react'
import { 
  Button, 
  Input, 
  Card, 
  FoodFriendlyIndicator, 
  LoadingState, 
  Toast, 
  SlideUpPanel,
  BottomNavigation,
  TopNavigation
} from '@/components/ui'

export default function ComponentsDemo() {
  const [showToast, setShowToast] = useState(false)
  const [showPanel, setShowPanel] = useState(false)
  const [activeTab, setActiveTab] = useState('home')

  const navigationItems = [
    {
      id: 'home',
      label: 'Quick Pick',
      icon: (
        <svg fill="none" stroke="currentColor" viewBox="0 0 24 24" className="w-6 h-6">
          <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M3 7v10a2 2 0 002 2h14a2 2 0 002-2V9a2 2 0 00-2-2H5a2 2 0 00-2-2z" />
        </svg>
      ),
      active: activeTab === 'home'
    },
    {
      id: 'history',
      label: 'History',
      icon: (
        <svg fill="none" stroke="currentColor" viewBox="0 0 24 24" className="w-6 h-6">
          <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M12 8v4l3 3m6-3a9 9 0 11-18 0 9 9 0 0118 0z" />
        </svg>
      ),
      badge: 3
    },
    {
      id: 'settings',
      label: 'Settings',
      icon: (
        <svg fill="none" stroke="currentColor" viewBox="0 0 24 24" className="w-6 h-6">
          <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M10.325 4.317c.426-1.756 2.924-1.756 3.35 0a1.724 1.724 0 002.573 1.066c1.543-.94 3.31.826 2.37 2.37a1.724 1.724 0 001.065 2.572c1.756.426 1.756 2.924 0 3.35a1.724 1.724 0 00-1.066 2.573c.94 1.543-.826 3.31-2.37 2.37a1.724 1.724 0 00-2.572 1.065c-.426 1.756-2.924 1.756-3.35 0a1.724 1.724 0 00-2.573-1.066c-1.543.94-3.31-.826-2.37-2.37a1.724 1.724 0 00-1.065-2.572c-1.756-.426-1.756-2.924 0-3.35a1.724 1.724 0 001.066-2.573c-.94-1.543.826-3.31 2.37-2.37.996.608 2.296.07 2.572-1.065z" />
          <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M15 12a3 3 0 11-6 0 3 3 0 016 0z" />
        </svg>
      )
    }
  ]

  return (
    <div className="min-h-screen bg-gradient-to-br from-primary-950 via-neutral-900 to-primary-950 pb-20">
      <TopNavigation 
        title="Component Demo"
        subtitle="MealStream Design System"
        showBack={false}
      />

      <div className="container mx-auto px-4 py-8 space-y-12">
        {/* Buttons Section */}
        <section>
          <h2 className="text-2xl font-bold text-neutral-100 mb-6">Buttons</h2>
          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-4">
            <Button variant="primary">Primary Button</Button>
            <Button variant="secondary">Secondary Button</Button>
            <Button variant="accent">Accent Button</Button>
            <Button variant="ghost">Ghost Button</Button>
            <Button variant="emergency">Emergency Button</Button>
            <Button variant="primary" loading>Loading...</Button>
          </div>
        </section>

        {/* Cards Section */}
        <section>
          <h2 className="text-2xl font-bold text-neutral-100 mb-6">Cards</h2>
          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
            <Card variant="recommendation" interaction="pressable">
              <div className="space-y-4">
                <div className="h-32 bg-gradient-to-r from-primary-600 to-accent-500 rounded-lg"></div>
                <h3 className="text-lg font-semibold text-neutral-100">Recommendation Card</h3>
                <p className="text-neutral-300">Interactive card for content recommendations</p>
              </div>
            </Card>

            <Card variant="context" interaction="pressable">
              <div className="text-center space-y-4">
                <div className="w-12 h-12 bg-accent-500 rounded-full mx-auto flex items-center justify-center">
                  <svg className="w-6 h-6 text-white" fill="currentColor" viewBox="0 0 24 24">
                    <path d="M12 2C6.48 2 2 6.48 2 12s4.48 10 10 10 10-4.48 10-10S17.52 2 12 2z"/>
                  </svg>
                </div>
                <h3 className="text-lg font-semibold text-neutral-100">Context Card</h3>
                <p className="text-neutral-300">For context selection</p>
              </div>
            </Card>

            <Card variant="platform" interaction="pressable">
              <div className="flex items-center space-x-4">
                <div className="w-10 h-10 bg-red-600 rounded-lg flex items-center justify-center">
                  <span className="text-white font-bold text-sm">N</span>
                </div>
                <div>
                  <h3 className="font-semibold text-neutral-100">Netflix</h3>
                  <p className="text-sm text-neutral-400">Streaming Platform</p>
                </div>
              </div>
            </Card>
          </div>
        </section>

        {/* Food-Friendly Indicators */}
        <section>
          <h2 className="text-2xl font-bold text-neutral-100 mb-6">Food-Friendly Indicators</h2>
          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-4">
            <FoodFriendlyIndicator score={2} style="detailed" animation="pulse" />
            <FoodFriendlyIndicator score={5} style="detailed" animation="grow" />
            <FoodFriendlyIndicator score={8} style="detailed" animation="glow" />
            <FoodFriendlyIndicator score={10} style="detailed" animation="grow" />
          </div>
          <div className="flex items-center space-x-4 mt-4">
            <FoodFriendlyIndicator score={7} style="minimal" />
            <FoodFriendlyIndicator score={9} style="badge" />
            <FoodFriendlyIndicator score={4} style="minimal" animation="pulse" />
          </div>
        </section>

        {/* Input Fields */}
        <section>
          <h2 className="text-2xl font-bold text-neutral-100 mb-6">Input Fields</h2>
          <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
            <Input 
              label="Email Address"
              placeholder="Enter your email"
              type="email"
              icon={
                <svg className="w-5 h-5" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                  <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M16 12a4 4 0 10-8 0 4 4 0 008 0zm0 0v1.5a2.5 2.5 0 005 0V12a9 9 0 10-9 9m4.5-1.206a8.959 8.959 0 01-4.5 1.207" />
                </svg>
              }
            />
            <Input 
              label="Password"
              placeholder="Enter your password"
              type="password"
              showPasswordToggle
              helperText="Must be at least 8 characters"
            />
          </div>
        </section>

        {/* Loading States */}
        <section>
          <h2 className="text-2xl font-bold text-neutral-100 mb-6">Loading States</h2>
          <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
            <div>
              <h3 className="text-lg font-semibold text-neutral-200 mb-4">Skeleton Cards</h3>
              <LoadingState type="skeleton" content="recommendation" count={2} />
            </div>
            <div>
              <h3 className="text-lg font-semibold text-neutral-200 mb-4">Context Skeletons</h3>
              <LoadingState type="skeleton" content="context" count={3} />
            </div>
          </div>
        </section>

        {/* Interactive Elements */}
        <section>
          <h2 className="text-2xl font-bold text-neutral-100 mb-6">Interactive Elements</h2>
          <div className="flex flex-wrap gap-4">
            <Button variant="primary" onClick={() => setShowToast(true)}>
              Show Toast
            </Button>
            <Button variant="secondary" onClick={() => setShowPanel(true)}>
              Open Panel
            </Button>
          </div>
        </section>
      </div>

      {/* Toast */}
      <Toast
        visible={showToast}
        variant="success"
        title="Component Demo"
        description="All components are working perfectly!"
        onClose={() => setShowToast(false)}
        action={{
          label: "View More",
          onClick: () => console.log("Action clicked")
        }}
      />

      {/* Slide Up Panel */}
      <SlideUpPanel
        isOpen={showPanel}
        onClose={() => setShowPanel(false)}
        title="Demo Panel"
        description="This is a slide-up panel that replaces modals"
        size="md"
      >
        <div className="space-y-4">
          <p className="text-neutral-300">
            This panel slides up from the bottom and provides a mobile-friendly 
            alternative to traditional modals, following our UX commandments.
          </p>
          <div className="grid grid-cols-2 gap-4">
            <Button variant="primary" onClick={() => setShowPanel(false)}>
              Confirm
            </Button>
            <Button variant="ghost" onClick={() => setShowPanel(false)}>
              Cancel
            </Button>
          </div>
        </div>
      </SlideUpPanel>

      {/* Bottom Navigation */}
      <BottomNavigation
        items={navigationItems}
        activeId={activeTab}
        onItemClick={setActiveTab}
      />
    </div>
  )
}