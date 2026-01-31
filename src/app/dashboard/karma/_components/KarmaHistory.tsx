import { Notification } from "@/app/generated/prisma/client";
import { format } from "date-fns";
import { TrendingUp, Zap, Star, Gift, ShoppingBag, Heart, Ghost, Skull, Flame } from "lucide-react";

interface KarmaHistoryProps {
    history: Notification[];
}

// Get karma details from referenceId with spooky styling
function getKarmaDetails(referenceId: string) {
    switch (referenceId) {
        case "DAILY_LOGIN":
            return { label: "Daily Login Bonus", points: "+1", icon: Zap, color: "text-yellow-400", bg: "bg-yellow-500/10" };
        case "SELL_ITEM":
            return { label: "Soul Harvested", points: "+10", icon: Flame, color: "text-green-400", bg: "bg-green-500/10" };
        case "BUY_ITEM":
            return { label: "Relic Acquired", points: "+5", icon: Gift, color: "text-blue-400", bg: "bg-blue-500/10" };
        case "RETURN_LOST_ITEM":
            return { label: "Spirit Reunited", points: "+50", icon: Heart, color: "text-pink-400", bg: "bg-pink-500/10" };
        case "FIVE_STAR_RATING":
            return { label: "Perfect Ritual", points: "+10", icon: Star, color: "text-amber-400", bg: "bg-amber-500/10" };
        default:
            return { label: "Dark Energy", points: "+?", icon: Skull, color: "text-purple-400", bg: "bg-purple-500/10" };
    }
}

export function KarmaHistory({ history }: KarmaHistoryProps) {
    if (history.length === 0) {
        return (
            <div className="bg-zinc-900/60 rounded-xl border border-purple-500/10 p-6 backdrop-blur-sm">
                <h3 className="font-semibold text-lg flex items-center gap-2 mb-4">
                    <div className="p-1.5 rounded-lg bg-purple-500/20">
                        <TrendingUp className="w-4 h-4 text-purple-400" />
                    </div>
                    History
                </h3>
                <div className="text-center py-8">
                    <Ghost className="w-10 h-10 text-zinc-700 mx-auto mb-2" />
                    <p className="text-zinc-500 text-sm">No karma history yet. Start earning!</p>
                </div>
            </div>
        );
    }

    return (
        <div className="bg-zinc-900/60 rounded-xl border border-purple-500/10 p-6 backdrop-blur-sm">
            <h3 className="font-semibold text-lg flex items-center gap-2 mb-4">
                <div className="p-1.5 rounded-lg bg-purple-500/20">
                    <TrendingUp className="w-4 h-4 text-purple-400" />
                </div>
                History
            </h3>

            <div className="space-y-1 max-h-[400px] overflow-y-auto pr-2 scrollbar-thin scrollbar-thumb-zinc-700">
                {history.map((item) => {
                    const details = getKarmaDetails(item.referenceId);
                    const Icon = details.icon;

                    return (
                        <div key={item.id} className="flex items-center gap-3 p-3 rounded-lg hover:bg-purple-500/5 transition-colors group">
                            <div className={`p-2 rounded-lg ${details.bg}`}>
                                <Icon className={`w-4 h-4 ${details.color}`} />
                            </div>
                            <div className="flex-1 min-w-0">
                                <p className="font-medium text-white text-sm group-hover:text-purple-200 transition-colors">{details.label}</p>
                                <p className="text-xs text-zinc-500">
                                    {format(new Date(item.createdAt), "EEE MMM d yyyy")}
                                </p>
                            </div>
                            <span className="text-green-400 font-bold text-sm">
                                {details.points}
                            </span>
                        </div>
                    );
                })}
            </div>
        </div>
    );
}
