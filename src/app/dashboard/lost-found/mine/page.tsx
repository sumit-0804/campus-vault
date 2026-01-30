import { getUserLostRelics } from "@/actions/lost-found";
import { LostFoundList } from "@/components/lost-found/LostFoundList";
import { Button } from "@/components/ui/button";
import Link from "next/link";
import { Plus } from "lucide-react";
import { getServerSession } from "next-auth";
import { authOptions } from "@/auth";
import { redirect } from "next/navigation";

export default async function MyLostFoundPage({
    searchParams,
}: {
    searchParams?: Promise<{ type?: string }>;
}) {
    const session = await getServerSession(authOptions);

    if (!session || !session.user) {
        redirect("/sign-in");
    }

    const params = await searchParams;
    const type = (params?.type === "LOST" ? "LOST" : params?.type === "FOUND" ? "FOUND" : null) as "LOST" | "FOUND" | null;

    const { data: relics } = await getUserLostRelics();

    // Filter relics by type if specified
    const filteredRelics = type
        ? relics?.filter(relic => relic.type === type)
        : relics;

    return (
        <div className="p-6 sm:p-8 w-full space-y-8">
            <div className="flex flex-col md:flex-row md:items-center justify-between gap-4">
                <div>
                    <h1 className="text-3xl font-black tracking-tight text-amber-500 mb-2 glow-text">
                        My Items
                    </h1>
                    <p className="text-zinc-400">
                        Items you have reported lost or found.
                    </p>
                </div>

                <Link href="/lost-found/report">
                    <Button className="bg-amber-600 hover:bg-amber-700 text-white font-bold">
                        <Plus className="w-4 h-4 mr-2" />
                        Report Item
                    </Button>
                </Link>
            </div>

            <LostFoundList
                relics={filteredRelics || []}
                type={type || "FOUND"}
                showTabs={true}
                emptyMessage="You haven't reported any items yet."
            />
        </div>
    );
}
