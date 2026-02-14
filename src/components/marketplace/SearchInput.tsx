"use client"

import { Input } from "@/components/ui/input"
import { Search } from "lucide-react"
import { useMarketplaceStore } from "@/stores/useMarketplaceStore"

export default function SearchInput() {
    const { searchQuery, setSearchQuery } = useMarketplaceStore()

    return (
        <div className="relative flex-grow">
            <Search className="absolute left-3 top-1/2 -translate-y-1/2 w-4 h-4 text-zinc-500" />
            <Input
                placeholder="Search for dark relics..."
                className="pl-9 bg-zinc-900 border-zinc-700 focus:border-purple-500 text-white placeholder:text-zinc-600"
                onChange={(e) => setSearchQuery(e.target.value)}
                value={searchQuery}
            />
        </div>
    )
}
