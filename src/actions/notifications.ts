"use server"

import { getServerSession } from "next-auth"
import { authOptions } from "@/auth"
import prisma from "@/lib/db"
import { NotificationType } from "@/app/generated/prisma/enums"
import { revalidatePath } from "next/cache"
import { pusherServer } from "@/lib/pusher"

/**
 * Get notifications for the current user with pagination
 */
export async function getNotifications(page: number = 1, limit: number = 20) {
    const session = await getServerSession(authOptions)
    if (!session?.user?.id) {
        throw new Error("Unauthorized")
    }

    try {
        const [notifications, total, unreadCount] = await Promise.all([
            prisma.notification.findMany({
                where: { userId: session.user.id },
                orderBy: { createdAt: 'desc' },
                take: limit,
                skip: (page - 1) * limit,
            }),
            prisma.notification.count({
                where: { userId: session.user.id },
            }),
            prisma.notification.count({
                where: { userId: session.user.id, isSeen: false },
            }),
        ])

        return {
            success: true,
            notifications,
            total,
            unreadCount,
            hasMore: (page * limit) < total,
        }
    } catch (error) {
        console.error("Error fetching notifications:", error)
        throw error
    }
}

/**
 * Get unread notification count for badge display
 */
export async function getUnreadNotificationCount() {
    const session = await getServerSession(authOptions)
    if (!session?.user?.id) {
        return 0
    }

    try {
        const count = await prisma.notification.count({
            where: { userId: session.user.id, isSeen: false },
        })
        return count
    } catch (error) {
        console.error("Error fetching unread count:", error)
        return 0
    }
}

/**
 * Mark a single notification as read
 */
export async function markNotificationRead(notificationId: string) {
    const session = await getServerSession(authOptions)
    if (!session?.user?.id) {
        throw new Error("Unauthorized")
    }

    try {
        const notification = await prisma.notification.findUnique({
            where: { id: notificationId },
        })

        if (!notification || notification.userId !== session.user.id) {
            throw new Error("Notification not found")
        }

        await prisma.notification.update({
            where: { id: notificationId },
            data: { isSeen: true },
        })

        revalidatePath('/dashboard/notifications')
        return { success: true }
    } catch (error) {
        console.error("Error marking notification read:", error)
        throw error
    }
}

/**
 * Mark all notifications as read for current user
 */
export async function markAllNotificationsRead() {
    const session = await getServerSession(authOptions)
    if (!session?.user?.id) {
        throw new Error("Unauthorized")
    }

    try {
        await prisma.notification.updateMany({
            where: { userId: session.user.id, isSeen: false },
            data: { isSeen: true },
        })

        revalidatePath('/dashboard/notifications')
        return { success: true }
    } catch (error) {
        console.error("Error marking all notifications read:", error)
        throw error
    }
}

/**
 * Create a notification for a user
 * Also triggers real-time update via Pusher
 */
export async function createNotification(
    userId: string,
    type: NotificationType,
    referenceId: string
) {
    try {
        const notification = await prisma.notification.create({
            data: {
                userId,
                type,
                referenceId,
            },
        })

        // Trigger real-time notification via Pusher
        await pusherServer.trigger(
            `private-user-${userId}`,
            'new-notification',
            {
                id: notification.id,
                type: notification.type,
                referenceId: notification.referenceId,
                createdAt: notification.createdAt,
            }
        )

        return { success: true, notification }
    } catch (error) {
        console.error("Error creating notification:", error)
        throw error
    }
}

/**
 * Delete a notification
 */
export async function deleteNotification(notificationId: string) {
    const session = await getServerSession(authOptions)
    if (!session?.user?.id) {
        throw new Error("Unauthorized")
    }

    try {
        const notification = await prisma.notification.findUnique({
            where: { id: notificationId },
        })

        if (!notification || notification.userId !== session.user.id) {
            throw new Error("Notification not found")
        }

        await prisma.notification.delete({
            where: { id: notificationId },
        })

        revalidatePath('/dashboard/notifications')
        return { success: true }
    } catch (error) {
        console.error("Error deleting notification:", error)
        throw error
    }
}
