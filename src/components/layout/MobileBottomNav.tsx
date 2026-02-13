"use client"

import Link from "next/link"
import { usePathname } from "next/navigation"
import { LayoutDashboard, Store, Receipt, MessageSquare } from "lucide-react"
import { cn } from "@/lib/utils"
import { useSession } from "next-auth/react"
import { toast } from "sonner"

export function MobileBottomNav() {
    const pathname = usePathname()
    const { data: session } = useSession()
    const isProfileIncomplete = session?.user && !session.user.phoneNumber

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
                    const isDisabled = isProfileIncomplete

                    const handleClick = (e: React.MouseEvent) => {
                        if (isDisabled) {
                            e.preventDefault()
                            toast.error("Update mobile number to continue", {
                                id: "mobile-nav-incomplete",
                            })
                        }
                    }

                    return (
                        <Link
                            key={item.title}
                            href={isDisabled ? "#" : item.url}
                            onClick={handleClick}
                            className={cn(
                                "flex flex-col items-center justify-center gap-1 transition-colors",
                                isActive
                                    ? "text-white"
                                    : "text-zinc-500 hover:text-zinc-300",
                                isDisabled && "opacity-50"
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
