"use client"

import Link from "next/link"
import { usePathname } from "next/navigation"
import { LayoutDashboard, Store, Receipt, MessageSquare } from "lucide-react"
import { cn } from "@/lib/utils"

export function MobileBottomNav() {
    const pathname = usePathname()

    const items = [
        {
            title: "Overview",
            url: "/dashboard",
            icon: LayoutDashboard,
        },
        {
            title: "Sell",
            url: "/dashboard/listings",
            icon: Store,
        },
        {
            title: "Txns",
            url: "/dashboard/transactions",
            icon: Receipt,
        },
        {
            title: "Chat",
            url: "/dashboard/messages",
            icon: MessageSquare,
        },
    ]

    return (
        <div className="md:hidden fixed bottom-0 left-0 right-0 z-50 h-16 bg-black/90 backdrop-blur-xl border-t border-white/10 pb-safe">
            <div className="grid grid-cols-4 h-full">
                {items.map((item) => {
                    const isActive = pathname === item.url
                    return (
                        <Link
                            key={item.title}
                            href={item.url}
                            className={cn(
                                "flex flex-col items-center justify-center gap-1 transition-colors",
                                isActive
                                    ? "text-white"
                                    : "text-zinc-500 hover:text-zinc-300"
                            )}
                        >
                            <item.icon className={cn("w-5 h-5", isActive && "fill-current")} />
                            <span className="text-[10px] font-medium">{item.title}</span>
                        </Link>
                    )
                })}
            </div>
        </div>
    )
}
