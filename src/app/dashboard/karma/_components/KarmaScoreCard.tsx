import { KarmaRank } from "@/app/generated/prisma/enums";
import { Skull, Crown, Shield, Sparkles } from "lucide-react";

interface KarmaScoreCardProps {
    score: number;
    rank: KarmaRank;
}

// Map karma ranks to display names and icons
const RANK_CONFIG = {
    MUGGLE: { name: "Muggle", icon: Skull, color: "text-zinc-400" },
    WIZARD: { name: "Wizard", icon: Shield, color: "text-purple-400" },
    AUROR: { name: "Auror", icon: Sparkles, color: "text-blue-400" },
    DARK_KNIGHT: { name: "Dark Knight", icon: Crown, color: "text-yellow-400" },
} as const;

export function KarmaScoreCard({ score, rank }: KarmaScoreCardProps) {
    const config = RANK_CONFIG[rank];
    const Icon = config.icon;

    return (
        <div className="relative overflow-hidden rounded-2xl bg-gradient-to-br from-purple-600 via-purple-800 to-indigo-900 p-6 sm:p-8">
            {/* Spooky background decorations */}
            <div className="absolute top-0 right-0 w-64 h-64 bg-purple-500/10 rounded-full -translate-y-1/2 translate-x-1/2 blur-3xl" />
            <div className="absolute bottom-0 left-0 w-48 h-48 bg-pink-500/10 rounded-full translate-y-1/2 -translate-x-1/2 blur-3xl" />
            <div className="absolute top-1/2 left-1/2 w-32 h-32 bg-indigo-500/10 rounded-full -translate-x-1/2 -translate-y-1/2 blur-2xl" />

            {/* Floating particles effect - skull emoji decorations */}
            <div className="absolute top-4 right-12 text-2xl opacity-20 animate-pulse">💀</div>
            <div className="absolute bottom-8 left-8 text-xl opacity-15 animate-pulse" style={{ animationDelay: '0.5s' }}>👻</div>
            <div className="absolute top-16 right-32 text-lg opacity-10 animate-pulse" style={{ animationDelay: '1s' }}>🦇</div>

            <div className="relative flex flex-col sm:flex-row sm:items-center justify-between gap-6">
                {/* Score Section */}
                <div>
                    <p className="text-purple-200 text-sm font-medium mb-1 flex items-center gap-2">
                        <Skull className="w-4 h-4" />
                        Current Score
                    </p>
                    <h2 className="text-6xl sm:text-7xl font-black text-white tracking-tight drop-shadow-lg">
                        {score}
                    </h2>
                    <p className="text-purple-200/80 text-sm mt-2 max-w-xs">
                        Your Karma reflects your trust in the community. Earn more by being a verified, active, and honest member.
                    </p>
                </div>

                {/* Level Badge */}
                <div className="flex-shrink-0">
                    <div className="px-6 py-4 rounded-xl bg-black/30 backdrop-blur-sm border border-white/10 shadow-xl shadow-purple-900/20">
                        <p className="text-purple-300 text-xs font-medium uppercase tracking-wider text-center mb-2">Level</p>
                        <div className="flex items-center gap-2 justify-center">
                            <Icon className={`w-5 h-5 ${config.color}`} />
                            <p className="text-white font-bold text-lg">
                                {config.name}
                            </p>
                        </div>
                    </div>
                </div>
            </div>
        </div>
    );
}
