"use client"

import { useEffect } from "react"
import { useSearchParams, usePathname, useRouter } from "next/navigation"
import { useMarketplaceStore } from "@/stores/useMarketplaceStore"
import { useDebouncedCallback } from "use-debounce"

export function MarketplaceStoreInitializer() {
    const { searchQuery, category, setSearchQuery, setCategory } = useMarketplaceStore()
    const searchParams = useSearchParams()
    const pathname = usePathname()
    const { replace } = useRouter()

    // 1. Sync URL -> Store on Mount
    useEffect(() => {
        const urlSearch = searchParams?.get("search")
        const urlCategory = searchParams?.get("category")

        // Priority 1: URL Params (Deep Linking)
        if (urlSearch !== undefined && urlSearch !== null) {
            if (urlSearch !== searchQuery) setSearchQuery(urlSearch)
        }
        if (urlCategory !== undefined && urlCategory !== null) {
            if (urlCategory !== category) setCategory(urlCategory)
        }

        // Priority 2: Store Persistence (Restoring state when URL is empty)
        // Only if URL params are completely missing
        if (!urlSearch && !urlCategory) {
            if (searchQuery || category) {
                const params = new URLSearchParams(searchParams?.toString())
                if (searchQuery) params.set("search", searchQuery)
                if (category) params.set("category", category)
                replace(`${pathname}?${params.toString()}`)
            }
        }
    }, []) // Run once on mount

    // 2. Sync Store -> URL (Debounced for Search)
    const handleDebouncedUrlUpdate = useDebouncedCallback((term: string, cat: string | null) => {
        const params = new URLSearchParams(searchParams?.toString())

        // Handle Search
        if (term) {
            params.set("search", term)
        } else {
            params.delete("search")
        }

        // Handle Category
        if (cat) {
            params.set("category", cat)
        } else {
            params.delete("category")
        }

        // Only replace if changed
        if (params.toString() !== searchParams?.toString()) {
            replace(`${pathname}?${params.toString()}`)
        }
    }, 300)

    // Trigger updates
    useEffect(() => {
        // We debounce everything together to avoid conflicts
        handleDebouncedUrlUpdate(searchQuery, category)
    }, [searchQuery, category, handleDebouncedUrlUpdate])

    return null // This component does not render anything
}
