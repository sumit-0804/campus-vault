"use server"

import { getServerSession } from "next-auth"
import { authOptions } from "@/auth"
import prisma from "@/lib/db"
import { KarmaRank } from "@/app/generated/prisma/enums"
import { KARMA_VALUES, KARMA_THRESHOLDS } from "@/lib/karma-constants"

/**
 * Calculate the appropriate karma rank based on score
 */
function calculateRank(karmaScore: number): KarmaRank {
    if (karmaScore >= KARMA_THRESHOLDS.DARK_KNIGHT) return "DARK_KNIGHT"
    if (karmaScore >= KARMA_THRESHOLDS.AUROR) return "AUROR"
    if (karmaScore >= KARMA_THRESHOLDS.WIZARD) return "WIZARD"
    return "MUGGLE"
}

/**
 * Core function to award karma points to a user
 * Automatically updates karma rank if threshold is crossed
 */
export async function harvestSouls(
    userId: string,
    amount: number,
    reason: keyof typeof KARMA_VALUES
) {
    try {
        const user = await prisma.wizard.findUnique({
            where: { id: userId },
            select: { karmaScore: true, karmaRank: true }
        })

        if (!user) {
            throw new Error("User not found")
        }

        const newScore = user.karmaScore + amount
        const newRank = calculateRank(newScore)

        const updatedUser = await prisma.wizard.update({
            where: { id: userId },
            data: {
                karmaScore: newScore,
                karmaRank: newRank,
            },
        })

        // Create notification for karma earned
        await prisma.notification.create({
            data: {
                userId,
                type: "KARMA_EARNED",
                referenceId: reason,
            }
        })

        return {
            success: true,
            newScore: updatedUser.karmaScore,
            newRank: updatedUser.karmaRank,
            rankChanged: user.karmaRank !== newRank,
        }
    } catch (error) {
        console.error("Error awarding karma:", error)
        throw error
    }
}

/**
 * Grant daily login bonus (+1 karma)
 * Only awards once per day
 */
export async function grantDailyLoginBonus() {
    const session = await getServerSession(authOptions)
    if (!session?.user?.id) {
        return { success: false, alreadyClaimed: false }
    }

    try {
        const user = await prisma.wizard.findUnique({
            where: { id: session.user.id },
            select: { lastLoginDate: true }
        })

        if (!user) {
            return { success: false, alreadyClaimed: false }
        }

        const today = new Date()
        today.setHours(0, 0, 0, 0)

        // Check if already claimed today
        if (user.lastLoginDate) {
            const lastLogin = new Date(user.lastLoginDate)
            lastLogin.setHours(0, 0, 0, 0)

            if (lastLogin.getTime() === today.getTime()) {
                return { success: true, alreadyClaimed: true }
            }
        }

        // Update last login date
        await prisma.wizard.update({
            where: { id: session.user.id },
            data: { lastLoginDate: new Date() }
        })

        // Award karma
        const result = await harvestSouls(
            session.user.id,
            KARMA_VALUES.DAILY_LOGIN,
            "DAILY_LOGIN"
        )

        return {
            success: true,
            alreadyClaimed: false,
            newScore: result.newScore,
            rankChanged: result.rankChanged,
        }
    } catch (error) {
        console.error("Error granting daily login bonus:", error)
        return { success: false, alreadyClaimed: false }
    }
}

/**
 * Award karma for completing a sale (seller gets +10)
 */
export async function awardSellKarma(sellerId: string) {
    return harvestSouls(sellerId, KARMA_VALUES.SELL_ITEM, "SELL_ITEM")
}

/**
 * Award karma for completing a purchase (buyer gets +5)
 */
export async function awardBuyKarma(buyerId: string) {
    return harvestSouls(buyerId, KARMA_VALUES.BUY_ITEM, "BUY_ITEM")
}

/**
 * Award karma for returning a lost item (+50)
 */
export async function awardReturnKarma(finderId: string) {
    return harvestSouls(finderId, KARMA_VALUES.RETURN_LOST_ITEM, "RETURN_LOST_ITEM")
}

/**
 * Award karma for receiving a 5-star rating (+10)
 */
export async function awardFiveStarKarma(sellerId: string) {
    return harvestSouls(sellerId, KARMA_VALUES.FIVE_STAR_RATING, "FIVE_STAR_RATING")
}

/**
 * Get karma leaderboard (top users by karma score)
 */
export async function getKarmaLeaderboard(limit: number = 10) {
    try {
        const leaders = await prisma.wizard.findMany({
            where: {
                isBanished: false,
            },
            select: {
                id: true,
                fullName: true,
                avatarUrl: true,
                karmaScore: true,
                karmaRank: true,
            },
            orderBy: {
                karmaScore: 'desc',
            },
            take: limit,
        })

        return { success: true, leaders }
    } catch (error) {
        console.error("Error fetching leaderboard:", error)
        return { success: false, leaders: [] }
    }
}
