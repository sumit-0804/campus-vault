// NEW CLEAN OFFER ACTIONS - Rebuilt from scratch

"use server"

import { getServerSession } from "next-auth"
import { authOptions } from "@/auth"
import prisma from "@/lib/db"
import { pusherServer } from "@/lib/pusher"
import { revalidatePath } from "next/cache"

// Helper function to create system messages
async function createSystemMessage(chatId: string, content: string, senderId: string) {
    const message = await prisma.message.create({
        data: {
            chatRoomId: chatId,
            senderId,
            content,
            type: 'SYSTEM',
        }
    })

    await prisma.chatRoom.update({
        where: { id: chatId },
        data: { lastMessageAt: new Date() }
    })

    await pusherServer.trigger(`private-chat-${chatId}`, 'new-message', message)
    return message
}

/**
 * Create a new offer for an item
 * Item stays ACTIVE to allow multiple competing offers
 */
export async function createOffer(chatId: string, amount: number, expiresInMinutes: number = 1440) {
    const session = await getServerSession(authOptions)
    if (!session?.user?.id) throw new Error("Unauthorized")

    // Validate expiry (max 24 hours)
    if (expiresInMinutes < 1 || expiresInMinutes > 1440) {
        expiresInMinutes = 1440
    }

    try {
        const chat = await prisma.chatRoom.findUnique({
            where: { id: chatId },
            include: { participants: true, relic: true }
        })

        if (!chat || !chat.relicId) throw new Error("Chat or item not found")

        const isParticipant = chat.participants.some(p => p.id === session.user.id)
        if (!isParticipant) throw new Error("Not a participant")

        // Check for existing active offer by this buyer
        const existingOffer = await prisma.bloodPact.findFirst({
            where: {
                itemId: chat.relicId,
                buyerId: session.user.id,
                status: { in: ['PENDING', 'COUNTER_OFFER_PENDING'] }
            }
        })

        if (existingOffer) {
            throw new Error("You already have an active offer for this item")
        }

        // Create new offer
        const expiresAt = new Date(Date.now() + expiresInMinutes * 60 * 1000)
        const bloodPact = await prisma.bloodPact.create({
            data: {
                itemId: chat.relicId,
                buyerId: session.user.id,
                offerAmount: amount,
                status: 'PENDING',
                expiresAt,
            }
        })

        // Log history
        await prisma.offerHistory.create({
            data: {
                offerId: bloodPact.id,
                action: 'CREATED',
                amount,
                actorId: session.user.id
            }
        })

        // CRITICAL: Item stays ACTIVE to allow multiple offers
        // It will only become RESERVED when seller accepts

        // Create system message
        const hours = Math.floor(expiresInMinutes / 60)
        const minutes = expiresInMinutes % 60
        const expiryText = hours > 0 ? `${hours}h ${minutes}m` : `${minutes}m`
        await createSystemMessage(
            chatId,
            `New offer: ₹${amount} (expires in ${expiryText})`,
            session.user.id
        )

        // Trigger Notification
        if (chat.relic) {
            const { createNotification } = await import("./notifications")
            await createNotification(chat.relic.sellerId, "OFFER_RECEIVED", bloodPact.id)
        }

        revalidatePath(`/dashboard/messages/${chatId}`)
        revalidatePath('/marketplace')
        return { success: true, offerId: bloodPact.id }
    } catch (error) {
        console.error("Error creating offer:", error)
        throw error
    }
}

/**
 * Create a counter-offer
 * Seller counters buyer's offer OR buyer counters seller's counter
 */
