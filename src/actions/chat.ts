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
export async function createOffer(chatId: string, amount: number) {
    const session = await getServerSession(authOptions)
    if (!session?.user?.id) throw new Error("Unauthorized")

    try {
        const chat = await prisma.chatRoom.findUnique({
            where: { id: chatId },
            include: { participants: true, relic: true }
        })

        if (!chat || !chat.relicId) throw new Error("Chat or relic not found")

        const isParticipant = chat.participants.some(p => p.id === session.user.id)
        if (!isParticipant) throw new Error("Not a participant")

        // Create BloodPact (Offer)
        const bloodPact = await prisma.bloodPact.create({
            data: {
                itemId: chat.relicId,
                buyerId: session.user.id,
                offerAmount: amount,
                status: 'PENDING'
            }
        })

        // Update item status to RESERVED
        await prisma.cursedObject.update({
            where: { id: chat.relicId },
            data: { status: 'RESERVED' }
        })

        // Send OFFER message with BloodPact ID
        const message = await prisma.message.create({
            data: {
                chatRoomId: chatId,
                senderId: session.user.id,
                content: `OFFER_ID:${bloodPact.id}`, // Store ID in content
                type: 'OFFER',
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

export async function respondToOffer(offerId: string, status: 'ACCEPTED' | 'REJECTED') {
    const session = await getServerSession(authOptions)
    if (!session?.user?.id) throw new Error("Unauthorized")

    try {
        const bloodPact = await prisma.bloodPact.findUnique({
            where: { id: offerId },
            include: { item: true }
        })

        if (!bloodPact) throw new Error("Offer not found")
        if (bloodPact.item.sellerId !== session.user.id) throw new Error("Not authorized")

        // Update BloodPact status
        await prisma.bloodPact.update({
            where: { id: offerId },
            data: { status }
        })

        // If accepted, create transaction
        if (status === 'ACCEPTED') {
            await prisma.transaction.create({
                data: {
                    buyerId: bloodPact.buyerId,
                    sellerId: session.user.id,
                    relicId: bloodPact.itemId,
                    finalPrice: bloodPact.offerAmount,
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
        const chat = await prisma.chatRoom.findFirst({
            where: {
                relicId: bloodPact.itemId,
                participants: { some: { id: bloodPact.buyerId } }
            }
        })

        if (chat) {
            const message = await prisma.message.create({
                data: {
                    chatRoomId: chat.id,
                    senderId: session.user.id,
                    content: `Offer for ₹${bloodPact.offerAmount} was ${status.toLowerCase()}`,
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

export async function cancelOffer(offerId: string) {
    const session = await getServerSession(authOptions)
    if (!session?.user?.id) throw new Error("Unauthorized")

    try {
        const bloodPact = await prisma.bloodPact.findUnique({
            where: { id: offerId },
            include: { item: true }
        })

        if (!bloodPact) throw new Error("Offer not found")
        if (bloodPact.buyerId !== session.user.id) throw new Error("Not authorized")
        if (bloodPact.status !== 'PENDING') throw new Error("Can only cancel pending offers")

        // Update BloodPact status
        await prisma.bloodPact.update({
            where: { id: offerId },
            data: { status: 'CANCELLED' }
        })

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
        const chat = await prisma.chatRoom.findFirst({
            where: {
                relicId: bloodPact.itemId,
                participants: { some: { id: session.user.id } }
            }
        })

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
