"use server"

import { getServerSession } from "next-auth"
import { authOptions } from "@/auth"
import prisma from "@/lib/db"
import { revalidatePath } from "next/cache"
import { awardFiveStarKarma } from "./karma"
import { createNotification } from "./notifications"

/**
 * Submit a rating for a completed transaction
 * Only the buyer can rate the seller
 */
export async function submitRating(
    transactionId: string,
    stars: number,
    comment?: string
) {
    const session = await getServerSession(authOptions)
    if (!session?.user?.id) {
        throw new Error("Unauthorized")
    }

    // Validate stars
    if (stars < 1 || stars > 5 || !Number.isInteger(stars)) {
        throw new Error("Rating must be between 1 and 5 stars")
    }

    try {
        // Get the transaction
        const transaction = await prisma.transaction.findUnique({
            where: { id: transactionId },
            include: { rating: true }
        })

        if (!transaction) {
            throw new Error("Transaction not found")
        }

        // Verify the current user is the buyer
        if (transaction.buyerId !== session.user.id) {
            throw new Error("Only buyers can rate transactions")
        }

        // Check if already rated
        if (transaction.rating) {
            throw new Error("This transaction has already been rated")
        }

        // Create the rating
        const rating = await prisma.rating.create({
            data: {
                transactionId,
                raterId: session.user.id,
                sellerId: transaction.sellerId,
                stars,
                comment: comment || null,
            }
        })

        // Award karma if 5-star rating
        if (stars === 5) {
            await awardFiveStarKarma(transaction.sellerId)
        }

        // Notify the seller
        await createNotification(
            transaction.sellerId,
            "RATING_RECEIVED",
            transactionId
        )

        revalidatePath('/dashboard/transactions')
        revalidatePath('/dashboard/profile')

        return { success: true, rating }
    } catch (error) {
        console.error("Error submitting rating:", error)
        throw error
    }
}

/**
 * Get average rating for a seller
 */
export async function getSellerRating(sellerId: string) {
    try {
        const result = await prisma.rating.aggregate({
            where: { sellerId },
            _avg: { stars: true },
            _count: { stars: true },
        })

        return {
            success: true,
            averageRating: result._avg.stars || 0,
            totalRatings: result._count.stars,
        }
    } catch (error) {
        console.error("Error fetching seller rating:", error)
        return { success: false, averageRating: 0, totalRatings: 0 }
    }
}

/**
 * Get all ratings received by a seller
 */
export async function getSellerRatings(sellerId: string, limit: number = 10) {
    try {
        const ratings = await prisma.rating.findMany({
            where: { sellerId },
            include: {
                rater: {
                    select: {
                        id: true,
                        fullName: true,
                        avatarUrl: true,
                    }
                },
                transaction: {
                    select: {
                        relic: {
                            select: {
                                id: true,
                                title: true,
                            }
                        }
                    }
                }
            },
            orderBy: { createdAt: 'desc' },
            take: limit,
        })

        return { success: true, ratings }
    } catch (error) {
        console.error("Error fetching seller ratings:", error)
        return { success: false, ratings: [] }
    }
}

/**
 * Check if a transaction can be rated
 */
export async function canRateTransaction(transactionId: string) {
    const session = await getServerSession(authOptions)
    if (!session?.user?.id) {
        return { canRate: false, reason: "Not logged in" }
    }

    try {
        const transaction = await prisma.transaction.findUnique({
            where: { id: transactionId },
            include: { rating: true }
        })

        if (!transaction) {
            return { canRate: false, reason: "Transaction not found" }
        }

        if (transaction.buyerId !== session.user.id) {
            return { canRate: false, reason: "Only buyers can rate" }
        }

        if (transaction.rating) {
            return { canRate: false, reason: "Already rated" }
        }

        return { canRate: true }
    } catch (error) {
        console.error("Error checking rate eligibility:", error)
        return { canRate: false, reason: "Error occurred" }
    }
}
