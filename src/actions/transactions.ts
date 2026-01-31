"use server"

import { getServerSession } from "next-auth"
import { authOptions } from "@/auth"
import prisma from "@/lib/db"

/**
 * Get transactions for the current user
 */
export async function getTransactions(
    type: 'all' | 'purchases' | 'sales' = 'all',
    page: number = 1,
    limit: number = 20
) {
    const session = await getServerSession(authOptions)
    if (!session?.user?.id) {
        throw new Error("Unauthorized")
    }

    try {
        const whereClause = type === 'all'
            ? {
                OR: [
                    { buyerId: session.user.id },
                    { sellerId: session.user.id },
                ]
            }
            : type === 'purchases'
                ? { buyerId: session.user.id }
                : { sellerId: session.user.id }

        const [transactions, total] = await Promise.all([
            prisma.transaction.findMany({
                where: whereClause,
                include: {
                    buyer: {
                        select: {
                            id: true,
                            fullName: true,
                            avatarUrl: true,
                        }
                    },
                    seller: {
                        select: {
                            id: true,
                            fullName: true,
                            avatarUrl: true,
                        }
                    },
                    relic: {
                        select: {
                            id: true,
                            title: true,
                            images: true,
                        }
                    },
                    rating: true,
                },
                orderBy: { completedAt: 'desc' },
                take: limit,
                skip: (page - 1) * limit,
            }),
            prisma.transaction.count({
                where: whereClause,
            }),
        ])

        return {
            success: true,
            transactions,
            total,
            hasMore: (page * limit) < total,
        }
    } catch (error) {
        console.error("Error fetching transactions:", error)
        throw error
    }
}

/**
 * Get a single transaction by ID
 */
export async function getTransactionById(transactionId: string) {
    const session = await getServerSession(authOptions)
    if (!session?.user?.id) {
        throw new Error("Unauthorized")
    }

    try {
        const transaction = await prisma.transaction.findUnique({
            where: { id: transactionId },
            include: {
                buyer: {
                    select: {
                        id: true,
                        fullName: true,
                        avatarUrl: true,
                        karmaScore: true,
                        karmaRank: true,
                    }
                },
                seller: {
                    select: {
                        id: true,
                        fullName: true,
                        avatarUrl: true,
                        karmaScore: true,
                        karmaRank: true,
                    }
                },
                relic: {
                    select: {
                        id: true,
                        title: true,
                        description: true,
                        images: true,
                        category: true,
                        condition: true,
                    }
                },
                rating: true,
            },
        })

        if (!transaction) {
            throw new Error("Transaction not found")
        }

        // Verify user is part of the transaction
        if (transaction.buyerId !== session.user.id && transaction.sellerId !== session.user.id) {
            throw new Error("Unauthorized")
        }

        return { success: true, transaction }
    } catch (error) {
        console.error("Error fetching transaction:", error)
        throw error
    }
}

/**
 * Get transaction stats for the current user
 */
export async function getTransactionStats() {
    const session = await getServerSession(authOptions)
    if (!session?.user?.id) {
        throw new Error("Unauthorized")
    }

    try {
        const [totalPurchases, totalSales, totalSpent, totalEarned] = await Promise.all([
            prisma.transaction.count({
                where: { buyerId: session.user.id },
            }),
            prisma.transaction.count({
                where: { sellerId: session.user.id },
            }),
            prisma.transaction.aggregate({
                where: { buyerId: session.user.id },
                _sum: { finalPrice: true },
            }),
            prisma.transaction.aggregate({
                where: { sellerId: session.user.id },
                _sum: { finalPrice: true },
            }),
        ])

        return {
            success: true,
            stats: {
                totalPurchases,
                totalSales,
                totalSpent: totalSpent._sum.finalPrice || 0,
                totalEarned: totalEarned._sum.finalPrice || 0,
            }
        }
    } catch (error) {
        console.error("Error fetching transaction stats:", error)
        throw error
    }
}
