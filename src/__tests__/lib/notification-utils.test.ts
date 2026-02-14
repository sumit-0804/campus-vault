import { describe, it, expect } from 'vitest'
import { getNotificationInfo } from '@/lib/notification-utils'
import { NotificationType } from '@/app/generated/prisma/enums'

describe('notification-utils', () => {
    describe('getNotificationInfo', () => {
        it('returns correct info for OFFER_RECEIVED', () => {
            const info = getNotificationInfo(NotificationType.OFFER_RECEIVED, 'ref-123')
            expect(info.title).toBe('New Offer Received')
            expect(info.href).toBe('/dashboard/messages')
        })

        it('returns correct info for ITEM_SOLD', () => {
            const info = getNotificationInfo(NotificationType.ITEM_SOLD, 'ref-456')
            expect(info.title).toBe('Item Sold!')
            expect(info.href).toBe('/dashboard/transactions')
        })

        it('returns correct info for MESSAGE_RECEIVED with referenceId', () => {
            const info = getNotificationInfo(NotificationType.MESSAGE_RECEIVED, 'chat-abc')
            expect(info.title).toBe('New Message')
            expect(info.href).toBe('/dashboard/messages/chat-abc')
        })

        it('returns default info for unknown type', () => {
            // @ts-ignore - testing fallback for invalid type
            const info = getNotificationInfo('UNKNOWN_TYPE' as NotificationType, 'ref-000')
            expect(info.title).toBe('Notification')
            expect(info.description).toBe('You have a new notification')
        })
    })
})
