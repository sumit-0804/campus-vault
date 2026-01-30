"use client";

import { useEffect } from "react";
import { useRouter } from "next/navigation";
import { pusherClient } from "@/lib/pusher";

interface RelicRealtimeListenerProps {
    relicId: string;
}

export function RelicRealtimeListener({ relicId }: RelicRealtimeListenerProps) {
    const router = useRouter();

    useEffect(() => {
        const channelName = `relic-${relicId}`;
        const channel = pusherClient.subscribe(channelName);

        const handleStatusUpdate = (data: { status: string }) => {
            console.log("Realtime update received:", data);
            router.refresh();
        };

        channel.bind("status-updated", handleStatusUpdate);

        return () => {
            channel.unbind("status-updated", handleStatusUpdate);
            pusherClient.unsubscribe(channelName);
        };
    }, [relicId, router]);

    return null;
}