export async function createCounterOffer(offerId: string, amount: number, expiresInMinutes: number = 1440) {
    const session = await getServerSession(authOptions)
    if (!session?.user?.id) throw new Error("Unauthorized")

    // Validate expiry
    if (expiresInMinutes < 1 || expiresInMinutes > 1440) {
        expiresInMinutes = 1440
    }

    try {
        const offer = await prisma.bloodPact.findUnique({
            where: { id: offerId },
            include: { item: true }
        })

        if (!offer) throw new Error("Offer not found")

        const isSeller = offer.item.sellerId === session.user.id
        const isBuyer = offer.buyerId === session.user.id

        if (!isSeller && !isBuyer) throw new Error("Not authorized")

        let updateData: any = {}
        let actionDescription = ""

        const expiresAt = new Date(Date.now() + expiresInMinutes * 60 * 1000)

        if (isSeller) {
            // Seller countering buyer's offer
            if (offer.status !== 'PENDING') {
                throw new Error("Can only counter pending offers")
            }
            updateData = {
                counterOfferAmount: amount,
                status: "COUNTER_OFFER_PENDING",
                expiresAt,
            }
            actionDescription = `Seller countered: ₹${amount}`
        } else {
            // Buyer countering seller's counter
            if (offer.status !== 'COUNTER_OFFER_PENDING') {
                throw new Error("Can only counter pending counter-offers")
            }
            updateData = {
                offerAmount: amount,
                counterOfferAmount: null,
                status: "PENDING",
                expiresAt,
            }
            actionDescription = `Buyer countered: ₹${amount}`
        }

        // Update offer
        await prisma.bloodPact.update({
            where: { id: offerId },
            data: updateData
        })

        // Log history
        await prisma.offerHistory.create({
            data: {
                offerId,
                action: 'COUNTERED',
                amount,
                actorId: session.user.id
            }
        })

        // Find chat and notify
        const chat = await prisma.chatRoom.findFirst({
            where: {
                relicId: offer.itemId,
                participants: { some: { id: offer.buyerId } }
            }
        })

        if (chat) {
            const hours = Math.floor(expiresInMinutes / 60)
            const minutes = expiresInMinutes % 60
            const expiryText = hours > 0 ? `${hours}h ${minutes}m` : `${minutes}m`
            await createSystemMessage(
                chat.id,
                `${actionDescription} (expires in ${expiryText})`,
                session.user.id
            )
            revalidatePath(`/dashboard/messages/${chat.id}`)

            // Trigger Notification
            const { createNotification } = await import("./notifications")
            const recipientId = isSeller ? offer.buyerId : offer.item.sellerId
            await createNotification(recipientId, "OFFER_COUNTERED", offerId)
        }

        revalidatePath('/marketplace')
        return { success: true }
    } catch (error) {
        console.error("Error creating counter offer:", error)
        throw error
    }
}

/**
 * Accept or reject an offer
 * When accepted: item becomes RESERVED, other offers are rejected
 */
export async function respondToOffer(offerId: string, action: 'ACCEPT' | 'REJECT') {
    const session = await getServerSession(authOptions)
    if (!session?.user?.id) throw new Error("Unauthorized")

    try {
        const offer = await prisma.bloodPact.findUnique({
            where: { id: offerId },
            include: { item: true }
        })

        if (!offer) throw new Error("Offer not found")

        const isSeller = offer.item.sellerId === session.user.id
        const isBuyer = offer.buyerId === session.user.id

        // Authorization check
        if (offer.status === 'PENDING') {
            if (!isSeller) throw new Error("Only seller can respond to pending offers")
        } else if (offer.status === 'COUNTER_OFFER_PENDING') {
            if (!isBuyer) throw new Error("Only buyer can respond to counter-offers")
        } else {
            throw new Error("Offer is not in a responsive state")
        }

        if (action === 'ACCEPT') {
            // Update offer to AWAITING_COMPLETION
            await prisma.bloodPact.update({
                where: { id: offerId },
                data: { status: 'AWAITING_COMPLETION' }
            })

            // CRITICAL: Item becomes RESERVED only when offer is accepted
            await prisma.cursedObject.update({
                where: { id: offer.itemId },
                data: { status: 'RESERVED' }
            })

            // Reject all other pending offers
            const otherOffers = await prisma.bloodPact.findMany({
                where: {
                    itemId: offer.itemId,
                    id: { not: offerId },
                    status: { in: ['PENDING', 'COUNTER_OFFER_PENDING'] }
                },
                include: { buyer: true }
            })

            if (otherOffers.length > 0) {
                await prisma.bloodPact.updateMany({
                    where: {
                        itemId: offer.itemId,
                        id: { not: offerId },
                        status: { in: ['PENDING', 'COUNTER_OFFER_PENDING'] }
                    },
                    data: { status: 'REJECTED' }
                })

                // Notify each affected buyer
                for (const otherOffer of otherOffers) {
                    const buyerChat = await prisma.chatRoom.findFirst({
                        where: {
                            relicId: offer.itemId,
                            participants: { some: { id: otherOffer.buyerId } }
                        }
                    })

                    if (buyerChat) {
                        await createSystemMessage(
                            buyerChat.id,
                            `Your offer for ₹${otherOffer.counterOfferAmount || otherOffer.offerAmount} was rejected - seller accepted another offer`,
                            session.user.id
                        )
                        revalidatePath(`/dashboard/messages/${buyerChat.id}`)
                    }
                }
            }

            // Log history
            await prisma.offerHistory.create({
                data: {
                    offerId,
                    action: 'ACCEPTED',
                    actorId: session.user.id
                }
            })

            // Notify in this chat
            const chat = await prisma.chatRoom.findFirst({
                where: {
                    relicId: offer.itemId,
                    participants: { some: { id: offer.buyerId } }
                }
            })

            if (chat) {
                await createSystemMessage(
                    chat.id,
                    `Offer for ₹${offer.counterOfferAmount || offer.offerAmount} was accepted - awaiting buyer confirmation`,
                    session.user.id
                )
                revalidatePath(`/dashboard/messages/${chat.id}`)

                // Trigger Notification
                const { createNotification } = await import("./notifications")
                await createNotification(offer.buyerId, "OFFER_ACCEPTED", offerId)
            }
        } else {
            // REJECT
            await prisma.bloodPact.update({
                where: { id: offerId },
                data: { status: 'REJECTED' }
            })

            // Log history
            await prisma.offerHistory.create({
                data: {
                    offerId,
                    action: 'REJECTED',
                    actorId: session.user.id
                }
            })

            // Check if there are other pending offers
            const pendingCount = await prisma.bloodPact.count({
                where: {
                    itemId: offer.itemId,
                    status: { in: ['PENDING', 'COUNTER_OFFER_PENDING'] },
                    id: { not: offerId }
                }
            })

            // If no other pending offers, item goes back to ACTIVE
            if (pendingCount === 0) {
                await prisma.cursedObject.update({
                    where: { id: offer.itemId },
                    data: { status: 'ACTIVE' }
                })
            }

            // Notify
            const chat = await prisma.chatRoom.findFirst({
                where: {
                    relicId: offer.itemId,
                    participants: { some: { id: offer.buyerId } }
                }
            })

            if (chat) {
                await createSystemMessage(
                    chat.id,
                    `Offer for ₹${offer.counterOfferAmount || offer.offerAmount} was rejected`,
                    session.user.id
                )
                revalidatePath(`/dashboard/messages/${chat.id}`)

                // Trigger Notification
                const { createNotification } = await import("./notifications")
                await createNotification(offer.buyerId, "OFFER_REJECTED", offerId)
            }
        }

        revalidatePath('/marketplace')
        revalidatePath(`/marketplace/${offer.itemId}`)
        return { success: true }
    } catch (error) {
        console.error("Error responding to offer:", error)
        throw error
    }
}

