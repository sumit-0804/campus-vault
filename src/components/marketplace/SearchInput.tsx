"use client"

import { Input } from "@/components/ui/input"
import { Search } from "lucide-react"
import { useSearchParams, usePathname, useRouter } from "next/navigation"
import { useDebouncedCallback } from "use-debounce"

export default function SearchInput() {
    const searchParams = useSearchParams()
    const pathname = usePathname()
    const { replace } = useRouter()

    const handleSearch = useDebouncedCallback((term: string) => {
        const params = new URLSearchParams(searchParams?.toString())
        if (term) {
            params.set("search", term)
        } else {
            params.delete("search")
        }
        replace(`${pathname}?${params.toString()}`)
    }, 300)

    return (
        <div className="relative flex-grow">
            <Search className="absolute left-3 top-1/2 -translate-y-1/2 w-4 h-4 text-zinc-500" />
            <Input
                placeholder="Search for dark relics..."
                className="pl-9 bg-zinc-900 border-zinc-700 focus:border-purple-500 text-white placeholder:text-zinc-600"
                onChange={(e) => handleSearch(e.target.value)}
                defaultValue={searchParams?.get("search")?.toString()}
            />
        </div>
    )
}
