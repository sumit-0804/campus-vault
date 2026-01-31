import { Award, Heart, ShoppingBag, Gift, Star, Zap, Skull, Flame, Ghost } from "lucide-react";

const KARMA_ITEMS = [
    {
        icon: Heart,
        iconBg: "bg-pink-500/10 border-pink-500/20",
        iconColor: "text-pink-400",
        label: "Return Lost Item",
        description: "Reuniting a spirit with its owner",
        points: "+50",
        emoji: "👻",
    },
    {
        icon: Flame,
        iconBg: "bg-green-500/10 border-green-500/20",
        iconColor: "text-green-400",
        label: "Sell an Item",
        description: "Successfully completing a ritual",
        points: "+10",
        emoji: "🔥",
    },
    {
        icon: Gift,
        iconBg: "bg-blue-500/10 border-blue-500/20",
        iconColor: "text-blue-400",
        label: "Buy an Item",
        description: "Acquiring a cursed relic",
        points: "+5",
        emoji: "🎁",
    },
    {
        icon: Star,
        iconBg: "bg-yellow-500/10 border-yellow-500/20",
        iconColor: "text-yellow-400",
        label: "5-Star Seller Rating",
        description: "Receiving a perfect dark blessing",
        points: "+10",
        emoji: "⭐",
    },
    {
        icon: Zap,
        iconBg: "bg-purple-500/10 border-purple-500/20",
        iconColor: "text-purple-400",
        label: "Daily Login",
        description: "Visiting the vault daily",
        points: "+1",
        emoji: "⚡",
    },
];

export function ScoringGuide() {
    return (
        <div className="bg-zinc-900/60 rounded-xl border border-purple-500/10 p-6 backdrop-blur-sm">
            <h3 className="font-semibold text-lg flex items-center gap-2 mb-4">
                <div className="p-1.5 rounded-lg bg-purple-500/20">
                    <Award className="w-4 h-4 text-purple-400" />
                </div>
                Scoring Guide
            </h3>

            <div className="space-y-2">
                {KARMA_ITEMS.map((item) => {
                    const Icon = item.icon;

                    return (
                        <div key={item.label} className="flex items-center gap-3 p-3 rounded-lg bg-zinc-800/40 border border-white/5 hover:border-purple-500/20 transition-all group">
                            <div className={`p-2.5 rounded-lg border ${item.iconBg}`}>
                                <Icon className={`w-5 h-5 ${item.iconColor}`} />
                            </div>
                            <div className="flex-1 min-w-0">
                                <p className="font-medium text-white text-sm flex items-center gap-1.5">
                                    {item.label}
                                    <span className="text-xs opacity-60">{item.emoji}</span>
                                </p>
                                <p className="text-xs text-zinc-500">{item.description}</p>
                            </div>
                            <span className="text-green-400 font-bold text-sm">
                                {item.points}
                            </span>
                        </div>
                    );
                })}
            </div>
        </div>
    );
}
