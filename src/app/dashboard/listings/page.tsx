import prisma from "@/lib/db";
import ItemCard from "@/components/marketplace/ItemCard";
import { Button } from "@/components/ui/button";
import { Plus } from "lucide-react";
import Link from "next/link";
import { getServerSession } from "next-auth";
import { authOptions } from "@/auth";
import { redirect } from "next/navigation";

async function getUserItems(userId: string) {
    try {
        const items = await prisma.cursedObject.findMany({
            where: {
                sellerId: userId
            },
            orderBy: {
                createdAt: 'desc'
            }
        });
        return items;
    } catch (e) {
        console.error("Failed to fetch user items", e);
        return [];
    }
}

export default async function UserListingsPage() {
    const session = await getServerSession(authOptions);

    if (!session || !session.user || !session.user.id) {
        redirect("/sign-in");
    }

    const items = await getUserItems(session.user.id);

    return (
        <div className="p-6 sm:p-8 w-full space-y-8">
            <div className="flex flex-col md:flex-row md:items-center justify-between gap-4">
                <div>
                    <h1 className="text-3xl font-black tracking-tight text-white mb-2">
                        My Listings
                    </h1>
                    <p className="text-zinc-400">
                        Manage your accursed inventory.
                    </p>
                </div>
                <Link href="/marketplace/create">
                    <Button className="bg-purple-600 hover:bg-purple-700 text-white font-bold">
                        <Plus className="w-4 h-4 mr-2" /> Summon Item
                    </Button>
                </Link>
            </div>

            {items.length === 0 ? (
                <div className="text-center py-20 border border-dashed border-zinc-800 rounded-2xl bg-zinc-900/20">
                    <h3 className="text-xl font-bold text-zinc-500 mb-2">No Listings Yet</h3>
                    <p className="text-zinc-600 mb-6">You haven't summoned any cursed objects yet.</p>
                    <Link href="/marketplace/create">
                        <Button variant="secondary">Create Listing</Button>
                    </Link>
                </div>
            ) : (
                <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 xl:grid-cols-4 gap-6">
                    {items.map((item) => (
                        <ItemCard key={item.id} item={item} />
                    ))}
                </div>
            )}
        </div>
    );
}
