import { describe, it, expect, vi, beforeEach } from 'vitest'
import { createOffer, respondToOffer } from '@/actions/offers'
import { createNotification } from '@/actions/notifications'
import prisma from '@/lib/db'

// Mock the prisma client
vi.mock('@/lib/db', () => ({
    default: {
        bloodPact: {
            create: vi.fn(),
            findUnique: vi.fn(),
            update: vi.fn(),
            findFirst: vi.fn(),
            updateMany: vi.fn(),
            findMany: vi.fn(),
            count: vi.fn(),
        },
        cursedObject: {
            findUnique: vi.fn(),
            update: vi.fn(),
        },
        chatRoom: {
            findUnique: vi.fn(),
            findFirst: vi.fn(),
            create: vi.fn(),
            update: vi.fn(),
        },
        message: {
            create: vi.fn(),
        },
        notification: {
            create: vi.fn(),
        },
        offerHistory: {
            create: vi.fn(),
        },
        wizard: {
            findUnique: vi.fn(),
        },
        $transaction: vi.fn((callback) => callback(prisma)),
    },
}))

// Mock pusher
vi.mock('@/lib/pusher', () => ({
    pusherServer: {
        trigger: vi.fn(),
    },
}))

// Mock auth options
vi.mock('@/auth', () => ({
    authOptions: {},
}))

// Mock notifications
vi.mock('@/actions/notifications', () => ({
    createNotification: vi.fn(),
}))

// Mock next/cache
vi.mock('next/cache', () => ({
    revalidatePath: vi.fn(),
}))

// Mock next-auth
vi.mock('next-auth', () => ({
    getServerSession: vi.fn(),
}))

import { getServerSession } from 'next-auth'

describe('offers actions', () => {
    beforeEach(() => {
        vi.clearAllMocks()
    })

    describe('createOffer', () => {
        it('creates an offer and triggers notifications', async () => {
            // Mock session
            vi.mocked(getServerSession).mockResolvedValue({
                user: { id: 'buyer-1', name: 'Buyer' }
            } as any)

            // Mock chat found
            vi.mocked(prisma.chatRoom.findUnique).mockResolvedValue({
                id: 'chat-1',
                relicId: 'item-1',
                participants: [{ id: 'buyer-1' }, { id: 'seller-1' }],
                relic: { sellerId: 'seller-1' }
            } as any)

            // Mock no existing offer
            vi.mocked(prisma.bloodPact.findFirst).mockResolvedValue(null)

            // Mock offer creation
            vi.mocked(prisma.bloodPact.create).mockResolvedValue({
                id: 'offer-1',
                amount: 80,
                status: 'PENDING',
            } as any)

            const result = await createOffer('chat-1', 80)

            expect(result.success).toBe(true)
            expect(prisma.bloodPact.create).toHaveBeenCalled()
            expect(createNotification).toHaveBeenCalledWith('seller-1', 'OFFER_RECEIVED', 'offer-1')
        })
    })

    describe('respondToOffer - ACCEPT', () => {
        it('accepts offer, updates item status, and rejects other offers', async () => {
            // Mock session (Seller)
            vi.mocked(getServerSession).mockResolvedValue({
                user: { id: 'seller-1' }
            } as any)

            // Mock offer found
            vi.mocked(prisma.bloodPact.findUnique).mockResolvedValue({
                id: 'offer-1',
                itemId: 'item-1',
                cursedObjectId: 'item-1', // checking fallback if model differs
                amount: 80,
                buyerId: 'buyer-1',
                status: 'PENDING',
                item: { // relation name might be 'item' or 'cursedObject'
                    sellerId: 'seller-1',
                    status: 'ACTIVE',
                    name: 'Item'
                }
            } as any)

            // Mock reject other offers findMany
            vi.mocked(prisma.bloodPact.findMany).mockResolvedValue([])

            const result = await respondToOffer('offer-1', 'ACCEPT')

            expect(result.success).toBe(true)

            // Check atomic updates
            expect(prisma.bloodPact.update).toHaveBeenCalledWith(expect.objectContaining({
                where: { id: 'offer-1' },
                data: { status: 'AWAITING_COMPLETION' }
            }))

            expect(prisma.cursedObject.update).toHaveBeenCalledWith(expect.objectContaining({
                where: { id: 'item-1' },
                data: { status: 'RESERVED' }
            }))
        })
    })

    describe('respondToOffer - REJECT', () => {
        it('rejects an offer', async () => {
            // Mock session (Seller)
            vi.mocked(getServerSession).mockResolvedValue({
                user: { id: 'seller-1' }
            } as any)

            // Mock offer found
            vi.mocked(prisma.bloodPact.findUnique).mockResolvedValue({
                id: 'offer-1',
                itemId: 'item-1',
                buyerId: 'buyer-1',
                status: 'PENDING',
                item: {
                    sellerId: 'seller-1',
                    status: 'ACTIVE'
                }
            } as any)

            vi.mocked(prisma.bloodPact.count).mockResolvedValue(0)

            const result = await respondToOffer('offer-1', 'REJECT')

            expect(result.success).toBe(true)
            expect(prisma.bloodPact.update).toHaveBeenCalledWith(expect.objectContaining({
                where: { id: 'offer-1' },
                data: { status: 'REJECTED' }
            }))
        })
    })
})
