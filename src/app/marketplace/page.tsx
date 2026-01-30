import prisma from "@/lib/db";
import ItemCard from "@/components/marketplace/ItemCard";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Plus, Search, Filter } from "lucide-react";
import Link from "next/link";
import { Suspense } from "react";

// Mock data until we have real data
// We will try to fetch from DB first, if empty show empty state
async function getItems() {
    try {
        const items = await prisma.cursedObject.findMany({
            where: {
                status: {
                    in: ['ACTIVE', 'RESERVED', 'SOLD']
                }
            },
            orderBy: {
                createdAt: 'desc'
            }
        });
        return items;
    } catch (e) {
        console.error("Failed to fetch items", e);
        return [];
    }
}

export default async function MarketplacePage() {
    const items = await getItems();

    return (
        <div className="p-6 sm:p-8 w-full space-y-8">
            {/* Header */}
            <div className="flex flex-col md:flex-row md:items-center justify-between gap-4">
                <div>
                    <h1 className="text-3xl font-black tracking-tight text-white mb-2">
                        The Bazaar
                    </h1>
                    <p className="text-zinc-400">
                        Trade your cursed artifacts with fellow wizards.
                    </p>
                </div>
                <Link href="/marketplace/create">
                    <Button className="bg-purple-600 hover:bg-purple-700 text-white font-bold">
                        <Plus className="w-4 h-4 mr-2" /> Summon Item
                    </Button>
                </Link>
            </div>

            {/* Filters & Search */}
            <div className="flex flex-col sm:flex-row gap-4">
                <div className="relative flex-grow">
                    <Search className="absolute left-3 top-1/2 -translate-y-1/2 w-4 h-4 text-zinc-500" />
                    <Input
                        placeholder="Search for dark relics..."
                        className="pl-9 bg-zinc-900 border-zinc-700 focus:border-purple-500 text-white placeholder:text-zinc-600"
                    />
                </div>
                <Button variant="outline" className="border-zinc-700 text-zinc-300 hover:bg-zinc-800 hover:text-white">
                    <Filter className="w-4 h-4 mr-2" /> Filter
                </Button>
            </div>

            {/* Grid */}
            {items.length === 0 ? (
                <div className="text-center py-20 border border-dashed border-zinc-800 rounded-2xl bg-zinc-900/20">
                    <h3 className="text-xl font-bold text-zinc-500 mb-2">The Bazaar is Empty</h3>
                    <p className="text-zinc-600 mb-6">Be the first to summon a cursed object.</p>
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
