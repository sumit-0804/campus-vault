'use client'

import { useEffect } from 'react'
import { useSession } from 'next-auth/react'
import { pusherClient } from '@/lib/pusher'
import { toast } from 'sonner'
import { getNotificationInfo } from '@/lib/notification-utils'
import { useRouter } from 'next/navigation'
import { NotificationType } from '@/app/generated/prisma/enums'
import { useQueryClient } from '@tanstack/react-query'
import { queryKeys } from '@/lib/query-keys'

type NotificationEvent = {
    id: string
    type: NotificationType
    referenceId: string
    createdAt: Date
    isSeen: boolean
}

export function usePusherNotifications() {
    const { data: session } = useSession()
    const router = useRouter()
    const queryClient = useQueryClient()

    useEffect(() => {
        if (!session?.user?.id) return

        const channelName = `private-user-${session.user.id}`
        const channel = pusherClient.subscribe(channelName)

        const handleNewNotification = (data: NotificationEvent) => {
            // 1. Invalidate Queries
            // This will trigger refetches in NotificationBell for both count and list
            queryClient.invalidateQueries({ queryKey: queryKeys.notifications.all })

            // 2. Show Toast
            const info = getNotificationInfo(data.type, data.referenceId)

            toast.custom((t) => (
                <div className="bg-popover border border-border rounded-lg shadow-lg p-4 w-full max-w-sm flex flex-col gap-3 pointer-events-auto">
                    <div className="flex items-start gap-3">
                        <span className="text-2xl">{info.icon}</span>
                        <div className="flex-1 overflow-hidden">
                            <h4 className="font-semibold text-sm truncate">{info.title}</h4>
                            <p className="text-muted-foreground text-xs line-clamp-2">{info.description}</p>
                        </div>
                    </div>
                    <div className="flex justify-end gap-2">
                        <button
                            onClick={() => {
                                toast.dismiss(t)
                                if (info.href) router.push(info.href)
                            }}
                            className="text-xs font-medium px-3 py-1.5 rounded-md hover:bg-muted transition-colors"
                        >
                            View
                        </button>
                    </div>
                </div>
            ), { duration: 4000 })
        }

        channel.bind('new-notification', handleNewNotification)

        return () => {
            channel.unbind('new-notification', handleNewNotification)
            pusherClient.unsubscribe(channelName)
        }
    }, [session?.user?.id, queryClient, router])
}
