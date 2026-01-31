"use client";

import { useState } from "react";
import { CursedObject, LostRelic, Transaction, Rating } from "@/app/generated/prisma/client";
import { Skull, Ghost, Search, Package, Flame, ShoppingCart, FileText, Inbox, Scroll, Sparkles } from "lucide-react";
import Image from "next/image";
import Link from "next/link";
import { format } from "date-fns";

interface TransactionContentProps {
    activeListings: CursedObject[];
    soldItems: (Transaction & {
        buyer: { id: string; fullName: string; avatarUrl: string | null };
        relic: { id: string; title: string; images: string[] };
        rating: Rating | null;
    })[];
    purchasedItems: (Transaction & {
        seller: { id: string; fullName: string; avatarUrl: string | null };
        relic: { id: string; title: string; images: string[] };
        rating: Rating | null;
    })[];
    lostFoundReports: LostRelic[];
}

type Tab = "marketplace" | "lostfound";

export function TransactionContent({
    activeListings,
    soldItems,
    purchasedItems,
    lostFoundReports,
}: TransactionContentProps) {
    const [activeTab, setActiveTab] = useState<Tab>("marketplace");

    return (
        <div className="space-y-6">
            {/* Tab Buttons */}
            <div className="flex gap-2">
                <button
                    onClick={() => setActiveTab("marketplace")}
                    className={`flex items-center gap-2 px-5 py-2.5 rounded-lg font-medium text-sm transition-all ${activeTab === "marketplace"
                            ? "bg-gradient-to-r from-purple-600 to-pink-600 text-white shadow-lg shadow-purple-500/30"
                            : "bg-zinc-800/80 text-zinc-400 hover:bg-zinc-700 border border-white/5"
                        }`}
                >
                    <Skull className="w-4 h-4" />
                    Marketplace
                </button>
                <button
                    onClick={() => setActiveTab("lostfound")}
                    className={`flex items-center gap-2 px-5 py-2.5 rounded-lg font-medium text-sm transition-all ${activeTab === "lostfound"
                            ? "bg-gradient-to-r from-purple-600 to-pink-600 text-white shadow-lg shadow-purple-500/30"
                            : "bg-zinc-800/80 text-zinc-400 hover:bg-zinc-700 border border-white/5"
                        }`}
                >
                    <Ghost className="w-4 h-4" />
                    Lost & Found
                </button>
            </div>

            {/* Content */}
            {activeTab === "marketplace" ? (
                <MarketplaceContent
                    activeListings={activeListings}
                    soldItems={soldItems}
                    purchasedItems={purchasedItems}
                />
            ) : (
                <LostFoundContent reports={lostFoundReports} />
            )}
        </div>
    );
}