/**
 * Cancel a pending offer
 */
export async function cancelOffer(offerId: string) {
    const session = await getServerSession(authOptions)
    if (!session?.user?.id) throw new Error("Unauthorized")

    try {
        const offer = await prisma.bloodPact.findUnique({
            where: { id: offerId },
            include: { item: true }
        })

        if (!offer) throw new Error("Offer not found")
        if (offer.status !== 'PENDING' && offer.status !== 'COUNTER_OFFER_PENDING') {
            throw new Error("Can only cancel pending offers")
        }

        // Authorization: buyer can cancel PENDING, seller can cancel COUNTER_OFFER_PENDING
        if (offer.status === 'PENDING') {
            if (offer.buyerId !== session.user.id) throw new Error("Not authorized")
        } else {
            if (offer.item.sellerId !== session.user.id) throw new Error("Not authorized")
        }

        // Update status
        await prisma.bloodPact.update({
            where: { id: offerId },
            data: { status: 'CANCELLED' }
        })

        // Log history
        await prisma.offerHistory.create({
            data: {
                offerId,
                action: 'CANCELLED',
                actorId: session.user.id
            }
        })

        // Check if there are other pending offers
        const pendingCount = await prisma.bloodPact.count({
            where: {
                itemId: offer.itemId,
                status: { in: ['PENDING', 'COUNTER_OFFER_PENDING'] },
                id: { not: offerId }
            }
        })

        // If no other pending offers, item goes back to ACTIVE
        if (pendingCount === 0) {
            await prisma.cursedObject.update({
                where: { id: offer.itemId },
                data: { status: 'ACTIVE' }
            })
        }

        // Notify
        const chat = await prisma.chatRoom.findFirst({
            where: {
                relicId: offer.itemId,
                participants: { some: { id: offer.buyerId } }
            }
        })

        if (chat) {
            const who = offer.status === 'PENDING' ? 'buyer' : 'seller'
            await createSystemMessage(
                chat.id,
                `Offer for ₹${offer.offerAmount} withdrawn by ${who}`,
                session.user.id
            )
            revalidatePath(`/dashboard/messages/${chat.id}`)
        }

        revalidatePath('/marketplace')
        revalidatePath(`/marketplace/${offer.itemId}`)
        return { success: true }
    } catch (error) {
        console.error("Error cancelling offer:", error)
        throw error
    }
}

