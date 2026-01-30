import { getLostRelics } from "@/actions/lost-found";
import { LostFoundList } from "@/components/lost-found/LostFoundList";
import { getServerSession } from "next-auth";
import { authOptions } from "@/auth";
import { redirect } from "next/navigation";

export default async function BrowseLostFoundPage({
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

    // Fetch all listings, optionally filtered by type
    const { data: relics } = await getLostRelics(type);

    return (
        <div className="p-6 sm:p-8 w-full space-y-8">
            <div className="flex flex-col md:flex-row md:items-center justify-between gap-4">
                <div>
                    <h1 className="text-3xl font-black tracking-tight text-amber-500 mb-2 glow-text">
                        The Marauder's Map
                    </h1>
                    <p className="text-zinc-400">
                        Browse all lost and found items from the community.
                    </p>
                </div>
            </div>

            <LostFoundList relics={relics || []} type={type || "FOUND"} showTabs={true} />
        </div>
    );
}
