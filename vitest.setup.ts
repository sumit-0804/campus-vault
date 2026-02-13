import '@testing-library/jest-dom'
import { vi } from 'vitest'

// Mock next/navigation
vi.mock('next/navigation', () => ({
    useRouter: () => ({
        push: vi.fn(),
        replace: vi.fn(),
        refresh: vi.fn(),
        back: vi.fn(),
        forward: vi.fn(),
    }),
    usePathname: () => '/',
    useSearchParams: () => new URLSearchParams(),
}))

// Mock next-auth/react
vi.mock('next-auth/react', () => ({
    useSession: () => ({
        data: { user: { id: 'test-user-id', name: 'Test User' } },
        status: 'authenticated',
    }),
    signIn: vi.fn(),
    signOut: vi.fn(),
    SessionProvider: ({ children }: { children: React.ReactNode }) => children,
}))

// Mock server actions (generic mock, specific tests can override)
vi.mock('@/actions/notifications', () => ({
    getNotifications: vi.fn(),
    getUnreadNotificationCount: vi.fn(),
    markNotificationRead: vi.fn(),
}))

// Mock Pusher
vi.mock('@/lib/pusher', () => ({
    pusherClient: {
        subscribe: vi.fn(() => ({
            bind: vi.fn(),
            unbind: vi.fn(),
        })),
        unsubscribe: vi.fn(),
    },
}))
