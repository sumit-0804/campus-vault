"use client";

import { useState } from "react";
import { useRouter } from "next/navigation";
import { Avatar, AvatarFallback, AvatarImage } from "@/components/ui/avatar";
import { Badge } from "@/components/ui/badge";
import { Button } from "@/components/ui/button";
import {
    DropdownMenu,
    DropdownMenuContent,
    DropdownMenuItem,
    DropdownMenuLabel,
    DropdownMenuSeparator,
    DropdownMenuTrigger,
} from "@/components/ui/dropdown-menu";
import { formatDistanceToNow } from "date-fns";
import { Clock, Inbox } from "lucide-react";
import { ChatRoom, Wizard, BloodPact, Message } from "@/app/generated/prisma/client";

type OwnerOfferListProps = {
    itemId: string;
    currentUserId: string;
    chatRooms: (ChatRoom & {
        participants: Wizard[];
        messages: Message[];
    })[];
    offers: (BloodPact & {
        buyer: Wizard;
    })[];
}

export function OwnerOfferList({ itemId, currentUserId, chatRooms, offers }: OwnerOfferListProps) {
    const router = useRouter();

    // Group properties by Buyer
    const interactions = new Map<string, {
        buyer: Wizard;
        chat?: typeof chatRooms[0];
        latestOffer?: typeof offers[0];
        lastActivity: Date;
    }>();

    // 1. Process Chats
    chatRooms.forEach(chat => {
        const buyer = chat.participants.find(p => p.id !== currentUserId);
        if (buyer) {
            interactions.set(buyer.id, {
                buyer,
                chat,
                lastActivity: new Date(chat.lastMessageAt),
            });
        }
    });

    // 2. Process Offers (Updates or Adds)
    offers.forEach(offer => {
        const existing = interactions.get(offer.buyerId);
        if (existing) {
            existing.latestOffer = offer;
            if (new Date(offer.createdAt) > existing.lastActivity) {
                existing.lastActivity = new Date(offer.createdAt);
            }
        } else {
            interactions.set(offer.buyerId, {
                buyer: offer.buyer,
                latestOffer: offer,
                lastActivity: new Date(offer.createdAt),
            });
        }
    });

    const sortedInteractions = Array.from(interactions.values()).sort((a, b) => {
        return b.lastActivity.getTime() - a.lastActivity.getTime();
    });

    return (
        <DropdownMenu>
            <DropdownMenuTrigger asChild>
                <Button
                    size="lg"
                    className="flex-1 bg-zinc-800 text-zinc-100 hover:bg-zinc-700 font-bold text-lg h-14 border border-zinc-700 w-full"
                >
                    <Inbox className="w-5 h-5 mr-2" />
                    Offers & Inquiries
                    {sortedInteractions.length > 0 && (
                        <Badge variant="secondary" className="ml-2 bg-red-600 text-white hover:bg-red-700 border-0">
                            {sortedInteractions.length}
                        </Badge>
                    )}
                </Button>
            </DropdownMenuTrigger>
            <DropdownMenuContent className="w-96 bg-zinc-900 border-zinc-800 text-zinc-100" align="end">
                <DropdownMenuLabel className="flex justify-between items-center text-zinc-400">
                    <span>Queries</span>
                    <span className="text-xs font-normal">{sortedInteractions.length} active</span>
                </DropdownMenuLabel>
                <DropdownMenuSeparator className="bg-zinc-800" />

                {sortedInteractions.length === 0 ? (
                    <div className="p-8 text-center text-zinc-500">
                        <Inbox className="w-10 h-10 mx-auto mb-2 opacity-20" />
                        <p className="text-sm">No offers yet</p>
                    </div>
                ) : (
                    <div className="max-h-96 overflow-y-auto custom-scrollbar">
                        {sortedInteractions.map((interaction) => (
                            <DropdownMenuItem
                                key={interaction.buyer.id}
                                onClick={() => interaction.chat && router.push(`/dashboard/messages/${interaction.chat.id}`)}
                                className={`p-3 focus:bg-zinc-800 cursor-pointer flex items-start gap-3 border-b border-zinc-800/50 last:border-0 ${!interaction.chat ? 'opacity-50 pointer-events-none' : ''}`}
                            >
                                <Avatar className="w-10 h-10 border border-zinc-700 shrink-0">
                                    <AvatarImage src={interaction.buyer.avatarUrl || ""} />
                                    <AvatarFallback className="bg-zinc-800 text-zinc-400 text-xs">
                                        {interaction.buyer.fullName.slice(0, 2).toUpperCase()}
                                    </AvatarFallback>
                                </Avatar>

                                <div className="flex-1 min-w-0">
                                    <div className="flex justify-between items-baseline mb-1">
                                        <h4 className="font-bold text-sm text-zinc-200 truncate">
                                            {interaction.buyer.fullName}
                                        </h4>
                                        <span className="text-[10px] text-zinc-500 whitespace-nowrap ml-2">
                                            {formatDistanceToNow(interaction.lastActivity, { addSuffix: true })}
                                        </span>
                                    </div>

                                    {interaction.latestOffer ? (
                                        <div className="flex items-center gap-2 mb-1">
                                            <Badge variant="outline" className={`
                                                border-0 text-[10px] px-1.5 py-0 h-5
                                                ${interaction.latestOffer.status === 'PENDING' ? 'bg-yellow-500/20 text-yellow-500' :
                                                    interaction.latestOffer.status === 'ACCEPTED' ? 'bg-green-500/20 text-green-500' :
                                                        interaction.latestOffer.status === 'CANCELLED' ? 'bg-zinc-500/20 text-zinc-400' :
                                                            'bg-zinc-500/20 text-zinc-400'}
                                            `}>
                                                Offer: ${interaction.latestOffer.offerAmount}
                                            </Badge>
                                            {interaction.latestOffer.status === 'PENDING' && interaction.latestOffer.expiresAt && (
                                                <span className="text-[10px] text-orange-400 flex items-center gap-0.5">
                                                    <Clock className="w-3 h-3" />
                                                    Exp
                                                </span>
                                            )}
                                        </div>
                                    ) : (
                                        <div className="text-xs text-zinc-500 italic mb-1">Inquiry only</div>
                                    )}

                                    {interaction.chat?.messages?.[0] && (
                                        <p className="text-xs text-zinc-400 truncate">
                                            {interaction.chat.messages[0].content.startsWith('OFFER_ID') ? 'Sent an offer' : interaction.chat.messages[0].content}
                                        </p>
                                    )}
                                </div>
                            </DropdownMenuItem>
                        ))}
                    </div>
                )}
            </DropdownMenuContent>
        </DropdownMenu>
    );
}
