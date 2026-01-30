import Link from "next/link";
import { getLostRelics } from "@/actions/lost-found";
import { LostFoundList } from "@/components/lost-found/LostFoundList";
import { BackToMapButton } from "@/components/lost-found/BackToMapButton";
import { Button } from "@/components/ui/button";
import { Plus } from "lucide-react";

export default async function LostFoundPage({
    searchParams,
}: {
    searchParams?: Promise<{ type?: string }>;
}) {
    const params = await searchParams;
    const type = (params?.type === "LOST" ? "LOST" : "FOUND") as "LOST" | "FOUND";

    // Fetch data
    const { data: relics } = await getLostRelics(type);

    return (
        <div className="container mx-auto py-8">
            <div className="mb-4">
                <BackToMapButton fallbackRoute="/dashboard" />
            </div>
            <div className="flex flex-col md:flex-row justify-between items-start md:items-center mb-8 gap-4">
                <div>
                    <h1 className="text-4xl font-black text-amber-500 tracking-tight glow-text mb-2">
                        The Marauder&apos;s Map
                    </h1>
                    <p className="text-stone-400">
                        Lost something? Or found a magical artifact?
                    </p>
                </div>

                {/* Only show "Report Found" button since "Report Lost" is disabled/out of scope */}
                <Link href="/lost-found/report">
                    <Button className="bg-amber-600 hover:bg-amber-700 text-white">
                        <Plus className="w-4 h-4 mr-2" />
                        I Found Something
                    </Button>
                </Link>
            </div>

            <LostFoundList relics={relics || []} type={type} />
        </div>
    );
}
