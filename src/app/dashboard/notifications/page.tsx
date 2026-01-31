export const dynamic = 'force-dynamic';

import { getNotifications } from "@/actions/notifications";
import { NotificationList } from "./_components/NotificationList";
import { Ghost } from "lucide-react";

export default async function NotificationsPage() {
    const { notifications, unreadCount } = await getNotifications();

    return (
        <div className="flex flex-col gap-6 p-4 pt-6 max-w-3xl mx-auto w-full animate-in fade-in slide-in-from-bottom-4 duration-700">
            {/* Header Badge */}
            <div className="flex items-center gap-2 text-purple-400">
                <Ghost className="w-4 h-4" />
                <span className="text-xs font-semibold uppercase tracking-wider">Notifications</span>
            </div>

            {/* Title Section */}
            <section className="flex flex-col sm:flex-row sm:items-start justify-between gap-4">
                <div>
                    <h1 className="text-3xl sm:text-4xl font-bold tracking-tight flex items-center gap-3">
                        <span className="bg-gradient-to-r from-purple-400 to-pink-400 bg-clip-text text-transparent">
                            Activity Feed
                        </span>
                        <span className="text-2xl">🔔</span>
                    </h1>
                    <p className="text-zinc-500 mt-1">
                        Updates on your cursed items, blood pacts, and karma.
                    </p>
                </div>
            </section>

            {/* Notifications List */}
            <NotificationList initialNotifications={notifications} initialUnreadCount={unreadCount} />
        </div>
    );
}
