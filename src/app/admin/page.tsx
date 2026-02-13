import { getAdminStats } from "@/actions/admin";
import { Users, ShoppingBag, Sparkles, Flag, Receipt } from "lucide-react";

export default async function AdminDashboard() {
    const stats = await getAdminStats();

    const kpiCards = [
        {
            label: "Total Users",
            value: stats.totalUsers,
            icon: Users,
            color: "text-blue-400",
            bg: "bg-blue-500/10 border-blue-500/20",
        },
        {
            label: "Active Listings",
            value: stats.activeListings,
            icon: ShoppingBag,
            color: "text-emerald-400",
            bg: "bg-emerald-500/10 border-emerald-500/20",
        },
        {
            label: "Total Karma",
            value: stats.totalKarma.toLocaleString(),
            icon: Sparkles,
            color: "text-amber-400",
            bg: "bg-amber-500/10 border-amber-500/20",
        },
        {
            label: "Pending Reports",
            value: stats.pendingReports,
            icon: Flag,
            color: "text-red-400",
            bg: "bg-red-500/10 border-red-500/20",
        },
        {
            label: "Transactions",
            value: stats.totalTransactions,
            icon: Receipt,
            color: "text-purple-400",
            bg: "bg-purple-500/10 border-purple-500/20",
        },
    ];

    return (
        <div>
            <h2 className="text-2xl font-bold mb-6">Dashboard Overview</h2>

            <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-4">
                {kpiCards.map((card) => (
                    <div
                        key={card.label}
                        className={`rounded-xl border p-5 ${card.bg} transition-all hover:scale-[1.02] duration-200`}
                    >
                        <div className="flex items-center justify-between mb-3">
                            <span className="text-xs uppercase tracking-widest text-zinc-400 font-semibold">
                                {card.label}
                            </span>
                            <card.icon className={`w-5 h-5 ${card.color}`} />
                        </div>
                        <p className={`text-3xl font-black ${card.color}`}>
                            {card.value}
                        </p>
                    </div>
                ))}
            </div>
        </div>
    );
}
