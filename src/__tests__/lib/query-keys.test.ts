import { describe, it, expect } from 'vitest'
import { queryKeys } from '@/lib/query-keys'

describe('queryKeys', () => {
    describe('transactions', () => {
        it('returns stable base key', () => {
            expect(queryKeys.transactions.all).toEqual(['transactions'])
        })

        it('includes type in list key', () => {
            expect(queryKeys.transactions.list('buying')).toEqual(['transactions', 'list', 'buying'])
            expect(queryKeys.transactions.list('selling')).toEqual(['transactions', 'list', 'selling'])
        })

        it('produces unique keys per type', () => {
            expect(queryKeys.transactions.list('buying')).not.toEqual(queryKeys.transactions.list('selling'))
        })

        it('includes id in detail key', () => {
            expect(queryKeys.transactions.detail('tx-1')).toEqual(['transactions', 'detail', 'tx-1'])
        })

        it('returns stable stats key', () => {
            expect(queryKeys.transactions.stats).toEqual(['transactions', 'stats'])
        })
    })

    describe('notifications', () => {
        it('returns stable base key', () => {
            expect(queryKeys.notifications.all).toEqual(['notifications'])
        })

        it('includes page and limit in list key', () => {
            expect(queryKeys.notifications.list(1, 5)).toEqual(['notifications', 'list', { page: 1, limit: 5 }])
        })

        it('produces unique keys per pagination', () => {
            expect(queryKeys.notifications.list(1, 5)).not.toEqual(queryKeys.notifications.list(2, 5))
        })

        it('returns stable unreadCount key', () => {
            expect(queryKeys.notifications.unreadCount).toEqual(['notifications', 'unreadCount'])
        })
    })

    describe('offers', () => {
        it('includes chatId in byChat key', () => {
            expect(queryKeys.offers.byChat('chat-123')).toEqual(['offers', 'chat', 'chat-123'])
        })

        it('produces unique keys per chat', () => {
            expect(queryKeys.offers.byChat('a')).not.toEqual(queryKeys.offers.byChat('b'))
        })
    })

    describe('chat', () => {
        it('includes chatId in messages key', () => {
            expect(queryKeys.chat.messages('chat-abc')).toEqual(['chat', 'messages', 'chat-abc'])
        })
    })

    describe('relics', () => {
        it('includes id in detail key', () => {
            expect(queryKeys.relics.detail('relic-1')).toEqual(['relics', 'detail', 'relic-1'])
        })

        it('includes filter in list key', () => {
            expect(queryKeys.relics.list('lost')).toEqual(['relics', 'list', 'lost'])
        })

        it('handles undefined filter', () => {
            expect(queryKeys.relics.list()).toEqual(['relics', 'list', undefined])
        })
    })

    describe('key hierarchy (invalidation)', () => {
        it('transaction list keys start with the base key', () => {
            const listKey = queryKeys.transactions.list('all')
            expect(listKey[0]).toBe(queryKeys.transactions.all[0])
        })

        it('notification list keys start with the base key', () => {
            const listKey = queryKeys.notifications.list(1, 5)
            expect(listKey[0]).toBe(queryKeys.notifications.all[0])
        })
    })
})
