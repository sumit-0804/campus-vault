"use client";

import { useQuery, useMutation, useQueryClient } from "@tanstack/react-query";
import { getReports, actionReport, toggleBanUser } from "@/actions/admin";
import { Loader2, CheckCircle, XCircle, ShieldAlert } from "lucide-react";
import { toast } from "sonner";
import { formatDistanceToNow } from "date-fns";

export default function AdminBansPage() {
    const queryClient = useQueryClient();

    const { data: reports, isLoading } = useQuery({
        queryKey: ["admin", "reports", "UNBAN_REQUEST"],
        queryFn: () => getReports("PENDING"),
    });

    // Filter purely client-side for simplicity as getReports fetches all pending
    // Optimally, getReports should accept a type filter.
    const appealReports = reports?.filter(r => r.targetType === "UNBAN_REQUEST") || [];

    const actionMutation = useMutation({
        mutationFn: async ({ reportId, action, userId }: { reportId: string, action: "ACTIONED" | "REJECTED", userId: string }) => {
            if (action === "ACTIONED") {
                // If actioned (approved), we must Unban the user
                await toggleBanUser(userId);
            }
            await actionReport(reportId, action, action === "ACTIONED" ? "Appeal Approved" : "Appeal Rejected");
        },
        onSuccess: () => {
            queryClient.invalidateQueries({ queryKey: ["admin", "reports"] });
            queryClient.invalidateQueries({ queryKey: ["admin", "users"] }); // Invalidate users to show updated status
            toast.success("Appeal processed successfully");
        },
        onError: (error) => {
            toast.error(`Failed to process appeal: ${error.message}`);
        }
    });

    if (isLoading) {
        return <div className="flex justify-center p-12"><Loader2 className="w-8 h-8 animate-spin text-red-500" /></div>;
    }

    return (
        <div>
            <h2 className="text-2xl font-bold mb-6 flex items-center gap-2">
                <ShieldAlert className="w-6 h-6 text-red-500" />
                Ban Appeals
            </h2>

            {appealReports.length === 0 ? (
                <div className="bg-zinc-900/50 border border-white/10 rounded-xl p-8 text-center">
                    <p className="text-zinc-500">No pending appeals from the nether realm.</p>
                </div>
            ) : (
                <div className="grid gap-4">
                    {appealReports.map((report) => (
                        <div key={report.id} className="bg-zinc-900 border border-red-900/30 rounded-xl p-6 flex flex-col md:flex-row justify-between gap-4">
                            <div className="space-y-2">
                                <div className="flex items-center gap-3">
                                    {report.reporter.avatarUrl && (
                                        <img src={report.reporter.avatarUrl} alt={report.reporter.fullName} className="w-10 h-10 rounded-full" />
                                    )}
                                    <div>
                                        <p className="font-bold text-white">{report.reporter.fullName}</p>
                                        <p className="text-xs text-zinc-500">{report.reporter.email}</p>
                                    </div>
                                    <span className="text-xs bg-zinc-800 text-zinc-400 px-2 py-1 rounded-full">
                                        {formatDistanceToNow(new Date(report.createdAt), { addSuffix: true })}
                                    </span>
                                </div>
                                <div className="mt-4 bg-black/50 p-4 rounded-lg border border-white/5">
                                    <p className="text-zinc-300 italic">" {report.reason} "</p>
                                </div>
                            </div>

                            <div className="flex items-center gap-2 md:flex-col md:justify-center">
                                <button
                                    onClick={() => actionMutation.mutate({ reportId: report.id, action: "ACTIONED", userId: report.reporterId })}
                                    disabled={actionMutation.isPending}
                                    className="px-4 py-2 bg-emerald-500/10 hover:bg-emerald-500/20 text-emerald-500 border border-emerald-500/20 rounded-lg flex items-center gap-2 transition-all"
                                >
                                    <CheckCircle className="w-4 h-4" />
                                    Unban (Approve)
                                </button>
                                <button
                                    onClick={() => actionMutation.mutate({ reportId: report.id, action: "REJECTED", userId: report.reporterId })}
                                    disabled={actionMutation.isPending}
                                    className="px-4 py-2 bg-red-500/10 hover:bg-red-500/20 text-red-500 border border-red-500/20 rounded-lg flex items-center gap-2 transition-all"
                                >
                                    <XCircle className="w-4 h-4" />
                                    Reject Appeal
                                </button>
                            </div>
                        </div>
                    ))}
                </div>
            )}
        </div>
    );
}
