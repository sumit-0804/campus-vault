import prisma from "@/lib/db";
import { notFound } from "next/navigation";
import Image from "next/image";
import Link from "next/link";
import { BackButton } from "@/components/ui/BackButton";
import { Badge } from "@/components/ui/badge";
import { Button } from "@/components/ui/button";
import { Card, CardContent } from "@/components/ui/card";
import { Avatar, AvatarFallback, AvatarImage } from "@/components/ui/avatar";
import { ArrowLeft, Share2, ShieldCheck, Skull, Sparkles } from "lucide-react";
import { ReportButton } from "@/components/ui/ReportButton";
import { ItemStatus } from "@/app/generated/prisma/enums";
import { getServerSession } from "next-auth";
import { authOptions } from "@/auth";
import { ImageGallery } from "@/components/ui/ImageGallery";
import { MarketplaceItemActions } from "@/components/marketplace/MarketplaceItemActions";
import { UserBadge } from "@/components/features/karma/UserBadge";

interface MarketplaceItemDetailViewProps {
    itemId: string;
    backRoute?: string;
    backLabel?: string;
}

export async function MarketplaceItemDetailView({
    itemId,
    backRoute = "/marketplace",
    backLabel = "Back to Marketplace"
}: MarketplaceItemDetailViewProps) {
    const session = await getServerSession(authOptions);

    const item = await prisma.cursedObject.findUnique({
        where: { id: itemId },
        include: {
            seller: true
        }
    });

    if (!item) {
        notFound();
    }

    let existingOffer = null;
    if (session?.user?.id) {
        existingOffer = await prisma.bloodPact.findFirst({
            where: {
                itemId: itemId,
                buyerId: session.user.id
            }
        });
    }


    // Check for any accepted/completed offers which make the item unavailable
    const acceptedOffer = await prisma.bloodPact.findFirst({
        where: {
            itemId: itemId,
            status: { in: ['AWAITING_COMPLETION', 'DELIVERED', 'COMPLETED'] }
        }
    });

    const isAvailable = item.status === ItemStatus.ACTIVE && !acceptedOffer;
    const isOwnItem = session?.user?.id === item.sellerId;

    return (
        <div className="p-6 md:p-10 max-w-7xl mx-auto min-h-screen">


            <div className="grid md:grid-cols-2 gap-10 lg:gap-16">
                {/* Left: Images */}
                <div className="space-y-4">
                    <Card className="bg-zinc-900/10 border-zinc-800/50 p-2 relative overflow-hidden group">
                        <div className="absolute inset-0 bg-gradient-to-tr from-purple-500/5 to-amber-500/5 opacity-0 group-hover:opacity-100 transition-opacity pointer-events-none" />
                        <ImageGallery images={item.images} title={item.title} />
                    </Card>
                </div>

                {/* Right: Details */}
                <div className="space-y-6">
                    <div className="bg-zinc-900/20 backdrop-blur-sm border border-white/5 rounded-2xl p-6 lg:p-8 space-y-6 relative overflow-hidden">
                        <div className="absolute top-0 right-0 w-32 h-32 bg-purple-500/10 rounded-full blur-3xl -ml-10 -mt-10 pointer-events-none" />

                        <div>
                            <div className="flex items-center gap-3 mb-4">
                                <Badge className="bg-purple-900/30 text-purple-300 border-purple-500/20">
                                    {item.category}
                                </Badge>
                                <span className="text-zinc-500 flex items-center uppercase tracking-wider text-xs font-bold px-2 py-1 bg-white/5 rounded-md">
                                    {item.condition}
                                </span>
                            </div>
                            <h1 className="text-3xl md:text-5xl font-black text-white mb-2 tracking-tight">
                                {item.title}
                            </h1>
                            <p className="text-3xl font-light text-amber-500/90 text-shadow-sm">
                                ${item.price.toFixed(2)}
                            </p>
                        </div>

                        <div className="prose prose-invert prose-zinc max-w-none border-t border-white/5 pt-6">
                            <h3 className="text-sm font-bold text-zinc-400 uppercase tracking-widest mb-3 flex items-center gap-2">
                                <Sparkles className="w-4 h-4 text-purple-500" />
                                The Lore
                            </h3>
                            <p className="text-zinc-300 leading-relaxed text-lg font-light mb-6">
                                {item.description}
                            </p>

                            {/* AI Generated Tags */}
                            {item.tags && item.tags.length > 0 && (
                                <div className="space-y-3 mt-8 pt-6 border-t border-white/5">
                                    <h4 className="text-[10px] font-black text-zinc-500 uppercase tracking-[0.2em] flex items-center gap-2">
                                        <Sparkles className="w-3 h-3 text-purple-400" />
                                        Spectral Infusion (AI Tags)
                                    </h4>
                                    <div className="flex flex-wrap gap-2">
                                        {item.tags.map((tag) => (
                                            <Badge
                                                key={tag}
                                                variant="secondary"
                                                className="bg-purple-500/10 text-purple-300 border-purple-500/20 hover:bg-purple-500/20 transition-all font-mono text-[11px] lowercase px-3 py-1"
                                            >
                                                #{tag}
                                            </Badge>
                                        ))}
                                    </div>
                                </div>
                            )}

                            {/* PII Detection Warning */}
                            {item.piiDetected && (
                                <div className="mt-6 p-4 bg-red-950/20 border border-red-500/20 rounded-xl flex items-start gap-4 animate-pulse">
                                    <div className="p-2 bg-red-500/20 rounded-lg">
                                        <Skull className="w-5 h-5 text-red-400" />
                                    </div>
                                    <div className="space-y-1">
                                        <h4 className="text-sm font-bold text-red-400 uppercase tracking-wider">Mortal Breach Detected</h4>
                                        <p className="text-xs text-red-500/80 leading-relaxed">
                                            Our spectral sensors have detected potential PII (Personally Identifiable Information) in this listing's imagery. Exercise caution.
                                        </p>
                                    </div>
                                </div>
                            )}
                        </div>
                    </div>

                    {/* Seller Card */}
                    <Card className="bg-black/40 border-zinc-800">
                        <CardContent className="p-4 flex items-center gap-4">
                            <Avatar className="w-12 h-12 border-2 border-zinc-800 ring-2 ring-purple-500/20">
                                <AvatarImage src={item.seller.avatarUrl || ""} />
                                <AvatarFallback className="bg-zinc-900 text-zinc-400 font-bold">
                                    {item.seller.fullName.slice(0, 2).toUpperCase()}
                                </AvatarFallback>
                            </Avatar>
                            <div>
                                <h4 className="font-bold text-white text-sm">{item.seller.fullName}</h4>
                                <div className="flex items-center gap-2 mt-1">
                                    <div className="flex items-center text-xs text-purple-400">
                                        <ShieldCheck className="w-3 h-3 mr-1" />
                                        Karma: {item.seller.karmaScore}
                                    </div>
                                    <UserBadge karma={item.seller.karmaScore} className="scale-90 origin-left" />
                                </div>
                            </div>
                            <div className="ml-auto flex items-center gap-2">
                                <Button variant="outline" size="sm" className="border-zinc-700 bg-zinc-900/50 text-zinc-300 hover:text-white hover:bg-zinc-800 hover:border-zinc-600 transition-all">
                                    View Profile
                                </Button>
                                {!isOwnItem && session?.user?.id && (
                                    <ReportButton
                                        targetType="USER"
                                        targetId={item.sellerId}
                                        targetLabel="this seller"
                                        variant="ghost"
                                        size="icon"
                                        iconOnly
                                        className="text-zinc-500 hover:text-red-400 hover:bg-red-950/20"
                                    />
                                )}
                            </div>
                        </CardContent>
                    </Card>

                    {/* Actions */}
                    <div className="pt-2">
                        <MarketplaceItemActions
                            itemId={item.id}
                            sellerId={item.sellerId}
                            isAvailable={isAvailable}
                            isOwnItem={isOwnItem}
                            hasExistingOffer={!!existingOffer}
                        />
                    </div>
                </div>
            </div>
        </div >
    );
}
