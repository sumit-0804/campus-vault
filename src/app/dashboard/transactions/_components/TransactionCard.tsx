"use client";

import { useState } from "react";
import Image from "next/image";
import Link from "next/link";
import { useSession } from "next-auth/react";
import { format } from "date-fns";
import { Star, MessageCircle, ChevronRight } from "lucide-react";
import { RatingModal } from "./RatingModal";

interface Transaction {
    id: string;
    buyerId: string;
    sellerId: string;
    finalPrice: number;
    completedAt: Date;
    buyer: {
        id: string;
        fullName: string;
        avatarUrl: string | null;
    };
    seller: {
        id: string;
        fullName: string;
        avatarUrl: string | null;
    };
    relic: {
        id: string;
        title: string;
        images: string[];
    };
    rating: {
        id: string;
        stars: number;
        comment: string | null;
    } | null;
}

interface TransactionCardProps {
    transaction: Transaction;
}

export function TransactionCard({ transaction }: TransactionCardProps) {
    const { data: session } = useSession();
    const [showRatingModal, setShowRatingModal] = useState(false);
    const [hasRated, setHasRated] = useState(!!transaction.rating);

    const isBuyer = session?.user?.id === transaction.buyerId;
    const otherParty = isBuyer ? transaction.seller : transaction.buyer;
    const roleLabel = isBuyer ? "Bought from" : "Sold to";
    const roleColor = isBuyer ? "text-blue-400" : "text-emerald-400";

    return (
        <>
            <div className="p-4 rounded-xl bg-zinc-900/50 border border-white/5 hover:bg-zinc-900 transition-all group">
                <div className="flex gap-4">
                    {/* Item Image */}
                    <div className="relative w-20 h-20 rounded-lg overflow-hidden flex-shrink-0 bg-zinc-800">
                        {transaction.relic.images[0] ? (
                            <Image
                                src={transaction.relic.images[0]}
                                alt={transaction.relic.title}
                                fill
                                className="object-cover"
                            />
                        ) : (
                            <div className="w-full h-full flex items-center justify-center text-zinc-600">
                                No Image
                            </div>
                        )}
                    </div>

                    {/* Details */}
                    <div className="flex-1 min-w-0">
                        <div className="flex items-start justify-between gap-2">
                            <div>
                                <h3 className="font-semibold text-white truncate group-hover:text-purple-400 transition-colors">
                                    {transaction.relic.title}
                                </h3>
                                <p className="text-sm text-zinc-500 mt-0.5">
                                    <span className={roleColor}>{roleLabel}</span>{" "}
                                    {otherParty.fullName}
                                </p>
                            </div>
                            <div className="text-right flex-shrink-0">
                                <p className="font-bold text-white">
                                    ₹{transaction.finalPrice.toLocaleString()}
                                </p>
                                <p className="text-xs text-zinc-600">
                                    {format(new Date(transaction.completedAt), "MMM d, yyyy")}
                                </p>
                            </div>
                        </div>

                        {/* Actions */}
                        <div className="flex items-center gap-2 mt-3">
                            {/* Rating */}
                            {transaction.rating ? (
                                <div className="flex items-center gap-1 px-2 py-1 rounded-lg bg-yellow-500/10 border border-yellow-500/20">
                                    {[...Array(5)].map((_, i) => (
                                        <Star
                                            key={i}
                                            className={`w-3 h-3 ${i < transaction.rating!.stars
                                                    ? "text-yellow-400 fill-yellow-400"
                                                    : "text-zinc-600"
                                                }`}
                                        />
                                    ))}
                                </div>
                            ) : isBuyer && !hasRated ? (
                                <button
                                    onClick={() => setShowRatingModal(true)}
                                    className="flex items-center gap-1.5 px-3 py-1.5 rounded-lg bg-yellow-500/10 border border-yellow-500/20 text-yellow-400 text-sm font-medium hover:bg-yellow-500/20 transition-colors"
                                >
                                    <Star className="w-4 h-4" />
                                    Rate Seller
                                </button>
                            ) : null}

                            {/* View Item */}
                            <Link
                                href={`/marketplace/${transaction.relic.id}`}
                                className="flex items-center gap-1 px-3 py-1.5 rounded-lg bg-zinc-800 border border-white/5 text-zinc-400 text-sm hover:bg-zinc-700 hover:text-white transition-colors"
                            >
                                View Item
                                <ChevronRight className="w-3 h-3" />
                            </Link>
                        </div>
                    </div>
                </div>
            </div>

            {/* Rating Modal */}
            {showRatingModal && (
                <RatingModal
                    transactionId={transaction.id}
                    sellerName={transaction.seller.fullName}
                    itemTitle={transaction.relic.title}
                    onClose={() => setShowRatingModal(false)}
                    onRated={() => setHasRated(true)}
                />
            )}
        </>
    );
}
