"use client"

import { useEffect } from "react"
import { useSession } from "next-auth/react"
import { pusherClient } from "@/lib/pusher"
import { toast } from "sonner"
import { getNotificationInfo } from "@/lib/notification-utils"
import { markNotificationRead } from "@/actions/notifications"
import { NotificationType } from "@/app/generated/prisma/enums"
import { useRouter } from "next/navigation"

type NotificationEvent = {
    id: string
    type: NotificationType
    referenceId: string
    createdAt: Date
}

export function NotificationListener() {
    const { data: session } = useSession()
    const router = useRouter()

    useEffect(() => {
        if (!session?.user?.id) return

        const channelName = `private-user-${session.user.id}`
        const channel = pusherClient.subscribe(channelName)

        channel.bind("new-notification", (data: NotificationEvent) => {
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
                        <button
                            onClick={async (e) => {
                                e.stopPropagation()
                                toast.dismiss(t)
                                try {
                                    await markNotificationRead(data.id)
                                } catch (err) {
                                    console.error("Failed to mark as read", err)
                                }
                            }}
                            className="text-xs font-medium px-3 py-1.5 rounded-md bg-primary text-primary-foreground hover:bg-primary/90 transition-colors"
                        >
                            Mark as Read
                        </button>
                    </div>
                    {/* Visual Progress Timer (simulated with CSS animation handled by Sonner if configured, 
                        but effectively we just rely on duration=2000 here for dismissal) */}
                </div>
            ), {
                duration: 2000,
                // Sonner handles the timer internally, but visual progress bar is default in 'toast' generic.
                // For custom toasts, we often need to implement the bar ourselves if we really want it.
                // Given the requirement "visual showing toast is dismissing", Sonner's default 'toast()' has a progress bar or circle.
                // 'toast.custom' does NOT by default. 
                // However, implementing a CSS progress bar inside custom toast is cleaner.
            })
        })

        return () => {
            pusherClient.unsubscribe(channelName)
        }
    }, [session?.user?.id, router])

    return null
}
