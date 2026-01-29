"use client";

import { Button } from "@/components/ui/button";
import { Plus, ShoppingBag, ScrollText, Search, Zap } from "lucide-react";

export default function Dashboard() {
    return (
        <div className="flex flex-col gap-8 p-4 pt-6 max-w-7xl mx-auto w-full animate-in fade-in slide-in-from-bottom-4 duration-700">
            {/* Header Section */}
            <section className="flex flex-col sm:flex-row sm:items-center justify-between gap-4">
                <div>
                    <h1 className="text-2xl sm:text-3xl font-bold tracking-tight">
                        Welcome back, Sumit Goyal 👋
                    </h1>
                    <p className="text-zinc-400 mt-1">
                        Here's what's happening in your campus vault.
                    </p>
                </div>
                <Button className="bg-purple-600 hover:bg-purple-700 text-white shadow-[0_0_20px_rgba(147,51,234,0.3)] border-none">
                    <Plus className="w-4 h-4 mr-2" /> Post New Item
                </Button>
            </section>

            {/* Karma Card */}
            <section className="relative overflow-hidden rounded-3xl bg-gradient-to-r from-violet-900 to-purple-800 p-8 sm:p-10 shadow-2xl border border-white/10">
                <div className="relative z-10 flex flex-col md:flex-row justify-between items-start md:items-end gap-6">
                    <div className="space-y-4">
                        <div className="flex items-center gap-3">
                            <span className="text-purple-200 font-medium">Karma Score</span>
                            <span className="px-3 py-1 rounded-full bg-white/10 border border-white/20 text-xs font-bold uppercase tracking-wider text-white">
                                Newcomer
                            </span>
                        </div>
                        <div className="text-6xl sm:text-7xl font-black text-white tracking-tighter">
                            106
                        </div>
                        <p className="text-purple-200 max-w-md text-sm sm:text-base leading-relaxed">
                            Earn more karma by verifying your student ID, returning found items, and completing fair trades.
                        </p>
                    </div>

                    <div className="w-full md:w-64 bg-black/20 p-4 rounded-xl backdrop-blur-sm border border-white/5">
                        <div className="flex justify-between text-sm mb-2 font-medium">
                            <span className="text-purple-200">Progress to Next Badge</span>
                        </div>
                        <div className="h-2 w-full bg-black/40 rounded-full overflow-hidden">
                            <div className="h-full bg-white w-[35%] rounded-full shadow-[0_0_10px_white]" />
                        </div>
                        <div className="text-right text-xs text-purple-300 mt-2">
                            300 pts goal
                        </div>
                    </div>
                </div>
                {/* Background Decor */}
                <div className="absolute top-0 right-0 -translate-y-1/2 translate-x-1/4 w-96 h-96 bg-purple-500/30 blur-[100px] rounded-full pointer-events-none" />
                <div className="absolute bottom-0 left-0 translate-y-1/2 -translate-x-1/4 w-64 h-64 bg-violet-500/20 blur-[80px] rounded-full pointer-events-none" />
            </section>

            {/* Stats Grid */}
            <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-4">
                {[
                    { label: "Active Listings", value: "0", icon: ShoppingBag, color: "text-purple-400", bg: "bg-purple-500/10" },
                    { label: "Pending Offers", value: "0", icon: ScrollText, color: "text-amber-400", bg: "bg-amber-500/10" },
                    { label: "Found Items", value: "0", icon: Search, color: "text-emerald-400", bg: "bg-emerald-500/10" },
                    { label: "Total Karma", value: "106", icon: Zap, color: "text-red-400", bg: "bg-red-500/10" }
                ].map((stat) => (
                    <div key={stat.label} className="p-6 rounded-2xl bg-zinc-900/50 border border-white/5 hover:bg-zinc-900 transition-all hover:border-white/10 flex items-center justify-between group cursor-pointer">
                        <div className="space-y-1">
                            <div className={`p-2 rounded-lg w-fit mb-3 transition-colors ${stat.bg} ${stat.color}`}>
                                <stat.icon className="w-5 h-5" />
                            </div>
                            <p className="text-zinc-500 text-sm font-medium group-hover:text-zinc-400 transition-colors">{stat.label}</p>
                        </div>
                        <span className="text-3xl font-bold">{stat.value}</span>
                    </div>
                ))}
            </div>

            <div className="grid lg:grid-cols-3 gap-8">
                {/* Recent Activity */}
                <div className="lg:col-span-2 p-6 rounded-2xl bg-zinc-900/50 border border-white/5 min-h-[300px] flex flex-col">
                    <h3 className="text-lg font-bold mb-6">Recent Activity</h3>
                    <div className="flex-1 flex flex-col items-center justify-center text-zinc-500 gap-4">
                        <div className="p-4 rounded-full bg-zinc-800/50 border border-white/5">
                            <ScrollText className="w-8 h-8 opacity-50" />
                        </div>
                        <p className="text-sm">No recent activity yet.</p>
                    </div>
                </div>

                {/* Quick Actions */}
                <div className="space-y-4">
                    <h3 className="text-lg font-bold">Quick Actions</h3>
                    <div className="grid grid-cols-2 gap-3">
                        <button className="p-4 rounded-xl bg-purple-900/10 border border-purple-500/20 hover:bg-purple-900/20 transition-colors flex flex-col items-center justify-center gap-3 text-purple-200 group">
                            <div className="p-3 rounded-full bg-purple-500/10 border border-purple-500/20 group-hover:scale-110 transition-transform">
                                <ShoppingBag className="w-5 h-5" />
                            </div>
                            <span className="text-sm font-medium">Sell Item</span>
                        </button>
                        <button className="p-4 rounded-xl bg-red-900/10 border border-red-500/20 hover:bg-red-900/20 transition-colors flex flex-col items-center justify-center gap-3 text-red-200 group">
                            <div className="p-3 rounded-full bg-red-500/10 border border-red-500/20 group-hover:scale-110 transition-transform">
                                <Zap className="w-5 h-5" />
                            </div>
                            <span className="text-sm font-medium">Report</span>
                        </button>
                    </div>

                    <div className="p-4 rounded-xl bg-amber-900/10 border border-amber-500/20 flex items-center gap-3">
                        <Zap className="w-5 h-5 text-amber-500" />
                        <span className="text-sm text-amber-200 font-medium">Daily Login Bonus: +1 Karma</span>
                    </div>
                </div>
            </div>
        </div>
    );
}
