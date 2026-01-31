"use server"

import { getServerSession } from "next-auth"
import { authOptions } from "@/auth"
import prisma from "@/lib/db"
import { pusherServer } from "@/lib/pusher"
import { revalidatePath } from "next/cache"

export async function sendMessage(chatId: string, content: string) {
    const session = await getServerSession(authOptions)
    if (!session?.user?.id) {
        throw new Error("Unauthorized")
    }

    try {
        // Verify user is a participant
        const chat = await prisma.chatRoom.findUnique({
            where: { id: chatId },
            include: { participants: true }
        })

        if (!chat) {
            throw new Error("Chat not found")
        }

        const isParticipant = chat.participants.some(p => p.id === session.user.id)
        if (!isParticipant) {
            throw new Error("Not a participant")
        }

        // Create message
        const message = await prisma.message.create({
            data: {
                chatRoomId: chatId,
                senderId: session.user.id,
                content,
                type: 'TEXT',
            }
        })

        // Update lastMessageAt
        await prisma.chatRoom.update({
            where: { id: chatId },
            data: { lastMessageAt: new Date() }
        })

        // Trigger Pusher event
        await pusherServer.trigger(`private-chat-${chatId}`, 'new-message', message)

        revalidatePath(`/dashboard/messages/${chatId}`)
        return { success: true, message }
    } catch (error) {
        console.error("Error sending message:", error)
        throw error
    }
}

export async function getOrCreateChatRoom(otherUserId: string, relicId?: string) {
    const session = await getServerSession(authOptions)
    if (!session?.user?.id) {
        throw new Error("Unauthorized")
    }

    try {
        // Determine if relicId is a CursedObject or LostRelic
        let cursedObjectId: string | undefined;
        let lostRelicId: string | undefined;

        if (relicId) {
            const cursedObject = await prisma.cursedObject.findUnique({
                where: { id: relicId }
            });

            if (cursedObject) {
                cursedObjectId = relicId;
            } else {
                const lostRelic = await prisma.lostRelic.findUnique({
                    where: { id: relicId }
                });
                if (lostRelic) {
                    lostRelicId = relicId;
                }
            }
        }

        // Check if chat already exists between these users
        const existingChat = await prisma.chatRoom.findFirst({
            where: {
                AND: [
                    { participants: { some: { id: session.user.id } } },
                    { participants: { some: { id: otherUserId } } },
                    cursedObjectId ? { relicId: cursedObjectId } : {},
                    lostRelicId ? { lostRelicId: lostRelicId } : {},
                    // If no relic ID provided, find chat with NO relic attached (general chat)
                    !relicId ? { relicId: null, lostRelicId: null } : {}
                ]
            },
            include: {
                participants: true,
                messages: {
                    take: 1,
                    orderBy: { createdAt: 'desc' }
                }
            }
        })

        if (existingChat) {
            return existingChat
        }

        // Create new chat room
        const newChat = await prisma.chatRoom.create({
            data: {
                relicId: cursedObjectId,
                lostRelicId: lostRelicId,
                participants: {
                    connect: [
                        { id: session.user.id },
                        { id: otherUserId }
                    ]
                }
            },
            include: {
                participants: true,
                messages: true
            }
        })

        revalidatePath('/dashboard/messages')
        return newChat
    } catch (error) {
        console.error("Error creating chat room:", error)
        throw error
    }
}
export async function createOffer(chatId: string, amount: number, expiresInMinutes: number = 1440) {
    const session = await getServerSession(authOptions)
    if (!session?.user?.id) throw new Error("Unauthorized")

    // Validate expiresInMinutes (Max 24 hours = 1440 minutes)
    if (expiresInMinutes < 1 || expiresInMinutes > 1440) {
        expiresInMinutes = 1440;
    }

    try {
        const chat = await prisma.chatRoom.findUnique({
            where: { id: chatId },
            include: { participants: true, relic: true }
        })

        if (!chat || !chat.relicId) throw new Error("Chat or relic not found")

        const isParticipant = chat.participants.some(p => p.id === session.user.id)
        if (!isParticipant) throw new Error("Not a participant")

        // Check for existing offer for this item by this buyer
        const existingOffer = await prisma.bloodPact.findFirst({
            where: {
                itemId: chat.relicId,
                buyerId: session.user.id
            }
        })

        let bloodPact;
        // Calculate expiry date
        const expiresAt = new Date(Date.now() + expiresInMinutes * 60 * 1000);

        if (existingOffer) {
            // If active, prevent new offer
            const activeStatuses = ['PENDING', 'COUNTER_OFFER_PENDING'];
            if (activeStatuses.includes(existingOffer.status)) {
                throw new Error("An active offer already exists");
            }

            // Revive existing offer
            bloodPact = await prisma.bloodPact.update({
                where: { id: existingOffer.id },
                data: {
                    offerAmount: amount,
                    counterOfferAmount: null, // Reset counter
                    status: 'PENDING',
                    expiresAt: expiresAt, // Set new expiry
                }
            })
            // Log history safely
            try {
                await prisma.offerHistory.create({
                    data: {
                        offerId: existingOffer.id,
                        action: 'REVIVED',
                        amount: amount,
                        actorId: session.user.id
                    }
                })
            } catch (e) {
                console.error("Failed to log history (ignoring):", e)
            }
        } else {
            // Create new offer
            bloodPact = await prisma.bloodPact.create({
                data: {
                    itemId: chat.relicId,
                    buyerId: session.user.id,
                    offerAmount: amount,
                    status: 'PENDING',
                    expiresAt: expiresAt,
                }
            })
            // Log history safely
            try {
                await prisma.offerHistory.create({
                    data: {
                        offerId: bloodPact.id,
                        action: 'CREATED',
                        amount: amount,
                        actorId: session.user.id
                    }
                })
            } catch (e) {
                console.error("Failed to log history (ignoring):", e)
            }
        }

        // Update item status to RESERVED
        // NOTE: If we want to allow multiple offers, we shouldn't reserve here.
        // But for "one offer per chat" and assuming "first come first serve" reservation logic:
        await prisma.cursedObject.update({
            where: { id: chat.relicId },
            data: { status: 'RESERVED' }
        })

        // Send message based on action (New Offer vs Revival)
        const messageType = existingOffer ? 'SYSTEM' : 'OFFER';
        const messageContent = existingOffer
            ? `Offer revived for $${amount}`
            : `OFFER_ID:${bloodPact.id}`;

        const message = await prisma.message.create({
            data: {
                chatRoomId: chatId,
                senderId: session.user.id,
                content: messageContent,
                type: messageType,
            }
        })

        await prisma.chatRoom.update({
            where: { id: chatId },
            data: { lastMessageAt: new Date() }
        })

        await pusherServer.trigger(`private-chat-${chatId}`, 'new-message', message)
        revalidatePath(`/dashboard/messages/${chatId}`)
        revalidatePath('/marketplace')
        return { success: true, message }
    } catch (error) {
        console.error("Error creating offer:", error)
        throw error
    }
}

