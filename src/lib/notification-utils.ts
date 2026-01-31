import { NotificationType } from "@/app/generated/prisma/enums"

/**
 * Get notification display info based on type and reference
 */
export function getNotificationInfo(type: NotificationType, referenceId: string) {
    const info = {
        OFFER_RECEIVED: {
            title: "New Offer Received",
            description: "Someone made an offer on your item",
            icon: "💰",
            href: `/dashboard/messages`,
        },
        OFFER_ACCEPTED: {
            title: "Offer Accepted!",
            description: "Your offer has been accepted",
            icon: "✅",
            href: `/dashboard/messages`,
        },
        OFFER_REJECTED: {
            title: "Offer Declined",
            description: "Your offer was not accepted",
            icon: "❌",
            href: `/dashboard/messages`,
        },
        OFFER_COUNTERED: {
            title: "Counter Offer Received",
            description: "The seller made a counter offer",
            icon: "🔄",
            href: `/dashboard/messages`,
        },
        MESSAGE_RECEIVED: {
            title: "New Message",
            description: "You have a new message",
            icon: "💬",
            href: `/dashboard/messages/${referenceId}`,
        },
        ITEM_SOLD: {
            title: "Item Sold!",
            description: "Your item has been sold",
            icon: "🎉",
            href: `/dashboard/transactions`,
        },
        RATING_RECEIVED: {
            title: "New Rating",
            description: "You received a rating from a buyer",
            icon: "⭐",
            href: `/dashboard/profile`,
        },
        KARMA_EARNED: {
            title: "Karma Earned!",
            description: `You earned karma points`,
            icon: "⚡",
            href: `/dashboard`,
        },
        RELIC_MATCH: {
            title: "Potential Match Found",
            description: "Found items have a post which might be linked to your post about lost item",
            icon: "🔍",
            href: `/dashboard/lost-found/${referenceId}`,
        },
    }

    return info[type] || {
        title: "Notification",
        description: "You have a new notification",
        icon: "🔔",
        href: `/dashboard`,
    }
}
