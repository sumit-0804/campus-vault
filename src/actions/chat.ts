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

