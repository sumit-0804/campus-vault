"use client";

import { useEffect, useState } from "react";
import { getUserReports } from "@/actions/reports";
import { useReportsStore } from "@/stores/useReportsStore";
import { format, formatDistanceToNow } from "date-fns";
import { Badge } from "@/components/ui/badge";
import { Card, CardContent, CardHeader, CardTitle, CardDescription } from "@/components/ui/card";
import { Tabs, TabsList, TabsTrigger } from "@/components/ui/tabs";
import { Loader2, AlertCircle, CheckCircle2, XCircle, Clock, ShieldAlert, User, Package, FileWarning, Skull, Ghost } from "lucide-react";
import { toast } from "sonner";

export default function UserReportsPage() {
    const { reports, setReports, filter, setFilter, filteredReports } = useReportsStore();
    const [isLoading, setIsLoading] = useState(true);

    useEffect(() => {
        const fetchReports = async () => {
            try {
                const data = await getUserReports();
                setReports(data as any);
            } catch (error) {
                toast.error("Failed to fetch reports");
            } finally {
                setIsLoading(false);
            }
        };

        fetchReports();
    }, [setReports]);

    const getStatusConfig = (status: string) => {
        switch (status) {
            case "PENDING":
                return {
                    icon: <Clock className="w-4 h-4" />,
                    label: "Awaiting Judgment",
                    variant: "secondary" as const,
                    borderColor: "border-l-amber-500/80",
                    textColor: "text-amber-400",
                };
            case "ACTIONED":
                return {
                    icon: <CheckCircle2 className="w-4 h-4" />,
                    label: "Justice Served",
                    variant: "default" as const,
                    borderColor: "border-l-emerald-500/80",
                    textColor: "text-emerald-400",
                };
            case "REJECTED":
                return {
                    icon: <XCircle className="w-4 h-4" />,
                    label: "Dismissed",
                    variant: "destructive" as const,
                    borderColor: "border-l-red-500/80",
                    textColor: "text-red-400",
                };
            default:
                return {
                    icon: <AlertCircle className="w-4 h-4" />,
                    label: status,
                    variant: "outline" as const,
                    borderColor: "border-l-zinc-500",
                    textColor: "text-zinc-400",
                };
        }
    };

    const getTargetLabel = (targetType: string) => {
        switch (targetType) {
            case "USER":
                return { label: "User Report", icon: <User className="w-3.5 h-3.5" /> };
            case "ITEM":
                return { label: "Artifact Report", icon: <Package className="w-3.5 h-3.5" /> };
            default:
                return { label: targetType, icon: <FileWarning className="w-3.5 h-3.5" /> };
        }
    };

    const getCategoryLabel = (category: string | null) => {
        if (!category) return "General";
        const map: Record<string, string> = {
            SPAM: "Spam",
            HARASSMENT: "Harassment",
            SCAM: "Dark Sorcery",
            INAPPROPRIATE: "Inappropriate",
            OTHER: "Other",
        };
        return map[category] || category;
    };

    if (isLoading) {
        return (
            <div className="flex flex-col items-center justify-center min-h-[50vh] gap-3">
                <Loader2 className="w-8 h-8 animate-spin text-red-500/60" />
                <p className="text-sm text-zinc-600 italic">Summoning your reports...</p>
            </div>
        );
    }

    const displayedReports = filteredReports();

    const counts = {
        ALL: reports.length,
        PENDING: reports.filter(r => r.status === "PENDING").length,
        ACTIONED: reports.filter(r => r.status === "ACTIONED").length,
        REJECTED: reports.filter(r => r.status === "REJECTED").length,
    };

    const tabs = [
        { value: "ALL", label: "All", count: counts.ALL },
        { value: "PENDING", label: "Pending", count: counts.PENDING },
        { value: "ACTIONED", label: "Resolved", count: counts.ACTIONED },
        { value: "REJECTED", label: "Dismissed", count: counts.REJECTED },
    ];

    return (
        <div className="space-y-6 max-w-4xl animate-in fade-in slide-in-from-bottom-4 duration-500">
            {/* Header */}
            <div className="flex flex-col gap-3">
                <div className="flex items-center gap-3">
                    <div className="p-2 rounded-xl bg-red-500/5 border border-red-500/10">
                        <ShieldAlert className="w-5 h-5 text-red-400/70" />
                    </div>
                    <div>
                        <h1 className="text-2xl sm:text-3xl font-bold tracking-tight text-white">My Reports</h1>
                        <p className="text-zinc-600 text-sm italic">Grievances lodged against the unworthy</p>
                    </div>
                </div>

                {reports.length > 0 && (
                    <div className="flex items-center gap-2 flex-wrap mt-1">
                        <span className="text-xs text-zinc-600">{counts.ALL} total</span>
                        {counts.PENDING > 0 && (
                            <>
                                <span className="text-zinc-800">·</span>
                                <span className="text-xs text-amber-500/70">{counts.PENDING} awaiting</span>
                            </>
                        )}
                        {counts.ACTIONED > 0 && (
                            <>
                                <span className="text-zinc-800">·</span>
                                <span className="text-xs text-emerald-500/70">{counts.ACTIONED} resolved</span>
                            </>
                        )}
                        {counts.REJECTED > 0 && (
                            <>
                                <span className="text-zinc-800">·</span>
                                <span className="text-xs text-red-500/70">{counts.REJECTED} dismissed</span>
                            </>
                        )}
                    </div>
                )}
            </div>

            {/* Tabs */}
            <Tabs defaultValue="ALL" className="w-full" onValueChange={(v) => setFilter(v as any)}>
                <TabsList className="grid w-full grid-cols-4 lg:w-[480px]">
                    {tabs.map((tab) => (
                        <TabsTrigger key={tab.value} value={tab.value} className="text-xs sm:text-sm">
                            {tab.label}
                            {tab.count > 0 && (
                                <span className="ml-1.5 px-1.5 py-0.5 rounded-full bg-white/10 text-[10px] font-medium tabular-nums">
                                    {tab.count}
                                </span>
                            )}
                        </TabsTrigger>
                    ))}
                </TabsList>
            </Tabs>

            {/* Report Cards */}
            <div className="grid gap-4">
                {displayedReports.length === 0 ? (
                    <Card className="bg-zinc-950/50 border-zinc-800/50">
                        <CardContent className="flex flex-col items-center justify-center py-16 text-zinc-500">
                            <div className="p-4 rounded-full bg-zinc-900/50 border border-red-500/5 mb-4">
                                <Ghost className="w-10 h-10 opacity-20 text-red-400/50" />
                            </div>
                            <p className="font-medium text-zinc-500">No reports found</p>
                            <p className="text-sm text-zinc-700 mt-1 italic">
                                {filter === "ALL"
                                    ? "The spirits rest undisturbed..."
                                    : `No ${filter.toLowerCase()} reports haunt this realm.`}
                            </p>
                        </CardContent>
                    </Card>
                ) : (
                    displayedReports.map((report, index) => {
                        const statusConfig = getStatusConfig(report.status);
                        const targetInfo = getTargetLabel(report.targetType);
                        return (
                            <Card
                                key={report.id}
                                className={`bg-zinc-950/50 border-zinc-800/50 border-l-[3px] ${statusConfig.borderColor} transition-all duration-300 hover:bg-zinc-900/50 hover:border-zinc-700/50 animate-in fade-in slide-in-from-bottom-2`}
                                style={{ animationDelay: `${index * 60}ms`, animationFillMode: 'both' }}
                            >
                                <CardHeader className="pb-3">
                                    <div className="flex items-center justify-between flex-wrap gap-2">
                                        <div className="flex items-center gap-2">
                                            <Badge variant="outline" className="uppercase text-[10px] tracking-wider flex items-center gap-1 border-zinc-700/50">
                                                {targetInfo.icon}
                                                {targetInfo.label}
                                            </Badge>
                                            <Badge variant="outline" className="text-[10px] tracking-wider capitalize border-zinc-700/50">
                                                {getCategoryLabel(report.category)}
                                            </Badge>
                                        </div>
                                        <Badge
                                            variant={statusConfig.variant}
                                            className={`flex items-center gap-1.5 ${statusConfig.textColor}`}
                                        >
                                            {statusConfig.icon}
                                            {statusConfig.label}
                                        </Badge>
                                    </div>

                                    <div className="mt-3 space-y-1.5">
                                        <CardTitle className="text-base text-white">
                                            {targetInfo.label}
                                        </CardTitle>
                                        <CardDescription className="text-zinc-500 leading-relaxed">
                                            {report.reason}
                                        </CardDescription>
                                    </div>

                                    <div className="flex items-center gap-1.5 mt-2">
                                        <Clock className="w-3 h-3 text-zinc-700" />
                                        <span className="text-xs text-zinc-700">
                                            {formatDistanceToNow(new Date(report.createdAt), { addSuffix: true })}
                                            {" · "}
                                            {format(new Date(report.createdAt), "MMM d, yyyy")}
                                        </span>
                                    </div>
                                </CardHeader>

                                {report.adminNote && (
                                    <CardContent className="pt-0 pb-4">
                                        <div className="p-4 bg-emerald-950/20 rounded-xl border border-emerald-500/10">
                                            <div className="flex items-start gap-2.5">
                                                <div className="mt-0.5 p-1 rounded-md bg-emerald-500/10">
                                                    <Skull className="w-3.5 h-3.5 text-emerald-500" />
                                                </div>
                                                <div>
                                                    <p className="text-xs font-semibold text-emerald-400 mb-1">Council&apos;s Verdict</p>
                                                    <p className="text-sm text-zinc-400 leading-relaxed">{report.adminNote}</p>
                                                </div>
                                            </div>
                                        </div>
                                    </CardContent>
                                )}
                            </Card>
                        );
                    })
                )}
            </div>
        </div>
    );
}
