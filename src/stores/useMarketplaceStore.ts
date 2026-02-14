import { create } from 'zustand'

interface MarketplaceState {
    searchQuery: string
    category: string | null
    setSearchQuery: (query: string) => void
    setCategory: (category: string | null) => void
    reset: () => void
}

export const useMarketplaceStore = create<MarketplaceState>((set) => ({
    searchQuery: "",
    category: null,
    setSearchQuery: (query) => set({ searchQuery: query }),
    setCategory: (category) => set({ category }),
    reset: () => set({ searchQuery: "", category: null }),
}))
