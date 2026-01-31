"use client"

import { Bell } from "lucide-react"
import { Button } from "@/components/ui/button"
import {
    Popover,
    PopoverContent,
    PopoverTrigger,
} from "@/components/ui/popover"
import { useEffect, useState } from "react"
import { getNotifications, getUnreadNotificationCount, markNotificationRead } from "@/actions/notifications"
import { Notification } from "@/app/generated/prisma/client"
import { getNotificationInfo } from "@/lib/notification-utils"
import Link from "next/link"
import { useRouter } from "next/navigation"
import { pusherClient } from "@/lib/pusher"
import { useSession } from "next-auth/react"
import { format } from "date-fns"
import { cn } from "@/lib/utils"

export function NotificationBell() {
    const [open, setOpen] = useState(false)
    const [unreadCount, setUnreadCount] = useState(0)
    const [notifications, setNotifications] = useState<Notification[]>([])
    const { data: session } = useSession()
    const router = useRouter()

    useEffect(() => {
        // Initial fetch
        const fetchData = async () => {
            if (session?.user?.id) {
                const count = await getUnreadNotificationCount()
                setUnreadCount(count)

                // Fetch top 3 notifications
                const result = await getNotifications(1, 3)
                if (result.success) {
                    setNotifications(result.notifications)
                }
            }
        }
        fetchData()

        // Real-time updates
        if (session?.user?.id) {
            const channelName = `private-user-${session.user.id}`
            const channel = pusherClient.subscribe(channelName)

            channel.bind("new-notification", async () => {
                const count = await getUnreadNotificationCount()
                setUnreadCount(count)

                // Refresh top 3
                const result = await getNotifications(1, 3)
                if (result.success) {
                    setNotifications(result.notifications)
                }
            })

            return () => {
                pusherClient.unsubscribe(channelName)
            }
        }
    }, [session?.user?.id])

    const handleNotificationClick = async (notification: Notification) => {
        const info = getNotificationInfo(notification.type, notification.referenceId)

        if (!notification.isSeen) {
            await markNotificationRead(notification.id)
            setUnreadCount(prev => Math.max(0, prev - 1))
            setNotifications(prev => prev.map(n =>
                n.id === notification.id ? { ...n, isSeen: true } : n
            ))
        }

        setOpen(false)
        router.push(info.href)
    }

    return (
        <Popover open={open} onOpenChange={setOpen}>
            <PopoverTrigger asChild>
                <Button variant="ghost" size="icon" className="relative text-zinc-400 hover:text-white hover:bg-white/10">
                    <Bell className="h-5 w-5" />
                    {unreadCount > 0 && (
                        <span className="absolute top-2 right-2 h-2 w-2 rounded-full bg-red-500 ring-2 ring-black" />
                    )}
                </Button>
            </PopoverTrigger>
            <PopoverContent className="w-80 p-0 bg-black/95 border-white/10 text-zinc-400 shadow-xl backdrop-blur-md" align="end">
                <div className="flex items-center justify-between p-3 border-b border-white/10">
                    <span className="text-xs uppercase tracking-wider font-semibold text-muted-foreground">Notifications</span>
                    {unreadCount > 0 && (
                        <span className="text-xs text-red-500 font-bold bg-red-900/20 px-2 py-0.5 rounded-full border border-red-500/20">{unreadCount} New</span>
                    )}
                </div>

                <div className="max-h-[300px] overflow-y-auto">
                    {notifications.length === 0 ? (
                        <div className="p-8 text-center flex flex-col items-center gap-2">
                            <span className="text-2xl opacity-50">👻</span>
                            <span className="text-sm text-zinc-500">No notifications yet</span>
                        </div>
                    ) : (
                        <div className="divide-y divide-white/5">
                            {notifications.map((notification) => {
                                const info = getNotificationInfo(notification.type, notification.referenceId)
                                return (
                                    <button
                                        key={notification.id}
                                        className="w-full text-left p-3 flex gap-3 items-start group hover:bg-white/5 transition-colors focus:outline-none focus:bg-white/5"
                                        onClick={() => handleNotificationClick(notification)}
                                    >
                                        <div className="text-xl pt-0.5 shrink-0 select-none">{info.icon}</div>
                                        <div className="flex-1 min-w-0 space-y-1">
                                            <p className={cn("text-sm font-medium leading-tight group-hover:text-white transition-colors truncate", !notification.isSeen && "text-white")}>
                                                {info.title}
                                            </p>
                                            <p className="text-xs text-muted-foreground line-clamp-2 leading-relaxed">
                                                {info.description}
                                            </p>
                                            <p className="text-[10px] text-zinc-600 font-medium">
                                                {format(new Date(notification.createdAt), "MMM d, h:mm a")}
                                            </p>
                                        </div>
                                        {!notification.isSeen && (
                                            <div className="h-1.5 w-1.5 rounded-full bg-purple-500 mt-2 shrink-0 animate-pulse" />
                                        )}
                                    </button>
                                )
                            })}
                        </div>
                    )}
                </div>

                <div className="p-2 border-t border-white/10 bg-white/5 md:bg-transparent">
                    <Link
                        href="/dashboard/notifications"
                        onClick={() => setOpen(false)}
                        className="flex w-full items-center justify-center p-2 text-xs font-medium text-zinc-400 hover:text-white hover:bg-white/10 rounded-md transition-all border border-transparent hover:border-white/5"
                    >
                        View all notifications
                    </Link>
                </div>
            </PopoverContent>
        </Popover>
    )
}
