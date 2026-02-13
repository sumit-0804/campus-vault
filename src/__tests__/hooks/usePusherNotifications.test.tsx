import { describe, it, expect, vi, beforeEach } from 'vitest'
import { renderHook } from '@testing-library/react'
import { QueryClient, QueryClientProvider } from '@tanstack/react-query'
import { usePusherNotifications } from '@/hooks/usePusherNotifications'
import { pusherClient } from '@/lib/pusher'
import React from 'react'

// The pusher mock is set up in vitest.setup.ts
let mockChannel: { bind: ReturnType<typeof vi.fn>; unbind: ReturnType<typeof vi.fn> }

beforeEach(() => {
    vi.clearAllMocks()
    mockChannel = { bind: vi.fn(), unbind: vi.fn() }
    vi.mocked(pusherClient.subscribe).mockReturnValue(mockChannel as any)
})

function createWrapper() {
    const queryClient = new QueryClient({
        defaultOptions: { queries: { retry: false } },
    })
    return function Wrapper({ children }: { children: React.ReactNode }) {
        return (
            <QueryClientProvider client={queryClient}>
                {children}
            </QueryClientProvider>
        )
    }
}

describe('usePusherNotifications', () => {
    it('subscribes to the correct Pusher channel', () => {
        renderHook(() => usePusherNotifications(), { wrapper: createWrapper() })

        expect(pusherClient.subscribe).toHaveBeenCalledWith('private-user-test-user-id')
    })

    it('binds to the new-notification event', () => {
        renderHook(() => usePusherNotifications(), { wrapper: createWrapper() })

        expect(mockChannel.bind).toHaveBeenCalledWith('new-notification', expect.any(Function))
    })

    it('unsubscribes and unbinds on unmount', () => {
        const { unmount } = renderHook(() => usePusherNotifications(), { wrapper: createWrapper() })

        unmount()

        expect(mockChannel.unbind).toHaveBeenCalledWith('new-notification', expect.any(Function))
        expect(pusherClient.unsubscribe).toHaveBeenCalledWith('private-user-test-user-id')
    })
})