/**
 * Seller marks the item as delivered
 */
export async function markAsDelivered(offerId: string) {
    const session = await getServerSession(authOptions)
    if (!session?.user?.id) throw new Error("Unauthorized")

    try {
        const offer = await prisma.bloodPact.findUnique({
            where: { id: offerId },
            include: { item: true }
        })

        if (!offer) throw new Error("Offer not found")

        // Authorization: Only seller
        if (offer.item.sellerId !== session.user.id) throw new Error("Only seller can mark as delivered")

        // Must be in AWAITING_COMPLETION
        if (offer.status !== 'AWAITING_COMPLETION') throw new Error("Offer is not in AWAITING_COMPLETION state")

        // Update to DELIVERED
        await prisma.bloodPact.update({
            where: { id: offerId },
            data: {
                status: 'DELIVERED',
                deliveredAt: new Date()
            }
        })

        // Notify Buyer
        const chat = await prisma.chatRoom.findFirst({
            where: {
                relicId: offer.itemId,
                participants: { some: { id: offer.buyerId } }
            }
        })

        if (chat) {
            await createSystemMessage(
                chat.id,
                `Seller has marked the item as delivered. Please confirm receipt.`,
                session.user.id
            )
            revalidatePath(`/dashboard/messages/${chat.id}`)
        }

        revalidatePath('/marketplace')
        revalidatePath(`/marketplace/${offer.itemId}`)
        return { success: true }
    } catch (error) {
        console.error("Error marking as delivered:", error)
        throw error
    }
}

/**
 * Buyer confirms receipt of item
 * Item becomes SOLD, transaction is created
 * Awards karma: Seller +10, Buyer +5
 */
/**
 * Buyer confirms delivery (Finalizing the transaction)
 */
export async function confirmDelivery(offerId: string) {
    const session = await getServerSession(authOptions)
    if (!session?.user?.id) throw new Error("Unauthorized")

    try {
        const offer = await prisma.bloodPact.findUnique({
            where: { id: offerId },
            include: { item: true }
        })

        if (!offer) throw new Error("Offer not found")

        // Authorization: Buyer only
        if (offer.buyerId !== session.user.id) {
            // Allow system (auto-confirm) to bypass this check if we pass a special flag, 
            // but effectively the session check above handles user calls.
            // For auto-confirm (cron/system), we might need a different entry point or 
            // ensure session is mocked/bypassed carefully. 
            // For now, assuming this is user-triggered.
            throw new Error("Only the buyer can confirm delivery")
        }

        // Must be in DELIVERED status (strict flow)
        if (offer.status !== 'DELIVERED') {
            throw new Error("Item must be marked delivered before confirming")
        }

        // --- Transaction Logic (Same as before) ---

        // Create transaction
        await prisma.transaction.create({
            data: {
                buyerId: offer.buyerId,
                sellerId: offer.item.sellerId,
                relicId: offer.itemId,
                finalPrice: offer.counterOfferAmount || offer.offerAmount,
            }
        })

        // Update offer to COMPLETED
        await prisma.bloodPact.update({
            where: { id: offerId },
            data: { status: 'COMPLETED' }
        })

        // Item becomes SOLD
        await prisma.cursedObject.update({
            where: { id: offer.itemId },
            data: { status: 'SOLD' }
        })

        // Log history
        await prisma.offerHistory.create({
            data: {
                offerId,
                action: 'ACCEPTED', // Using ACCEPTED to represent completion in history for now, or could map to COMPLETED
                actorId: session.user.id
            }
        })

        // Award karma
        const { awardSellKarma, awardBuyKarma } = await import("./karma")
        await Promise.all([
            awardSellKarma(offer.item.sellerId),
            awardBuyKarma(offer.buyerId),
        ])

        // Notifications
        const { createNotification } = await import("./notifications")
        await createNotification(offer.item.sellerId, "ITEM_SOLD", offer.itemId)

        // Chat System Message
        const chat = await prisma.chatRoom.findFirst({
            where: {
                relicId: offer.itemId,
                participants: { some: { id: offer.buyerId } }
            }
        })

        if (chat) {
            await createSystemMessage(
                chat.id,
                `Transaction completed! Item purchased for ₹${offer.counterOfferAmount || offer.offerAmount}`,
                session.user.id
            )
            revalidatePath(`/dashboard/messages/${chat.id}`)
        }

        revalidatePath('/marketplace')
        revalidatePath(`/marketplace/${offer.itemId}`)
        return { success: true }
    } catch (error) {
        console.error("Error confirming delivery:", error)
        throw error
    }
}

