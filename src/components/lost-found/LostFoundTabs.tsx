"use client";

import { usePathname, useRouter, useSearchParams } from "next/navigation";
import { Tabs, TabsList, TabsTrigger } from "@/components/ui/tabs";

export function LostFoundTabs() {
    const router = useRouter();
    const searchParams = useSearchParams();
    const currentTab = searchParams?.get("type") === "LOST" ? "LOST" : "FOUND";

    const pathname = usePathname();

    const handleTabChange = (value: string) => {
        // Navigate to the same page but with updated query param
        router.push(`${pathname}?type=${value}`);
    };

    return (
        <Tabs value={currentTab} onValueChange={handleTabChange} className="w-full mb-8">
            <TabsList className="grid w-full grid-cols-2 bg-stone-900 border border-stone-800">
                <TabsTrigger
                    value="FOUND"
                    className="data-[state=active]:bg-stone-800 data-[state=active]:text-emerald-400 text-stone-400 text-xs sm:text-sm"
                >
                    Found <span className="hidden sm:inline ml-1">Items (The Treasury)</span>
                </TabsTrigger>
                <TabsTrigger
                    value="LOST"
                    className="data-[state=active]:bg-stone-800 data-[state=active]:text-red-400 text-stone-400 text-xs sm:text-sm"
                >
                    Lost <span className="hidden sm:inline ml-1">Items (The Void)</span>
                </TabsTrigger>
            </TabsList>
        </Tabs>
    );
}
