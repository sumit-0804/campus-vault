"use client"

import { SidebarTrigger, useSidebar } from "@/components/ui/sidebar"
import { Separator } from "@/components/ui/separator"
import { cn } from "@/lib/utils"
import { Shield, LogOut, User, Sparkles } from "lucide-react"
import { Avatar, AvatarFallback, AvatarImage } from "@/components/ui/avatar"
import { Button } from "@/components/ui/button"
import {
    DropdownMenu,
    DropdownMenuContent,
    DropdownMenuItem,
    DropdownMenuLabel,
    DropdownMenuSeparator,
    DropdownMenuTrigger,
} from "@/components/ui/dropdown-menu"
import { signOut, useSession } from "next-auth/react"
import Link from "next/link"
import { usePathname } from "next/navigation"
import { NotificationBell } from "@/components/features/notifications/NotificationBell"

export function DashboardHeader() {
    const { state, isMobile } = useSidebar()
    const shouldHideTrigger = isMobile || state === "expanded"
    const pathname = usePathname()
    const { data: session } = useSession()

    // Dynamic Title Logic
    const getPageTitle = (path: string) => {
        if (path === "/dashboard") return "Overview"
        if (path.startsWith("/dashboard/market")) return "Marketplace"
        if (path.startsWith("/dashboard/listings")) return "My Listings"
        if (path.startsWith("/dashboard/profile")) return "Profile"
        if (path.startsWith("/dashboard/karma")) return "Karma Center"
        return "Dashboard"
    }

    const title = getPageTitle(pathname || "")

    const userInitials = session?.user?.name
        ? session.user.name.split(" ").map(n => n[0]).join("").toUpperCase().slice(0, 2)
        : "CV"

    return (
        <header className="flex h-16 shrink-0 items-center gap-2 border-b border-white/5 px-4 bg-black/20 backdrop-blur-sm transition-all duration-200">
            <div className={cn("flex items-center gap-2 transition-all duration-200", shouldHideTrigger ? "-ml-9 opacity-0 pointer-events-none" : "opacity-100")}>
                <SidebarTrigger className="-ml-1" />
                <Separator orientation="vertical" className="mr-2 h-4 bg-white/10" />
            </div>

            {/* Mobile Brand Logo */}
            <div className="flex items-center gap-2 md:hidden">
                <div className="p-1.5 bg-red-900/20 border border-red-500/20 rounded-md">
                    <Shield className="w-4 h-4 text-red-500" />
                </div>
                <span className="font-black uppercase tracking-widest text-sm text-white">
                    Campus Vault
                </span>
            </div>

            {/* Desktop Title */}
            <span className={cn("hidden md:block font-semibold text-sm tracking-wide text-zinc-300 transition-transform duration-200", shouldHideTrigger ? "-translate-x-2" : "")}>
                {title}
            </span>

            <div className="ml-auto flex items-center gap-2">
                <NotificationBell />
                <DropdownMenu>
                    <DropdownMenuTrigger asChild>
                        <Button variant="ghost" className="relative h-8 w-8 rounded-full ring-2 ring-white/10 hover:ring-white/20 transition-all">
                            <Avatar className="h-8 w-8">
                                <AvatarImage src={session?.user?.image || "/avatars/01.png"} alt={session?.user?.name || "User"} />
                                <AvatarFallback className="bg-zinc-800 text-zinc-400">{userInitials}</AvatarFallback>
                            </Avatar>
                        </Button>
                    </DropdownMenuTrigger>
                    <DropdownMenuContent className="w-56 bg-black/90 border-white/10 text-zinc-400" align="end" forceMount>
                        <DropdownMenuLabel className="font-normal">
                            <div className="flex flex-col space-y-1">
                                <p className="text-sm font-medium leading-none text-white">{session?.user?.name || "User"}</p>
                                <p className="text-xs leading-none text-muted-foreground">
                                    {session?.user?.email || "No email"}
                                </p>
                            </div>
                        </DropdownMenuLabel>
                        <DropdownMenuSeparator className="bg-white/10" />
                        <DropdownMenuItem className="focus:bg-white/10 focus:text-white cursor-pointer" asChild>
                            <Link href="/dashboard/profile">
                                <User className="mr-2 h-4 w-4" />
                                <span>Profile</span>
                            </Link>
                        </DropdownMenuItem>
                        <DropdownMenuItem className="focus:bg-white/10 focus:text-white cursor-pointer" asChild>
                            <Link href="/dashboard/karma">
                                <Sparkles className="mr-2 h-4 w-4" />
                                <span className="flex-1">Karma</span>
                                {session?.user?.karmaScore !== undefined && (
                                    <span className="ml-auto text-xs text-purple-400 font-bold">{session.user.karmaScore}</span>
                                )}
                            </Link>
                        </DropdownMenuItem>
                        <DropdownMenuSeparator className="bg-white/10" />
                        <DropdownMenuItem className="text-red-500 focus:bg-red-900/20 focus:text-red-400 cursor-pointer" onClick={() => signOut({ callbackUrl: "/" })}>
                            <LogOut className="mr-2 h-4 w-4" />
                            <span>Log out</span>
                        </DropdownMenuItem>
                    </DropdownMenuContent>
                </DropdownMenu>
            </div>
        </header>
    )
}
