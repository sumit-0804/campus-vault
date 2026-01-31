"use client";

import { useMemo } from "react";
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs";
import { RelicCard } from "@/components/lost-found/RelicCard";
import { AlertCircle, CheckCircle, Clock } from "lucide-react";
import { Button } from "@/components/ui/button";
import Link from "next/link";

interface MyItemsClientProps {
    reportedRelics: any[];
    claims: any[];
}

export function MyItemsClient({ reportedRelics, claims }: MyItemsClientProps) {

    const activeLostItems = useMemo(() =>
        reportedRelics.filter(r => r.type === "LOST" && r.status === "OPEN"),
        [reportedRelics]);

    const activeFoundItems = useMemo(() =>
        reportedRelics.filter(r => r.type === "FOUND" && r.status === "OPEN"),
        [reportedRelics]);

    const historyItems = useMemo(() =>
        reportedRelics.filter(r => r.status !== "OPEN"),
        [reportedRelics]);

    return (
        <Tabs defaultValue="active" className="w-full">
            <TabsList className="bg-transparent border-b border-stone-800 w-full justify-start h-auto p-0 mb-8 rounded-none space-x-6">
                <TabsTrigger
                    value="active"
                    className="data-[state=active]:bg-transparent data-[state=active]:shadow-none data-[state=active]:border-b-2 data-[state=active]:border-amber-500 rounded-none px-0 pb-2 text-stone-400 data-[state=active]:text-amber-500 font-medium transition-colors"
                >
                    Active Reports
                </TabsTrigger>
                <TabsTrigger
                    value="claims"
                    className="data-[state=active]:bg-transparent data-[state=active]:shadow-none data-[state=active]:border-b-2 data-[state=active]:border-amber-500 rounded-none px-0 pb-2 text-stone-400 data-[state=active]:text-amber-500 font-medium transition-colors"
                >
                    My Claims ({claims.length})
                </TabsTrigger>
                <TabsTrigger
                    value="history"
                    className="data-[state=active]:bg-transparent data-[state=active]:shadow-none data-[state=active]:border-b-2 data-[state=active]:border-amber-500 rounded-none px-0 pb-2 text-stone-400 data-[state=active]:text-amber-500 font-medium transition-colors"
                >
                    History
                </TabsTrigger>
            </TabsList>

            <TabsContent value="active" className="space-y-8">
                {/* Active Lost Items */}
                <div className="space-y-4">
                    <div className="flex items-center gap-2 mb-4">
                        <div className="p-2 rounded-full bg-red-500/10 text-red-500">
                            <AlertCircle className="w-5 h-5" />
                        </div>
                        <h2 className="text-xl font-bold">Active Lost Items</h2>
                    </div>

                    {activeLostItems.length > 0 ? (
                        <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-6">
                            {activeLostItems.map((relic) => (
                                <RelicCard key={relic.id} relic={relic} />
                            ))}
                        </div>
                    ) : (
                        <div className="bg-stone-900/50 rounded-xl p-12 text-center border border-stone-800 border-dashed">
                            <p className="text-stone-500 mb-4">No active lost item reports.</p>
                            <Link href="/lost-found/report?type=LOST">
                                <Button variant="link" className="text-amber-500 font-semibold p-0 h-auto">
                                    Report Lost Item
                                </Button>
                            </Link>
                        </div>
                    )}
                </div>

                {/* Active Found Items */}
                <div className="space-y-4 pt-4">
                    <div className="flex items-center gap-2 mb-4">
                        <div className="p-2 rounded-full bg-emerald-500/10 text-emerald-500">
                            <CheckCircle className="w-5 h-5" />
                        </div>
                        <h2 className="text-xl font-bold">Active Found Items</h2>
                    </div>

                    {activeFoundItems.length > 0 ? (
                        <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-6">
                            {activeFoundItems.map((relic) => (
                                <RelicCard key={relic.id} relic={relic} />
                            ))}
                        </div>
                    ) : (
                        <div className="bg-stone-900/50 rounded-xl p-12 text-center border border-stone-800 border-dashed">
                            <p className="text-stone-500 mb-4">No active found item reports.</p>
                            <Link href="/lost-found/report?type=FOUND">
                                <Button variant="link" className="text-amber-500 font-semibold p-0 h-auto">
                                    Report Found Item
                                </Button>
                            </Link>
                        </div>
                    )}
                </div>
            </TabsContent>

            <TabsContent value="claims">
                {claims.length > 0 ? (
                    <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-6">
                        {claims.map((relic) => (
                            <RelicCard key={relic.id} relic={relic} />
                        ))}
                    </div>
                ) : (
                    <div className="bg-stone-900/50 rounded-xl p-12 text-center border border-stone-800 border-dashed">
                        <p className="text-stone-500">You haven&apos;t claimed any items yet.</p>
                    </div>
                )}
            </TabsContent>

            <TabsContent value="history">
                {historyItems.length > 0 ? (
                    <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-6">
                        {historyItems.map((relic) => (
                            <RelicCard key={relic.id} relic={relic} />
                        ))}
                    </div>
                ) : (
                    <div className="bg-stone-900/50 rounded-xl p-12 text-center border border-stone-800 border-dashed">
                        <p className="text-stone-500">No history available.</p>
                    </div>
                )}
            </TabsContent>
        </Tabs>
    );
}
