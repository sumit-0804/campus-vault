"use client";

import { useState } from "react";
import { getKarmaLogs, adjustKarma } from "@/actions/admin";
import { useQuery, useMutation, useQueryClient } from "@tanstack/react-query";
import { Sparkles, Loader2, Plus, Minus, Send } from "lucide-react";

export default function AdminKarmaPage() {
    const [userId, setUserId] = useState("");
    const [amount, setAmount] = useState("");
    const [reason, setReason] = useState("");
    const [filterUserId, setFilterUserId] = useState("");
    const queryClient = useQueryClient();

    const { data: logs, isLoading } = useQuery({
        queryKey: ["admin", "karma-logs", filterUserId],
        queryFn: () => getKarmaLogs(filterUserId || undefined),
    });

    const adjustMutation = useMutation({
        mutationFn: () =>
            adjustKarma(userId, parseInt(amount), reason),
        onSuccess: () => {
            queryClient.invalidateQueries({ queryKey: ["admin", "karma-logs"] });
            setUserId("");
            setAmount("");
            setReason("");
        },
    });

    return (
        <div>
            <h2 className="text-2xl font-bold mb-6">Karma Management</h2>

            {/* Manual Adjustment Form */}
            <div className="border border-white/10 rounded-xl p-5 bg-zinc-900/30 mb-8">
                <h3 className="text-sm font-semibold uppercase tracking-wider text-zinc-400 mb-4">
                    Manual Karma Adjustment
                </h3>
                <div className="grid grid-cols-1 md:grid-cols-4 gap-3">
                    <input
                        type="text"
                        placeholder="User ID"
                        value={userId}
                        onChange={(e) => setUserId(e.target.value)}
                        className="px-3 py-2.5 bg-zinc-800 border border-white/10 rounded-lg text-sm text-white placeholder:text-zinc-500 focus:outline-none focus:ring-2 focus:ring-red-500/30"
                    />
                    <input
                        type="number"
                        placeholder="Amount (+/-)"
                        value={amount}
                        onChange={(e) => setAmount(e.target.value)}
                        className="px-3 py-2.5 bg-zinc-800 border border-white/10 rounded-lg text-sm text-white placeholder:text-zinc-500 focus:outline-none focus:ring-2 focus:ring-red-500/30"
                    />
                    <input
                        type="text"
                        placeholder="Reason"
                        value={reason}
                        onChange={(e) => setReason(e.target.value)}
                        className="px-3 py-2.5 bg-zinc-800 border border-white/10 rounded-lg text-sm text-white placeholder:text-zinc-500 focus:outline-none focus:ring-2 focus:ring-red-500/30"
                    />
                    <button
                        onClick={() => adjustMutation.mutate()}
                        disabled={!userId || !amount || !reason || adjustMutation.isPending}
                        className="flex items-center justify-center gap-2 px-4 py-2.5 rounded-lg text-sm font-semibold bg-red-500 text-white hover:bg-red-600 transition-all disabled:opacity-50 disabled:cursor-not-allowed"
                    >
                        <Send className="w-4 h-4" />
                        {adjustMutation.isPending ? "Adjusting..." : "Adjust"}
                    </button>
                </div>
                {adjustMutation.isError && (
                    <p className="text-xs text-red-400 mt-2">
                        Error: {(adjustMutation.error as Error).message}
                    </p>
                )}
                {adjustMutation.isSuccess && (
                    <p className="text-xs text-emerald-400 mt-2">Karma adjusted successfully!</p>
                )}
            </div>

            {/* Filter */}
            <div className="flex items-center gap-3 mb-4">
                <input
                    type="text"
                    placeholder="Filter by User ID..."
                    value={filterUserId}
                    onChange={(e) => setFilterUserId(e.target.value)}
                    className="flex-1 max-w-xs px-3 py-2 bg-zinc-900 border border-white/10 rounded-lg text-sm text-white placeholder:text-zinc-500 focus:outline-none focus:ring-2 focus:ring-red-500/30"
                />
                <h3 className="text-sm font-semibold uppercase tracking-wider text-zinc-400">
                    Karma Logs
                </h3>
            </div>

            {/* Logs Table */}
            <div className="border border-white/10 rounded-xl overflow-hidden">
                <div className="overflow-x-auto">
                    <table className="w-full text-sm">
                        <thead>
                            <tr className="border-b border-white/10 bg-zinc-900/50">
                                <th className="text-left px-4 py-3 text-xs uppercase tracking-wider text-zinc-500 font-semibold">User</th>
                                <th className="text-left px-4 py-3 text-xs uppercase tracking-wider text-zinc-500 font-semibold">Amount</th>
                                <th className="text-left px-4 py-3 text-xs uppercase tracking-wider text-zinc-500 font-semibold">Reason</th>
                                <th className="text-left px-4 py-3 text-xs uppercase tracking-wider text-zinc-500 font-semibold">Date</th>
                            </tr>
                        </thead>
                        <tbody>
                            {isLoading ? (
                                <tr>
                                    <td colSpan={4} className="px-4 py-12 text-center text-zinc-500">
                                        <Loader2 className="w-5 h-5 animate-spin mx-auto" />
                                    </td>
                                </tr>
                            ) : logs?.length === 0 ? (
                                <tr>
                                    <td colSpan={4} className="px-4 py-12 text-center text-zinc-500">
                                        <Sparkles className="w-6 h-6 mx-auto mb-2 opacity-50" />
                                        No karma logs found
                                    </td>
                                </tr>
                            ) : (
                                logs?.map((log) => (
                                    <tr
                                        key={log.id}
                                        className="border-b border-white/5 hover:bg-white/5 transition-colors"
                                    >
                                        <td className="px-4 py-3">
                                            <div className="flex items-center gap-2">
                                                {log.user.avatarUrl ? (
                                                    <img
                                                        src={log.user.avatarUrl}
                                                        alt={log.user.fullName}
                                                        className="w-6 h-6 rounded-full object-cover"
                                                    />
                                                ) : (
                                                    <div className="w-6 h-6 rounded-full bg-zinc-700 flex items-center justify-center text-[10px] font-bold">
                                                        {log.user.fullName.charAt(0)}
                                                    </div>
                                                )}
                                                <span className="text-white">{log.user.fullName}</span>
                                            </div>
                                        </td>
                                        <td className="px-4 py-3">
                                            <span className={`flex items-center gap-1 font-semibold ${log.amount >= 0 ? "text-emerald-400" : "text-red-400"
                                                }`}>
                                                {log.amount >= 0 ? (
                                                    <Plus className="w-3 h-3" />
                                                ) : (
                                                    <Minus className="w-3 h-3" />
                                                )}
                                                {Math.abs(log.amount)}
                                            </span>
                                        </td>
                                        <td className="px-4 py-3 text-zinc-400">{log.reason}</td>
                                        <td className="px-4 py-3 text-zinc-500 text-xs">
                                            {new Date(log.createdAt).toLocaleString()}
                                        </td>
                                    </tr>
                                ))
                            )}
                        </tbody>
                    </table>
                </div>
            </div>
        </div>
    );
}
