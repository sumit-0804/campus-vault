import { getRelicById } from "@/actions/lost-found";
import { notFound, redirect } from "next/navigation";
import { getServerSession } from "next-auth";
import { authOptions } from "@/auth";
import Image from "next/image";
import Link from "next/link";
import { Badge } from "@/components/ui/badge";
import { Card, CardContent } from "@/components/ui/card";
import { Avatar, AvatarFallback, AvatarImage } from "@/components/ui/avatar";
import { ArrowLeft, Share2, ShieldCheck, HelpCircle, MapPin, Calendar } from "lucide-react";
import { RelicDetailActions } from "@/components/lost-found/RelicDetailActions";
import { HandoffTimeline } from "@/components/lost-found/HandoffTimeline";
import { formatDistanceToNow } from "date-fns";
import { RelicRealtimeListener } from "@/components/lost-found/RelicRealtimeListener";

export const dynamic = 'force-dynamic';

export default async function RelicDetailPage(props: { params: Promise<{ id: string }> }) {
    const params = await props.params;
    const session = await getServerSession(authOptions);

    if (!session || !session.user) {
        redirect("/sign-in");
    }

    const result = await getRelicById(params.id);

    if (!result.success || !result.data) {
        notFound();
    }

    const relic = result.data;
    const isReporter = session.user.id === relic.reporterId;
    const isClaimer = session.user.id === relic.claimerId;
    const isFound = relic.type === "FOUND";

    return (
        <div className="min-h-screen bg-gradient-to-b from-zinc-950 via-zinc-900 to-zinc-950">
            <div className="p-4 md:p-8 lg:p-10 max-w-7xl mx-auto">
                <RelicRealtimeListener relicId={relic.id} />
                {/* Header Nav */}
                <div className="mb-6 md:mb-10">
                    <Link
                        href="/dashboard/lost-found"
                        className="inline-flex items-center gap-2 text-zinc-400 hover:text-amber-500 transition-all duration-300 group"
                    >
                        <ArrowLeft className="w-4 h-4 group-hover:-translate-x-1 transition-transform" />
                        <span className="font-medium">Back to Browse</span>
                    </Link>
                </div>

                {/* Main Grid: Image + Details */}
                <Card className="bg-zinc-900/30 border-zinc-800/50 overflow-hidden">
                    <div className="flex flex-col lg:flex-row">
                        {/* Left: Image */}
                        <div className="relative w-full lg:w-1/3 min-h-[300px] lg:min-h-full bg-gradient-to-br from-zinc-900 to-zinc-950">
                            {relic.images.length > 0 && relic.images[0].startsWith('http') ? (
                                <Image
                                    src={relic.images[0]}
                                    alt={relic.title}
                                    fill
                                    className="object-cover"
                                    priority
                                />
                            ) : (
                                <div className="absolute inset-0 flex items-center justify-center text-zinc-600 flex-col gap-3">
                                    <HelpCircle className="w-16 h-16 opacity-30" />
                                    <span className="text-sm font-medium">No Image Available</span>
                                </div>
                            )}
                        </div>

                        {/* Right: All Details */}
                        <div className="flex-1 p-6 lg:p-8 space-y-6">
                            {/* Title and Badges */}
                            <div>
                                <div className="flex items-center gap-2 mb-3">
                                    <Badge
                                        className={`${isFound
                                            ? "bg-emerald-600/20 text-emerald-400 border-emerald-500/30"
                                            : "bg-red-600/20 text-red-400 border-red-500/30"
                                            } border px-2.5 py-0.5 text-xs font-bold uppercase`}
                                    >
                                        {relic.type}
                                    </Badge>
                                    <Badge className="bg-purple-900/30 text-purple-300 border-purple-500/30 border px-2.5 py-0.5 text-xs font-bold uppercase">
                                        {relic.status}
                                    </Badge>
                                </div>

                                <h1 className="text-3xl md:text-4xl font-black text-white mb-3">
                                    {relic.title}
                                </h1>
                            </div>

                            {/* Description */}
                            <div className="space-y-2">
                                <h3 className="text-sm font-bold text-zinc-400 uppercase tracking-wider">Description</h3>
                                <p className="text-zinc-300 leading-relaxed">
                                    {relic.description}
                                </p>
                            </div>

                            {/* Tags/Location */}
                            {relic.location && (
                                <div className="space-y-2">
                                    <h3 className="text-sm font-bold text-zinc-400 uppercase tracking-wider flex items-center gap-2">
                                        <MapPin className="w-4 h-4" />
                                        Last Seen
                                    </h3>
                                    <p className="text-zinc-300">{relic.location}</p>
                                </div>
                            )}

                            {/* Security Riddle */}
                            {isFound && relic.secretRiddle && (
                                <div className="p-4 bg-amber-950/20 rounded-lg border border-amber-900/30">
                                    <h3 className="text-sm font-bold text-amber-400 uppercase tracking-wider mb-2 flex items-center gap-2">
                                        <ShieldCheck className="w-4 h-4" />
                                        Security Verification
                                    </h3>
                                    <p className="text-amber-200/80 italic text-sm">
                                        "{relic.secretRiddle}"
                                    </p>
                                </div>
                            )}

                            {/* Reporter Info */}
                            <div className="space-y-3">
                                <h3 className="text-sm font-bold text-zinc-400 uppercase tracking-wider">Reported By</h3>
                                <div className="flex items-center gap-3">
                                    <Avatar className="w-12 h-12 border-2 border-zinc-700">
                                        <AvatarImage src={relic.reporter.avatarUrl || ""} />
                                        <AvatarFallback className="bg-gradient-to-br from-amber-600 to-orange-600 text-white font-bold text-sm">
                                            {relic.reporter.fullName.slice(0, 2).toUpperCase()}
                                        </AvatarFallback>
                                    </Avatar>
                                    <div>
                                        <h4 className="font-bold text-white">{relic.reporter.fullName}</h4>
                                        <p className="text-xs text-zinc-400">{relic.reporter.email}</p>
                                    </div>
                                </div>
                            </div>

                            {/* Date Posted */}
                            <div className="space-y-2">
                                <h3 className="text-sm font-bold text-zinc-400 uppercase tracking-wider flex items-center gap-2">
                                    <Calendar className="w-4 h-4" />
                                    Date Posted
                                </h3>
                                <p className="text-zinc-300">{formatDistanceToNow(new Date(relic.createdAt), { addSuffix: true })}</p>
                            </div>

                            {/* Timeline */}
                            {relic.status !== "OPEN" && (
                                <div className="pt-4 border-t border-zinc-800">
                                    <HandoffTimeline relic={relic} />
                                </div>
                            )}

                            {/* Actions */}
                            <div className="pt-4">
                                <RelicDetailActions
                                    relic={relic}
                                    isReporter={isReporter}
                                    isClaimer={isClaimer}
                                />
                            </div>
                        </div>
                    </div>
                </Card>
            </div>
        </div>
    );
}