function MarketplaceContent({
    activeListings,
    soldItems,
    purchasedItems,
}: {
    activeListings: CursedObject[];
    soldItems: TransactionContentProps["soldItems"];
    purchasedItems: TransactionContentProps["purchasedItems"];
}) {
    return (
        <div className="space-y-8">
            {/* Selling (Active Listings) - Cursed Artifacts */}
            <section>
                <h2 className="font-semibold text-lg flex items-center gap-2 mb-4">
                    <div className="p-1.5 rounded-lg bg-purple-500/20">
                        <Scroll className="w-4 h-4 text-purple-400" />
                    </div>
                    <span>Selling <span className="text-zinc-500">(Active Listings)</span></span>
                </h2>
                <div className="bg-zinc-900/60 rounded-xl border border-purple-500/10 p-5 backdrop-blur-sm">
                    {activeListings.length === 0 ? (
                        <div className="text-center py-8">
                            <Ghost className="w-10 h-10 text-zinc-700 mx-auto mb-2" />
                            <p className="text-zinc-500 text-sm">Nothing currently for sale.</p>
                        </div>
                    ) : (
                        <div className="space-y-2">
                            {activeListings.map((item) => (
                                <ListingCard key={item.id} item={item} />
                            ))}
                        </div>
                    )}
                </div>
            </section>

            {/* Sold History - Souls Harvested */}
            <section>
                <h2 className="font-semibold text-lg flex items-center gap-2 mb-4">
                    <div className="p-1.5 rounded-lg bg-green-500/20">
                        <Flame className="w-4 h-4 text-green-400" />
                    </div>
                    Sold History
                </h2>
                <div className="bg-zinc-900/60 rounded-xl border border-green-500/10 p-5 backdrop-blur-sm">
                    {soldItems.length === 0 ? (
                        <p className="text-zinc-500 text-sm">No items sold yet.</p>
                    ) : (
                        <div className="space-y-2">
                            {soldItems.map((tx) => (
                                <TransactionCard
                                    key={tx.id}
                                    item={tx.relic}
                                    party={tx.buyer}
                                    partyLabel="Claimed by"
                                    price={tx.finalPrice}
                                    date={tx.completedAt}
                                    rating={tx.rating}
                                    variant="sold"
                                />
                            ))}
                        </div>
                    )}
                </div>
            </section>

            {/* Purchase History - Acquired Relics */}
            <section>
                <h2 className="font-semibold text-lg flex items-center gap-2 mb-4">
                    <div className="p-1.5 rounded-lg bg-blue-500/20">
                        <ShoppingCart className="w-4 h-4 text-blue-400" />
                    </div>
                    Purchase History
                </h2>
                <div className="bg-zinc-900/60 rounded-xl border border-blue-500/10 p-5 backdrop-blur-sm">
                    {purchasedItems.length === 0 ? (
                        <p className="text-zinc-500 text-sm">No items bought yet.</p>
                    ) : (
                        <div className="space-y-2">
                            {purchasedItems.map((tx) => (
                                <TransactionCard
                                    key={tx.id}
                                    item={tx.relic}
                                    party={tx.seller}
                                    partyLabel="From"
                                    price={tx.finalPrice}
                                    date={tx.completedAt}
                                    rating={tx.rating}
                                    variant="purchased"
                                />
                            ))}
                        </div>
                    )}
                </div>
            </section>
        </div>
    );
}

function LostFoundContent({ reports }: { reports: LostRelic[] }) {
    const lostReports = reports.filter((r) => r.type === "LOST");
    const foundReports = reports.filter((r) => r.type === "FOUND");

    return (
        <div className="space-y-8">
            {/* Lost Reports - Missing Souls */}
            <section>
                <h2 className="font-semibold text-lg flex items-center gap-2 mb-4">
                    <div className="p-1.5 rounded-lg bg-red-500/20">
                        <Search className="w-4 h-4 text-red-400" />
                    </div>
                    Lost Reports
                </h2>
                <div className="bg-zinc-900/60 rounded-xl border border-red-500/10 p-5 backdrop-blur-sm">
                    {lostReports.length === 0 ? (
                        <p className="text-zinc-500 text-sm">No lost item reports.</p>
                    ) : (
                        <div className="space-y-2">
                            {lostReports.map((report) => (
                                <ReportCard key={report.id} report={report} />
                            ))}
                        </div>
                    )}
                </div>
            </section>

            {/* Found Reports - Recovered Artifacts */}
            <section>
                <h2 className="font-semibold text-lg flex items-center gap-2 mb-4">
                    <div className="p-1.5 rounded-lg bg-emerald-500/20">
                        <Sparkles className="w-4 h-4 text-emerald-400" />
                    </div>
                    Found Reports
                </h2>
                <div className="bg-zinc-900/60 rounded-xl border border-emerald-500/10 p-5 backdrop-blur-sm">
                    {foundReports.length === 0 ? (
                        <p className="text-zinc-500 text-sm">No found item reports.</p>
                    ) : (
                        <div className="space-y-2">
                            {foundReports.map((report) => (
                                <ReportCard key={report.id} report={report} />
                            ))}
                        </div>
                    )}
                </div>
            </section>
        </div>
    );
}

function ListingCard({ item }: { item: CursedObject }) {
    return (
        <Link
            href={`/dashboard/marketplace/${item.id}`}
            className="flex items-center gap-4 p-3 rounded-lg hover:bg-purple-500/5 border border-transparent hover:border-purple-500/20 transition-all group"
        >
            <div className="relative w-12 h-12 rounded-lg overflow-hidden bg-zinc-800 flex-shrink-0 border border-white/5">
                {item.images[0] ? (
                    <Image src={item.images[0]} alt={item.title} fill className="object-cover" />
                ) : (
                    <div className="w-full h-full flex items-center justify-center text-zinc-600">
                        <Skull className="w-6 h-6" />
                    </div>
                )}
            </div>
            <div className="flex-1 min-w-0">
                <p className="font-medium text-white truncate group-hover:text-purple-300 transition-colors">{item.title}</p>
                <p className="text-sm text-zinc-500">{item.category}</p>
            </div>
            <p className="font-bold text-white">₹{item.price.toLocaleString()}</p>
        </Link>
    );
}

