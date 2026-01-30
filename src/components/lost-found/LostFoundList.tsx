"use client";

import { RelicCard } from "@/components/lost-found/RelicCard";
import { LostFoundTabs } from "@/components/lost-found/LostFoundTabs";

interface LostFoundListProps {
    relics: any[];
    type: "LOST" | "FOUND";
    showTabs?: boolean;
    emptyMessage?: string;
}

export function LostFoundList({ relics, type, showTabs = true, emptyMessage }: LostFoundListProps) {
    return (
        <>
            {showTabs && <LostFoundTabs />}

            {relics && relics.length > 0 ? (
                <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 xl:grid-cols-4 gap-6">
                    {relics.map((relic) => (
                        <RelicCard key={relic.id} relic={relic} />
                    ))}
                </div>
            ) : (
                <div className="text-center py-20 bg-stone-900/50 rounded-lg border border-stone-800 border-dashed">
                    <p className="text-stone-500 text-lg">
                        {emptyMessage || (type === "LOST" ? "No lost items reported yet." : "No artifacts found yet.")}
                    </p>
                    <p className="text-stone-600 text-sm mt-2">
                        The void is silent... for now.
                    </p>
                </div>
            )}
        </>
    );
}
