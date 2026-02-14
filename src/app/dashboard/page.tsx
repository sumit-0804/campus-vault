export const dynamic = 'force-dynamic';

import { Button } from "@/components/ui/button";
import Link from "next/link";
import { Plus, ShoppingBag, ScrollText, Search, Zap, Eye, Star, TrendingUp, Package, Handshake, Clock, Skull, Ghost, Flame } from "lucide-react";
import { getServerSession } from "next-auth";
import { authOptions } from "@/auth";
import db from "@/lib/db";
import { KARMA_BADGES } from "@/lib/karma-constants";
import { redirect } from "next/navigation";
import { formatDistanceToNow } from "date-fns";

function getGreeting() {
    const hour = new Date().getHours();
    if (hour < 12) return "Good morning";
    if (hour < 17) return "Good afternoon";
    return "Good evening";
}

export default async function Dashboard() {
    const session = await getServerSession(authOptions);

    if (!session || !session.user) {
        redirect("/");
    }

    const [activeListings, pendingOffers, foundItems, freshUser, recentOffers, recentTransactions] = await Promise.all([
        db.cursedObject.count({
            where: {
                sellerId: session.user.id,
                status: "ACTIVE",
            },
        }),
        db.bloodPact.count({
            where: {
                item: {
                    sellerId: session.user.id,
                },
                status: "PENDING",
            },
        }),
        db.lostRelic.count({
            where: {
                reporterId: session.user.id,
                type: "FOUND",
            },
        }),
        db.wizard.findUnique({
            where: { email: session.user.email! },
            select: { karmaScore: true, karmaRank: true },
        }),
        db.bloodPact.findMany({
            where: {
                OR: [
                    { buyerId: session.user.id },
                    { item: { sellerId: session.user.id } },
                ],
            },
            orderBy: { updatedAt: "desc" },
            take: 5,
            include: {
                item: { select: { title: true } },
                buyer: { select: { fullName: true } },
            },
        }),
        db.transaction.findMany({
            where: {
                OR: [
                    { buyerId: session.user.id },
                    { sellerId: session.user.id },
                ],
            },
            orderBy: { completedAt: "desc" },
            take: 3,
            include: {
                relic: { select: { title: true } },
                buyer: { select: { fullName: true } },
                seller: { select: { fullName: true } },
            },
        }),
    ]);

    const karmaScore = freshUser?.karmaScore ?? 0;
    const derivedBadge = KARMA_BADGES.find(b => karmaScore >= b.min && karmaScore <= b.max) || KARMA_BADGES[0];
    const karmaRankLabel = derivedBadge.label;
    const badgeIcon = derivedBadge.icon;

    const sortedBadges = [...KARMA_BADGES].sort((a, b) => a.min - b.min);
    const currentBadgeIndex = sortedBadges.findIndex(b => karmaScore >= b.min && karmaScore <= b.max);
    const currentBadge = sortedBadges[currentBadgeIndex] || sortedBadges[0];
    const nextBadge = sortedBadges[currentBadgeIndex + 1];

    let progressPercent = 100;
    let nextRankLabel = "Max Rank!";

    if (nextBadge) {
        const range = nextBadge.min - currentBadge.min;
        const progress = karmaScore - currentBadge.min;
        progressPercent = Math.min(100, Math.max(0, (progress / range) * 100));
        nextRankLabel = nextBadge.label;
    }

    // Build activity feed
    type ActivityItem = {
        id: string;
        icon: 'offer' | 'sale' | 'purchase';
        text: string;
        time: Date;
    };

    const activityFeed: ActivityItem[] = [];

    for (const offer of recentOffers) {
        const isBuyer = offer.buyerId === session.user.id;
        activityFeed.push({
            id: `offer-${offer.id}`,
            icon: 'offer',
            text: isBuyer
                ? `You sealed a blood pact on "${offer.item.title}"`
                : `${offer.buyer.fullName} offered a blood pact on "${offer.item.title}"`,
            time: offer.updatedAt,
        });
    }

    for (const tx of recentTransactions) {
        const isBuyer = tx.buyerId === session.user.id;
        activityFeed.push({
            id: `tx-${tx.id}`,
            icon: isBuyer ? 'purchase' : 'sale',
            text: isBuyer
                ? `You claimed "${tx.relic.title}" from ${tx.seller.fullName}`
                : `"${tx.relic.title}" was surrendered to ${tx.buyer.fullName}`,
            time: tx.completedAt,
        });
    }

    activityFeed.sort((a, b) => b.time.getTime() - a.time.getTime());
    const topActivity = activityFeed.slice(0, 5);

    const stats = [
        { label: "Cursed Artifacts", value: activeListings, icon: ShoppingBag, color: "text-red-400", bg: "bg-red-500/10", glow: "group-hover:shadow-red-500/25", borderGlow: "hover:border-red-500/20" },
        { label: "Blood Pacts", value: pendingOffers, icon: ScrollText, color: "text-orange-400", bg: "bg-orange-500/10", glow: "group-hover:shadow-orange-500/25", borderGlow: "hover:border-orange-500/20" },
        { label: "Found Relics", value: foundItems, icon: Search, color: "text-emerald-400", bg: "bg-emerald-500/10", glow: "group-hover:shadow-emerald-500/25", borderGlow: "hover:border-emerald-500/20" },
        { label: "Soul Energy", value: karmaScore, icon: Flame, color: "text-purple-400", bg: "bg-purple-500/10", glow: "group-hover:shadow-purple-500/25", borderGlow: "hover:border-purple-500/20" },
    ];

    const quickActions = [
        { href: "/marketplace/create", icon: Skull, label: "Sell Artifact", desc: "Curse the marketplace", color: "red" },
        { href: "/lost-found/report", icon: Ghost, label: "Report Relic", desc: "Lost or found", color: "orange" },
        { href: "/browse", icon: Eye, label: "Browse Vault", desc: "Explore the depths", color: "violet" },
        { href: "/dashboard/karma", icon: Flame, label: "Soul Energy", desc: "View your power", color: "purple" },
    ];

    const colorMap: Record<string, { bg: string; border: string; text: string; iconBg: string }> = {
        red: { bg: "bg-red-950/20", border: "border-red-500/20", text: "text-red-200", iconBg: "bg-red-500/10" },
        orange: { bg: "bg-orange-950/20", border: "border-orange-500/20", text: "text-orange-200", iconBg: "bg-orange-500/10" },
        violet: { bg: "bg-violet-950/20", border: "border-violet-500/20", text: "text-violet-200", iconBg: "bg-violet-500/10" },
        purple: { bg: "bg-purple-950/20", border: "border-purple-500/20", text: "text-purple-200", iconBg: "bg-purple-500/10" },
    };

    const activityIconMap: Record<string, typeof Handshake> = {
        offer: Handshake,
        sale: TrendingUp,
        purchase: Package,
    };

    const activityColorMap: Record<string, string> = {
        offer: "text-orange-400 bg-orange-500/10",
        sale: "text-emerald-400 bg-emerald-500/10",
        purchase: "text-red-400 bg-red-500/10",
    };

    return (
        <div className="flex flex-col gap-8 p-4 pt-6 max-w-7xl mx-auto w-full animate-in fade-in slide-in-from-bottom-4 duration-700 relative">
            {/* Header Section */}
            <section className="flex flex-col sm:flex-row sm:items-center justify-between gap-4">
                <div>
                    <h1 className="text-2xl sm:text-3xl font-bold tracking-tight flex items-center gap-2">
                        {getGreeting()}, {session.user.name?.split(" ")[0]}
                        <span className="text-2xl">🦇</span>
                    </h1>
                    <p className="text-zinc-500 mt-1 text-sm italic">
                        The vault whispers of your deeds...
                    </p>
                </div>
                <Link href="/marketplace/create">
                    <Button className="bg-red-900 hover:bg-red-800 text-white shadow-[0_0_25px_rgba(220,38,38,0.3)] border border-red-500/20 transition-all hover:shadow-[0_0_35px_rgba(220,38,38,0.5)] hover:scale-[1.02]">
                        <Plus className="w-4 h-4 mr-2" /> Curse New Item
                    </Button>
                </Link>
            </section>

            {/* Karma Card — Dark Realm Style */}
            <section className="relative overflow-hidden rounded-3xl bg-gradient-to-br from-zinc-950 via-red-950/40 to-zinc-950 p-8 sm:p-10 shadow-2xl border border-red-500/10">
                {/* Eerie background orbs */}
                <div className="absolute inset-0 overflow-hidden pointer-events-none">
                    <div className="absolute top-[-20%] right-[-10%] w-[500px] h-[500px] bg-red-500/10 blur-[120px] rounded-full animate-pulse" />
                    <div className="absolute bottom-[-30%] left-[-10%] w-[400px] h-[400px] bg-orange-500/8 blur-[100px] rounded-full animate-pulse [animation-delay:1.5s]" />
                    <div className="absolute top-[30%] left-[40%] w-[300px] h-[300px] bg-purple-500/8 blur-[80px] rounded-full animate-pulse [animation-delay:3s]" />
                    {/* Floating embers */}
                    <div className="absolute top-[20%] right-[30%] w-1 h-1 bg-red-400/60 rounded-full animate-bounce [animation-delay:0.5s] [animation-duration:3s]" />
                    <div className="absolute top-[60%] right-[50%] w-1.5 h-1.5 bg-orange-400/40 rounded-full animate-bounce [animation-delay:1s] [animation-duration:4s]" />
                    <div className="absolute top-[40%] right-[20%] w-1 h-1 bg-red-300/50 rounded-full animate-bounce [animation-delay:2s] [animation-duration:3.5s]" />
                </div>

                <div className="relative z-10 flex flex-col md:flex-row justify-between items-start md:items-end gap-6">
                    <div className="space-y-4">
                        <div className="flex items-center gap-3">
                            <span className="text-red-300/80 font-medium tracking-wide uppercase text-sm">Soul Energy</span>
                            <span className="px-3 py-1 rounded-full bg-red-500/10 border border-red-500/20 text-xs font-bold uppercase tracking-wider text-red-200 flex items-center gap-1.5 shadow-[0_0_15px_rgba(220,38,38,0.2)]">
                                <span className="text-sm">{badgeIcon}</span>
                                {karmaRankLabel}
                            </span>
                        </div>
                        <div className="text-6xl sm:text-7xl font-black text-white tracking-tighter drop-shadow-[0_0_40px_rgba(220,38,38,0.3)]" style={{ textShadow: '0 0 60px rgba(220,38,38,0.2), 0 0 120px rgba(220,38,38,0.1)' }}>
                            {karmaScore}
                        </div>
                        <p className="text-zinc-400 max-w-md text-sm sm:text-base leading-relaxed">
                            Channel more soul energy by returning lost relics, completing fair trades, and rising through the ranks.
                        </p>
                    </div>

                    <div className="w-full md:w-72 bg-black/40 p-5 rounded-2xl backdrop-blur-sm border border-red-500/10">
                        <div className="flex justify-between text-sm mb-3 font-medium">
                            <span className="text-red-300/80">{karmaRankLabel}</span>
                            <span className="text-zinc-500">{nextRankLabel}</span>
                        </div>
                        <div className="h-2.5 w-full bg-black/60 rounded-full overflow-hidden">
                            <div
                                className="h-full bg-gradient-to-r from-red-600 via-orange-500 to-red-500 rounded-full shadow-[0_0_12px_rgba(220,38,38,0.6)] transition-all duration-1000 ease-out"
                                style={{ width: `${progressPercent}%` }}
                            />
                        </div>
                        <div className="flex justify-between text-xs text-zinc-500 mt-2">
                            <span>{karmaScore} pts</span>
                            <span>{nextBadge ? `${nextBadge.min} pts` : "∞"}</span>
                        </div>
                    </div>
                </div>
            </section>

            {/* Stats Grid — Dark Realm */}
            <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-4">
                {stats.map((stat, i) => (
                    <div
                        key={stat.label}
                        className={`group p-6 rounded-2xl bg-zinc-950/60 border border-white/5 ${stat.borderGlow} transition-all duration-300 hover:bg-zinc-900/60 hover:shadow-lg ${stat.glow} hover:-translate-y-1 flex items-center justify-between cursor-pointer`}
                        style={{ animationDelay: `${i * 100}ms` }}
                    >
                        <div className="space-y-1">
                            <div className={`p-2.5 rounded-xl w-fit mb-3 transition-all duration-300 ${stat.bg} ${stat.color} group-hover:scale-110 group-hover:shadow-lg`}>
                                <stat.icon className="w-5 h-5" />
                            </div>
                            <p className="text-zinc-600 text-sm font-medium group-hover:text-zinc-400 transition-colors">{stat.label}</p>
                        </div>
                        <span className="text-3xl font-bold tabular-nums text-zinc-200">{stat.value}</span>
                    </div>
                ))}
            </div>

            <div className="grid lg:grid-cols-3 gap-6">
                {/* Recent Activity — Chronicle */}
                <div className="lg:col-span-2 p-6 rounded-2xl bg-zinc-950/60 border border-white/5 min-h-[300px] flex flex-col">
                    <div className="flex items-center justify-between mb-6">
                        <h3 className="text-lg font-bold flex items-center gap-2.5">
                            <Clock className="w-4 h-4 text-red-400/70" />
                            <span>Dark Chronicle</span>
                        </h3>
                        {topActivity.length > 0 && (
                            <span className="text-xs text-zinc-600 italic">{topActivity.length} entries</span>
                        )}
                    </div>

                    {topActivity.length === 0 ? (
                        <div className="flex-1 flex flex-col items-center justify-center text-zinc-500 gap-4">
                            <div className="p-4 rounded-full bg-zinc-900/50 border border-red-500/10">
                                <Ghost className="w-8 h-8 opacity-40 text-red-400/50" />
                            </div>
                            <div className="text-center">
                                <p className="text-sm font-medium text-zinc-500">The chronicle is empty</p>
                                <p className="text-xs text-zinc-700 mt-1 italic">Your deeds will be inscribed here...</p>
                            </div>
                        </div>
                    ) : (
                        <div className="space-y-1">
                            {topActivity.map((item, i) => {
                                const IconComp = activityIconMap[item.icon];
                                const colorClass = activityColorMap[item.icon];
                                return (
                                    <div
                                        key={item.id}
                                        className="flex items-start gap-3 p-3 rounded-xl hover:bg-white/[0.02] transition-colors group/item"
                                        style={{ animationDelay: `${i * 80}ms` }}
                                    >
                                        <div className={`p-2 rounded-lg ${colorClass} shrink-0 mt-0.5`}>
                                            <IconComp className="w-3.5 h-3.5" />
                                        </div>
                                        <div className="flex-1 min-w-0">
                                            <p className="text-sm text-zinc-300 leading-snug truncate">{item.text}</p>
                                            <p className="text-xs text-zinc-700 mt-1 italic">
                                                {formatDistanceToNow(item.time, { addSuffix: true })}
                                            </p>
                                        </div>
                                    </div>
                                );
                            })}
                        </div>
                    )}
                </div>

                {/* Quick Actions — Ritual Actions */}
                <div className="space-y-4">
                    <h3 className="text-lg font-bold flex items-center gap-2.5">
                        <Skull className="w-4 h-4 text-red-400/70" />
                        <span>Rituals</span>
                    </h3>
                    <div className="grid grid-cols-2 gap-3">
                        {quickActions.map((action) => {
                            const colors = colorMap[action.color];
                            return (
                                <Link
                                    key={action.href}
                                    href={action.href}
                                    className={`p-4 rounded-xl ${colors.bg} border ${colors.border} hover:bg-opacity-30 transition-all duration-200 flex flex-col items-center justify-center gap-2.5 ${colors.text} group hover:-translate-y-1 hover:shadow-lg`}
                                >
                                    <div className={`p-3 rounded-full ${colors.iconBg} border ${colors.border} group-hover:scale-110 transition-transform duration-200`}>
                                        <action.icon className="w-5 h-5" />
                                    </div>
                                    <div className="text-center">
                                        <span className="text-sm font-semibold block">{action.label}</span>
                                        <span className="text-[11px] opacity-50 italic">{action.desc}</span>
                                    </div>
                                </Link>
                            );
                        })}
                    </div>

                    <div className="p-4 rounded-xl bg-gradient-to-r from-red-950/20 to-orange-950/10 border border-red-500/10 flex items-center gap-3">
                        <div className="p-2 rounded-lg bg-red-500/10">
                            <Flame className="w-4 h-4 text-red-500 animate-pulse" />
                        </div>
                        <div>
                            <span className="text-sm text-red-200 font-semibold block">Daily Offering</span>
                            <span className="text-xs text-red-300/40 italic">+1 Soul Energy each dawn</span>
                        </div>
                    </div>
                </div>
            </div>
        </div>
    );
}
