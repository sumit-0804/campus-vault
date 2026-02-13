"use client";

import { useState } from "react";
import { getReports, actionReport } from "@/actions/admin";
import { useQuery, useMutation, useQueryClient } from "@tanstack/react-query";
import { Flag, CheckCircle, XCircle, Loader2, Clock } from "lucide-react";

const statusFilters = [
    { label: "All", value: "" },
    { label: "Pending", value: "PENDING" },
    { label: "Actioned", value: "ACTIONED" },
    { label: "Rejected", value: "REJECTED" },
];

export default function AdminReportsPage() {
    const [statusFilter, setStatusFilter] = useState("");
    const [adminNote, setAdminNote] = useState<Record<string, string>>({});
    const queryClient = useQueryClient();

    const { data: reports, isLoading } = useQuery({
        queryKey: ["admin", "reports", statusFilter],
        queryFn: () => getReports(statusFilter || undefined),
    });

    const actionMutation = useMutation({
        mutationFn: ({ reportId, status, note }: { reportId: string; status: "ACTIONED" | "REJECTED"; note?: string }) =>
            actionReport(reportId, status, note),
        onSuccess: () => {
            queryClient.invalidateQueries({ queryKey: ["admin", "reports"] });
        },
    });

    return (
        <div>
            <h2 className="text-2xl font-bold mb-6">Report Queue</h2>

            {/* Status Filters */}
            <div className="flex gap-2 mb-6">
                {statusFilters.map((filter) => (
                    <button
                        key={filter.value}
                        onClick={() => setStatusFilter(filter.value)}
                        className={`px-4 py-2 rounded-lg text-xs font-semibold uppercase tracking-wider transition-all ${statusFilter === filter.value
                            ? "bg-red-500 text-white"
                            : "bg-zinc-900 text-zinc-400 border border-white/10 hover:bg-white/5"
                            }`}
                    >
                        {filter.label}
                    </button>
                ))}
            </div>

            {isLoading ? (
                <div className="flex justify-center py-12">
                    <Loader2 className="w-6 h-6 animate-spin text-zinc-500" />
                </div>
            ) : reports?.length === 0 ? (
                <div className="text-center py-12 text-zinc-500">
                    <Flag className="w-8 h-8 mx-auto mb-3 opacity-50" />
                    <p>No reports found</p>
                </div>
            ) : (
                <div className="space-y-4">
                    {reports?.map((report) => (
                        <div
                            key={report.id}
                            className="border border-white/10 rounded-xl p-5 bg-zinc-900/30 hover:bg-zinc-900/50 transition-all"
                        >
                            <div className="flex items-start justify-between gap-4">
                                <div className="flex-1">
                                    <div className="flex items-center gap-3 mb-2">
                                        <span className={`text-xs px-2 py-1 rounded-full font-semibold ${report.status === "PENDING"
                                            ? "bg-amber-500/10 text-amber-400 border border-amber-500/20"
                                            : report.status === "ACTIONED"
                                                ? "bg-emerald-500/10 text-emerald-400 border border-emerald-500/20"
                                                : "bg-zinc-800 text-zinc-400 border border-white/10"
                                            }`}>
                                            {report.status}
                                        </span>
                                        <span className="text-xs text-zinc-500">
                                            {report.targetType} • {new Date(report.createdAt).toLocaleDateString()}
                                        </span>
                                    </div>
                                    <p className="text-sm text-white mb-1">{report.reason}</p>
                                    <p className="text-xs text-zinc-500">
                                        Reported by: {report.reporter.fullName} ({report.reporter.email})
                                    </p>
                                    <p className="text-xs text-zinc-600 mt-1">
                                        Target ID: <code className="bg-zinc-800 px-1 rounded">{report.targetId}</code>
                                    </p>
                                    {report.adminNote && (
                                        <p className="text-xs text-zinc-400 mt-2 italic border-l-2 border-zinc-700 pl-2">
                                            Admin note: {report.adminNote}
                                        </p>
                                    )}
                                </div>

                                {report.status === "PENDING" && (
                                    <div className="flex flex-col gap-2 min-w-[140px]">
                                        <input
                                            type="text"
                                            placeholder="Admin note..."
                                            value={adminNote[report.id] || ""}
                                            onChange={(e) =>
                                                setAdminNote((prev) => ({
                                                    ...prev,
                                                    [report.id]: e.target.value,
                                                }))
                                            }
                                            className="px-3 py-1.5 bg-zinc-800 border border-white/10 rounded-lg text-xs text-white placeholder:text-zinc-500 focus:outline-none focus:ring-1 focus:ring-red-500/30"
                                        />
                                        <button
                                            onClick={() =>
                                                actionMutation.mutate({
                                                    reportId: report.id,
                                                    status: "ACTIONED",
                                                    note: adminNote[report.id],
                                                })
                                            }
                                            disabled={actionMutation.isPending}
                                            className="flex items-center justify-center gap-1 px-3 py-1.5 rounded-lg text-xs font-semibold bg-emerald-500/10 text-emerald-400 border border-emerald-500/20 hover:bg-emerald-500/20 transition-all disabled:opacity-50"
                                        >
                                            <CheckCircle className="w-3 h-3" /> Action
                                        </button>
                                        <button
                                            onClick={() =>
                                                actionMutation.mutate({
                                                    reportId: report.id,
                                                    status: "REJECTED",
                                                    note: adminNote[report.id],
                                                })
                                            }
                                            disabled={actionMutation.isPending}
                                            className="flex items-center justify-center gap-1 px-3 py-1.5 rounded-lg text-xs font-semibold bg-red-500/10 text-red-400 border border-red-500/20 hover:bg-red-500/20 transition-all disabled:opacity-50"
                                        >
                                            <XCircle className="w-3 h-3" /> Reject
                                        </button>
                                    </div>
                                )}
                            </div>
                        </div>
                    ))}
                </div>
            )}
        </div>
    );
}