export async function respondToOffer(offerId: string, status: 'ACCEPTED' | 'REJECTED', chatId?: string) {
    const session = await getServerSession(authOptions)
    if (!session?.user?.id) throw new Error("Unauthorized")

    try {
        const bloodPact = await prisma.bloodPact.findUnique({
            where: { id: offerId },
            include: { item: true }
        })

        if (!bloodPact) throw new Error("Offer not found")

        // Authorization Logic
        const isSeller = bloodPact.item.sellerId === session.user.id;
        const isBuyer = bloodPact.buyerId === session.user.id;

        if (bloodPact.status === 'PENDING') {
            if (!isSeller) throw new Error("Not authorized")
        } else if (bloodPact.status === 'COUNTER_OFFER_PENDING') {
            if (!isBuyer) throw new Error("Not authorized")
        } else {
            throw new Error("Offer is not in a responsive state")
        }

        // Update BloodPact status
        await prisma.bloodPact.update({
            where: { id: offerId },
            data: {
                status,
                // If accepting a counter offer, we might want to update the offerAmount to the counterAmount?
                // Or just rely on the fact that counterAmount exists.
                // Logic below uses counterOfferAmount preferred.
            }
        })

        // Log history safely
        try {
            await prisma.offerHistory.create({
                data: {
                    offerId: offerId,
                    action: status,
                    actorId: session.user.id
                }
            })
        } catch (e) {
            console.error("Failed to log history (ignoring):", e)
        }

        // If accepted, create transaction
        if (status === 'ACCEPTED') {
            await prisma.transaction.create({
                data: {
                    buyerId: bloodPact.buyerId,
                    sellerId: session.user.id,
                    relicId: bloodPact.itemId,
                    finalPrice: bloodPact.counterOfferAmount || bloodPact.offerAmount, // Use counter amount if exists
                }
            })

            // Update item status
            await prisma.cursedObject.update({
                where: { id: bloodPact.itemId },
                data: { status: 'SOLD' }
            })
        } else if (status === 'REJECTED') {
            // Check if there are other pending offers
            const pendingOffersCount = await prisma.bloodPact.count({
                where: {
                    itemId: bloodPact.itemId,
                    status: 'PENDING',
                    id: { not: offerId }
                }
            })

            // If no other pending offers, revert to ACTIVE
            if (pendingOffersCount === 0) {
                await prisma.cursedObject.update({
                    where: { id: bloodPact.itemId },
                    data: { status: 'ACTIVE' }
                })
            }
        }

        // Notify via chat
        // Find chat room for this item and buyer
        let chat;
        if (chatId) {
            chat = await prisma.chatRoom.findUnique({
                where: { id: chatId }
            })
        } else {
            chat = await prisma.chatRoom.findFirst({
                where: {
                    relicId: bloodPact.itemId,
                    participants: { some: { id: bloodPact.buyerId } }
                }
            })
        }

        if (chat) {
            const message = await prisma.message.create({
                data: {
                    chatRoomId: chat.id,
                    senderId: session.user.id,
                    content: `Offer for ₹${bloodPact.counterOfferAmount || bloodPact.offerAmount} was ${status.toLowerCase()}`,
                    type: 'SYSTEM',
                }
            })
            await pusherServer.trigger(`private-chat-${chat.id}`, 'new-message', message)
            revalidatePath(`/dashboard/messages/${chat.id}`)
            revalidatePath('/marketplace')
            revalidatePath(`/marketplace/${bloodPact.itemId}`)
        }

    } catch (error) {
        console.error("Error responding to offer:", error)
        throw error
    }
}

