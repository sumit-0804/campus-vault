import prisma from "@/lib/db";
import ItemCard from "@/components/marketplace/ItemCard";
import { Button } from "@/components/ui/button";
import { Plus } from "lucide-react";
import Link from "next/link";
import { BackButton } from "@/components/ui/BackButton";
import SearchInput from "@/components/marketplace/SearchInput";
import { CategoryFilter } from "@/components/marketplace/CategoryFilter";
import { Prisma } from "@/app/generated/prisma/client";

// Mapping for category filters
const CATEGORY_MAP: Record<string, string> = {
    "Potions": "Electronics",
    "Scrolls": "Books",
    "Artifacts": "Misc"
};

async function getItems(search?: string, category?: string) {
    try {
        const whereClause: Prisma.CursedObjectWhereInput = {
            status: {
                in: ['ACTIVE', 'RESERVED', 'SOLD']
            }
        };

        if (search) {
            whereClause.OR = [
                { title: { contains: search, mode: 'insensitive' } },
                { description: { contains: search, mode: 'insensitive' } }
            ];
        }

        if (category && CATEGORY_MAP[category]) {
            whereClause.category = CATEGORY_MAP[category];
        }

        const items = await prisma.cursedObject.findMany({
            where: whereClause,
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

export default async function MarketplacePage({
    searchParams,
}: {
    searchParams?: {
        search?: string;
        category?: string;
    };
}) {
    const search = searchParams?.search;
    const category = searchParams?.category;
    const items = await getItems(search, category);

    return (
        <div className="p-6 sm:p-8 w-full space-y-8 max-w-7xl mx-auto">
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
            <div className="flex flex-col gap-4">
                <SearchInput />
                <CategoryFilter />
            </div>

            {/* Grid */}
            {items.length === 0 ? (
                <div className="text-center py-20 border border-dashed border-zinc-800 rounded-2xl bg-zinc-900/20">
                    <h3 className="text-xl font-bold text-zinc-500 mb-2">The Bazaar is Empty</h3>
                    <p className="text-zinc-600 mb-6">
                        {search || category
                            ? "No cursed objects match your criteria."
                            : "Be the first to summon a cursed object."}
                    </p>
                    {(search || category) ? (
                        <Link href="/marketplace">
                            <Button variant="secondary">Clear Filters</Button>
                        </Link>
                    ) : (
                        <Link href="/marketplace/create">
                            <Button variant="secondary">Create Listing</Button>
                        </Link>
                    )}
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
