"use client";

import { useState } from "react";
import Image from "next/image";
import Link from "next/link";
import { formatDistanceToNow } from "date-fns";
import { Card, CardContent, CardFooter, CardHeader } from "@/components/ui/card";
import { Badge } from "@/components/ui/badge";
import { Button } from "@/components/ui/button";
import { MapPin, Calendar, HelpCircle, Eye } from "lucide-react";
import { ClaimRelicModal } from "./ClaimRelicModal";

// Define a type for the relic prop based on the Prisma return type
// Ideally this should be imported from a types file, but defining here for speed/self-containment
interface RelicProps {
    relic: {
        id: string;
        title: string;
        description: string;
        images: string[];
        location: string | null;
        type: "LOST" | "FOUND";
        status: string;
        createdAt: Date;
        secretRiddle: string | null;
        reporter: {
            fullName: string;
            avatarUrl: string | null;
            karmaRank: string;
        };
    };
    currentUserId?: string;
}

export function RelicCard({ relic, currentUserId }: RelicProps) {
    const [isClaimModalOpen, setIsClaimModalOpen] = useState(false);

    const isFound = relic.type === "FOUND";
    // const isOwner = currentUserId === relic.reporterId; // Need reporterId in props if we want this check

    const linkHref = currentUserId
        ? `/dashboard/lost-found/${relic.id}`
        : `/lost-found/${relic.id}`;

    return (
        <>
            <Link href={linkHref} className="block">
                <Card className="overflow-hidden bg-stone-900 border-stone-800 hover:border-stone-700 transition-all duration-300 group cursor-pointer">
                    <div className="relative h-48 w-full bg-stone-950">
                        {relic.images.length > 0 ? (
                            <Image
                                src={relic.images[0]}
                                alt={relic.title}
                                fill
                                className="object-cover group-hover:scale-105 transition-transform duration-500"
                            />
                        ) : (
                            <div className="flex items-center justify-center h-full text-stone-700">
                                <HelpCircle className="w-12 h-12 opacity-20" />
                            </div>
                        )}
                        <div className="absolute top-2 left-2">
                            <Badge
                                variant={isFound ? "default" : "destructive"}
                                className={isFound ? "bg-emerald-600 hover:bg-emerald-700" : "bg-red-600 hover:bg-red-700"}
                            >
                                {relic.type}
                            </Badge>
                        </div>
                    </div>

                    <CardHeader className="p-4 pb-2">
                        <div className="flex justify-between items-start">
                            <h3 className="font-bold text-lg text-stone-100 line-clamp-1">{relic.title}</h3>
                            <span className="text-xs text-stone-500 whitespace-nowrap">
                                {formatDistanceToNow(new Date(relic.createdAt), { addSuffix: true })}
                            </span>
                        </div>
                        {relic.location && (
                            <div className="flex items-center text-xs text-stone-400 mt-1">
                                <MapPin className="w-3 h-3 mr-1" />
                                {relic.location}
                            </div>
                        )}
                    </CardHeader>

                    <CardContent className="p-4 pt-2">
                        <p className="text-sm text-stone-400 line-clamp-2 min-h-[2.5rem]">
                            {relic.description}
                        </p>

                        {isFound && relic.secretRiddle && (
                            <div className="mt-3 p-2 bg-stone-950 rounded border border-stone-800">
                                <p className="text-xs text-amber-500 font-medium mb-1">Security Riddle:</p>
                                <p className="text-xs text-stone-300 italic">"{relic.secretRiddle}"</p>
                            </div>
                        )}
                    </CardContent>
                </Card>
            </Link>
        </>
    );
}
