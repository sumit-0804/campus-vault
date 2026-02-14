"use client";

import { useState, useTransition } from "react";
import { getAllUsers, toggleBanUser } from "@/actions/admin";
import { useQuery, useMutation, useQueryClient } from "@tanstack/react-query";
import { Search, Ban, CheckCircle, Loader2 } from "lucide-react";

export default function AdminUsersPage() {
    const [search, setSearch] = useState("");
    const [page, setPage] = useState(1);
    const queryClient = useQueryClient();

    const { data, isLoading } = useQuery({
        queryKey: ["admin", "users", page, search],
        queryFn: () => getAllUsers(page, search),
    });

    const [selectedUser, setSelectedUser] = useState<string | null>(null);
    const [banReason, setBanReason] = useState("");
    const [isBanDialogOpen, setIsBanDialogOpen] = useState(false);

    const banMutation = useMutation({
        mutationFn: ({ userId, reason }: { userId: string, reason?: string }) => toggleBanUser(userId, reason),
        onSuccess: () => {
            queryClient.invalidateQueries({ queryKey: ["admin", "users"] });
            setIsBanDialogOpen(false);
            setBanReason("");
            setSelectedUser(null);
        },
    });

    const handleBanClick = (userId: string, isBanished: boolean) => {
        if (isBanished) {
            // Unban directly
            banMutation.mutate({ userId });
        } else {
            // Open dialog for banning
            setSelectedUser(userId);
            setIsBanDialogOpen(true);
        }
    };

    const confirmBan = () => {
        if (selectedUser) {
            banMutation.mutate({ userId: selectedUser, reason: banReason });
        }
    };

    return (
        <div>
            <h2 className="text-2xl font-bold mb-6">User Management</h2>

            {/* Search */}
            <div className="relative mb-6">
                <Search className="absolute left-3 top-1/2 -translate-y-1/2 w-4 h-4 text-zinc-500" />
                <input
                    type="text"
                    placeholder="Search users by name or email..."
                    value={search}
                    onChange={(e) => {
                        setSearch(e.target.value);
                        setPage(1);
                    }}
                    className="w-full pl-10 pr-4 py-2.5 bg-zinc-900 border border-white/10 rounded-lg text-sm text-white placeholder:text-zinc-500 focus:outline-none focus:ring-2 focus:ring-red-500/30 focus:border-red-500/30"
                />
            </div>

            {/* Table */}
            <div className="border border-white/10 rounded-xl overflow-hidden">
                <div className="overflow-x-auto">
                    <table className="w-full text-sm">
                        <thead>
                            <tr className="border-b border-white/10 bg-zinc-900/50">
                                <th className="text-left px-4 py-3 text-xs uppercase tracking-wider text-zinc-500 font-semibold">User</th>
                                <th className="text-left px-4 py-3 text-xs uppercase tracking-wider text-zinc-500 font-semibold">Karma</th>
                                <th className="text-left px-4 py-3 text-xs uppercase tracking-wider text-zinc-500 font-semibold">Role</th>
                                <th className="text-left px-4 py-3 text-xs uppercase tracking-wider text-zinc-500 font-semibold">Status</th>
                                <th className="text-right px-4 py-3 text-xs uppercase tracking-wider text-zinc-500 font-semibold">Action</th>
                            </tr>
                        </thead>
                        <tbody>
                            {isLoading ? (
                                <tr>
                                    <td colSpan={5} className="px-4 py-12 text-center text-zinc-500">
                                        <Loader2 className="w-5 h-5 animate-spin mx-auto" />
                                    </td>
                                </tr>
                            ) : data?.users.length === 0 ? (
                                <tr>
                                    <td colSpan={5} className="px-4 py-12 text-center text-zinc-500">
                                        No users found
                                    </td>
                                </tr>
                            ) : (
                                data?.users.map((user) => (
                                    <tr
                                        key={user.id}
                                        className="border-b border-white/5 hover:bg-white/5 transition-colors"
                                    >
                                        <td className="px-4 py-3">
                                            <div className="flex items-center gap-3">
                                                {user.avatarUrl ? (
                                                    <img
                                                        src={user.avatarUrl}
                                                        alt={user.fullName}
                                                        className="w-8 h-8 rounded-full object-cover"
                                                    />
                                                ) : (
                                                    <div className="w-8 h-8 rounded-full bg-zinc-700 flex items-center justify-center text-xs font-bold">
                                                        {user.fullName.charAt(0)}
                                                    </div>
                                                )}
                                                <div>
                                                    <p className="font-medium text-white">{user.fullName}</p>
                                                    <p className="text-xs text-zinc-500">{user.email}</p>
                                                </div>
                                            </div>
                                        </td>
                                        <td className="px-4 py-3">
                                            <span className="text-amber-400 font-semibold">{user.karmaScore}</span>
                                            <span className="text-xs text-zinc-500 ml-1">{user.karmaRank}</span>
                                        </td>
                                        <td className="px-4 py-3">
                                            <span className={`text-xs px-2 py-1 rounded-full font-semibold ${user.role === "ADMIN"
                                                ? "bg-red-500/10 text-red-400 border border-red-500/20"
                                                : "bg-zinc-800 text-zinc-400 border border-white/10"
                                                }`}>
                                                {user.role}
                                            </span>
                                        </td>
                                        <td className="px-4 py-3">
                                            {user.isBanished ? (
                                                <span className="text-xs px-2 py-1 rounded-full bg-red-500/10 text-red-400 border border-red-500/20 font-semibold">
                                                    Banned
                                                </span>
                                            ) : (
                                                <span className="text-xs px-2 py-1 rounded-full bg-emerald-500/10 text-emerald-400 border border-emerald-500/20 font-semibold">
                                                    Active
                                                </span>
                                            )}
                                        </td>
                                        <td className="px-4 py-3 text-right">
                                            <button
                                                onClick={() => handleBanClick(user.id, user.isBanished)}
                                                disabled={banMutation.isPending || user.role === "ADMIN"}
                                                className={`text-xs px-3 py-1.5 rounded-lg font-semibold transition-all disabled:opacity-50 disabled:cursor-not-allowed ${user.isBanished
                                                    ? "bg-emerald-500/10 text-emerald-400 hover:bg-emerald-500/20 border border-emerald-500/20"
                                                    : "bg-red-500/10 text-red-400 hover:bg-red-500/20 border border-red-500/20"
                                                    }`}
                                            >
                                                {user.isBanished ? (
                                                    <span className="flex items-center gap-1">
                                                        <CheckCircle className="w-3 h-3" /> Unban
                                                    </span>
                                                ) : (
                                                    <span className="flex items-center gap-1">
                                                        <Ban className="w-3 h-3" /> Ban
                                                    </span>
                                                )}
                                            </button>
                                        </td>
                                    </tr>
                                ))
                            )}
                        </tbody>
                    </table>
                </div>
            </div>

            {/* Pagination */}
            {data && data.totalPages > 1 && (
                <div className="flex justify-center gap-2 mt-6">
                    {Array.from({ length: data.totalPages }, (_, i) => i + 1).map((p) => (
                        <button
                            key={p}
                            onClick={() => setPage(p)}
                            className={`px-3 py-1.5 rounded-lg text-xs font-semibold transition-all ${p === page
                                ? "bg-red-500 text-white"
                                : "bg-zinc-900 text-zinc-400 border border-white/10 hover:bg-white/5"
                                }`}
                        >
                            {p}
                        </button>
                    ))}
                </div>
            )}

            {/* Ban Modal */}
            {isBanDialogOpen && (
                <div className="fixed inset-0 bg-black/80 backdrop-blur-sm z-50 flex items-center justify-center p-4">
                    <div className="bg-zinc-900 border border-white/10 rounded-xl p-6 w-full max-w-sm">
                        <h3 className="text-lg font-bold text-white mb-2">Ban User</h3>
                        <p className="text-zinc-400 text-sm mb-4">
                            Specify a reason for this ban. The user will see this message.
                        </p>
                        <textarea
                            value={banReason}
                            onChange={(e) => setBanReason(e.target.value)}
                            placeholder="Reason for ban..."
                            className="w-full bg-zinc-800 border border-white/10 rounded-lg p-3 text-sm text-white focus:outline-none focus:ring-1 focus:ring-red-500 mb-4 h-24 resize-none"
                        />
                        <div className="flex justify-end gap-2">
                            <button
                                onClick={() => {
                                    setIsBanDialogOpen(false);
                                    setBanReason("");
                                    setSelectedUser(null);
                                }}
                                className="px-3 py-1.5 rounded-lg text-sm text-zinc-400 hover:text-white hover:bg-white/5"
                            >
                                Cancel
                            </button>
                            <button
                                onClick={confirmBan}
                                disabled={banMutation.isPending}
                                className="px-3 py-1.5 rounded-lg text-sm font-semibold bg-red-600 text-white hover:bg-red-700 disabled:opacity-50"
                            >
                                {banMutation.isPending ? "Banning..." : "Confirm Ban"}
                            </button>
                        </div>
                    </div>
                </div>
            )}
        </div>
    );
}
