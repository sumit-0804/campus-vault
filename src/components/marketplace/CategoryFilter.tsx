"use client"

import { Button } from "@/components/ui/button"
import { Filter } from "lucide-react"
import { useMarketplaceStore } from "@/stores/useMarketplaceStore"

type Category = "Potions" | "Scrolls" | "Artifacts"

const CATEGORIES: Category[] = ["Potions", "Scrolls", "Artifacts"]

export function CategoryFilter() {
    const { category: currentCategory, setCategory } = useMarketplaceStore()

    const handleCategory = (category: Category | null) => {
        if (currentCategory === category) {
            setCategory(null) // Toggle off
        } else {
            setCategory(category)
        }
    }

    return (
        <div className="flex gap-2 flex-wrap">
            {CATEGORIES.map((category) => (
                <Button
                    key={category}
                    variant="outline"
                    size="sm"
                    className={`border-zinc-700 hover:bg-zinc-800 hover:text-white ${currentCategory === category
                        ? "bg-purple-600 border-purple-600 text-white hover:bg-purple-700"
                        : "text-zinc-300"
                        }`}
                    onClick={() => handleCategory(category)}
                >
                    <Filter className="w-3 h-3 mr-2" />
                    {category}
                </Button>
            ))}
        </div>
    )
}
