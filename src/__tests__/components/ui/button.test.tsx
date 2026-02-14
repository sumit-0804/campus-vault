import { describe, it, expect } from 'vitest'
import { render, screen } from '@testing-library/react'
import { Button } from '@/components/ui/button'

describe('Button', () => {
    it('renders with default props', () => {
        render(<Button>Click me</Button>)
        const button = screen.getByRole('button', { name: /click me/i })
        expect(button).toBeInTheDocument()
        expect(button).toHaveClass('bg-primary')
    })

    it('renders as a child when asChild is true', () => {
        render(
            <Button asChild>
                <a href="/test">Link Button</a>
            </Button>
        )
        const link = screen.getByRole('link', { name: /link button/i })
        expect(link).toBeInTheDocument()
        expect(link).toHaveAttribute('href', '/test')
        expect(link).toHaveClass('inline-flex')
    })

    it('applies variant classes', () => {
        render(<Button variant="destructive">Delete</Button>)
        const button = screen.getByRole('button', { name: /delete/i })
        expect(button).toHaveClass('bg-destructive')
    })

    it('applies size classes', () => {
        render(<Button size="sm">Small</Button>)
        const button = screen.getByRole('button', { name: /small/i })
        expect(button).toHaveClass('h-8')
    })

    it('combines custom className', () => {
        render(<Button className="custom-class">Custom</Button>)
        const button = screen.getByRole('button', { name: /custom/i })
        expect(button).toHaveClass('custom-class')
    })
})
