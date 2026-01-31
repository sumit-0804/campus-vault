import prisma from "@/lib/db";
import { notFound } from "next/navigation";
import Image from "next/image";
import Link from "next/link";
import { BackButton } from "@/components/ui/BackButton";
import { Badge } from "@/components/ui/badge";
import { Button } from "@/components/ui/button";
import { Card, CardContent } from "@/components/ui/card";
import { Avatar, AvatarFallback, AvatarImage } from "@/components/ui/avatar";
import { ArrowLeft, Share2, ShieldCheck, Skull } from "lucide-react";
import { ItemStatus } from "@/app/generated/prisma/enums";
import { getServerSession } from "next-auth";
import { authOptions } from "@/auth";
import { ImageGallery } from "@/components/ui/ImageGallery";
import { MarketplaceItemActions } from "@/components/marketplace/MarketplaceItemActions";

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
            {/* Nav */}
            <div className="flex justify-between items-center mb-8">
                <BackButton
                    fallbackRoute={backRoute}
                >
                    <ArrowLeft className="w-4 h-4 mr-2" />
                    {backLabel}
                </BackButton>

                <Button variant="ghost" size="icon" className="text-zinc-400 hover:text-white">
                    <Share2 className="w-5 h-5" />
                </Button>
            </div>

            <div className="grid md:grid-cols-2 gap-10 lg:gap-16">
                {/* Left: Images */}
                <div className="space-y-4">
                    <ImageGallery images={item.images} title={item.title} />
                </div>

                {/* Right: Details */}
                <div className="space-y-8">
                    <div>
                        <div className="flex items-center gap-3 mb-4">
                            <Badge className="bg-purple-900/50 text-purple-300 hover:bg-purple-900/70 border-purple-500/30">
                                {item.category}
                            </Badge>
                            <span className="text-zinc-500 flex items-center uppercase tracking-wider text-xs font-bold">
                                {item.condition}
                            </span>
                        </div>
                        <h1 className="text-4xl md:text-5xl font-black text-white mb-2 tracking-tight">
                            {item.title}
                        </h1>
                        <p className="text-3xl font-light text-zinc-300">
                            ${item.price.toFixed(2)}
                        </p>
                    </div>

                    <div className="prose prose-invert prose-zinc max-w-none">
                        <h3 className="text-lg font-bold text-zinc-200 mb-2">The Lore</h3>
                        <p className="text-zinc-400 leading-relaxed">
                            {item.description}
                        </p>
                    </div>

                    {/* Seller Card */}
                    <Card className="bg-zinc-900/30 border-zinc-800">
                        <CardContent className="p-4 flex items-center gap-4">
                            <Avatar className="w-12 h-12 border border-zinc-700">
                                <AvatarImage src={item.seller.avatarUrl || ""} />
                                <AvatarFallback className="bg-zinc-800 text-zinc-400">
                                    {item.seller.fullName.slice(0, 2).toUpperCase()}
                                </AvatarFallback>
                            </Avatar>
                            <div>
                                <h4 className="font-bold text-white text-sm">{item.seller.fullName}</h4>
                                <div className="flex items-center text-xs text-purple-400 mt-1">
                                    <ShieldCheck className="w-3 h-3 mr-1" />
                                    Karma: {item.seller.karmaScore}
                                </div>
                            </div>
                            <Button variant="outline" size="sm" className="ml-auto border-zinc-700 text-zinc-300 hover:text-white">
                                View Profile
                            </Button>
                        </CardContent>
                    </Card>

                    {/* Actions */}
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
    );
}
