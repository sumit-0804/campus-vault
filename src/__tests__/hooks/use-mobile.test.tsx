import { describe, it, expect, vi, beforeEach, afterEach } from 'vitest'
import { renderHook, act } from '@testing-library/react'
import { useIsMobile } from '@/hooks/use-mobile'

describe('useIsMobile', () => {
    let matchMediaMock: any

    beforeEach(() => {
        matchMediaMock = vi.fn().mockImplementation((query) => ({
            matches: false,
            media: query,
            onchange: null,
            addListener: vi.fn(), // deprecated
            removeListener: vi.fn(), // deprecated
            addEventListener: vi.fn(),
            removeEventListener: vi.fn(),
            dispatchEvent: vi.fn(),
        }))
        window.matchMedia = matchMediaMock
    })

    afterEach(() => {
        vi.restoreAllMocks()
    })

    it('returns false when width is larger than breakpoint', () => {
        // Mock window.innerWidth
        Object.defineProperty(window, 'innerWidth', { writable: true, configurable: true, value: 1024 })

        const { result } = renderHook(() => useIsMobile())
        expect(result.current).toBe(false)
    })

    it('returns true when width is smaller than breakpoint', () => {
        // Mock window.innerWidth
        Object.defineProperty(window, 'innerWidth', { writable: true, configurable: true, value: 500 })

        const { result } = renderHook(() => useIsMobile())
        expect(result.current).toBe(true)
    })

    it('updates when window resizes', () => {
        // Initial state: desktop
        Object.defineProperty(window, 'innerWidth', { writable: true, configurable: true, value: 1024 })

        let changeCallback: any
        matchMediaMock.mockImplementation((query: any) => ({
            matches: false,
            media: query,
            onchange: null,
            addEventListener: vi.fn((event, callback) => {
                if (event === 'change') changeCallback = callback
            }),
            removeEventListener: vi.fn(),
            dispatchEvent: vi.fn(),
        }))

        const { result } = renderHook(() => useIsMobile())
        expect(result.current).toBe(false)

        // Simulate resize to mobile
        act(() => {
            Object.defineProperty(window, 'innerWidth', { writable: true, configurable: true, value: 500 })
            if (changeCallback) changeCallback()
        })

        expect(result.current).toBe(true)
    })
})
