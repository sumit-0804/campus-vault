"use client";

import { useState } from "react";
import { Notification } from "@/app/generated/prisma/client";
import { NotificationCard } from "./NotificationCard";
import { markAllNotificationsRead, markNotificationRead } from "@/actions/notifications";
import { CheckCheck, Ghost, Skull } from "lucide-react";
import { useMutation, useQueryClient } from "@tanstack/react-query";
import { queryKeys } from "@/lib/query-keys";

interface NotificationListProps {
    initialNotifications: Notification[];
    initialUnreadCount: number;
}

export function NotificationList({ initialNotifications, initialUnreadCount }: NotificationListProps) {
    const [notifications, setNotifications] = useState(initialNotifications);
    const [unreadCount, setUnreadCount] = useState(initialUnreadCount);
    const queryClient = useQueryClient();

    const markAllReadMutation = useMutation({
        mutationFn: () => markAllNotificationsRead(),
        onMutate: () => {
            // Optimistic update
            setNotifications((prev) => prev.map((n) => ({ ...n, isSeen: true })));
            setUnreadCount(0);
        },
        onSuccess: () => {
            queryClient.invalidateQueries({ queryKey: queryKeys.notifications.all });
        },
    });

    const handleNotificationRead = (id: string) => {
        setNotifications((prev) =>
            prev.map((n) => (n.id === id ? { ...n, isSeen: true } : n))
        );
        setUnreadCount((prev) => Math.max(0, prev - 1));
        queryClient.invalidateQueries({ queryKey: queryKeys.notifications.all });
    };

    if (notifications.length === 0) {
        return (
            <div className="flex flex-col items-center justify-center py-20">
                <div className="p-6 rounded-2xl bg-zinc-900/60 border border-purple-500/10 mb-4">
                    <Ghost className="w-12 h-12 text-purple-500/50" />
                </div>
                <h3 className="text-lg font-medium text-zinc-400 mb-1">The vault is silent...</h3>
                <p className="text-sm text-zinc-600">
                    When spirits stir, their whispers will appear here.
                </p>
            </div>
        );
    }

    return (
        <div className="space-y-4">
            {/* Mark All Read Button */}
            {unreadCount > 0 && (
                <div className="flex justify-end">
                    <button
                        onClick={() => markAllReadMutation.mutate()}
                        disabled={markAllReadMutation.isPending}
                        className="flex items-center gap-1.5 text-sm text-purple-400 hover:text-purple-300 transition-colors disabled:opacity-50"
                    >
                        <CheckCheck className="w-4 h-4" />
                        Mark all as read
                    </button>
                </div>
            )}

            {/* Notifications */}
            <div className="space-y-3">
                {notifications.map((notification) => (
                    <NotificationCard
                        key={notification.id}
                        notification={notification}
                        onRead={handleNotificationRead}
                    />
                ))}
            </div>
        </div>
    );
}