function TransactionCard({
    item,
    party,
    partyLabel,
    price,
    date,
    rating,
    variant,
}: {
    item: { id: string; title: string; images: string[] };
    party: { id: string; fullName: string; avatarUrl: string | null };
    partyLabel: string;
    price: number;
    date: Date;
    rating: Rating | null;
    variant: "sold" | "purchased";
}) {
    const hoverColor = variant === "sold" ? "hover:bg-green-500/5 hover:border-green-500/20" : "hover:bg-blue-500/5 hover:border-blue-500/20";
    const textColor = variant === "sold" ? "group-hover:text-green-300" : "group-hover:text-blue-300";

    return (
        <Link
            href={`/marketplace/${item.id}`}
            className={`flex items-center gap-4 p-3 rounded-lg border border-transparent transition-all group ${hoverColor}`}
        >
            <div className="relative w-12 h-12 rounded-lg overflow-hidden bg-zinc-800 flex-shrink-0 border border-white/5">
                {item.images[0] ? (
                    <Image src={item.images[0]} alt={item.title} fill className="object-cover" />
                ) : (
                    <div className="w-full h-full flex items-center justify-center text-zinc-600">
                        <Package className="w-6 h-6" />
                    </div>
                )}
            </div>
            <div className="flex-1 min-w-0">
                <p className={`font-medium text-white truncate transition-colors ${textColor}`}>{item.title}</p>
                <p className="text-sm text-zinc-500">
                    {partyLabel} {party.fullName} • {format(new Date(date), "MMM d, yyyy")}
                </p>
            </div>
            <div className="text-right">
                <p className="font-bold text-white">₹{price.toLocaleString()}</p>
                {rating && (
                    <p className="text-xs text-yellow-400">⭐ {rating.stars}/5</p>
                )}
            </div>
        </Link>
    );
}

function ReportCard({ report }: { report: LostRelic }) {
    const statusColors = {
        OPEN: "bg-amber-500/10 text-amber-400 border-amber-500/20",
        VERIFIED: "bg-blue-500/10 text-blue-400 border-blue-500/20",
        PENDING_PICKUP: "bg-purple-500/10 text-purple-400 border-purple-500/20",
        DROPPED_OFF: "bg-orange-500/10 text-orange-400 border-orange-500/20",
        DELIVERED: "bg-green-500/10 text-green-400 border-green-500/20",
        SOLVED: "bg-emerald-500/10 text-emerald-400 border-emerald-500/20",
    };

    const typeColor = report.type === "LOST" ? "hover:bg-red-500/5 hover:border-red-500/20" : "hover:bg-emerald-500/5 hover:border-emerald-500/20";

    return (
        <Link
            href={`/dashboard/lost-found/${report.id}`}
            className={`flex items-center gap-4 p-3 rounded-lg border border-transparent transition-all group ${typeColor}`}
        >
            <div className="relative w-12 h-12 rounded-lg overflow-hidden bg-zinc-800 flex-shrink-0 border border-white/5">
                {report.images[0] ? (
                    <Image src={report.images[0]} alt={report.title} fill className="object-cover" />
                ) : (
                    <div className="w-full h-full flex items-center justify-center text-zinc-600">
                        <Ghost className="w-6 h-6" />
                    </div>
                )}
            </div>
            <div className="flex-1 min-w-0">
                <p className="font-medium text-white truncate">{report.title}</p>
                <p className="text-sm text-zinc-500">
                    {report.type === "LOST" ? "👻 Lost" : "✨ Found"} • {format(new Date(report.createdAt), "MMM d, yyyy")}
                </p>
            </div>
            <span className={`px-2.5 py-1 rounded-lg text-xs font-medium border ${statusColors[report.status]}`}>
                {report.status.replace("_", " ")}
            </span>
        </Link>
    );
}