/**
 * Buyer rejects delivery
 */
export async function rejectDelivery(offerId: string) {
    const session = await getServerSession(authOptions)
    if (!session?.user?.id) throw new Error("Unauthorized")

    try {
        const offer = await prisma.bloodPact.findUnique({
            where: { id: offerId },
            include: { item: true }
        })

        if (!offer) throw new Error("Offer not found")

        // Authorization: Buyer only
        if (offer.buyerId !== session.user.id) throw new Error("Only buyer can reject delivery")

        // Must be in DELIVERED status
        if (offer.status !== 'DELIVERED') throw new Error("Item is not marked as delivered")

        // Update back to AWAITING_COMPLETION and clear deliveredAt
        await prisma.bloodPact.update({
            where: { id: offerId },
            data: {
                status: 'AWAITING_COMPLETION',
                deliveredAt: null // Reset timer
            }
        })

        // Notify Seller
        const chat = await prisma.chatRoom.findFirst({
            where: {
                relicId: offer.itemId,
                participants: { some: { id: offer.buyerId } }
            }
        })

        if (chat) {
            await createSystemMessage(
                chat.id,
                `Buyer rejected delivery confirmation. Status reverted.`,
                session.user.id
            )
            revalidatePath(`/dashboard/messages/${chat.id}`)
        }

        revalidatePath('/marketplace')
        revalidatePath(`/marketplace/${offer.itemId}`)
        return { success: true }
    } catch (error) {
        console.error("Error rejecting delivery:", error)
        throw error
    }
}


/**
 * Check and expire offers when chat is loaded
 */
export async function checkAndExpireOffers(chatId: string) {
    const session = await getServerSession(authOptions)
    if (!session?.user?.id) return

    try {
        const chat = await prisma.chatRoom.findUnique({
            where: { id: chatId },
            select: { relicId: true }
        })

        if (!chat?.relicId) return

        // 1. Expire PENDING offers
        const expiredOffers = await prisma.bloodPact.findMany({
            where: {
                itemId: chat.relicId,
                status: { in: ['PENDING', 'COUNTER_OFFER_PENDING'] },
                expiresAt: { lt: new Date() }
            }
        })

        for (const offer of expiredOffers) {
            await prisma.bloodPact.update({
                where: { id: offer.id },
                data: { status: 'REJECTED' }
            })
            await prisma.offerHistory.create({
                data: {
                    offerId: offer.id,
                    action: 'EXPIRED',
                    actorId: session.user.id
                }
            })
            await createSystemMessage(
                chatId,
                `Offer for ₹${offer.counterOfferAmount || offer.offerAmount} has expired and was automatically rejected`,
                session.user.id
            )
        }

        // 2. Auto-complete DELIVERED offers > 48 hours
        const autoDeliveredOffers = await prisma.bloodPact.findMany({
            where: {
                itemId: chat.relicId,
                status: 'DELIVERED',
                deliveredAt: {
                    lt: new Date(Date.now() - 48 * 60 * 60 * 1000) // 48 hours ago
                }
            },
            include: { item: true }
        })

        for (const offer of autoDeliveredOffers) {
            // Re-use confirm logic but tailored for system action
            // Verify not already completed to be safe
            if (offer.status === 'COMPLETED') continue

            // Perform completion logic manually to avoid auth checks in confirmDelivery

            await prisma.transaction.create({
                data: {
                    buyerId: offer.buyerId,
                    sellerId: offer.item.sellerId,
                    relicId: offer.itemId,
                    finalPrice: offer.counterOfferAmount || offer.offerAmount,
                }
            })

            await prisma.bloodPact.update({
                where: { id: offer.id },
                data: { status: 'COMPLETED' }
            })

            await prisma.cursedObject.update({
                where: { id: offer.itemId },
                data: { status: 'SOLD' }
            })

            // Award karma 
            const { awardSellKarma, awardBuyKarma } = await import("./karma")
            await Promise.all([
                awardSellKarma(offer.item.sellerId),
                awardBuyKarma(offer.buyerId),
            ])

            // Notify
            await createSystemMessage(
                chatId,
                `System: Delivery auto-confirmed after 48 hours. Transaction completed.`,
                session.user.id // Attribution to current user triggering the check, usually fine
            )
        }

    } catch (error) {
        console.error("Error checking offers:", error)
    }
}

