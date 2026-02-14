import { describe, it, expect, vi, beforeEach, type Mock } from 'vitest'
import { harvestSouls } from '@/actions/karma'
import prisma from '@/lib/db'
import { KARMA_THRESHOLDS } from '@/lib/karma-constants'

// Mock the prisma client
vi.mock('@/lib/db', () => ({
    default: {
        wizard: {
            findUnique: vi.fn(),
            update: vi.fn(),
        },
        notification: {
            create: vi.fn(),
        },
        karmaLog: {
            create: vi.fn(),
        },
    },
}))

describe('harvestSouls', () => {
    beforeEach(() => {
        vi.clearAllMocks()
    })

    it('updates karma score and creates notification and log', async () => {
        // Mock user found
        (prisma.wizard.findUnique as unknown as Mock).mockResolvedValue({
            id: 'user-1',
            karmaScore: 10,
            karmaRank: 'E_RANK',
        } as any);

        // Mock update
        // 10 + 50 = 60 (Still E-Rank presumably)
        (prisma.wizard.update as unknown as Mock).mockResolvedValue({
            id: 'user-1',
            karmaScore: 60,
            karmaRank: 'E_RANK',
        } as any);

        const result = await harvestSouls('user-1', 50, 'RETURN_LOST_ITEM')

        expect(prisma.wizard.findUnique).toHaveBeenCalledWith({
            where: { id: 'user-1' },
            select: { karmaScore: true, karmaRank: true }
        })

        expect(prisma.wizard.update).toHaveBeenCalled()

        expect(prisma.notification.create).toHaveBeenCalled()
        expect(prisma.karmaLog.create).toHaveBeenCalled()

        expect(result.success).toBe(true)
        expect(result.newScore).toBe(60)
    })

    it('upgrades rank when threshold is crossed', async () => {
        // Use actual constants for robust testing
        const targetRank = 'D_RANK'
        const threshold = KARMA_THRESHOLDS[targetRank]
        const currentScore = threshold - 10
        const award = 20;

        // Mock user close to rank up
        (prisma.wizard.findUnique as unknown as Mock).mockResolvedValue({
            id: 'user-1',
            karmaScore: currentScore,
            karmaRank: 'E_RANK',
        } as any);

        // Mock update
        (prisma.wizard.update as unknown as Mock).mockResolvedValue({
            id: 'user-1',
            karmaScore: currentScore + award,
            karmaRank: targetRank,
        } as any);

        const result = await harvestSouls('user-1', award, 'RETURN_LOST_ITEM')

        expect(prisma.wizard.update).toHaveBeenCalledWith(expect.objectContaining({
            data: expect.objectContaining({
                karmaRank: targetRank
            })
        }))

        // Check if rankChanged is true (based on correct logic in harvestSouls)
        // harvestSouls calculates new rank internally. 
        // mocking update return value affects the result returned by harvestSouls, 
        // but mocked findUnique affects the 'old' rank logic.
        expect(result.rankChanged).toBe(true)
    })

    it('throws error if user not found', async () => {
        (prisma.wizard.findUnique as unknown as Mock).mockResolvedValue(null)

        await expect(harvestSouls('user-1', 10, 'DAILY_LOGIN')).rejects.toThrow('User not found')
    })
})