export async function cancelOffer(offerId: string, chatId?: string) {
    const session = await getServerSession(authOptions)
    if (!session?.user?.id) throw new Error("Unauthorized")

    try {
        const bloodPact = await prisma.bloodPact.findUnique({
            where: { id: offerId },
            include: { item: true }
        })

        if (!bloodPact) throw new Error("Offer not found")
        if (bloodPact.status !== 'PENDING' && bloodPact.status !== 'COUNTER_OFFER_PENDING') {
            throw new Error("Can only cancel pending offers")
        }

        // Authorization check
        if (bloodPact.status === 'PENDING') {
            if (bloodPact.buyerId !== session.user.id) throw new Error("Not authorized")
        } else if (bloodPact.status === 'COUNTER_OFFER_PENDING') {
            if (bloodPact.item.sellerId !== session.user.id) throw new Error("Not authorized")
        }

        // Update BloodPact status
        await prisma.bloodPact.update({
            where: { id: offerId },
            data: {
                status: 'CANCELLED',
            }
        })

        // Log history safely
        try {
            await prisma.offerHistory.create({
                data: {
                    offerId: offerId,
                    action: 'CANCELLED',
                    actorId: session.user.id
                }
            })
        } catch (e) {
            console.error("Failed to log history (ignoring):", e)
        }

        // Check if there are other pending offers
        const pendingOffersCount = await prisma.bloodPact.count({
            where: {
                itemId: bloodPact.itemId,
                status: 'PENDING',
                id: { not: offerId }
            }
        })

        // If no other pending offers, revert to ACTIVE
        if (pendingOffersCount === 0) {
            await prisma.cursedObject.update({
                where: { id: bloodPact.itemId },
                data: { status: 'ACTIVE' }
            })
        }

        // Notify via chat
        let chat;
        if (chatId) {
            chat = await prisma.chatRoom.findUnique({
                where: { id: chatId }
            })
        } else {
            chat = await prisma.chatRoom.findFirst({
                where: {
                    relicId: bloodPact.itemId,
                    participants: { some: { id: session.user.id } }
                }
            })
        }

        if (chat) {
            const message = await prisma.message.create({
                data: {
                    chatRoomId: chat.id,
                    senderId: session.user.id,
                    content: `Offer for ₹${bloodPact.offerAmount} withdrawn by buyer`,
                    type: 'SYSTEM',
                }
            })
            await pusherServer.trigger(`private-chat-${chat.id}`, 'new-message', message)
            revalidatePath(`/dashboard/messages/${chat.id}`)
            revalidatePath('/marketplace')
            revalidatePath(`/marketplace/${bloodPact.itemId}`)
        }

        return { success: true }
    } catch (error) {
        console.error("Error cancelling offer:", error)
        throw error
    }
}

export async function checkAndExpireOffers(chatId: string) {
    const session = await getServerSession(authOptions)
    if (!session?.user?.id) return

    try {
        const chat = await prisma.chatRoom.findUnique({
            where: { id: chatId },
            select: { relicId: true }
        })

        if (!chat?.relicId) return

        // Find pending offers that have expired
        const expiredOffers = await prisma.bloodPact.findMany({
            where: {
                itemId: chat.relicId,
                status: {
                    in: ['PENDING', 'COUNTER_OFFER_PENDING']
                },
                expiresAt: {
                    lt: new Date()
                }
            }
        })

        if (expiredOffers.length === 0) return

        for (const offer of expiredOffers) {
            // Update status to REJECTED (as per requirement)
            await prisma.bloodPact.update({
                where: { id: offer.id },
                data: {
                    status: 'REJECTED'
                }
            })

            // Log history
            try {
                await prisma.offerHistory.create({
                    data: {
                        offerId: offer.id,
                        action: 'EXPIRED', // Log as EXPIRED to distinguish cause
                        actorId: session.user.id // Logged by the user who loaded the page effectively
                    }
                })
            } catch (e) {
                console.error("Failed to log history (ignoring):", e)
            }

            // Create system message
            const message = await prisma.message.create({
                data: {
                    chatRoomId: chatId,
                    senderId: session.user.id, // System message attributed to current user
                    content: `Offer for ₹${offer.counterOfferAmount || offer.offerAmount} has expired and was automatically rejected`,
                    type: 'SYSTEM',
                }
            })
            await pusherServer.trigger(`private-chat-${chatId}`, 'new-message', message)
        }

        // if (expiredOffers.length > 0) {
        //     revalidatePath(`/dashboard/messages/${chatId}`)
        // }
    } catch (error) {
        console.error("Error checking expired offers:", error)
    }
}
