import { render, screen } from '@testing-library/react'
import { describe, it, expect } from 'vitest'
import Home from './page'

describe('Home Page', () => {
  it('renders the main heading', () => {
    render(<Home />)
    const heading = screen.getByText('MealStream')
    expect(heading).toBeInTheDocument()
  })

  it('renders the tagline', () => {
    render(<Home />)
    const tagline = screen.getByText(
      'Find something perfect for your meal in under 30 seconds'
    )
    expect(tagline).toBeInTheDocument()
  })
})
