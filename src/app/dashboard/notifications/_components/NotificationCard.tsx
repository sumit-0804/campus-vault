"use client";

import { useTransition } from "react";
import { Notification } from "@/app/generated/prisma/client";
import { markNotificationRead } from "@/actions/notifications";
import { getNotificationInfo } from "@/lib/notification-utils";
import { useRouter } from "next/navigation";
import { format } from "date-fns";
import { Heart, Gift, MessageCircle, Star, Zap, ShoppingBag, AlertCircle, Ghost, Skull, Flame, Sparkles } from "lucide-react";

interface NotificationCardProps {
    notification: Notification;
    onRead: (id: string) => void;
}

// Map notification types to spooky icons and colors
function getNotificationIcon(type: string) {
    switch (type) {
        case "KARMA_EARNED":
            return { Icon: Skull, color: "text-purple-400", bg: "bg-purple-500/10 border-purple-500/20" };
        case "OFFER_RECEIVED":
            return { Icon: Flame, color: "text-orange-400", bg: "bg-orange-500/10 border-orange-500/20" };
        case "OFFER_ACCEPTED":
            return { Icon: Sparkles, color: "text-green-400", bg: "bg-green-500/10 border-green-500/20" };
        case "OFFER_REJECTED":
            return { Icon: Ghost, color: "text-red-400", bg: "bg-red-500/10 border-red-500/20" };
        case "OFFER_COUNTERED":
            return { Icon: Zap, color: "text-yellow-400", bg: "bg-yellow-500/10 border-yellow-500/20" };
        case "MESSAGE_RECEIVED":
            return { Icon: MessageCircle, color: "text-blue-400", bg: "bg-blue-500/10 border-blue-500/20" };
        case "ITEM_SOLD":
            return { Icon: Flame, color: "text-green-400", bg: "bg-green-500/10 border-green-500/20" };
        case "RATING_RECEIVED":
            return { Icon: Star, color: "text-amber-400", bg: "bg-amber-500/10 border-amber-500/20" };
        default:
            return { Icon: Ghost, color: "text-zinc-400", bg: "bg-zinc-500/10 border-zinc-500/20" };
    }
}

// Get spooky notification messages
function getNotificationMessage(type: string, referenceId: string) {
    switch (type) {
        case "KARMA_EARNED":
            if (referenceId === "DAILY_LOGIN") {
                return { title: "Daily Login Bonus! ⚡", description: "You earned +1 Karma for visiting the vault." };
            }
            if (referenceId === "SELL_ITEM") {
                return { title: "Soul Harvested! 🔥", description: "You earned +10 Karma for completing a ritual." };
            }
            if (referenceId === "BUY_ITEM") {
                return { title: "Relic Acquired! 🎁", description: "You earned +5 Karma for your acquisition." };
            }
            if (referenceId === "RETURN_LOST_ITEM") {
                return { title: "Spirit Reunited! 💜", description: "You earned +50 Karma for returning a lost spirit." };
            }
            if (referenceId === "FIVE_STAR_RATING") {
                return { title: "Perfect Dark Blessing! ⭐", description: "You earned +10 Karma for a 5-star rating." };
            }
            return { title: "Dark Energy Received!", description: "You earned karma points." };
        case "OFFER_RECEIVED":
            return { title: "Blood Pact Proposal 🩸", description: "A seeker has made an offer on your cursed relic." };
        case "OFFER_ACCEPTED":
            return { title: "Pact Sealed! ✅", description: "Your blood pact has been accepted." };
        case "OFFER_REJECTED":
            return { title: "Pact Rejected 💀", description: "Your offering was deemed unworthy." };
        case "OFFER_COUNTERED":
            return { title: "Counter Ritual ⚡", description: "The keeper demands a different offering." };
        case "MESSAGE_RECEIVED":
            return { title: "Whisper Received 💬", description: "A spirit has sent you a message." };
        case "ITEM_SOLD":
            return { title: "Relic Claimed! 🔥", description: "Your cursed object has found a new keeper." };
        case "RATING_RECEIVED":
            return { title: "Dark Blessing Received ⭐", description: "A seeker has blessed your services." };
        default:
            return { title: "Spectral Activity 👻", description: "Something stirs in the vault." };
    }
}

export function NotificationCard({ notification, onRead }: NotificationCardProps) {
    const router = useRouter();
    const [isPending, startTransition] = useTransition();

    const { Icon, color, bg } = getNotificationIcon(notification.type);
    const { title, description } = getNotificationMessage(notification.type, notification.referenceId);
    const info = getNotificationInfo(notification.type, notification.referenceId);

    const handleClick = () => {
        startTransition(async () => {
            if (!notification.isSeen) {
                await markNotificationRead(notification.id);
                onRead(notification.id);
            }
            router.push(info.href);
        });
    };

    return (
        <button
            onClick={handleClick}
            disabled={isPending}
            className="w-full p-4 rounded-xl bg-zinc-900/60 border border-white/5 hover:bg-purple-500/5 hover:border-purple-500/20 transition-all text-left group backdrop-blur-sm"
        >
            <div className="flex items-start gap-4">
                {/* Icon */}
                <div className={`p-3 rounded-xl border flex-shrink-0 ${bg}`}>
                    <Icon className={`w-5 h-5 ${color}`} />
                </div>

                {/* Content */}
                <div className="flex-1 min-w-0 pt-1">
                    <h4 className="font-semibold text-white group-hover:text-purple-200 transition-colors">
                        {title}
                    </h4>
                    <p className="text-sm text-zinc-400 mt-0.5">
                        {description}
                    </p>
                    {/* Timestamp */}
                    <p className="text-xs text-zinc-600 mt-2">
                        {format(new Date(notification.createdAt), "M/dd/yyyy • h:mm a")}
                    </p>
                </div>

                {/* Unread indicator */}
                {!notification.isSeen && (
                    <div className="w-2.5 h-2.5 rounded-full bg-purple-500 flex-shrink-0 mt-2 animate-pulse" />
                )}
            </div>
        </button>
    );
}
